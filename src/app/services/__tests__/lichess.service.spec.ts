import { TestBed } from '@angular/core/testing';
import { LichessService } from '../lichess.service';
import { ChessFetchService } from '../chess-fetch.service';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { LichessArena, LichessGame, LichessPlayer, LichessSwiss } from '@model';

function createNdjsonResponse(lines: string[]): Response {
  const body = `${lines.join('\n')}\n`;
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(new TextEncoder().encode(body));
      controller.close();
    },
  });

  return new Response(stream, { status: 200, statusText: 'OK' });
}

function createPlayer(overrides: Partial<LichessPlayer> = {}): LichessPlayer {
  return {
    id: 'player-id',
    username: 'TestUser',
    disabled: false,
    tosViolation: false,
    perfs: {
      bullet: { games: 10, rating: 1500, rd: 50, prog: 0 },
      blitz: { games: 20, rating: 1600, rd: 45, prog: 5 },
      rapid: { games: 5, rating: 1700, rd: 40, prog: -2 },
    },
    title: 'GM',
    patron: false,
    createdAt: 100,
    online: false,
    profile: {
      bio: '',
      firstName: 'Test',
      lastName: 'User',
      links: '',
      country: 'PL',
      location: 'Warsaw',
    },
    seenAt: 200,
    playTime: { total: 1, tv: 0 },
    url: 'https://lichess.org/@/TestUser',
    count: { all: 35 },
    followable: true,
    following: false,
    blocking: false,
    followsYou: false,
    ...overrides,
  };
}

function createGame(overrides: Partial<LichessGame> = {}): LichessGame {
  return {
    id: 'abcdefgh',
    rated: true,
    variant: 'standard',
    speed: 'blitz',
    perf: 'blitz',
    createdAt: 1_700_000_000_000,
    lastMoveAt: 1_700_000_000_500,
    status: 'mate',
    players: {
      white: {
        user: { name: 'WhitePlayer', title: 'GM', patron: false, id: 'white-id' },
        rating: 2100,
      },
      black: {
        user: { name: 'BlackPlayer', title: 'IM', patron: false, id: 'black-id' },
        rating: 2000,
      },
    },
    winner: 'white',
    moves: 'e4 e5 Nf3 Nc6 Bb5 a6',
    pgn: '[Event "Rated Blitz game"]\n\n1. e4 e5 2. Nf3 Nc6 3. Bb5 a6',
    opening: { eco: 'C60', name: 'Ruy Lopez', ply: 6 },
    clocks: [600, 598],
    clock: { initial: 600, increment: 5, totalTime: 900 },
    analysis: [{ eval: 20 }],
    ...overrides,
  };
}

function createArena(overrides: Partial<LichessArena> = {}): LichessArena {
  return {
    nbPlayers: 40,
    duels: [],
    isFinished: true,
    podium: [],
    pairingsClosed: true,
    stats: {
      games: 120,
      moves: 4000,
      whiteWins: 50,
      blackWins: 40,
      draws: 30,
      berserks: 10,
      averageRating: 1800,
    },
    standing: { page: 1, players: [] },
    id: 'arena123',
    createdBy: 'organizer',
    startsAt: '2024-01-01T00:00:00Z',
    system: 'arena',
    fullName: 'Weekly Arena',
    minutes: 60,
    perf: { key: 'blitz', name: 'Blitz', icon: ')' },
    clock: { limit: 180, increment: 2 },
    variant: 'standard',
    rated: true,
    berserkable: true,
    verdicts: { list: [], accepted: true },
    schedule: { freq: 'weekly', speed: 'blitz' },
    ...overrides,
  };
}

function createSwiss(overrides: Partial<LichessSwiss> = {}): LichessSwiss {
  return {
    id: 'swiss123',
    createdBy: 'organizer',
    startsAt: '2024-01-01T00:00:00Z',
    name: 'Weekend Swiss',
    clock: { limit: 300, increment: 3 },
    variant: 'standard',
    round: 3,
    nbRounds: 7,
    nbPlayers: 24,
    nbOngoing: 2,
    status: 'finished',
    stats: {
      games: 60,
      whiteWins: 24,
      blackWins: 18,
      draws: 18,
      byes: 0,
      absences: 1,
      averageRating: 1750,
    },
    rated: true,
    ...overrides,
  };
}

