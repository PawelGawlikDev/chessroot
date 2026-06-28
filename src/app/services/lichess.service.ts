import { inject, Injectable } from '@angular/core';
import { parseGame } from '@mliebelt/pgn-parser';
import { ChessFetchService } from '@services/chess-fetch.service';
import {
  Game,
  GameCallback,
  LichessGameParameters,
  Profile,
  Tournament,
  LichessGame,
  LichessArena,
  LichessSwiss,
  LichessPlayer,
  ChessColor,
  TimeControl,
  Result,
  NetworkError,
} from '@model';

@Injectable({
  providedIn: 'root',
})
export class LichessService {
  private readonly fetchService = inject(ChessFetchService);

  public qs(obj: Record<string, unknown>): string {
    const params = new URLSearchParams(obj as Record<string, string>).toString();
    return params ? '?' + params : '';
  }

  public async profile(username: string): Promise<Profile> {
    const response = await this.fetchService.fetchFromEndpoint(
      `https://lichess.org/api/user/${username}`,
    );
    this.fetchService.checkForServerError(response);
    const data = await response.json();
    return this.formatProfile(data);
  }

  public async arena(id: string): Promise<Tournament> {
    return this.tournament(`https://lichess.org/api/tournament/${id}`);
  }

  public async swiss(id: string): Promise<Tournament> {
    return this.tournament(`https://lichess.org/api/swiss/${id}`);
  }

  private async tournament(url: string): Promise<Tournament> {
    const response = await this.fetchService.fetchFromEndpoint(url);
    this.fetchService.checkForServerError(response);
    const data = await response.json();
    return this.formatTournament(data);
  }

  public async playerGames(
    username: string,
    callback: GameCallback,
    params: LichessGameParameters = {},
  ): Promise<void> {
    return this.games(`https://lichess.org/api/games/user/${username}`, callback, params);
  }

  public async arenaGames(
    id: string,
    callback: GameCallback,
    params: LichessGameParameters = {},
  ): Promise<void> {
    return this.games(`https://lichess.org/api/tournament/${id}/games`, callback, params);
  }

  public async swissGames(
    id: string,
    callback: GameCallback,
    params: LichessGameParameters = {},
  ): Promise<void> {
    return this.games(`https://lichess.org/api/swiss/${id}/games`, callback, params);
  }

  public async games(
    url: string,
    callback: GameCallback,
    params: LichessGameParameters = {},
  ): Promise<void> {
    const response = await this.fetchService.fetchFromEndpoint(
      url + this.qs(params as Record<string, unknown>),
      {
        headers: {
          Accept: 'application/x-ndjson',
        },
      },
    );

    this.fetchService.checkForServerError(response);

    if (!response.body) throw new NetworkError('Response body is null');
    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) return;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n').filter((line) => line.trim());

