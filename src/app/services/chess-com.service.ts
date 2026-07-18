import { inject, Injectable } from '@angular/core';
import { parseGame } from '@mliebelt/pgn-parser';
import { ChessFetchService } from '@services';
import {
  ChessComArchive,
  ChessComArchives,
  ChesscomGameParameters,
  Profile,
  Title,
  TitledPlayers,
  Tournament,
  ChesscomStats,
  GameCallback,
  Game,
  ChessColor,
  TimeControl,
  Result,
  GamePlayer,
  ChessComGame,
  ChessComTournament,
  ChessComPlayer,
} from '@model';

@Injectable({
  providedIn: 'root',
})
export class ChessComService {
  private readonly fetchService = inject(ChessFetchService);

  public async profile(username: string): Promise<Profile> {
    const response = await this.fetchService.fetchFromEndpoint(
      `https://api.chess.com/pub/player/${username}`,
    );
    this.fetchService.checkForServerError(response);

    const ratings = await this.stats(username);
    const data = await response.json();
    return this.formatProfile(data, ratings);
  }

  public async archives(username: string): Promise<ChessComArchives> {
    const response = await this.fetchService.fetchFromEndpoint(
      `https://api.chess.com/pub/player/${username}/games/archives`,
    );
    this.fetchService.checkForServerError(response);
    return response.json();
  }

  public async archive(archiveUrl: string): Promise<ChessComArchive> {
    const response = await this.fetchService.fetchFromEndpoint(archiveUrl);
    this.fetchService.checkForServerError(response);
    return response.json();
  }

  public async playerGamesForMonth(
    username: string,
    year: number,
    month: number,
    callback: GameCallback,
  ): Promise<void> {
    const month2digit = ('0' + month.toString()).slice(-2);
    const json = await this.archive(
      `https://api.chess.com/pub/player/${username}/games/${year}/${month2digit}`,
    );
    for (const game of json.games) {
      callback(this.formatGame(game));
    }
  }

  public async playerGames(
    username: string,
    callback: GameCallback,
    params: ChesscomGameParameters = {},
  ): Promise<void> {
    if (params.since && params.since.toString().length !== 13) {
      throw new Error('Invalid timestamp format: Use 13-digit timestamp (w/ milliseconds)');
    }

    const [data, allTitledPlayers] = await Promise.all([
      this.archives(username),
      this.titledPlayers(),
    ]);

    let stopArchiveIteration = false;
    let gameCounter = 0;
    data.archives.reverse();

    for (const archiveUrl of data.archives) {
      if (stopArchiveIteration) return;
      const json = await this.archive(archiveUrl);
      json.games.reverse();
      for (const game of json.games) {
        const gameTime = game.end_time * 1000;

        if (params.since && gameTime < params.since) {
          stopArchiveIteration = true;
          return;
        }

        if (params.until && gameTime > params.until) {
          continue;
        }

        if (params.max && gameCounter >= params.max) {
          stopArchiveIteration = true;
          return;
        }

        gameCounter++;
        callback(this.formatGame(game, allTitledPlayers));
      }
    }
  }

  public async tournamentGames(id: string, callback: GameCallback): Promise<void> {
    const allTitledPlayers = await this.titledPlayers();

    const response = await this.fetchService.fetchFromEndpoint(
      `https://api.chess.com/pub/tournament/${id}`,
    );
    this.fetchService.checkForServerError(response);
    const data = await response.json();

    let url = data.rounds[0];
    if (data.settings.type === 'swiss') {
      url += '/1';
    }

    const gameArchive = await this.fetchService.fetchFromEndpoint(url).then((r) => r.json());
    gameArchive.games.forEach((game: ChessComGame) => {
      callback(this.formatGame(game, allTitledPlayers));
    });
  }

  public async game(url: string): Promise<Game> {
    const gameId = new URL(url).pathname.split('/')[3];
    const response = await this.fetchService.fetchFromEndpoint(
      `https://www.chess.com/callback/live/game/${gameId}`,
    );
    const data = await response.json();
    const uuid = data.game.uuid;
    const date = data.game.pgnHeaders.Date.split('.');

    const archiveData = await this.archive(
      `https://api.chess.com/pub/player/${data.game.pgnHeaders.White.toLowerCase()}/games/${date[0]}/${date[1]}`,
    );
    for (const game of archiveData.games) {
      if (game.uuid === uuid) {
        return this.formatGame(game);
      }
    }
    throw new Error('Game not found in monthly archive');
  }

