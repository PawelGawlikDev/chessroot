import { TestBed } from '@angular/core/testing';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { UserDataFormComponent } from '../user-data-form.component';
import { Platform } from '@enums';
import { INITIAL_TIME_CONTROLS } from '@model';

describe('UserDataFormComponent', () => {
  let store: MockStore;
  const defaultState = {
    userData: {
      platform: Platform.Lichess,
      playerColor: 'white',
      fromDate: null,
      toDate: null,
      timeControls: { ...INITIAL_TIME_CONTROLS },
    },
  };

  function createComponent(showColorFilter = false) {
    const fixture = TestBed.createComponent(UserDataFormComponent);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('showColorFilter', showColorFilter);
    fixture.detectChanges();
    return { fixture, component };
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserDataFormComponent],
      providers: [provideNativeDateAdapter(), provideMockStore({ initialState: defaultState })],
    }).compileComponents();

    store = TestBed.inject(MockStore);
  });

  describe('initial state', () => {
    it('should create the component', () => {
      const { component } = createComponent();
      expect(component).toBeTruthy();
    });

    it('should have empty username control', () => {
      const { component } = createComponent();
      expect(component.userDataForm.controls.username.value).toBe('');
    });

    it('should have Lichess as default platform', () => {
      const { component } = createComponent();
      expect(component.userDataForm.controls.platform.value).toBe(Platform.Lichess);
    });

    it('should have white as default playerColor', () => {
      const { component } = createComponent();
      expect(component.userDataForm.controls.playerColor.value).toBe('white');
    });

    it('should have null dates', () => {
      const { component } = createComponent();
      expect(component.userDataForm.controls.fromDate.value).toBeNull();
      expect(component.userDataForm.controls.toDate.value).toBeNull();
    });

    it('should have all time controls enabled', () => {
      const { component } = createComponent();
      expect(component.$timeControls()).toEqual(INITIAL_TIME_CONTROLS);
    });

    it('should list 6 time control filters', () => {
      const { component } = createComponent();
      expect(component.timeControlFilters.length).toBe(6);
    });

    it('should list 2 platform options', () => {
      const { component } = createComponent();
      expect(component.platformOptions).toEqual([Platform.Lichess, Platform.ChessCom]);
    });

    it('should list 2 color options', () => {
      const { component } = createComponent();
      expect(component.colorOptions).toEqual(['white', 'black']);
    });
  });

  describe('showColorFilter', () => {
    it('should hide color picker by default', () => {
      const { fixture } = createComponent(false);
      const select = fixture.nativeElement.querySelector(
        'mat-select[formControlName="playerColor"]',
      );
      expect(select).toBeNull();
    });

    it('should show color picker when input is true', () => {
      const { fixture } = createComponent(true);
      const select = fixture.nativeElement.querySelector(
        'mat-select[formControlName="playerColor"]',
      );
      expect(select).not.toBeNull();
    });
  });

  describe('form value changes dispatch store actions', () => {
    it('should dispatch updatePlatform when platform changes', () => {
      const { component } = createComponent();
      const dispatchSpy = vi.spyOn(store, 'dispatch');
      component.userDataForm.controls.platform.setValue(Platform.ChessCom);
      expect(dispatchSpy).toHaveBeenCalledWith(
        expect.objectContaining({ platform: Platform.ChessCom }),
      );
    });

    it('should dispatch updatePlayerColor when color changes', () => {
      const { component } = createComponent();
      const dispatchSpy = vi.spyOn(store, 'dispatch');
      component.userDataForm.controls.playerColor.setValue('black');
      expect(dispatchSpy).toHaveBeenCalledWith(expect.objectContaining({ playerColor: 'black' }));
    });

    it('should dispatch updateFromDate when fromDate changes', () => {
      const { component } = createComponent();
      const dispatchSpy = vi.spyOn(store, 'dispatch');
      const date = new Date(2024, 0, 15);
      component.userDataForm.controls.fromDate.setValue(date);
      expect(dispatchSpy).toHaveBeenCalledWith(expect.objectContaining({ fromDate: '2024-01-15' }));
    });

    it('should dispatch updateFromDate with null when fromDate cleared', () => {
      const { component } = createComponent();
      const dispatchSpy = vi.spyOn(store, 'dispatch');
      component.userDataForm.controls.fromDate.setValue(null);
      expect(dispatchSpy).toHaveBeenCalledWith(expect.objectContaining({ fromDate: null }));
    });

    it('should dispatch updateToDate when toDate changes', () => {
      const { component } = createComponent();
      const dispatchSpy = vi.spyOn(store, 'dispatch');
      const date = new Date(2024, 11, 31);
      component.userDataForm.controls.toDate.setValue(date);
      expect(dispatchSpy).toHaveBeenCalledWith(expect.objectContaining({ toDate: '2024-12-31' }));
    });

    it('should dispatch updateToDate with null when toDate cleared', () => {
      const { component } = createComponent();
      const dispatchSpy = vi.spyOn(store, 'dispatch');
      component.userDataForm.controls.toDate.setValue(null);
      expect(dispatchSpy).toHaveBeenCalledWith(expect.objectContaining({ toDate: null }));
    });

    it('should update username model when username changes', () => {
      const { component } = createComponent();
      component.userDataForm.controls.username.setValue('testuser');
      expect(component.username()).toBe('testuser');
    });
  });

  describe('onTimeControlChange', () => {
    it('should dispatch updateTimeControls when toggling a checkbox', () => {
      const { component } = createComponent();
      const dispatchSpy = vi.spyOn(store, 'dispatch');
      component.onTimeControlChange('bullet', false);
      expect(dispatchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          timeControls: expect.objectContaining({ bullet: false }),
        }),
      );
    });

    it('should re-enable a time control', () => {
      const { component } = createComponent();
      const dispatchSpy = vi.spyOn(store, 'dispatch');
      component.onTimeControlChange('bullet', true);
      expect(dispatchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          timeControls: expect.objectContaining({ bullet: true }),
        }),
      );
    });
  });

  describe('filtersOpen', () => {
    it('should default to closed', () => {
      const { component } = createComponent();
      expect(component.$filtersOpen()).toBe(false);
    });
  });
});