describe('LichessService', () => {
  let service: LichessService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        LichessService,
        ChessFetchService,
        provideHttpClient(withFetch()),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(LichessService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    vi.unstubAllGlobals();
  });
  it('should create the service', () => {
    expect(service).toBeTruthy();
  });

  describe('qs', () => {
    it('should build query string from empty object', () => {
      expect(service.qs({})).toBe('');
    });

    it('should build query string from object with params', () => {
      const result = service.qs({ max: 10, rated: true });
      expect(result).toContain('max=10');
      expect(result).toContain('rated=true');
    });

    it('should handle single param', () => {
      expect(service.qs({ since: 1234567890 })).toContain('since=1234567890');
    });

    it('should handle perfType with comma-separated values', () => {
      const result = service.qs({ perfType: 'bullet,blitz,rapid' });
      expect(result).toContain('perfType=');
      expect(result).toContain('bullet');
      expect(result).toContain('blitz');
      expect(result).toContain('rapid');
    });

    it('should handle color param', () => {
      expect(service.qs({ color: 'white' })).toContain('color=white');
    });

    it('should handle combined params', () => {
      const result = service.qs({
        since: 1609459200000,
        until: 1640995200000,
        perfType: 'blitz',
        color: 'white',
      });
      expect(result).toContain('since=1609459200000');
      expect(result).toContain('until=1640995200000');
      expect(result).toContain('perfType=');
      expect(result).toContain('color=white');
    });
  });

  it('should fetch and format a player profile', async () => {
    const promise = service.profile('TestUser');
    const req = httpMock.expectOne('https://lichess.org/api/user/TestUser');
    req.flush(createPlayer());

    await expect(promise).resolves.toEqual({
      site: 'lichess',
      type: 'profile',
      link: 'https://lichess.org/@/TestUser',
      username: 'TestUser',
      title: 'GM',
      createdAt: 100,
      lastSeenAt: 200,
      name: 'Test User',
      location: 'Warsaw',
      ratings: {
        bullet: { rating: 1500, games: 10 },
        blitz: { rating: 1600, games: 20 },
        rapid: { rating: 1700, games: 5 },
      },
      counts: { all: 35 },
      marked: false,
    });
  });

  it('should fetch and format an arena tournament', async () => {
    const promise = service.arena('arena123');
    const req = httpMock.expectOne('https://lichess.org/api/tournament/arena123');
    req.flush(createArena());

    await expect(promise).resolves.toEqual({
      id: 'arena123',
      type: 'arena',
      site: 'lichess',
      url: 'https://lichess.org/tournament/arena123',
      name: 'Weekly Arena',
      timeControl: { initial: 180, increment: 2 },
      isFinished: true,
      playerCount: 40,
      stats: { games: 120 },
    });
  });

  it('should fetch and format a swiss tournament', async () => {
    const promise = service.swiss('swiss123');
    const req = httpMock.expectOne('https://lichess.org/api/swiss/swiss123');
    req.flush(createSwiss());

    await expect(promise).resolves.toEqual({
      id: 'swiss123',
      type: 'swiss',
      site: 'lichess',
      url: 'https://lichess.org/swiss/swiss123',
      name: 'Weekend Swiss',
      timeControl: { initial: 300, increment: 3 },
      isFinished: true,
      playerCount: 24,
      stats: { games: 60 },
    });
  });

  describe('streaming endpoints', () => {
    it('should stream player games and skip invalid rows', async () => {
      const fetchSpy = vi
        .fn()
        .mockResolvedValue(
          createNdjsonResponse([
            JSON.stringify(createGame()),
            'not-json',
            JSON.stringify(createGame({ id: 'ijklmnop', winner: 'black', status: 'resign' })),
          ]),
        );
      vi.stubGlobal('fetch', fetchSpy);

      const games: string[] = [];
      const results: unknown[] = [];
      await service.playerGames(
        'tester',
        (game) => {
          games.push(game.id);
          results.push(game.result);
        },
        { max: 2, rated: true },
      );

      expect(fetchSpy).toHaveBeenCalledWith(
        'https://lichess.org/api/games/user/tester?max=2&rated=true',
        expect.objectContaining({
          headers: expect.objectContaining({ Accept: 'application/x-ndjson' }),
        }),
      );
      expect(games).toEqual(['abcdefgh', 'ijklmnop']);
      expect(results[0]).toEqual({ winner: 'white', via: 'checkmate', label: '1-0' });
      expect(results[1]).toEqual({ winner: 'black', via: 'resignation', label: '0-1' });
    });

    it('should stream arena and swiss games through their endpoints', async () => {
      const fetchSpy = vi
        .fn()
        .mockResolvedValueOnce(
          createNdjsonResponse([JSON.stringify(createGame({ id: 'arena001' }))]),
        )
        .mockResolvedValueOnce(
          createNdjsonResponse([JSON.stringify(createGame({ id: 'swiss001' }))]),
        );
      vi.stubGlobal('fetch', fetchSpy);

      const arenaGameIds: string[] = [];
      await service.arenaGames('arena123', (game) => arenaGameIds.push(game.id), { since: 1000 });

      const swissGameIds: string[] = [];
      await service.swissGames('swiss123', (game) => swissGameIds.push(game.id), { until: 2000 });

      expect(fetchSpy).toHaveBeenNthCalledWith(
        1,
        'https://lichess.org/api/tournament/arena123/games?since=1000',
        expect.any(Object),
      );
      expect(fetchSpy).toHaveBeenNthCalledWith(
        2,
        'https://lichess.org/api/swiss/swiss123/games?until=2000',
        expect.any(Object),
      );
      expect(arenaGameIds).toEqual(['arena001']);
      expect(swissGameIds).toEqual(['swiss001']);
    });

    it('should stream team members and format them as profiles', async () => {
      const fetchSpy = vi
        .fn()
        .mockResolvedValue(
          createNdjsonResponse([
            JSON.stringify(createPlayer({ username: 'MemberOne' })),
            JSON.stringify(createPlayer({ username: 'MemberTwo', disabled: true })),
          ]),
        );
      vi.stubGlobal('fetch', fetchSpy);

      const members: string[] = [];
      await service.teamMembers('team-id', (player) => members.push(player.username));

      expect(fetchSpy).toHaveBeenCalledWith(
        'https://lichess.org/api/team/team-id/users',
        expect.objectContaining({
          headers: expect.objectContaining({ Accept: 'application/x-ndjson' }),
        }),
      );
      expect(members).toEqual(['MemberOne', 'MemberTwo']);
    });
  });

  describe('game', () => {
    it('should fetch a game using an 8 character game id', async () => {
      const promise = service.game('https://lichess.org/abcdefgh');
      const req = httpMock.expectOne(
        'https://lichess.org/game/export/abcdefgh?pgnInJson=true&clocks=true',
      );
      req.flush(createGame());

      await expect(promise).resolves.toMatchObject({
        id: 'abcdefgh',
        links: {
          white: 'https://lichess.org/abcdefgh',
          black: 'https://lichess.org/abcdefgh/black',
        },
      });
    });

    it('should normalize a 12 character game id to 8 characters', async () => {
      const promise = service.game('https://lichess.org/abcdefgh1234');
      const req = httpMock.expectOne(
        'https://lichess.org/game/export/abcdefgh?pgnInJson=true&clocks=true',
      );
      req.flush(createGame());

      await expect(promise).resolves.toMatchObject({ id: 'abcdefgh' });
    });

    it('should throw for an invalid game id', async () => {
      await expect(service.game('https://lichess.org/short')).rejects.toThrow(
        'Invalid game ID: short',
      );
    });
  });
});