  private botAccounts(): string[] {
    return [
      'stockfish',
      'computer4-impossible',
      ...Array.from({ length: 25 }, (_, i) => `komodo${i + 1}`),
    ];
  }

  public async titledPlayers(
    titles: Title[] = ['CM', 'FM', 'GM', 'IM', 'NM', 'WCM', 'WFM', 'WGM', 'WIM', 'WNM', 'BOT'],
  ): Promise<TitledPlayers> {
    const allTitledPlayers: TitledPlayers = {};

    const activeTitles = titles.filter((t) => t !== 'BOT');
    const responses = await Promise.all(
      activeTitles.map((title) =>
        this.fetchService
          .fetchFromEndpoint(`https://api.chess.com/pub/titled/${title}`)
          .then((r) => r.json()),
      ),
    );

    responses.forEach((data, i) => {
      const title = activeTitles[i];
      data.players.forEach((player: string) => (allTitledPlayers[player.toLowerCase()] = title));
    });

    if (titles.includes('BOT')) {
      for (const bot of this.botAccounts()) {
        allTitledPlayers[bot] = 'BOT';
      }
    }

    return allTitledPlayers;
  }

  public async stats(username: string): Promise<ChesscomStats> {
    const response = await this.fetchService.fetchFromEndpoint(
      `https://api.chess.com/pub/player/${username}/stats`,
    );
    this.fetchService.checkForServerError(response);
    return response.json();
  }

  public async tournament(id: string): Promise<Tournament> {
    const url = `https://api.chess.com/pub/tournament/${id}`;
    const response = await this.fetchService.fetchFromEndpoint(url);
    this.fetchService.checkForServerError(response);
    const data = await response.json();
    return this.formatTournament(data);
  }

  private formatTournament(json: ChessComTournament): Tournament {
    const id = json.url.substring(json.url.lastIndexOf('/') + 1);
    const tournamentType = json.settings.type === 'standard' ? 'arena' : 'swiss';

    return {
      id,
      type: tournamentType,
      site: 'chess.com',
      url: json.url,
      name: json.name,
      timeControl: this.getTimeControl(json.settings.time_control),
      isFinished: json.status === 'finished',
      playerCount: json.settings.registered_user_count,
    };
  }

  private getLinkToGame(id: string, color: ChessColor, type: 'live' | 'daily'): string {
    return `https://www.chess.com/analysis/game/${type}/${id}?tab=analysis&flip=${color === 'black'}&move=0`;
  }

