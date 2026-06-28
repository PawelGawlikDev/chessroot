import { TestBed } from '@angular/core/testing';
import { provideNativeDateAdapter } from '@angular/material/core';
import { provideMockStore } from '@ngrx/store/testing';
import { AchievementsComponent } from '../achievements.component';

describe('AchievementsComponent', () => {
  let component: AchievementsComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AchievementsComponent],
      providers: [provideNativeDateAdapter(), provideMockStore()],
    }).compileComponents();

    component = TestBed.createComponent(AchievementsComponent).componentInstance;
  });

  it('should have default loading state false', () => {
    expect(component.$isLoading()).toBe(false);
  });

  it('should have default game count 0', () => {
    expect(component.$gameCount()).toBe(0);
  });

  it('should have default position count 0', () => {
    expect(component.$positionCount()).toBe(0);
  });

  it('should have default empty results map', () => {
    // @ts-expect-error private for testing
    expect(component.$results().size).toBe(0);
  });

  it('should have default empty expanded achievements set', () => {
    expect(component.$expandedAchievements().size).toBe(0);
  });

  it('should have achievement keys defined', () => {
    // @ts-expect-error private for testing
    expect(component.achievementKeys.length).toBeGreaterThan(0);
  });

  it('should compute total trophies as 0 initially', () => {
    // @ts-expect-error private for testing
    expect(component.$totalTrophies()).toBe(0);
  });

  it('should compute total achievement types as 0 initially', () => {
    // @ts-expect-error private for testing
    expect(component.$totalAchievementTypes()).toBe(0);
  });

  it('should compute categories correctly', () => {
    const categories = component.$categories();
    expect(Array.isArray(categories)).toBe(true);
  });

  it('should toggle achievement expansion', () => {
    const testKey = 'pawnCheckmate';

    component.toggleAchievement(testKey);

    expect(component.$expandedAchievements().has(testKey)).toBe(true);

    component.toggleAchievement(testKey);

    expect(component.$expandedAchievements().has(testKey)).toBe(false);
  });
});
