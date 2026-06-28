import { TestBed } from '@angular/core/testing';
import { AchievementCategoryComponent } from '../achievement-category.component';
import { CategoryResult } from '@model';

describe('AchievementCategoryComponent', () => {
  const mockCategory: CategoryResult = {
    category: 'checkmate',
    categoryTitle: 'Checkmates',
    goals: [
      {
        key: 'smotheredMate',
        metadata: { title: 'Smothered Mate', category: 'checkmate' },
        trophies: [],
        trophyCount: 0,
      },
      {
        key: 'pawnCheckmate',
        metadata: { title: 'Checkmate with a Pawn', category: 'checkmate' },
        trophies: [],
        trophyCount: 0,
      },
    ],
  };

  function createComponent(category: CategoryResult, expandedKeys: Set<string> = new Set()) {
    const fixture = TestBed.createComponent(AchievementCategoryComponent);
    fixture.componentRef.setInput('category', category);
    fixture.componentRef.setInput('expandedKeys', expandedKeys);
    fixture.detectChanges();
    return { fixture, component: fixture.componentInstance };
  }

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [AchievementCategoryComponent] });
  });

  it('should create', () => {
    const { component } = createComponent(mockCategory);
    expect(component).toBeTruthy();
  });

  it('should display category title', () => {
    const { fixture } = createComponent(mockCategory);
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.achievements__category-title')?.textContent).toContain('Checkmates');
  });

  it('should render achievement cards for each goal', () => {
    const { fixture } = createComponent(mockCategory);
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelectorAll('cr-achievement-card').length).toBe(2);
  });

  it('should emit toggle when toggled', () => {
    const { component } = createComponent(mockCategory);
    let emittedKey: string | undefined;
    component.toggle.subscribe((key) => (emittedKey = key));
    component.toggle.emit('smotheredMate');
    expect(emittedKey).toBe('smotheredMate');
  });

  it('should pass expanded keys to cards', () => {
    const expanded = new Set(['smotheredMate']);
    const { fixture } = createComponent(mockCategory, expanded);
    expect(fixture.componentInstance.expandedKeys()).toBe(expanded);
  });
});