  private formatGame(json: ChessComGame, titledPlayers?: TitledPlayers): Game {
    const isStandard: boolean =
      json.rules === 'chess' &&
      (!json.initial_setup ||
        json.initial_setup === 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');

    const id = json.url.substring(json.url.lastIndexOf('/') + 1);
    const parsed = isStandard && json.pgn ? parseGame(json.pgn, { startRule: 'game' }) : null;
    const parsedMoves = parsed?.moves ?? [];

    const openingName = parsed?.tags?.Opening ?? '';
    const openingEco = parsed?.tags?.ECO ?? '';
    const openingVariation = parsed?.tags?.Variation ?? '';
    const openingSubVariation = parsed?.tags?.SubVariation ?? '';
    const fullOpeningName = [openingName, openingVariation, openingSubVariation]
      .filter(Boolean)
      .join(', ');

    return {
      site: 'chess.com',
      type: 'game',
      id,
      links: {
        white: this.getLinkToGame(id, 'white', json.time_control.includes('/') ? 'daily' : 'live'),
        black: this.getLinkToGame(id, 'black', json.time_control.includes('/') ? 'daily' : 'live'),
      },
      timestamp: json.end_time * 1000,
      isStandard,
      players: {
        white: this.formatGamePlayer(json.white, titledPlayers),
        black: this.formatGamePlayer(json.black, titledPlayers),
      },
      timeControl: this.getTimeControl(json.time_control),
      result: this.getResult(json),
      moves: parsedMoves,
      clocks: [],
      opening: {
        name: fullOpeningName || openingName || '',
        eco: openingEco || '',
      },
    };
  }

  private getResult(json: ChessComGame): Result {
    const colors: ChessColor[] = ['white', 'black'];

    for (const color of colors) {
      switch (json[color].result) {
        case 'agreed':
          return { outcome: 'draw', via: 'agreement', label: '½-½' };
        case 'insufficient':
        case 'timevsinsufficient':
          return { outcome: 'draw', via: 'insufficient', label: '½-½' };
        case 'repetition':
          return { outcome: 'draw', via: 'repetition', label: '½-½' };
        case '50move':
          return { outcome: 'draw', via: '50moves', label: '½-½' };
        case 'stalemate':
          return { outcome: 'draw', via: 'stalemate', label: '½-½' };
        case 'checkmated':
          return {
            winner: this.swapColor(color),
            via: 'checkmate',
            label: this.getResultStringForColor(this.swapColor(color)),
          };
        case 'resigned':
          return {
            winner: this.swapColor(color),
            via: 'resignation',
            label: this.getResultStringForColor(this.swapColor(color)),
          };
        case 'timeout':
          return {
            winner: this.swapColor(color),
            via: 'timeout',
            label: this.getResultStringForColor(this.swapColor(color)),
          };
        case 'abandoned':
          return {
            winner: this.swapColor(color),
            via: 'abandonment',
            label: this.getResultStringForColor(this.swapColor(color)),
          };
        case 'bughousepartnerlose':
        case 'kingofthehill':
        case 'threecheck':
          return {
            winner: this.swapColor(color),
            via: 'variant',
            label: this.getResultStringForColor(this.swapColor(color)),
          };
      }
    }

    throw new Error(`Unexpected result: ${json.white.result} or ${json.black.result}`);
  }

  private getTimeControl(timeControl: string): TimeControl {
    if (timeControl.includes('/')) {
      const secondsPerMove = timeControl.split('/').pop() as string;
      return { correspondence: parseInt(secondsPerMove) };
    }

    const values = timeControl.split('+').map((value) => +value);

    return {
      initial: values[0],
      increment: values[1] || 0,
    };
  }

  private swapColor(color: ChessColor): ChessColor {
    return color === 'white' ? 'black' : 'white';
  }

  private formatGamePlayer(
    player: { username: string },
    titledPlayers?: TitledPlayers,
  ): GamePlayer {
    let title: Title = null;

    if (titledPlayers?.[player.username.toLowerCase()]) {
      title = titledPlayers[player.username.toLowerCase()];
    }

    return {
      username: player.username,
      title,
    };
  }

  private formatProfile(player: ChessComPlayer, ratings: ChesscomStats): Profile {
    let totalGameCount = 0;

    if (ratings.chess_bullet) {
      totalGameCount +=
        ratings.chess_bullet.record.win +
        ratings.chess_bullet.record.loss +
        ratings.chess_bullet.record.draw;
    }
    if (ratings.chess_blitz) {
      totalGameCount +=
        ratings.chess_blitz.record.win +
        ratings.chess_blitz.record.loss +
        ratings.chess_blitz.record.draw;
    }
    if (ratings.chess_rapid) {
      totalGameCount +=
        ratings.chess_rapid.record.win +
        ratings.chess_rapid.record.loss +
        ratings.chess_rapid.record.draw;
    }
    if (ratings.chess_daily) {
      totalGameCount +=
        ratings.chess_daily.record.win +
        ratings.chess_daily.record.loss +
        ratings.chess_daily.record.draw;
    }

    const username = player.url.split('/').pop() as string;

    return {
      site: 'chess.com',
      type: 'profile',
      link: player.url,
      username,
      title: player.title ?? '',
      createdAt: player.joined * 1000,
      lastSeenAt: player.last_online * 1000,
      name: player.name ?? '',
      location: player.location ?? '',
      ratings: {
        bullet: {
          rating: ratings.chess_bullet?.last.rating ?? 0,
          games: ratings.chess_bullet ? this.sumValuesOfObject(ratings.chess_bullet.record) : 0,
        },
        blitz: {
          rating: ratings.chess_blitz?.last.rating ?? 0,
          games: ratings.chess_blitz ? this.sumValuesOfObject(ratings.chess_blitz.record) : 0,
        },
        rapid: {
          rating: ratings.chess_rapid?.last.rating ?? 0,
          games: ratings.chess_rapid ? this.sumValuesOfObject(ratings.chess_rapid.record) : 0,
        },
      },
      counts: {
        all: totalGameCount,
      },
    };
  }

  private sumValuesOfObject(obj: Record<string, number>): number {
    return Object.values(obj).reduce((a, b) => a + b);
  }

  private getResultStringForColor(color?: ChessColor): '1-0' | '0-1' | '½-½' {
    if (color === 'white') return '1-0';
    if (color === 'black') return '0-1';
    return '½-½';
  }
}
