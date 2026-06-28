import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { ExplorerActions } from '@state/actions/explorer.actions';
import { OpeningBookService } from '@services/opening-book.service';
import { from, of } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';

@Injectable()
export class ExplorerEffects {
  private actions$ = inject(Actions);
  private bookService = inject(OpeningBookService);

  public fetchBook$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ExplorerActions.fetchBook),
      switchMap(({ fen }) =>
        from(this.bookService.fetchBookMoves(fen)).pipe(
          map((bookMoves) => ExplorerActions.fetchBookSuccess({ bookMoves })),
          catchError(() => of(ExplorerActions.fetchBookFailure())),
        ),
      ),
    ),
  );
}
