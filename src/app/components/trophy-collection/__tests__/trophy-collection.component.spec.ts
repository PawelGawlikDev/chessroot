import { TestBed } from '@angular/core/testing';

import { TrophyCollectionComponent } from '../trophy-collection.component';

describe('TrophyCollectionComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TrophyCollectionComponent],
    });
  });

  it('should have default count of 0', () => {
    const fixture = TestBed.createComponent(TrophyCollectionComponent);
    const component = fixture.componentInstance;
    expect(component.count()).toBe(0);
  });

  it('should have default size small', () => {
    const fixture = TestBed.createComponent(TrophyCollectionComponent);
    const component = fixture.componentInstance;
    expect(component.size()).toBe('small');
  });

  it('should return correct trophy array for count 0', () => {
    const fixture = TestBed.createComponent(TrophyCollectionComponent);
    const component = fixture.componentInstance;
    expect(component.getTrophiesArray().length).toBe(0);
  });

  it('should return correct trophy array for count 3 via input', () => {
    const fixture = TestBed.createComponent(TrophyCollectionComponent);
    fixture.componentRef.setInput('count', 3);
    const component = fixture.componentInstance;
    expect(component.getTrophiesArray().length).toBe(3);
  });

  it('should render trophies in template when count is set', () => {
    const fixture = TestBed.createComponent(TrophyCollectionComponent);
    fixture.componentRef.setInput('count', 2);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const trophies = compiled.querySelectorAll('svg');
    expect(trophies.length).toBe(2);
  });
});
