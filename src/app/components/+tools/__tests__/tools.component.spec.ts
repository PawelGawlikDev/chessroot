import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { ToolsComponent } from '../tools.component';
import { Platform } from '@enums';
import { INITIAL_TIME_CONTROLS, Game } from '@model';
import { ChessComService, LichessService, SeoService } from '@services';
import type { Insights } from '../models';

function buildState(platform: Platform = Platform.Lichess) {
  return {
    userData: {
      platform,
      playerColor: 'white',
      fromDate: null,
      toDate: null,
      timeControls: { ...INITIAL_TIME_CONTROLS },
    },
  };
}

function createGame(overrides: Partial<Game> = {}): Game {
  const base: Game = {
    site: 'lichess',
    type: 'game',
    id: 'game-1',
    links: {
      white: 'https://lichess.org/game-1',
      black: 'https://lichess.org/game-1/black',
    },
    timestamp: new Date('2024-01-10T12:00:00Z').getTime(),
    lastMoveAt: new Date('2024-01-10T12:05:00Z').getTime(),
    isStandard: true,
    clocks: [180, 180],
    result: {
      winner: 'white',
      label: '1-0',
    },
    players: {
      white: { username: 'tester', title: 'GM', rating: 2100 },
      black: { username: 'opponent', title: 'IM', rating: 2000 },
    },
    timeControl: { initial: 180, increment: 0 },
    opening: { eco: 'C20', name: 'King Pawn Game' },
    moves: [{ notation: { notation: 'e4' } }, { notation: { notation: 'e5' } }],
  };

  return {
    ...base,
    ...overrides,
    links: { ...base.links, ...overrides.links },
    result: { ...base.result, ...overrides.result },
    players: {
      white: { ...base.players.white, ...overrides.players?.white },
      black: { ...base.players.black, ...overrides.players?.black },
    },
    timeControl: { ...base.timeControl, ...overrides.timeControl },
    opening: { ...base.opening, ...overrides.opening },
    moves: overrides.moves ?? base.moves,
  };
}

function createInsights(overrides: Partial<Insights> = {}): Insights {
  return {
    totalGames: 0,
    wins: 0,
    losses: 0,
    draws: 0,
    winsAsWhite: 0,
    lossesAsWhite: 0,
    drawsAsWhite: 0,
    whiteGames: 0,
    winsAsBlack: 0,
    lossesAsBlack: 0,
    drawsAsBlack: 0,
    blackGames: 0,
    openings: [],
    topOpponents: [],
    timeControls: [],
    ...overrides,
  };
}

