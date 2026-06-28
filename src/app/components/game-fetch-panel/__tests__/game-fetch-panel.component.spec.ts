import { TestBed } from '@angular/core/testing';
import { provideNativeDateAdapter } from '@angular/material/core';
import { GameFetchPanelComponent } from '../game-fetch-panel.component';
import { provideRouter } from '@angular/router';
import { provideMockStore } from '@ngrx/store/testing';
import { Platform } from '@enums';
import { INITIAL_TIME_CONTROLS } from '@model';
import { USER_DATA_FEATURE_KEY } from '@state/selectors';

const initialState = {
  [USER_DATA_FEATURE_KEY]: {
    platform: Platform.Lichess,
    playerColor: 'white',
    fromDate: null,
    toDate: null,
    timeControls: { ...INITIAL_TIME_CONTROLS },
  },
};

describe('GameFetchPanelComponent', () => {
  function createComponent(overrides: Record<string, unknown> = {}) {
    const fixture = TestBed.createComponent(GameFetchPanelComponent);
    const defaults = {
      title: 'Test Panel',
      headerIcon: '',
      buttonLabel: 'Fetch',
      buttonIcon: 'analytics',
      isLoading: false,
      isButtonDisabled: false,
      progress: 0,
      gameCount: 0,
      gamesAnalyzed: 0,
      totalGames: 0,
      extraStat: '',
      summary: '',
      showColorFilter: false,
      ...overrides,
    };
    for (const [key, value] of Object.entries(defaults)) {
      fixture.componentRef.setInput(key, value);
    }
    fixture.detectChanges();
    return { fixture, component: fixture.componentInstance };
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [GameFetchPanelComponent],
      providers: [
        provideNativeDateAdapter(),
        provideRouter([]),
        provideMockStore({ initialState }),
      ],
    });
  });

  it('should create', () => {
    const { component } = createComponent();
    expect(component).toBeTruthy();
  });

  it('should display the title', () => {
    const { fixture } = createComponent({ title: 'Achievements' });
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.fetch-panel__title')?.textContent).toContain('Achievements');
  });

  it('should emit fetch on button click', () => {
    const { component, fixture } = createComponent();
    const spy = vi.fn();
    component.fetch.subscribe(spy);
    const btn = fixture.nativeElement.querySelector('.fetch-panel__btn') as HTMLElement;
    btn.click();
    expect(spy).toHaveBeenCalled();
  });

  it('should disable button when isButtonDisabled is true', () => {
    const { fixture } = createComponent({ isButtonDisabled: true });
    const btn = fixture.nativeElement.querySelector('.fetch-panel__btn') as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
  });

  it('should show spinner when loading', () => {
    const { fixture } = createComponent({ isLoading: true });
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('mat-spinner')).not.toBeNull();
  });

  it('should hide spinner when not loading', () => {
    const { fixture } = createComponent({ isLoading: false });
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('mat-spinner')).toBeNull();
  });

  it('should show progress bar when loading (non-explorer)', () => {
    const { fixture } = createComponent({ isLoading: true, progress: 50 });
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.fetch-panel__progress-track')).not.toBeNull();
  });

  it('should display progress stats when loading', () => {
    const { fixture } = createComponent({
      isLoading: true,
      progress: 75,
      gamesAnalyzed: 75,
      totalGames: 100,
    });
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('75%');
    expect(el.textContent).toContain('75 / 100 games');
  });

  it('should display game count as fallback when totalGames is 0', () => {
    const { fixture } = createComponent({
      isLoading: true,
      progress: 50,
      gamesAnalyzed: 10,
      gameCount: 20,
      totalGames: 0,
    });
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('10 / 20 games');
  });

  it('should display extra stat when provided', () => {
    const { fixture } = createComponent({
      isLoading: true,
      progress: 50,
      gamesAnalyzed: 5,
      gameCount: 10,
      totalGames: 0,
      extraStat: '42 positions',
    });
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('42 positions');
  });

  it('should display summary when provided', () => {
    const { fixture } = createComponent({ summary: '<h3>Summary text</h3>' });
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.fetch-panel__summary')?.innerHTML).toContain('Summary text');
  });

  it('should pass showColorFilter to user-data-form', () => {
    const { fixture } = createComponent({ showColorFilter: true });
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('cr-user-data-form')).not.toBeNull();
  });

  it('should display button label', () => {
    const { fixture } = createComponent({ buttonLabel: 'Analyze Games', isLoading: false });
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Analyze Games');
  });

  it('should display button icon when not loading', () => {
    const { fixture } = createComponent({ buttonIcon: 'download', isLoading: false });
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('mat-icon')).not.toBeNull();
  });
});
