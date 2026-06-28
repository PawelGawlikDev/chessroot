import { createFeatureSelector, createSelector } from '@ngrx/store';
import { UserDataState } from '@model';

export const USER_DATA_FEATURE_KEY = 'userData';

export const selectUserDataState = createFeatureSelector<UserDataState>(USER_DATA_FEATURE_KEY);

export const selectPlatform = createSelector(selectUserDataState, (state) => state.platform);

export const selectPlayerColor = createSelector(selectUserDataState, (state) => state.playerColor);

export const selectFromDate = createSelector(selectUserDataState, (state) => state.fromDate);

export const selectToDate = createSelector(selectUserDataState, (state) => state.toDate);

export const selectTimeControls = createSelector(
  selectUserDataState,
  (state) => state.timeControls,
);
