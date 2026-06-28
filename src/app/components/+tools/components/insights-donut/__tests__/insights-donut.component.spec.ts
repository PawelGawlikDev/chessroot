import { TestBed } from '@angular/core/testing';
import { InsightsDonutComponent } from '../insights-donut.component';

describe('InsightsDonutComponent', () => {
  function createComponent(overrides: Record<string, number> = {}) {
    const fixture = TestBed.createComponent(InsightsDonutComponent);
    const defaults = {
      totalGames: 100,
      wins: 55,
      losses: 40,
      draws: 5,
      whiteWins: 30,
      whiteLosses: 15,
      whiteDraws: 2,
      whiteGames: 47,
      blackWins: 25,
      blackLosses: 25,
      blackDraws: 3,
      blackGames: 53,
    };
    for (const [key, value] of Object.entries({ ...defaults, ...overrides })) {
      fixture.componentRef.setInput(key, value);
    }
    return { fixture, component: fixture.componentInstance };
  }

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [InsightsDonutComponent] });
  });

  it('should create', () => {
    const { component } = createComponent();
    expect(component).toBeTruthy();
  });

  it('should compute white win rate', () => {
    const { component } = createComponent({ whiteGames: 50, whiteWins: 25 });
    expect(component.$whiteWinRate()).toBe(50);
  });

  it('should return 0 white win rate when no white games', () => {
    const { component } = createComponent({ whiteGames: 0, whiteWins: 0 });
    expect(component.$whiteWinRate()).toBe(0);
  });

  it('should compute black win rate', () => {
    const { component } = createComponent({ blackGames: 40, blackWins: 20 });
    expect(component.$blackWinRate()).toBe(50);
  });

  it('should return 0 black win rate when no black games', () => {
    const { component } = createComponent({ blackGames: 0, blackWins: 0 });
    expect(component.$blackWinRate()).toBe(0);
  });

  it('should compute segments with correct data', () => {
    const { component } = createComponent({ wins: 55, losses: 40, draws: 5, totalGames: 100 });
    const segments = component.$segments();
    expect(segments.length).toBe(3);
    expect(segments[0]).toMatchObject({ label: 'Wins', count: 55, color: '#4caf50' });
    expect(segments[1]).toMatchObject({ label: 'Losses', count: 40, color: '#f44336' });
    expect(segments[2]).toMatchObject({ label: 'Draws', count: 5, color: '#9e9e9e' });
  });

  it('should compute correct percentages', () => {
    const { component } = createComponent({ wins: 25, losses: 25, draws: 0, totalGames: 50 });
    const segments = component.$segments();
    expect(segments[0].pct).toBeCloseTo(50);
    expect(segments[1].pct).toBeCloseTo(50);
    expect(segments.length).toBe(2);
  });

  it('should filter out zero-count segments', () => {
    const { component } = createComponent({ wins: 100, losses: 0, draws: 0, totalGames: 100 });
    const segments = component.$segments();
    expect(segments.length).toBe(1);
    expect(segments[0].label).toBe('Wins');
  });

  it('should handle zero total games gracefully', () => {
    const { component } = createComponent({
      totalGames: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      whiteGames: 0,
      blackGames: 0,
    });
    expect(component.$segments().length).toBe(0);
    expect(component.$whiteWinRate()).toBe(0);
    expect(component.$blackWinRate()).toBe(0);
  });

  it('should render the card title', () => {
    const { fixture } = createComponent();
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('mat-card-title')?.textContent).toContain('Results');
  });

  it('should render legend items', () => {
    const { fixture } = createComponent({ wins: 55, losses: 40, draws: 5 });
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const legendItems = el.querySelectorAll('.donut-chart__legend-item');
    expect(legendItems.length).toBe(3);
    expect(legendItems[0].textContent).toContain('Wins');
    expect(legendItems[0].textContent).toContain('55');
  });

  it('should render color stats (white/black)', () => {
    const { fixture } = createComponent({
      whiteWins: 30,
      whiteLosses: 15,
      whiteDraws: 2,
      whiteGames: 47,
      blackWins: 25,
      blackLosses: 25,
      blackDraws: 3,
      blackGames: 53,
    });
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const colorStats = el.querySelectorAll('.color-stat');
    expect(colorStats.length).toBe(2);
    expect(colorStats[0].textContent).toContain('30W');
    expect(colorStats[1].textContent).toContain('25W');
  });

  it('should render canvas element', () => {
    const { fixture } = createComponent();
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('canvas')).not.toBeNull();
  });
});
