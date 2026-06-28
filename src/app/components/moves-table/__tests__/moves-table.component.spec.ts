import { TestBed } from '@angular/core/testing';
import { MovesTableComponent } from '../moves-table.component';
import type { ExplorerMove } from '@model/opening-explorer.model';

describe('MovesTableComponent', () => {
  const mockMoves: ExplorerMove[] = [
    {
      san: 'e4',
      orig: 'e2',
      dest: 'e4',
      moveCount: 1000,
      details: {
        whiteWins: 400,
        blackWins: 300,
        draws: 300,
        count: 1000,
        totalOpponentElo: 0,
        hasData: true,
      },
      level: 1,
    },
    {
      san: 'd4',
      orig: 'd2',
      dest: 'd4',
      moveCount: 2000000,
      details: {
        whiteWins: 800000,
        blackWins: 700000,
        draws: 500000,
        count: 2000000,
        totalOpponentElo: 0,
        hasData: true,
      },
      level: 2,
    },
    {
      san: 'Nf3',
      orig: 'g1',
      dest: 'f3',
      moveCount: 15000,
      details: {
        whiteWins: 6000,
        blackWins: 5000,
        draws: 4000,
        count: 15000,
        totalOpponentElo: 0,
        hasData: true,
      },
      level: 3,
    },
  ];

  function createComponent(
    moves: ExplorerMove[] = mockMoves,
    showAsPercentage = false,
    highlightSan: string | null = null,
    showSettings = false,
  ) {
    const fixture = TestBed.createComponent(MovesTableComponent);
    fixture.componentRef.setInput('moves', moves);
    fixture.componentRef.setInput('showAsPercentage', showAsPercentage);
    fixture.componentRef.setInput('highlightSan', highlightSan);
    fixture.componentRef.setInput('showSettings', showSettings);
    fixture.detectChanges();
    return { fixture, component: fixture.componentInstance };
  }

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [MovesTableComponent] });
  });

  it('should create', () => {
    const { component } = createComponent();
    expect(component).toBeTruthy();
  });

  describe('simplify', () => {
    it('should format millions as M', () => {
      const { component } = createComponent();
      expect(component.simplify(1000000)).toBe('1.0M');
      expect(component.simplify(2500000)).toBe('2.5M');
    });

    it('should format thousands as k', () => {
      const { component } = createComponent();
      expect(component.simplify(10000)).toBe('10k');
      expect(component.simplify(15500)).toBe('16k');
      expect(component.simplify(9999)).toBe('9999');
    });

    it('should return string for small numbers', () => {
      const { component } = createComponent();
      expect(component.simplify(0)).toBe('0');
      expect(component.simplify(123)).toBe('123');
    });
  });

  describe('pct', () => {
    it('should calculate percentage', () => {
      const { component } = createComponent();
      expect(component.pct(250, 1000)).toBe(25);
    });

    it('should return 0 when total is 0', () => {
      const { component } = createComponent();
      expect(component.pct(100, 0)).toBe(0);
    });
  });

  describe('label', () => {
    it('should return empty string for pct < 8', () => {
      const { component } = createComponent();
      expect(component.label(70, 1000)).toBe('');
    });

    it('should return percentage when showAsPercentage is true', () => {
      const { component: comp } = createComponent(mockMoves, true);
      expect(comp.label(400, 1000)).toBe('40.0%');
    });

    it('should return simplified count when showAsPercentage is false', () => {
      const { component } = createComponent();
      expect(component.label(400, 1000)).toBe('400');
    });
  });

  describe('outputs', () => {
    it('should emit playMove', () => {
      const { component } = createComponent();
      const spy = vi.fn();
      component.playMove.subscribe(spy);
      component.playMove.emit(mockMoves[0]);
      expect(spy).toHaveBeenCalledWith(mockMoves[0]);
    });

    it('should emit highlight', () => {
      const { component } = createComponent();
      const spy = vi.fn();
      component.highlight.subscribe(spy);
      component.highlight.emit(mockMoves[0]);
      expect(spy).toHaveBeenCalledWith(mockMoves[0]);
    });

    it('should emit highlight with null', () => {
      const { component } = createComponent();
      const spy = vi.fn();
      component.highlight.subscribe(spy);
      component.highlight.emit(null);
      expect(spy).toHaveBeenCalledWith(null);
    });

    it('should emit settingsClick', () => {
      const { component } = createComponent(mockMoves, false, null, true);
      const spy = vi.fn();
      component.settingsClick.subscribe(spy);
      component.settingsClick.emit();
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('template', () => {
    it('should render move SAN notation', () => {
      const { fixture } = createComponent();
      const el = fixture.nativeElement as HTMLElement;
      const rows = el.querySelectorAll('.moves-table__row');
      expect(rows.length).toBe(3);
      expect(rows[0].querySelector('.moves-table__col-move')?.textContent).toContain('e4');
      expect(rows[1].querySelector('.moves-table__col-move')?.textContent).toContain('d4');
    });

    it('should show settings button when enabled', () => {
      const { fixture } = createComponent(mockMoves, false, null, true);
      const el = fixture.nativeElement as HTMLElement;
      expect(el.querySelector('.moves-table__settings-btn')).not.toBeNull();
    });

    it('should hide settings button when disabled', () => {
      const { fixture } = createComponent(mockMoves, false, null, false);
      const el = fixture.nativeElement as HTMLElement;
      expect(el.querySelector('.moves-table__settings-btn')).toBeNull();
    });

    it('should show empty message when no moves', () => {
      const { fixture } = createComponent([]);
      const el = fixture.nativeElement as HTMLElement;
      expect(el.textContent).toContain('No moves found');
    });

    it('should highlight the highlighted move', () => {
      const { fixture } = createComponent(mockMoves, false, 'e4');
      fixture.detectChanges();
      const el = fixture.nativeElement as HTMLElement;
      const highlightedRow = el.querySelector('.moves-table__row--highlight');
      expect(highlightedRow).not.toBeNull();
      expect(highlightedRow?.querySelector('.moves-table__col-move')?.textContent).toContain('e4');
    });

    it('should render progress bar segments', () => {
      const { fixture } = createComponent();
      const el = fixture.nativeElement as HTMLElement;
      const segments = el.querySelectorAll('.progress-bar__segment');
      expect(segments.length).toBe(3 * 3);
    });

    it('should display simplified counts', () => {
      const { fixture } = createComponent();
      const el = fixture.nativeElement as HTMLElement;
      const rows = el.querySelectorAll('.moves-table__row');
      const rowCounts = rows[0].querySelector('.moves-table__col-games');
      const rowCounts2 = rows[1].querySelector('.moves-table__col-games');
      expect(rowCounts?.textContent).toBe('1000');
      expect(rowCounts2?.textContent).toBe('2.0M');
    });
  });
});
