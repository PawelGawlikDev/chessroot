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

  function setTimeControls(timeControls: Record<string, boolean>) {
    store.setState({
      userData: { ...defaultState.userData, timeControls },
    });
    store.refreshState();
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

  describe('onTimeControlChange', () => {
    it('should update time controls when toggling a checkbox', () => {
      const { component } = createComponent();

      setTimeControls({ ...INITIAL_TIME_CONTROLS, bullet: false });

      expect(component.$timeControls()).toEqual({ ...INITIAL_TIME_CONTROLS, bullet: false });
    });

    it('should re-enable a time control', () => {
      const { component } = createComponent();

      setTimeControls({ ...INITIAL_TIME_CONTROLS, bullet: false });
      expect(component.$timeControls().bullet).toBe(false);

      setTimeControls(INITIAL_TIME_CONTROLS);
      expect(component.$timeControls().bullet).toBe(true);
    });
  });
});
