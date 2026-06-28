import { createFeatureSelector, createSelector } from '@ngrx/store';
import { EXPLORER_FEATURE_KEY, type ExplorerState } from '@state/reducers/explorer.reducer';

export const selectExplorerState = createFeatureSelector<ExplorerState>(EXPLORER_FEATURE_KEY);

export const selectBookMoves = createSelector(selectExplorerState, (state) => state.bookMoves);
