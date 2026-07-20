import { createReducer, on } from '@ngrx/store';
import { ExplorerActions } from '@state/actions/explorer.actions';
import type { BookMovesData } from '@model/opening-explorer.model';

export const EXPLORER_FEATURE_KEY = 'explorer';

export interface ExplorerState {
  bookMoves: BookMovesData;
}

export const initialExplorerState: ExplorerState = {
  bookMoves: { fetch: 'off' },
};

export const explorerReducer = createReducer(
  initialExplorerState,
  on(ExplorerActions.fetchBook, (state): ExplorerState => ({
    ...state,
    bookMoves: {
      fetch: 'pending',
      openingName: state.bookMoves.openingName,
    },
  })),
  on(ExplorerActions.fetchBookSuccess, (state, { bookMoves }): ExplorerState => ({
    ...state,
    bookMoves,
  })),
  on(ExplorerActions.fetchBookFailure, (state): ExplorerState => ({
    ...state,
    bookMoves: {
      fetch: 'failed',
      openingName: state.bookMoves.openingName,
    },
  })),
);
