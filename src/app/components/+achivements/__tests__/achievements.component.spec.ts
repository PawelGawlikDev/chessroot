import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { AchievementsComponent } from '../achievements.component';
import { Platform } from '@enums';
import { INITIAL_TIME_CONTROLS, Game } from '@model';
import { LichessService, ChessComService, GameCheckerService, SeoService } from '@services';
import type { TrophyCheckResult } from '@achievements/types';

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
    clocks: [180, 180],
    type: 'game',
    id: 'game-1',
    links: {
      white: 'https://lichess.org/game-1',
      black: 'https://lichess.org/game-1/black',
    },
    timestamp: new Date('2024-01-10T12:00:00Z').getTime(),
    lastMoveAt: new Date('2024-01-10T12:05:00Z').getTime(),
    isStandard: true,
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

describe('AchievementsComponent', () => {
  let fixture: ComponentFixture<AchievementsComponent>;
  let component: AchievementsComponent;
  let store: MockStore;

  let lichessService: { profile: ReturnType<typeof vi.fn>; playerGames: ReturnType<typeof vi.fn> };
  let chessComService: { profile: ReturnType<typeof vi.fn>; playerGames: ReturnType<typeof vi.fn> };
  let gameChecker: { checkGame: ReturnType<typeof vi.fn> };
  let seoService: { setSeo: ReturnType<typeof vi.fn> };

  async function createComponent(platform: Platform = Platform.Lichess): Promise<void> {
    lichessService = { profile: vi.fn(), playerGames: vi.fn() };
    chessComService = { profile: vi.fn(), playerGames: vi.fn() };
    gameChecker = { checkGame: vi.fn(() => new Map<string, TrophyCheckResult>()) };
    seoService = { setSeo: vi.fn() };

    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      providers: [
        provideMockStore({ initialState: buildState(platform) }),
        { provide: LichessService, useValue: lichessService },
        { provide: ChessComService, useValue: chessComService },
        { provide: GameCheckerService, useValue: gameChecker },
        { provide: SeoService, useValue: seoService },
      ],
    })
      .overrideComponent(AchievementsComponent, {
        set: {
          template: '',
          imports: [],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(AchievementsComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(MockStore);
  }

  beforeEach(async () => {
    await createComponent();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('should call seo.setSeo on init', () => {
    fixture.detectChanges();

    expect(seoService.setSeo).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Achievements' }),
      '/achievements',
    );
  });

  it('should expose summary, totals, categories and button state signals', () => {
    expect(component.$isButtonDisabled()).toBe(true);
    component.$username.set('tester');
    expect(component.$isButtonDisabled()).toBe(false);
    expect(component.$progress()).toBe(0);
    expect(component.$summary()).toBe('');
    expect(component['$totalTrophies']()).toBe(0);
    expect(component['$totalAchievementTypes']()).toBe(0);

    component['$results'].set(
      new Map([
        [
          'pawnCheckmate',
          [
            {
              gameId: 'game-1',
              opponent: 'opponent',
              opponentTitle: 'IM',
              link: 'https://lichess.org/game-1#12',
              date: '2024-01-10',
              color: 'w',
              onMoveNumber: 12,
            },
          ],
        ],
      ]),
    );

    expect(component['$totalTrophies']()).toBe(1);
    expect(component['$totalAchievementTypes']()).toBe(1);
    expect(component.$summary()).toContain('1</strong> Trophy');
    expect(
      component
        .$categories()
        .some((category) => category.goals.some((goal) => goal.trophyCount > 0)),
    ).toBe(true);
  });

  it('should toggle expanded achievements', () => {
    component.toggleAchievement('pawnCheckmate');
    expect(component.$expandedAchievements().has('pawnCheckmate')).toBe(true);

    component.toggleAchievement('pawnCheckmate');
    expect(component.$expandedAchievements().has('pawnCheckmate')).toBe(false);
  });

  it('should analyze a game and store matching trophies for the logged-in player', () => {
    component.$username.set('tester');
    gameChecker.checkGame.mockReturnValue(
      new Map<string, TrophyCheckResult>([
        ['pawnCheckmate', [{ color: 'w', onMoveNumber: 12 }]],
        ['ignored', [{ color: 'b', onMoveNumber: 5 }]],
      ]),
    );

    const positions = component['analyzeGame'](createGame());

    expect(positions).toBe(2);
    expect(component['$results']().get('pawnCheckmate')).toEqual([
      {
        gameId: 'game-1',
        opponent: 'opponent',
        opponentTitle: 'IM',
        link: 'https://lichess.org/game-1#12',
        date: '2024-01-10',
        color: 'w',
        onMoveNumber: 12,
      },
    ]);
    expect(component['$results']().has('ignored')).toBe(false);
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

  it('should fetch and analyze lichess games', async () => {
    vi.useFakeTimers();
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      return setTimeout(() => callback(0), 0) as unknown as number;
    });

    component.$username.set('tester');
    lichessService.profile.mockResolvedValue({ counts: { all: 25 } });
    lichessService.playerGames.mockImplementation(
      async (_username: string, onGame: (game: Game) => void) => {
        onGame(createGame());
      },
    );
    gameChecker.checkGame.mockReturnValue(
      new Map<string, TrophyCheckResult>([['pawnCheckmate', [{ color: 'w', onMoveNumber: 12 }]]]),
    );

    const promise = component.fetchGames();
    await vi.runAllTimersAsync();
    await promise;

    expect(lichessService.profile).toHaveBeenCalledWith('tester');
    expect(lichessService.playerGames).toHaveBeenCalled();
    expect(component.$totalGames()).toBe(25);
    expect(component.$gameCount()).toBe(1);
    expect(component.$gamesAnalyzed()).toBe(1);
    expect(component.$positionCount()).toBe(2);
    expect(component.$isLoading()).toBe(false);
    expect(component.$summary()).toContain('Trophy');
  });

  it('should fetch chess.com games and apply filters before analyzing', async () => {
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

    chessComService.profile.mockResolvedValue({ counts: { all: 10 } });
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
    gameChecker.checkGame.mockReturnValue(new Map<string, TrophyCheckResult>());

    const promise = component.fetchGames();
    await vi.runAllTimersAsync();
    await promise;

    expect(chessComService.profile).toHaveBeenCalledWith('tester');
    expect(chessComService.playerGames).toHaveBeenCalled();
    expect(component.$totalGames()).toBe(10);
    expect(component.$gameCount()).toBe(1);
    expect(component.$gamesAnalyzed()).toBe(1);
    expect(component.$isLoading()).toBe(false);
  });
});
