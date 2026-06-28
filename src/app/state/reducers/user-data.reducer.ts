import { createReducer, on } from '@ngrx/store';
import { Platform } from '@enums';
import { UserActions } from '@state/actions';
import { UserDataState, INITIAL_TIME_CONTROLS } from '@model';

export const initialUserDataState: UserDataState = {
  platform: Platform.Lichess,
  playerColor: 'white',
  fromDate: null,
  toDate: null,
  timeControls: { ...INITIAL_TIME_CONTROLS },
};

export const userDataReducer = createReducer(
  initialUserDataState,
  on(UserActions.updatePlatform, (state, { platform }) => ({ ...state, platform })),
  on(UserActions.updatePlayerColor, (state, { playerColor }) => ({ ...state, playerColor })),
  on(UserActions.updateFromDate, (state, { fromDate }) => ({ ...state, fromDate })),
  on(UserActions.updateToDate, (state, { toDate }) => ({ ...state, toDate })),
  on(UserActions.updateTimeControls, (state, { timeControls }) => ({ ...state, timeControls })),
);
