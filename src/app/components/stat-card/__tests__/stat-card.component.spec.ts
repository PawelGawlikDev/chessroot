import { TestBed } from '@angular/core/testing';
import { StatCardComponent } from '../stat-card.component';

describe('StatCardComponent', () => {
  function createComponent(value: string | number, label: string) {
    const fixture = TestBed.createComponent(StatCardComponent);
    fixture.componentRef.setInput('value', value);
    fixture.componentRef.setInput('label', label);
    fixture.detectChanges();
    return { fixture, component: fixture.componentInstance };
  }

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [StatCardComponent] });
  });

  it('should create', () => {
    const { component } = createComponent(42, 'Games');
    expect(component).toBeTruthy();
  });

  it('should display the value input', () => {
    const { fixture } = createComponent(99, 'Wins');
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.stat-card__value')?.textContent).toContain('99');
  });

  it('should display the label input', () => {
    const { fixture } = createComponent(5, 'Losses');
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.stat-card__label')?.textContent).toContain('Losses');
  });

  it('should accept string values', () => {
    const { fixture } = createComponent('85%', 'Win Rate');
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.stat-card__value')?.textContent).toContain('85%');
  });

  it('should update when inputs change', () => {
    const fixture = TestBed.createComponent(StatCardComponent);
    fixture.componentRef.setInput('value', 0);
    fixture.componentRef.setInput('label', 'Initial');
    fixture.detectChanges();

    fixture.componentRef.setInput('value', 100);
    fixture.componentRef.setInput('label', 'Updated');
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.stat-card__value')?.textContent).toContain('100');
    expect(el.querySelector('.stat-card__label')?.textContent).toContain('Updated');
  });
});
