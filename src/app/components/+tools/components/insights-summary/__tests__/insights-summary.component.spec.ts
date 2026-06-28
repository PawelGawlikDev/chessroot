import { TestBed } from '@angular/core/testing';
import { InsightsSummaryComponent } from '../insights-summary.component';

describe('InsightsSummaryComponent', () => {
  function createComponent(overrides: Record<string, number> = {}) {
    const fixture = TestBed.createComponent(InsightsSummaryComponent);
    const defaults = { totalGames: 100, winRate: 55, wins: 55, losses: 40, draws: 5 };
    for (const [key, value] of Object.entries({ ...defaults, ...overrides })) {
      fixture.componentRef.setInput(key, value);
    }
    fixture.detectChanges();
    return { fixture, component: fixture.componentInstance };
  }

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [InsightsSummaryComponent] });
  });

  it('should create', () => {
    const { component } = createComponent();
    expect(component).toBeTruthy();
  });

  it('should display total games', () => {
    const { fixture } = createComponent({ totalGames: 500 });
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('500');
  });

  it('should display win rate with percent', () => {
    const { fixture } = createComponent({ winRate: 60 });
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('60');
  });

  it('should display wins', () => {
    const { fixture } = createComponent({ wins: 300 });
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('300');
  });

  it('should display losses', () => {
    const { fixture } = createComponent({ losses: 150 });
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('150');
  });

  it('should display draws', () => {
    const { fixture } = createComponent({ draws: 50 });
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('50');
  });

  it('should render 5 stat cards', () => {
    const { fixture } = createComponent();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelectorAll('cr-stat-card').length).toBe(5);
  });

  it('should handle zero values', () => {
    const { fixture } = createComponent({ totalGames: 0, wins: 0, losses: 0, draws: 0 });
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('0');
  });
});
