import { TestBed } from '@angular/core/testing';
import { BarChartComponent, BarChartRow } from '../bar-chart.component';

describe('BarChartComponent', () => {
  const mockRows: BarChartRow[] = [
    { label: 'e4', count: 100, wins: 60, losses: 30, draws: 10, barWidth: 100 },
    { label: 'd4', count: 50, wins: 25, losses: 20, draws: 5, barWidth: 50 },
  ];

  function createComponent(title: string, rows: BarChartRow[], barColor?: string) {
    const fixture = TestBed.createComponent(BarChartComponent);
    fixture.componentRef.setInput('title', title);
    fixture.componentRef.setInput('rows', rows);
    if (barColor) fixture.componentRef.setInput('barColor', barColor);
    fixture.detectChanges();
    return { fixture, component: fixture.componentInstance };
  }

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [BarChartComponent] });
  });

  it('should create', () => {
    const { component } = createComponent('Test', []);
    expect(component).toBeTruthy();
  });

  it('should display the title', () => {
    const { fixture } = createComponent('Openings', mockRows);
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('mat-card-title')?.textContent).toContain('Openings');
  });

  it('should render rows', () => {
    const { fixture } = createComponent('Test', mockRows);
    const el = fixture.nativeElement as HTMLElement;
    const labels = el.querySelectorAll('.bar-chart__label');
    expect(labels.length).toBe(2);
    expect(labels[0].textContent).toContain('e4');
    expect(labels[1].textContent).toContain('d4');
  });

  it('should render win/loss/draw text', () => {
    const { fixture } = createComponent('Test', mockRows);
    const el = fixture.nativeElement as HTMLElement;
    const pcts = el.querySelectorAll('.bar-chart__pct');
    expect(pcts[0].textContent).toContain('60W / 30L / 10D');
    expect(pcts[1].textContent).toContain('25W / 20L / 5D');
  });

  it('should set bar width and color', () => {
    const customColor = 'linear-gradient(90deg, red, blue)';
    const { fixture } = createComponent('Test', mockRows, customColor);
    const el = fixture.nativeElement as HTMLElement;
    const bars = el.querySelectorAll('.bar-chart__bar');
    expect((bars[0] as HTMLElement).style.width).toBe('100%');
    expect((bars[0] as HTMLElement).style.background).toBe(customColor);
  });

  it('should handle empty rows', () => {
    const { fixture } = createComponent('Empty', []);
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.bar-chart__row')).toBeNull();
  });

  it('should display count inside bar', () => {
    const { fixture } = createComponent('Test', mockRows);
    const el = fixture.nativeElement as HTMLElement;
    const barTexts = el.querySelectorAll('.bar-chart__bar-text');
    expect(barTexts[0].textContent).toContain('100');
    expect(barTexts[1].textContent).toContain('50');
  });

  it('should use default bar color when not provided', () => {
    const { component } = createComponent('Test', mockRows);
    expect(component.barColor()).toBe('linear-gradient(90deg, #4caf50, #66bb6a)');
  });
});
