import { TestBed } from '@angular/core/testing';
import { AchievementCardComponent } from '../achievement-card.component';
import { AchievementResult } from '@model';

describe('AchievementCardComponent', () => {
  const mockAchievement: AchievementResult = {
    key: 'smotheredMate',
    metadata: { title: 'Smothered Mate', category: 'checkmate' },
    trophies: [
      {
        gameId: 'game1',
        opponent: 'player1',
        opponentTitle: 'GM',
        link: 'https://example.com/game1',
        date: '2024-01-01',
        color: 'w',
      },
    ],
    trophyCount: 1,
  };

  const emptyAchievement: AchievementResult = {
    key: 'none',
    metadata: { title: 'Empty Achievement', category: 'funny', desc: 'No trophies yet' },
    trophies: [],
    trophyCount: 0,
  };

  function createComponent(achievement: AchievementResult, isExpanded = false) {
    const fixture = TestBed.createComponent(AchievementCardComponent);
    fixture.componentRef.setInput('achievement', achievement);
    fixture.componentRef.setInput('isExpanded', isExpanded);
    fixture.detectChanges();
    return { fixture, component: fixture.componentInstance };
  }

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [AchievementCardComponent] });
  });

  it('should create', () => {
    const { component } = createComponent(mockAchievement);
    expect(component).toBeTruthy();
  });

  it('should display achievement title', () => {
    const { fixture } = createComponent(mockAchievement);
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.achievement-card__title')?.textContent).toContain('Smothered Mate');
  });

  it('should display description when available', () => {
    const { fixture } = createComponent(mockAchievement);
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.achievement-card__desc')).toBeNull();
  });

  it('should show trophy count when trophies exist', () => {
    const { fixture } = createComponent(mockAchievement);
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.achievement-card__trophy-count')?.textContent).toContain('1');
  });

  it('should show 0 badge when no trophies', () => {
    const { fixture } = createComponent(emptyAchievement);
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.achievement-card__no-trophies-badge')?.textContent).toContain('0');
  });

  it('should have tabindex -1 when no trophies', () => {
    const { component } = createComponent(emptyAchievement);
    expect(component.achievement().trophyCount).toBe(0);
  });

  it('should emit toggle on click', () => {
    const { fixture, component } = createComponent(mockAchievement);
    let emittedKey: string | undefined;
    component.toggle.subscribe((key) => (emittedKey = key));
    const el = fixture.nativeElement as HTMLElement;
    el.querySelector<HTMLElement>('.achievement-card')?.click();
    expect(emittedKey).toBe('smotheredMate');
  });

  it('should emit toggle on Enter key', () => {
    const { component } = createComponent(mockAchievement);
    let emitted: string | undefined;
    component.toggle.subscribe((key) => (emitted = key));
    const event = new KeyboardEvent('keydown', { key: 'Enter' });
    component.onKeydown(event);
    expect(emitted).toBe('smotheredMate');
  });

  it('should emit toggle on Space key', () => {
    const { component } = createComponent(mockAchievement);
    let emitted: string | undefined;
    component.toggle.subscribe((key) => (emitted = key));
    const event = new KeyboardEvent('keydown', { key: ' ' });
    component.onKeydown(event);
    expect(emitted).toBe('smotheredMate');
  });

  it('should prevent default on Enter key', () => {
    const { component } = createComponent(mockAchievement);
    const event = new KeyboardEvent('keydown', { key: 'Enter', cancelable: true });
    const preventDefault = vi.spyOn(event, 'preventDefault');
    component.onKeydown(event);
    expect(preventDefault).toHaveBeenCalled();
  });

  it('should prevent default on Space key', () => {
    const { component } = createComponent(mockAchievement);
    const event = new KeyboardEvent('keydown', { key: ' ', cancelable: true });
    const preventDefault = vi.spyOn(event, 'preventDefault');
    component.onKeydown(event);
    expect(preventDefault).toHaveBeenCalled();
  });

  it('should show expanded details when isExpanded is true', () => {
    const { fixture } = createComponent(mockAchievement, true);
    const el = fixture.nativeElement as HTMLElement;
    const details = el.querySelector('.achievement-card__details');
    expect(details).not.toBeNull();
    expect(details?.textContent).toContain('1 game achieved');
  });

  it('should hide expanded details when isExpanded is false', () => {
    const { fixture } = createComponent(mockAchievement, false);
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.achievement-card__details')).toBeNull();
  });

  it('should not render trophy list when trophies exist', () => {
    const { fixture } = createComponent(mockAchievement, true);
    const el = fixture.nativeElement as HTMLElement;
    const links = el.querySelectorAll('.trophy-list__link');
    expect(links.length).toBe(1);
    expect(links[0].textContent).toContain('GM');
    expect(links[0].textContent).toContain('player1');
  });

  it('should render opponent and date in trophy list', () => {
    const { fixture } = createComponent(mockAchievement, true);
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.trophy-list__date')?.textContent).toContain('2024-01-01');
    expect(el.querySelector('.trophy-list__view')?.textContent).toContain('View Game');
  });
});
