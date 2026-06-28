import { Platform } from '@enums';
import { UserActions } from '@state/actions';
import { INITIAL_TIME_CONTROLS } from '@model';
import { userDataReducer, initialUserDataState } from '../user-data.reducer';

describe('userDataReducer', () => {
  it('should return the initial state', () => {
    const action = { type: 'Unknown' };
    const state = userDataReducer(initialUserDataState, action);
    expect(state).toBe(initialUserDataState);
  });

  it('should update platform', () => {
    const state = userDataReducer(
      initialUserDataState,
      UserActions.updatePlatform({ platform: Platform.ChessCom }),
    );
    expect(state.platform).toBe(Platform.ChessCom);
  });

  it('should update playerColor', () => {
    const state = userDataReducer(
      initialUserDataState,
      UserActions.updatePlayerColor({ playerColor: 'black' }),
    );
    expect(state.playerColor).toBe('black');
  });

  it('should update fromDate', () => {
    const state = userDataReducer(
      initialUserDataState,
      UserActions.updateFromDate({ fromDate: '2024-06-01' }),
    );
    expect(state.fromDate).toBe('2024-06-01');
  });

  it('should update toDate', () => {
    const state = userDataReducer(
      initialUserDataState,
      UserActions.updateToDate({ toDate: '2024-12-31' }),
    );
    expect(state.toDate).toBe('2024-12-31');
  });

  it('should update timeControls', () => {
    const newTimeControls = { ...INITIAL_TIME_CONTROLS, bullet: false, blitz: false };
    const state = userDataReducer(
      initialUserDataState,
      UserActions.updateTimeControls({ timeControls: newTimeControls }),
    );
    expect(state.timeControls).toEqual(newTimeControls);
  });

  it('should preserve other state fields when updating one field', () => {
    const state = userDataReducer(
      initialUserDataState,
      UserActions.updatePlayerColor({ playerColor: 'black' }),
    );
    expect(state.playerColor).toBe('black');
    expect(state.platform).toBe(Platform.Lichess);
  });

  describe('initial state', () => {
    it('should have Lichess as default platform', () => {
      expect(initialUserDataState.platform).toBe(Platform.Lichess);
    });

    it('should have white as default playerColor', () => {
      expect(initialUserDataState.playerColor).toBe('white');
    });

    it('should have null dates', () => {
      expect(initialUserDataState.fromDate).toBeNull();
      expect(initialUserDataState.toDate).toBeNull();
    });

    it('should have all time controls enabled', () => {
      expect(initialUserDataState.timeControls).toEqual(INITIAL_TIME_CONTROLS);
    });
  });
});