      for (const line of lines) {
        try {
          const data = JSON.parse(line);
          callback(this.formatGame(data));
        } catch {
          // Skip invalid JSON lines
        }
      }
    }
  }

  public async teamMembers(teamId: string, callback: (player: Profile) => void): Promise<void> {
    const response = await this.fetchService.fetchFromEndpoint(
      `https://lichess.org/api/team/${teamId}/users`,
      {
        headers: {
          Accept: 'application/x-ndjson',
        },
      },
    );

    this.fetchService.checkForServerError(response);

    if (!response.body) throw new NetworkError('Response body is null');
    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) return;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n').filter((line) => line.trim());

      for (const line of lines) {
        try {
          const data = JSON.parse(line);
          callback(this.formatProfile(data));
        } catch {
          // Skip invalid JSON lines
        }
      }
    }
  }

  public async game(url: string): Promise<Game> {
    const gameId = new URL(url).pathname.split('/')[1];

    let normalizedGameId = gameId;
    if (gameId.length === 12) {
      normalizedGameId = gameId.substring(0, 8);
    }

    if (normalizedGameId.length !== 8) {
      throw new Error(`Invalid game ID: ${normalizedGameId}`);
    }

    const response = await this.fetchService.fetchFromEndpoint(
      `https://lichess.org/game/export/${normalizedGameId}${this.qs({ pgnInJson: true, clocks: true })}`,
    );
    this.fetchService.checkForServerError(response);
    const data = await response.json();
    return this.formatGame(data);
  }

  private formatTournament(json: LichessArena | LichessSwiss): Tournament {
    if ('nbRounds' in json) {
      return {
        id: json.id,
        type: 'swiss',
        site: 'lichess',
        url: `https://lichess.org/swiss/${json.id}`,
        name: json.name,
        timeControl: {
          initial: json.clock.limit,
          increment: json.clock.increment,
        },
        isFinished: json.status === 'finished',
        playerCount: json.nbPlayers,
        stats: {
          games: json.stats.games,
        },
      };
    }

    return {
      id: json.id,
      type: 'arena',
      site: 'lichess',
      url: `https://lichess.org/tournament/${json.id}`,
      name: json.fullName,
      timeControl: {
        initial: json.clock.limit,
        increment: json.clock.increment,
      },
      isFinished: json.isFinished,
      playerCount: json.nbPlayers,
      stats: {
        games: json.stats.games,
      },
    };
  }

  private formatGame(json: LichessGame): Game {
    const parsedMoves =
      json.variant === 'standard' && json.moves
        ? parseGame(json.pgn ?? json.moves, { startRule: 'game' }).moves
        : [];

    return {
      site: 'lichess',
      type: 'game',
      id: json.id,
      links: {
        white: `https://lichess.org/${json.id}`,
        black: `https://lichess.org/${json.id}/black`,
      },
      timestamp: json.createdAt,
      lastMoveAt: json.lastMoveAt,
      isStandard: json.variant === 'standard',
      players: {
        white: {
          username: json.players.white.user?.name,
          title: json.players.white.user?.title ?? null,
          rating: json.players.white.rating,
        },
        black: {
          username: json.players.black.user?.name,
          title: json.players.black.user?.title ?? null,
          rating: json.players.black.rating,
        },
      },
      timeControl: this.getTimeControl(json.clock),
      result: this.getResult(json),
      opening: {
        name: json.opening?.name ?? '',
        eco: json.opening?.eco ?? '',
      },
      moves: parsedMoves,
      clocks: json.clocks ?? [],
      analysis: json.analysis ?? [],
    };
  }

  private getResult(json: Partial<LichessGame>): Result {
    switch (json.status) {
      case 'mate':
        return {
          winner: json.winner,
          via: 'checkmate',
          label: this.getResultStringForColor(json.winner),
        };
      case 'resign':
        return {
          winner: json.winner,
          via: 'resignation',
          label: this.getResultStringForColor(json.winner),
        };
      case 'outoftime':
        return {
          winner: json.winner,
          via: 'timeout',
          label: this.getResultStringForColor(json.winner),
        };
      case 'timeout':
        return {
          winner: json.winner,
          via: 'abandonment',
          label: this.getResultStringForColor(json.winner),
        };
      case 'noStart':
        return {
          winner: json.winner,
          via: 'noStart',
          label: this.getResultStringForColor(json.winner),
        };
      case 'variantEnd':
        return {
          winner: json.winner,
          via: 'variant',
          label: this.getResultStringForColor(json.winner),
        };
      case 'cheat':
        return {
          winner: json.winner,
          via: 'cheat',
          label: this.getResultStringForColor(json.winner),
        };
      case 'draw':
        return { outcome: 'draw', label: '½-½' };
      case 'insufficientMaterialClaim':
        return { outcome: 'draw', via: 'insufficient', label: '½-½' };
      case 'stalemate':
        return { outcome: 'draw', via: 'stalemate', label: '½-½' };
    }

    throw new Error(`Unexpected result: ${json.status}`);
  }

  private getTimeControl(timeControl?: { initial: number; increment: number }): TimeControl {
    if (!timeControl) {
      return { initial: 0, increment: 0 };
    }

    return {
      initial: timeControl.initial,
      increment: timeControl.increment,
    };
  }

  private formatProfile(player: LichessPlayer): Profile {
    if (player.disabled) {
      return {
        site: 'lichess',
        type: 'profile',
        username: player.username,
        link: `https://lichess.org/@/${player.username}`,
        disabled: true,
      };
    }

    const name = [player.profile?.firstName, player.profile?.lastName].join(' ').trim();

    return {
      site: 'lichess',
      type: 'profile',
      link: player.url,
      username: player.username,
      title: player.title ?? '',
      createdAt: player.createdAt,
      lastSeenAt: player.seenAt,
      name,
      location: player.profile?.location ?? '',
      ratings: {
        bullet: {
          rating: player.perfs.bullet.rating,
          games: player.perfs.bullet.games,
        },
        blitz: {
          rating: player.perfs.blitz.rating,
          games: player.perfs.blitz.games,
        },
        rapid: {
          rating: player.perfs.rapid.rating,
          games: player.perfs.rapid.games,
        },
      },
      counts: player.count?.all ? { all: player.count.all } : {},
      marked: player.tosViolation ?? false,
    };
  }

  private getResultStringForColor(color?: ChessColor): '1-0' | '0-1' | '½-½' {
    if (color === 'white') return '1-0';
    if (color === 'black') return '0-1';
    return '½-½';
  }
}
