import { TestBed } from '@angular/core/testing';
import { ChessComGame, ChesscomStats } from '@model';
import { ChessFetchService } from '../chess-fetch.service';
import { ChessComService } from '../chess-com.service';

function jsonResponse(body: unknown): Response {
  return {
    ok: true,
    status: 200,
    statusText: 'OK',
    json: async () => body,
  } as Response;
}

function createStats(overrides: Partial<ChesscomStats> = {}): ChesscomStats {
  return {
    chess_bullet: { last: { rating: 1500 }, record: { win: 5, loss: 3, draw: 2 } },
    chess_blitz: { last: { rating: 1600 }, record: { win: 10, loss: 7, draw: 3 } },
    chess_rapid: { last: { rating: 1700 }, record: { win: 4, loss: 4, draw: 2 } },
    chess_daily: { last: { rating: 1800 }, record: { win: 1, loss: 1, draw: 1 } },
    ...overrides,
  };
}

function createGame(overrides: Partial<ChessComGame> = {}): ChessComGame {
  return {
    url: 'https://www.chess.com/game/live/123456789',
    pgn: [
      '[Event "Live Chess"]',
      '[Site "Chess.com"]',
      '[Date "2024.01.01"]',
      '[White "WhitePlayer"]',
      '[Black "BlackPlayer"]',
      '[Result "1-0"]',
      '[ECO "C60"]',
      '[Opening "Ruy Lopez"]',
      '',
      '1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 1-0',
    ].join('\n'),
    time_control: '300+5',
    end_time: 1_700_000_000,
    rated: true,
    accuracies: { white: 90, black: 85 },
    tcn: '',
    uuid: 'game-uuid',
    initial_setup: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    fen: '',
    time_class: 'blitz',
    rules: 'chess',
    white: {
      rating: 2000,
      result: 'win',
      '@id': 'https://api.chess.com/pub/player/whiteplayer',
      username: 'WhitePlayer',
      uuid: 'white-uuid',
    },
    black: {
      rating: 1950,
      result: 'checkmated',
      '@id': 'https://api.chess.com/pub/player/blackplayer',
      username: 'BlackPlayer',
      uuid: 'black-uuid',
    },
    tournament: '',
    ...overrides,
  };
}

