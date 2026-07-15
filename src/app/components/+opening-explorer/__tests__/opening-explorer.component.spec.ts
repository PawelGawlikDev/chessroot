import { TestBed } from '@angular/core/testing';
import { Component, input, output } from '@angular/core';
import { provideMockStore } from '@ngrx/store/testing';
import { provideNativeDateAdapter } from '@angular/material/core';
import { OpeningExplorerComponent } from '../opening-explorer.component';
import { Platform } from '@enums';
import { EXPLORER_FEATURE_KEY } from '@state/reducers';
import { USER_DATA_FEATURE_KEY } from '@state/selectors';
import { INITIAL_TIME_CONTROLS } from '@model';
import type { ExplorerMove, BookMovesData } from '@model/opening-explorer.model';
import type { DrawShape } from 'chessground/draw';

@Component({ selector: 'cr-game-fetch-panel', template: '', standalone: true })
class MockGameFetchPanelComponent {
  public readonly title = input('');
  public readonly headerIcon = input('');
  public readonly buttonLabel = input('');
  public readonly buttonIcon = input('');
  public readonly isLoading = input(false);
  public readonly isButtonDisabled = input(false);
  public readonly progress = input(0);
  public readonly gameCount = input(0);
  public readonly gamesAnalyzed = input(0);
  public readonly totalGames = input(0);
  public readonly showColorFilter = input(false);
  public readonly username = input('');
  public readonly usernameChange = output<string>();
  public readonly fetch = output<void>();
}

@Component({ selector: 'cr-move-navigation', template: '', standalone: true })
class MockMoveNavigationComponent {
  public readonly plys = input<unknown[]>([]);
  public readonly currentIndex = input(0);
  public readonly goForward = output<void>();
  public readonly goBack = output<void>();
  public readonly reset = output<void>();
  public readonly navigate = output<number>();
}

@Component({ selector: 'cr-chess-board', template: '', standalone: true })
class MockChessBoardComponent {
  public readonly fen = input('');
  public readonly orientation = input<'white' | 'black'>('white');
  public readonly turnColor = input<'white' | 'black'>('white');
  public readonly lastMove = input<string[] | null>(null);
  public readonly arrows = input<DrawShape[]>([]);
  public readonly interactive = input(false);
  public readonly movePlayed = output<string>();
}

@Component({ selector: 'cr-moves-table', template: '', standalone: true })
class MockMovesTableComponent {
  public readonly moves = input<ExplorerMove[]>([]);
  public readonly highlightSan = input<string | null>(null);
  public readonly showAsPercentage = input(false);
  public readonly showSettings = input(false);
  public readonly playMove = output<ExplorerMove>();
  public readonly highlight = output<ExplorerMove | null>();
  public readonly settingsClick = output<void>();
}

const initialState = {
  [USER_DATA_FEATURE_KEY]: {
    platform: Platform.Lichess,
    playerColor: 'white',
    fromDate: null,
    toDate: null,
    timeControls: { ...INITIAL_TIME_CONTROLS },
  },
  [EXPLORER_FEATURE_KEY]: {
    bookMoves: { fetch: 'off' } as BookMovesData,
  },
};

