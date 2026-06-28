import { TestBed } from '@angular/core/testing';
import { BookSettingsDialogComponent } from '../book-settings-dialog.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import type { OpeningBookConfig } from '@model/opening-explorer.model';
import { DEFAULT_BOOK_CONFIG } from '@model/opening-explorer.model';

describe('BookSettingsDialogComponent', () => {
  const mockConfig: OpeningBookConfig = { ...DEFAULT_BOOK_CONFIG };
  let closeSpy: ReturnType<typeof vi.fn>;

  function createComponent(data: OpeningBookConfig = mockConfig) {
    closeSpy = vi.fn();
    TestBed.overrideProvider(MatDialogRef, { useValue: { close: closeSpy } });
    TestBed.overrideProvider(MAT_DIALOG_DATA, { useValue: data });
    const fixture = TestBed.createComponent(BookSettingsDialogComponent);
    fixture.detectChanges();
    return { fixture, component: fixture.componentInstance };
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [BookSettingsDialogComponent],
      providers: [
        { provide: MatDialogRef, useValue: { close: vi.fn() } },
        { provide: MAT_DIALOG_DATA, useValue: mockConfig },
      ],
    });
  });

  it('should create', () => {
    const { component } = createComponent();
    expect(component).toBeTruthy();
  });

  it('should initialize config from injected data', () => {
    const { component } = createComponent({
      bookType: 'masters',
      ratings: [2000],
      speeds: ['blitz'],
    });
    expect(component.config()).toEqual({ bookType: 'masters', ratings: [2000], speeds: ['blitz'] });
  });

  it('should have rating options defined', () => {
    const { component } = createComponent();
    expect(component.ratingOptions).toEqual([1600, 1800, 2000, 2200, 2500]);
  });

  it('should have speed options defined', () => {
    const { component } = createComponent();
    expect(component.speedOptions.length).toBeGreaterThan(0);
    expect(component.speedOptions[0]).toMatchObject({ key: 'bullet', label: 'Bullet' });
  });

  describe('setBookType', () => {
    it('should update book type', () => {
      const { component } = createComponent();
      component.setBookType('masters');
      expect(component.config().bookType).toBe('masters');
    });

    it('should set book type to off', () => {
      const { component } = createComponent();
      component.setBookType('off');
      expect(component.config().bookType).toBe('off');
    });
  });

  describe('toggleRating', () => {
    it('should add a rating', () => {
      const { component } = createComponent({
        bookType: 'lichess',
        ratings: [2000],
        speeds: ['rapid'],
      });
      component.toggleRating(2200);
      expect(component.config().ratings).toEqual([2000, 2200]);
    });

    it('should remove a rating', () => {
      const { component } = createComponent({
        bookType: 'lichess',
        ratings: [2000, 2200],
        speeds: ['rapid'],
      });
      component.toggleRating(2000);
      expect(component.config().ratings).toEqual([2200]);
    });

    it('should sort ratings', () => {
      const { component } = createComponent({
        bookType: 'lichess',
        ratings: [2500],
        speeds: ['rapid'],
      });
      component.toggleRating(2000);
      expect(component.config().ratings).toEqual([2000, 2500]);
    });
  });

  describe('toggleSpeed', () => {
    it('should add a speed', () => {
      const { component } = createComponent({
        bookType: 'lichess',
        ratings: [2000],
        speeds: ['rapid'],
      });
      component.toggleSpeed('blitz');
      expect(component.config().speeds).toEqual(['rapid', 'blitz']);
    });

    it('should remove a speed', () => {
      const { component } = createComponent({
        bookType: 'lichess',
        ratings: [2000],
        speeds: ['rapid', 'blitz'],
      });
      component.toggleSpeed('rapid');
      expect(component.config().speeds).toEqual(['blitz']);
    });
  });

  describe('save', () => {
    it('should close dialog with config', () => {
      const { component } = createComponent();
      component.setBookType('masters');
      component.save();
      expect(closeSpy).toHaveBeenCalledWith(expect.objectContaining({ bookType: 'masters' }));
    });
  });

  describe('template', () => {
    it('should render dialog title', () => {
      const { fixture } = createComponent();
      const el = fixture.nativeElement as HTMLElement;
      expect(el.textContent).toContain('Best Moves Settings');
    });

    it('should render save button', () => {
      const { fixture } = createComponent();
      const el = fixture.nativeElement as HTMLElement;
      expect(el.textContent).toContain('Save');
    });

    it('should render cancel button', () => {
      const { fixture } = createComponent();
      const el = fixture.nativeElement as HTMLElement;
      expect(el.textContent).toContain('Cancel');
    });
  });
});