describe('ChessComService', () => {
  let service: ChessComService;
  let fetchService: {
    fetchFromEndpoint: ReturnType<typeof vi.fn>;
    checkForServerError: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    fetchService = {
      fetchFromEndpoint: vi.fn(),
      checkForServerError: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [ChessComService, { provide: ChessFetchService, useValue: fetchService }],
    });

    service = TestBed.inject(ChessComService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch and format a player profile with stats', async () => {
    fetchService.fetchFromEndpoint
      .mockResolvedValueOnce(
        jsonResponse({
          url: 'https://www.chess.com/member/TestUser',
          title: 'GM',
          joined: 100,
          last_online: 200,
          name: 'Test User',
          location: 'Warsaw',
        }),
      )
      .mockResolvedValueOnce(jsonResponse(createStats()));

    await expect(service.profile('TestUser')).resolves.toEqual({
      site: 'chess.com',
      type: 'profile',
      link: 'https://www.chess.com/member/TestUser',
      username: 'TestUser',
      title: 'GM',
      createdAt: 100_000,
      lastSeenAt: 200_000,
      name: 'Test User',
      location: 'Warsaw',
      ratings: {
        bullet: { rating: 1500, games: 10 },
        blitz: { rating: 1600, games: 20 },
        rapid: { rating: 1700, games: 10 },
      },
      counts: { all: 43 },
    });
    expect(fetchService.fetchFromEndpoint).toHaveBeenNthCalledWith(
      1,
      'https://api.chess.com/pub/player/TestUser',
    );
    expect(fetchService.fetchFromEndpoint).toHaveBeenNthCalledWith(
      2,
      'https://api.chess.com/pub/player/TestUser/stats',
    );
    expect(fetchService.checkForServerError).toHaveBeenCalledTimes(2);
  });

  it('should fetch archives and archive data', async () => {
    fetchService.fetchFromEndpoint
      .mockResolvedValueOnce(jsonResponse({ archives: ['archive-url'] }))
      .mockResolvedValueOnce(jsonResponse({ games: [createGame()] }));

    await expect(service.archives('TestUser')).resolves.toEqual({ archives: ['archive-url'] });
    await expect(service.archive('archive-url')).resolves.toEqual({ games: [createGame()] });
    expect(fetchService.fetchFromEndpoint).toHaveBeenNthCalledWith(
      1,
      'https://api.chess.com/pub/player/TestUser/games/archives',
    );
    expect(fetchService.fetchFromEndpoint).toHaveBeenNthCalledWith(2, 'archive-url');
    expect(fetchService.checkForServerError).toHaveBeenCalledTimes(2);
  });

  it('should fetch and format games for a month', async () => {
    fetchService.fetchFromEndpoint.mockResolvedValueOnce(jsonResponse({ games: [createGame()] }));
    const callback = vi.fn();

    await service.playerGamesForMonth('TestUser', 2024, 1, callback);

    expect(fetchService.fetchFromEndpoint).toHaveBeenCalledWith(
      'https://api.chess.com/pub/player/TestUser/games/2024/01',
    );
    expect(callback).toHaveBeenCalledWith(
      expect.objectContaining({
        site: 'chess.com',
        id: '123456789',
        timestamp: 1_700_000_000_000,
        isStandard: true,
        timeControl: { initial: 300, increment: 5 },
        result: { winner: 'white', via: 'checkmate', label: '1-0' },
        players: {
          white: { username: 'WhitePlayer', title: null },
          black: { username: 'BlackPlayer', title: null },
        },
        opening: { name: 'Ruy Lopez', eco: 'C60' },
      }),
    );
  });

  it('should iterate recent player games with filters and titled players', async () => {
    const olderGame = createGame({
      url: 'https://www.chess.com/game/live/1',
      uuid: 'older-game',
      end_time: 1_700_000_000,
    });
    const includedGame = createGame({
      url: 'https://www.chess.com/game/live/2',
      uuid: 'included-game',
      end_time: 1_700_000_100,
      white: { ...createGame().white, username: 'MagnusCarlsen' },
    });
    const tooNewGame = createGame({
      url: 'https://www.chess.com/game/live/3',
      uuid: 'too-new-game',
      end_time: 1_700_000_200,
    });
    fetchService.fetchFromEndpoint.mockImplementation((url: string) => {
      const responses: Record<string, unknown> = {
        'https://api.chess.com/pub/player/TestUser/games/archives': {
          archives: ['archive-older', 'archive-newer'],
        },
        'https://api.chess.com/pub/titled/GM': { players: ['MagnusCarlsen'] },
        'https://api.chess.com/pub/titled/IM': { players: [] },
        'https://api.chess.com/pub/titled/FM': { players: [] },
        'https://api.chess.com/pub/titled/CM': { players: [] },
        'https://api.chess.com/pub/titled/NM': { players: [] },
        'https://api.chess.com/pub/titled/WGM': { players: [] },
        'https://api.chess.com/pub/titled/WIM': { players: [] },
        'https://api.chess.com/pub/titled/WFM': { players: [] },
        'https://api.chess.com/pub/titled/WCM': { players: [] },
        'https://api.chess.com/pub/titled/WNM': { players: [] },
        'archive-newer': { games: [includedGame, tooNewGame] },
        'archive-older': { games: [olderGame] },
      };

      return Promise.resolve(jsonResponse(responses[url]));
    });
    const callback = vi.fn();

    await service.playerGames('TestUser', callback, {
      since: 1_700_000_050_000,
      until: 1_700_000_150_000,
      max: 1,
    });

    expect(callback).toHaveBeenCalledOnce();
    expect(callback).toHaveBeenCalledWith(
      expect.objectContaining({
        id: '2',
        players: expect.objectContaining({
          white: { username: 'MagnusCarlsen', title: 'GM' },
        }),
      }),
    );
  });

  it('should reject player game requests with invalid since timestamp', async () => {
    await expect(service.playerGames('TestUser', vi.fn(), { since: 123 })).rejects.toThrow(
      'Invalid timestamp format: Use 13-digit timestamp (w/ milliseconds)',
    );
    expect(fetchService.fetchFromEndpoint).not.toHaveBeenCalled();
  });

  it('should fetch and format tournament details', async () => {
    fetchService.fetchFromEndpoint.mockResolvedValueOnce(
      jsonResponse({
        name: 'Weekly Swiss',
        url: 'https://api.chess.com/pub/tournament/weekly-swiss',
        status: 'finished',
        settings: {
          type: 'swiss',
          time_control: '600+10',
          registered_user_count: 42,
        },
      }),
    );

    await expect(service.tournament('weekly-swiss')).resolves.toEqual({
      id: 'weekly-swiss',
      type: 'swiss',
      site: 'chess.com',
      url: 'https://api.chess.com/pub/tournament/weekly-swiss',
      name: 'Weekly Swiss',
      timeControl: { initial: 600, increment: 10 },
      isFinished: true,
      playerCount: 42,
    });
    expect(fetchService.fetchFromEndpoint).toHaveBeenCalledWith(
      'https://api.chess.com/pub/tournament/weekly-swiss',
    );
  });

  it('should resolve a live game through callback data and the monthly archive', async () => {
    const game = createGame({ uuid: 'target-uuid' });
    fetchService.fetchFromEndpoint.mockResolvedValueOnce(
      jsonResponse({
        game: {
          uuid: 'target-uuid',
          pgnHeaders: { Date: '2024.01.15', White: 'WhitePlayer' },
        },
      }),
    );
    fetchService.fetchFromEndpoint.mockResolvedValueOnce(jsonResponse({ games: [game] }));

    await expect(service.game('https://www.chess.com/game/live/123456789')).resolves.toEqual(
      expect.objectContaining({ id: '123456789' }),
    );
    expect(fetchService.fetchFromEndpoint).toHaveBeenNthCalledWith(
      1,
      'https://www.chess.com/callback/live/game/123456789',
    );
    expect(fetchService.fetchFromEndpoint).toHaveBeenNthCalledWith(
      2,
      'https://api.chess.com/pub/player/whiteplayer/games/2024/01',
    );
  });

  it('should throw when a live game is missing from its monthly archive', async () => {
    fetchService.fetchFromEndpoint.mockResolvedValueOnce(
      jsonResponse({
        game: {
          uuid: 'target-uuid',
          pgnHeaders: { Date: '2024.01.15', White: 'WhitePlayer' },
        },
      }),
    );
    fetchService.fetchFromEndpoint.mockResolvedValueOnce(jsonResponse({ games: [createGame()] }));

    await expect(service.game('https://www.chess.com/game/live/123456789')).rejects.toThrow(
      'Game not found in monthly archive',
    );
  });

  it('should fetch selected titled players and include bot accounts', async () => {
    fetchService.fetchFromEndpoint
      .mockResolvedValueOnce(jsonResponse({ players: ['MagnusCarlsen'] }))
      .mockResolvedValueOnce(jsonResponse({ players: ['Hikaru'] }));

    await expect(service.titledPlayers(['GM', 'IM', 'BOT'])).resolves.toEqual(
      expect.objectContaining({
        magnuscarlsen: 'GM',
        hikaru: 'IM',
        stockfish: 'BOT',
        komodo25: 'BOT',
      }),
    );
    expect(fetchService.fetchFromEndpoint).toHaveBeenNthCalledWith(
      1,
      'https://api.chess.com/pub/titled/GM',
    );
    expect(fetchService.fetchFromEndpoint).toHaveBeenNthCalledWith(
      2,
      'https://api.chess.com/pub/titled/IM',
    );
  });
});