describe('OpeningExplorerComponent', () => {
  function createComponent() {
    const fixture = TestBed.createComponent(OpeningExplorerComponent);
    fixture.detectChanges();
    return { fixture, component: fixture.componentInstance };
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        OpeningExplorerComponent,
        MockGameFetchPanelComponent,
        MockMoveNavigationComponent,
        MockChessBoardComponent,
        MockMovesTableComponent,
      ],
      providers: [provideNativeDateAdapter(), provideMockStore({ initialState })],
    });
  });

  it('should create', () => {
    const { component } = createComponent();
    expect(component).toBeTruthy();
  });

  it('should set default active tab to moves', () => {
    const { component } = createComponent();
    expect(component.$activeTab()).toBe('moves');
  });

  it('should flip board orientation', () => {
    const { component } = createComponent();
    expect(component.$orientation()).toBe('white');
    component.flipBoard();
    expect(component.$orientation()).toBe('black');
    component.flipBoard();
    expect(component.$orientation()).toBe('white');
  });

  it('should switch tabs', () => {
    const { component } = createComponent();
    component.switchTab('book');
    expect(component.$activeTab()).toBe('book');
    component.switchTab('analysis');
    expect(component.$activeTab()).toBe('analysis');
    component.switchTab('moves');
    expect(component.$activeTab()).toBe('moves');
  });

  it('should set username', () => {
    const { component } = createComponent();
    component.$username.set('testuser');
    expect(component.$username()).toBe('testuser');
  });

  it('should compute isButtonDisabled when username is empty', () => {
    const { component } = createComponent();
    expect(component.$isButtonDisabled()).toBe(true);
  });

  it('should compute isButtonDisabled when username is set', () => {
    const { component } = createComponent();
    component.$username.set('testuser');
    expect(component.$isButtonDisabled()).toBe(false);
  });

  it('should compute isButtonDisabled when loading', () => {
    const { component } = createComponent();
    component.$username.set('testuser');
    component.$isLoading.set(true);
    expect(component.$isButtonDisabled()).toBe(true);
  });

  it('should compute progress with total games', () => {
    const { component } = createComponent();
    component.$totalGames.set(100);
    component.$gamesAnalyzed.set(50);
    expect(component.$progress()).toBe(50);
  });

  it('should compute progress with 0 total games using gameCount as denominator', () => {
    const { component } = createComponent();
    component.$totalGames.set(0);
    component.$gameCount.set(20);
    component.$gamesAnalyzed.set(5);
    expect(component.$progress()).toBe(25);
  });

  it('should return 0 progress when no games', () => {
    const { component } = createComponent();
    expect(component.$progress()).toBe(0);
  });

  it('should handle onReset', () => {
    const { component } = createComponent();
    component.onReset();
    expect(component.$fen()).toBeTruthy();
  });

  it('should handle onGoForward', () => {
    const { component } = createComponent();
    component.onGoForward();
    expect(component.$fen()).toBeTruthy();
  });

  it('should handle onGoBack', () => {
    const { component } = createComponent();
    component.onGoBack();
    expect(component.$fen()).toBeTruthy();
  });

  it('should handle onNavigateTo', () => {
    const { component } = createComponent();
    component.onNavigateTo(0);
    expect(component.$fen()).toBeTruthy();
  });

  it('should handle onBoardMove with a valid SAN', () => {
    const { component } = createComponent();
    component.onBoardMove('e4');
    expect(component.$fen()).not.toBe('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
  });

  it('should throw on board move with invalid SAN', () => {
    const { component } = createComponent();
    expect(() => component.onBoardMove('invalid')).toThrow('Invalid move: invalid');
  });

  it('should handle onTableMove', () => {
    const { component } = createComponent();
    const move: ExplorerMove = {
      san: 'e4',
      orig: 'e2',
      dest: 'e4',
      moveCount: 1,
      details: {
        whiteWins: 0,
        blackWins: 0,
        draws: 0,
        count: 0,
        totalOpponentElo: 0,
        hasData: false,
      },
      level: 1,
    };
    component.onTableMove(move);
    expect(component.$fen()).not.toBe('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
  });

  it('should highlight a move', () => {
    const { component } = createComponent();
    const move: ExplorerMove = {
      san: 'e4',
      orig: 'e2',
      dest: 'e4',
      moveCount: 1,
      details: {
        whiteWins: 0,
        blackWins: 0,
        draws: 0,
        count: 0,
        totalOpponentElo: 0,
        hasData: false,
      },
      level: 1,
    };
    component.onHighlightMove(move);
    expect(component.$highlightedMove()).toBe(move);
    component.onHighlightMove(null);
    expect(component.$highlightedMove()).toBeNull();
  });

  it('should handle keyboard navigation (ArrowLeft, ArrowRight)', () => {
    const { component } = createComponent();
    const leftEvent = new KeyboardEvent('keydown', { key: 'ArrowLeft', cancelable: true });
    const rightEvent = new KeyboardEvent('keydown', { key: 'ArrowRight', cancelable: true });
    const preventDefaultLeft = vi.spyOn(leftEvent, 'preventDefault');
    const preventDefaultRight = vi.spyOn(rightEvent, 'preventDefault');
    component.onKeydown(leftEvent);
    expect(preventDefaultLeft).toHaveBeenCalled();
    component.onKeydown(rightEvent);
    expect(preventDefaultRight).toHaveBeenCalled();
  });

  it('should not handle non-arrow keys', () => {
    const { component } = createComponent();
    const event = new KeyboardEvent('keydown', { key: 'Enter', cancelable: true });
    const preventDefault = vi.spyOn(event, 'preventDefault');
    component.onKeydown(event);
    expect(preventDefault).not.toHaveBeenCalled();
  });

  it('should compute turnColor from FEN', () => {
    const { component } = createComponent();
    expect(component.$turnColor()).toBe('white');
  });

  it('should compute turnColor as white for invalid FEN', () => {
    const { component } = createComponent();
    const mockMgr = { plys: [{ fen: 'invalid', move: null }], currentIndex: 0 };
    Object.defineProperty(component, 'manager', { value: mockMgr });
    component.constructor;
    expect(component.$turnColor()).toBe('white');
  });

  it('should compute arrows for highlighted move', () => {
    const { component } = createComponent();
    const move: ExplorerMove = {
      san: 'e4',
      orig: 'e2',
      dest: 'e4',
      moveCount: 1,
      details: {
        whiteWins: 0,
        blackWins: 0,
        draws: 0,
        count: 0,
        totalOpponentElo: 0,
        hasData: false,
      },
      level: 1,
    };
    component.onHighlightMove(move);
    const arrows = component.$arrows();
    expect(arrows.length).toBeGreaterThan(0);
    expect(arrows[0].orig).toBe('e2');
  });

  it('should return empty arrows when no moves and no highlight', () => {
    const { component } = createComponent();
    expect(component.$arrows()).toEqual([]);
  });

  it('should evaluate score', () => {
    const { component } = createComponent();
    expect(component.evalScore({ evaluation: { type: 'cp', value: 150 } })).toBe(150);
    expect(component.evalScore({ evaluation: null })).toBe(0);
  });

  it('should evaluate mate score', () => {
    const { component } = createComponent();
    expect(component.evalScore({ evaluation: { type: 'mate', value: 3 } })).toBe(999);
    expect(component.evalScore({ evaluation: { type: 'mate', value: -2 } })).toBe(-999);
  });

  it('should format evaluation text for cp', () => {
    const { component } = createComponent();
    expect(component.evalText({ evaluation: { type: 'cp', value: 150 } })).toBe('+1.50');
    expect(component.evalText({ evaluation: { type: 'cp', value: -50 } })).toBe('-0.50');
  });

  it('should format evaluation text for mate', () => {
    const { component } = createComponent();
    expect(component.evalText({ evaluation: { type: 'mate', value: 3 } })).toBe('M3');
    expect(component.evalText({ evaluation: { type: 'mate', value: -2 } })).toBe('M2');
  });

  it('should return empty string for null evaluation', () => {
    const { component } = createComponent();
    expect(component.evalText({ evaluation: null })).toBe('');
  });

  it('should compute eval flex for white', () => {
    const { component } = createComponent();
    expect(component.evalFlexWhite({ evaluation: { type: 'cp', value: 0 } })).toBe(50);
    expect(component.evalFlexWhite({ evaluation: { type: 'cp', value: 500 } })).toBe(100);
    expect(component.evalFlexWhite({ evaluation: { type: 'cp', value: -500 } })).toBe(0);
  });

  it('should compute eval flex for black', () => {
    const { component } = createComponent();
    expect(component.evalFlexBlack({ evaluation: { type: 'cp', value: 0 } })).toBe(50);
    expect(component.evalFlexBlack({ evaluation: { type: 'cp', value: 500 } })).toBe(0);
    expect(component.evalFlexBlack({ evaluation: { type: 'cp', value: -500 } })).toBe(100);
  });

  it('should convert PV UCI to SAN', () => {
    const { component } = createComponent();
    const fen = 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1';
    const pv = ['e7e5'];
    expect(component.pvSan(fen, pv, 0)).toBe('e5');
  });

  it('should return raw UCI when PV conversion fails', () => {
    const { component } = createComponent();
    expect(component.pvSan('invalid', ['xyz'], 0)).toBe('xyz');
  });

  it('should return empty string for out-of-bounds PV index', () => {
    const { component } = createComponent();
    expect(
      component.pvSan('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', ['e2e4'], 5),
    ).toBe('');
  });

  it('should set loading state on fetch start', () => {
    const { component } = createComponent();
    component.$username.set('testuser');
    component.fetchGames();
    expect(component.$isLoading()).toBe(true);
    expect(component.$loaded()).toBe(false);
  });
});