describe('ToolsComponent', () => {
  let fixture: ComponentFixture<ToolsComponent>;
  let component: ToolsComponent;
  let store: MockStore;

  let lichessService: { profile: ReturnType<typeof vi.fn>; playerGames: ReturnType<typeof vi.fn> };
  let chessComService: { profile: ReturnType<typeof vi.fn>; playerGames: ReturnType<typeof vi.fn> };
  let seoService: { setSeo: ReturnType<typeof vi.fn> };

  async function createComponent(platform: Platform = Platform.Lichess): Promise<void> {
    lichessService = { profile: vi.fn(), playerGames: vi.fn() };
    chessComService = { profile: vi.fn(), playerGames: vi.fn() };
    seoService = { setSeo: vi.fn() };

    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      providers: [
        provideMockStore({ initialState: buildState(platform) }),
        { provide: LichessService, useValue: lichessService },
        { provide: ChessComService, useValue: chessComService },
        { provide: SeoService, useValue: seoService },
      ],
    })
      .overrideComponent(ToolsComponent, {
        set: {
          template: '',
          imports: [],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(ToolsComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(MockStore);
  }

  function initializeProcessingState(): void {
    component['insights'] = createInsights();
    component['openingMap'] = new Map();
    component['opponentMap'] = new Map();
    component['tcMap'] = new Map();
  }

  beforeEach(async () => {
    await createComponent();
    component.$username.set('tester');
    initializeProcessingState();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('should call seo.setSeo on init', () => {
    fixture.detectChanges();

    expect(seoService.setSeo).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Insights' }),
      '/tools',
    );
  });

  it('should compute button state, progress and zero-game win rate', () => {
    component.$username.set('');
    expect(component.$isButtonDisabled()).toBe(true);
    component.$username.set('tester');
    expect(component.$isButtonDisabled()).toBe(false);
    expect(component.$progress()).toBe(0);
    expect(component.$winRate()).toBe(0);
  });

  it('should process a white win, black win and draw with time-control categories', () => {
    component['processGame'](createGame({ timeControl: { initial: 30, increment: 0 } }));
    component['processGame'](
      createGame({
        id: 'game-2',
        players: {
          white: { username: 'other', title: 'FM', rating: 1900 },
          black: { username: 'tester', title: 'GM', rating: 2100 },
        },
        result: { winner: 'black', label: '0-1' },
        timeControl: { initial: 180, increment: 0 },
      }),
    );
    component['processGame'](
      createGame({
        id: 'game-3',
        result: { winner: undefined, label: '½-½' },
        timeControl: { initial: 600, increment: 10 },
      }),
    );
    component['processGame'](
      createGame({
        id: 'game-4',
        result: { winner: undefined, label: '½-½' },
        timeControl: { initial: 1800, increment: 0 },
      }),
    );

    expect(component['insights']).toMatchObject({
      totalGames: 4,
      wins: 2,
      draws: 2,
      whiteGames: 3,
      blackGames: 1,
      winsAsWhite: 1,
      winsAsBlack: 1,
      drawsAsWhite: 2,
    });
    expect(Array.from(component['opponentMap'].values())).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ username: 'opponent', games: 3 }),
        expect.objectContaining({ username: 'other', games: 1, wins: 1 }),
      ]),
    );
    expect(Array.from(component['tcMap'].keys())).toEqual(
      expect.arrayContaining(['Bullet', 'Blitz', 'Rapid', 'Classical']),
    );
  });

  it('should apply date and time-control filters', () => {
    const game = createGame({ timestamp: new Date('2024-01-15T12:00:00Z').getTime() });
    const timeControls = { ...INITIAL_TIME_CONTROLS, blitz: false };

    expect(component['applyFilters'](game, '2024-01-10', '2024-01-20', INITIAL_TIME_CONTROLS)).toBe(
      true,
    );
    expect(component['applyFilters'](game, '2024-01-16', null, INITIAL_TIME_CONTROLS)).toBe(false);
    expect(component['applyFilters'](game, null, '2024-01-14', INITIAL_TIME_CONTROLS)).toBe(false);
    expect(component['applyFilters'](game, null, null, timeControls)).toBe(false);
  });

  it('should sort and limit top opponents', () => {
    component.$insights.set(
      createInsights({
        totalGames: 12,
        topOpponents: Array.from({ length: 12 }, (_, index) => ({
          username: `opponent-${index}`,
          games: 12 - index,
          wins: index,
          losses: 0,
          draws: 0,
        })),
      }),
    );

    const rows = component.$topOpponentsList();

    expect(rows).toHaveLength(10);
    expect(rows[0]).toMatchObject({ label: 'opponent-0', count: 12 });
    expect(rows[9]).toMatchObject({ label: 'opponent-9', count: 3 });
  });

  it('should expose time-control stats rows', () => {
    component.$insights.set(
      createInsights({
        timeControls: [
          { name: 'Rapid', total: 2, wins: 1, losses: 1, draws: 0 },
          { name: 'Blitz', total: 5, wins: 3, losses: 1, draws: 1 },
        ],
      }),
    );

    expect(component.$timeControlStats()).toEqual([
      expect.objectContaining({ label: 'Blitz', count: 5 }),
      expect.objectContaining({ label: 'Rapid', count: 2 }),
    ]);
  });

  it('should process buffered games and increment analyzed count', async () => {
    vi.useFakeTimers();
    initializeProcessingState();
    component['gameBuffer'] = [
      createGame(),
      createGame({ id: 'game-2', result: { label: '½-½' } }),
    ];

    const promise = component['processGameBuffer']();
    await vi.runAllTimersAsync();
    await promise;

    expect(component.$gamesAnalyzed()).toBe(2);
    expect(component['insights'].totalGames).toBe(2);
    expect(component['isProcessing']).toBe(false);
  });

  it('should resolve drainBuffer once processing finishes', async () => {
    component['isProcessing'] = true;
    component['gameBuffer'] = [];
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      component['isProcessing'] = false;
      callback(0);
      return 1;
    });

    await expect(component['drainBuffer']()).resolves.toBeUndefined();
  });

  it('should fetch lichess games and build insights', async () => {
    vi.useFakeTimers();
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      return setTimeout(() => callback(0), 0) as unknown as number;
    });

    lichessService.profile.mockResolvedValue({ counts: { all: 8 } });
    lichessService.playerGames.mockImplementation(
      async (_username: string, onGame: (game: Game) => void) => {
        onGame(createGame());
        onGame(createGame({ id: 'game-2', result: { winner: undefined, label: '½-½' } }));
      },
    );

    const promise = component.fetchGames();
    await vi.runAllTimersAsync();
    await promise;

    expect(lichessService.profile).toHaveBeenCalledWith('tester');
    expect(lichessService.playerGames).toHaveBeenCalled();
    expect(component.$totalGames()).toBe(8);
    expect(component.$gameCount()).toBe(2);
    expect(component.$gamesAnalyzed()).toBe(2);
    expect(component.$insights()).toMatchObject({ totalGames: 2, wins: 1, draws: 1 });
    expect(component.$isLoading()).toBe(false);
  });

  it('should fetch chess.com games and apply filters before buffering', async () => {
    vi.useFakeTimers();
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      return setTimeout(() => callback(0), 0) as unknown as number;
    });

    await createComponent(Platform.ChessCom);
    component.$username.set('tester');
    store.setState({
      userData: {
        platform: Platform.ChessCom,
        playerColor: 'white',
        fromDate: '2024-01-10',
        toDate: '2024-01-20',
        timeControls: { ...INITIAL_TIME_CONTROLS },
      },
    });

    chessComService.profile.mockResolvedValue({ counts: { all: 4 } });
    chessComService.playerGames.mockImplementation(
      async (_username: string, onGame: (game: Game) => void) => {
        onGame(
          createGame({ site: 'chess.com', timestamp: new Date('2024-01-12T12:00:00Z').getTime() }),
        );
        onGame(
          createGame({ site: 'chess.com', timestamp: new Date('2024-01-25T12:00:00Z').getTime() }),
        );
      },
    );

    const promise = component.fetchGames();
    await vi.runAllTimersAsync();
    await promise;

    expect(chessComService.profile).toHaveBeenCalledWith('tester');
    expect(chessComService.playerGames).toHaveBeenCalled();
    expect(component.$gameCount()).toBe(1);
    expect(component.$gamesAnalyzed()).toBe(1);
    expect(component.$insights()?.totalGames).toBe(1);
  });
});
