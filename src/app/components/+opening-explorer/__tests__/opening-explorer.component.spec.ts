import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { of } from 'rxjs';
import { OpeningExplorerComponent } from '../opening-explorer.component';
import { Platform } from '@enums';
import { INITIAL_TIME_CONTROLS, Game } from '@model';
import type { BookMovesData, ExplorerMove, OpeningBookConfig } from '@model/opening-explorer.model';
import {
  ChessComService,
  LichessService,
  OpeningBookService,
  OpeningGraphService,
  OpeningManagerService,
  SeoService,
  StockfishAnalysisService,
} from '@services';

function buildState(
  platform: Platform = Platform.Lichess,
  bookMoves: BookMovesData = { fetch: 'off' },
) {
  return {
    userData: {
      platform,
      playerColor: 'white',
      fromDate: null,
      toDate: null,
      timeControls: { ...INITIAL_TIME_CONTROLS },
    },
    explorer: {
      bookMoves,
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
    moves: [
      { notation: { notation: 'e4' } },
      { notation: { notation: 'e5' } },
      { notation: { notation: 'Nf3' } },
    ],
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

describe('OpeningExplorerComponent', () => {
  let fixture: ComponentFixture<OpeningExplorerComponent>;
  let component: OpeningExplorerComponent;
  let store: MockStore;
  let graph: OpeningGraphService;
  let manager: OpeningManagerService;

  let lichessService: { profile: ReturnType<typeof vi.fn>; playerGames: ReturnType<typeof vi.fn> };
  let chessComService: { profile: ReturnType<typeof vi.fn>; playerGames: ReturnType<typeof vi.fn> };
  let bookService: {
    config: ReturnType<typeof signal<OpeningBookConfig>>;
    clearCache: ReturnType<typeof vi.fn>;
    updateConfig: ReturnType<typeof vi.fn>;
  };
  let seoService: { setSeo: ReturnType<typeof vi.fn> };
  let dialog: { open: ReturnType<typeof vi.fn> };
  let stockfish: {
    $enabled: ReturnType<typeof signal<boolean>>;
    $ready: ReturnType<typeof signal<boolean>>;
    $isAnalyzing: ReturnType<typeof signal<boolean>>;
    $result: ReturnType<
      typeof signal<{ evaluation: null; bestMove: null; pv: string[]; depth: number }>
    >;
    $depth: ReturnType<typeof signal<number>>;
    analyzePosition: ReturnType<typeof vi.fn>;
    toggle: ReturnType<typeof vi.fn>;
    setDepth: ReturnType<typeof vi.fn>;
  };

  async function createComponent(
    platform: Platform = Platform.Lichess,
    bookMoves: BookMovesData = { fetch: 'off' },
  ): Promise<void> {
    lichessService = { profile: vi.fn(), playerGames: vi.fn() };
    chessComService = { profile: vi.fn(), playerGames: vi.fn() };
    bookService = {
      config: signal<OpeningBookConfig>({
        bookType: 'lichess',
        ratings: [2000],
        speeds: ['rapid'],
      }),
      clearCache: vi.fn(),
      updateConfig: vi.fn(),
    };
    seoService = { setSeo: vi.fn() };
    dialog = { open: vi.fn() };
    stockfish = {
      $enabled: signal(false),
      $ready: signal(false),
      $isAnalyzing: signal(false),
      $result: signal({ evaluation: null, bestMove: null, pv: [], depth: 0 }),
      $depth: signal(18),
      analyzePosition: vi.fn(),
      toggle: vi.fn(),
      setDepth: vi.fn(),
    };

    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      providers: [
        provideMockStore({ initialState: buildState(platform, bookMoves) }),
        OpeningGraphService,
        OpeningManagerService,
        { provide: LichessService, useValue: lichessService },
        { provide: ChessComService, useValue: chessComService },
        { provide: OpeningBookService, useValue: bookService },
        { provide: SeoService, useValue: seoService },
        { provide: MatDialog, useValue: dialog },
        { provide: StockfishAnalysisService, useValue: stockfish },
      ],
    })
      .overrideComponent(OpeningExplorerComponent, {
        set: {
          template: '',
          imports: [],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(OpeningExplorerComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(MockStore);
    graph = TestBed.inject(OpeningGraphService);
    manager = TestBed.inject(OpeningManagerService);
    component.$username.set('tester');
  }

  beforeEach(async () => {
    await createComponent();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('should initialize seo and request the opening book on init', () => {
    const dispatchSpy = vi.spyOn(store, 'dispatch');

    fixture.detectChanges();

    expect(seoService.setSeo).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Opening Explorer' }),
      '/explorer',
    );
    expect(dispatchSpy).toHaveBeenCalled();
  });

  it('should compute last move from the opening manager', () => {
    component.onBoardMove('e4');

    expect(component.$lastMove()).toEqual(['e2', 'e4']);
  });

  it('should transform store book moves into board-aware moves', async () => {
    await createComponent(Platform.Lichess, {
      fetch: 'success',
      moves: [
        {
          san: 'e4',
          moveCount: 10,
          details: {
            hasData: true,
            whiteWins: 6,
            blackWins: 2,
            draws: 2,
            count: 10,
            totalOpponentElo: 20000,
          },
        },
      ],
    });

    expect(component.$bookMovesList()).toEqual([
      expect.objectContaining({ san: 'e4', orig: 'e2', dest: 'e4', moveCount: 10 }),
    ]);
  });

  it('should merge player moves with matching book moves', async () => {
    await createComponent(Platform.Lichess, {
      fetch: 'success',
      moves: [
        {
          san: 'e4',
          moveCount: 12,
          details: {
            hasData: true,
            whiteWins: 7,
            blackWins: 3,
            draws: 2,
            count: 12,
            totalOpponentElo: 24000,
          },
        },
      ],
    });
    graph.addGame(createGame(), 'white');
    component.$loaded.set(true);

    const merged = component.$mergedMoves();

    expect(merged[0]?.san).toBe('e4');
    expect(merged[0]?.compareTo).toMatchObject({
      bookScore: expect.any(Number),
      userScore: expect.any(Number),
      values: expect.any(Array),
    });
  });

  it('should compute arrows for highlighted and suggested moves', () => {
    graph.addGame(createGame(), 'white');
    component.$loaded.set(true);

    const move = component.$mergedMoves()[0] as ExplorerMove;
    component.onHighlightMove(move);

    const arrows = component.$arrows();

    expect(arrows[0]).toMatchObject({ orig: move.orig, dest: move.dest, brush: 'blue' });
    expect(arrows.length).toBeGreaterThan(0);
  });

  it('should expose evaluation helpers and pvSan conversions', () => {
    expect(component.evalScore({ evaluation: { type: 'cp', value: 150 } })).toBe(150);
    expect(component.evalText({ evaluation: { type: 'cp', value: 150 } })).toBe('+1.50');
    expect(component.evalText({ evaluation: { type: 'mate', value: -2 } })).toBe('M2');
    expect(component.evalFlexWhite({ evaluation: { type: 'cp', value: 500 } })).toBe(100);
    expect(component.evalFlexBlack({ evaluation: { type: 'cp', value: 500 } })).toBe(0);
    expect(
      component.pvSan('rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1', ['e7e5'], 0),
    ).toBe('e5');
    expect(component.pvSan('invalid', ['abcd'], 0)).toBe('abcd');
  });

  it('should open book settings and dispatch a refresh when config changes', () => {
    const dispatchSpy = vi.spyOn(store, 'dispatch');
    const config: OpeningBookConfig = {
      bookType: 'masters',
      ratings: [2200],
      speeds: ['classical'],
    };
    dialog.open.mockReturnValue({ afterClosed: () => of(config) });

    component.openBookSettings();

    expect(dialog.open).toHaveBeenCalled();
    expect(bookService.updateConfig).toHaveBeenCalledWith(config);
    expect(dispatchSpy).toHaveBeenCalled();
  });

  it('should throw on invalid SAN in onBoardMove and not add ply', () => {
    const addPlySpy = vi.spyOn(manager, 'addPly');
    const dispatchSpy = vi.spyOn(store, 'dispatch');
    dispatchSpy.mockClear();

    expect(() => component.onBoardMove('invalid')).toThrow('Invalid move: invalid');
    expect(addPlySpy).not.toHaveBeenCalled();
    expect(dispatchSpy).not.toHaveBeenCalled();
  });

  it('should resolve player color from the game players', () => {
    expect(component['resolvePlayerColor'](createGame())).toBe('white');
    expect(
      component['resolvePlayerColor'](
        createGame({
          players: {
            white: { username: 'other', title: 'FM', rating: 1800 },
            black: { username: 'tester', title: 'GM', rating: 2100 },
          },
        }),
      ),
    ).toBe('black');
    expect(
      component['resolvePlayerColor'](
        createGame({
          players: {
            white: { username: 'other', title: 'FM', rating: 1800 },
            black: { username: 'another', title: 'IM', rating: 2000 },
          },
        }),
      ),
    ).toBe('white');
  });

  it('should fetch lichess games and populate the graph', async () => {
    lichessService.profile.mockResolvedValue({ counts: { all: 5 } });
    lichessService.playerGames.mockImplementation(
      async (_username: string, onGame: (game: Game) => void) => {
        onGame(createGame());
      },
    );

    await component.fetchGames();

    expect(lichessService.profile).toHaveBeenCalledWith('tester');
    expect(lichessService.playerGames).toHaveBeenCalled();
    expect(component.$totalGames()).toBe(5);
    expect(component.$gameCount()).toBe(1);
    expect(component.$gamesAnalyzed()).toBe(1);
    expect(component.$loaded()).toBe(true);
    expect(component.$isLoading()).toBe(false);
    expect(graph.hasMoves).toBe(true);
  });

  it('should fetch chess.com games, filter them and populate the graph', async () => {
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
      explorer: { bookMoves: { fetch: 'off' } },
    });

    chessComService.profile.mockResolvedValue({ counts: { all: 3 } });
    chessComService.playerGames.mockImplementation(
      async (_username: string, onGame: (game: Game) => void) => {
        onGame(
          createGame({ site: 'chess.com', timestamp: new Date('2024-01-12T12:00:00Z').getTime() }),
        );
        onGame(
          createGame({
            site: 'chess.com',
            timestamp: new Date('2024-01-12T12:00:00Z').getTime(),
            players: {
              white: { username: 'other', title: 'FM', rating: 1800 },
              black: { username: 'tester', title: 'GM', rating: 2100 },
            },
          }),
        );
      },
    );

    await component.fetchGames();

    expect(chessComService.profile).toHaveBeenCalledWith('tester');
    expect(chessComService.playerGames).toHaveBeenCalled();
    expect(component.$totalGames()).toBe(3);
    expect(component.$gameCount()).toBe(2);
    expect(component.$gamesAnalyzed()).toBe(1);
    expect(graph.hasMoves).toBe(true);
  });

  it('should handle playerGames errors and reset loading state', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    lichessService.profile.mockResolvedValue({ counts: { all: 2 } });
    lichessService.playerGames.mockRejectedValue(new Error('boom'));

    await component.fetchGames();

    expect(consoleErrorSpy).toHaveBeenCalled();
    expect(component.$loaded()).toBe(true);
    expect(component.$isLoading()).toBe(false);
    expect(component.$gameCount()).toBe(0);
  });
});
