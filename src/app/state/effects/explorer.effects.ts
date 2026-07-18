import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { ExplorerActions } from '@state/actions/explorer.actions';
import { from, of } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';
import { OpeningBookService, LichessAuthService } from '@services';

@Injectable()
export class ExplorerEffects {
  private actions$ = inject(Actions);
  private bookService = inject(OpeningBookService);
  private lichessAuthService = inject(LichessAuthService);

  public fetchBook$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ExplorerActions.fetchBook),
      switchMap(({ fen }) => {
        if (!this.lichessAuthService.isLoggedIn()) {
          return of(ExplorerActions.fetchBookFailure());
        }
        return from(this.bookService.fetchBookMoves(fen)).pipe(
          map((bookMoves) => ExplorerActions.fetchBookSuccess({ bookMoves })),
          catchError(() => of(ExplorerActions.fetchBookFailure())),
        );
      }),
    ),
  );
}
