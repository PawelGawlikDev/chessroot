import { createActionGroup, emptyProps, props } from '@ngrx/store';
import type { BookMovesData } from '@model/opening-explorer.model';

export const ExplorerActions = createActionGroup({
  source: 'Explorer',
  events: {
    'Fetch Book': props<{ fen: string }>(),
    'Fetch Book Success': props<{ bookMoves: BookMovesData }>(),
    'Fetch Book Failure': emptyProps(),
  },
});
