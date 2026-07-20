import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable, of } from 'rxjs';
import { take } from 'rxjs/operators';
import { vi } from 'vitest';
import { ExplorerEffects } from '../explorer.effects';
import { ExplorerActions } from '@state/actions/explorer.actions';
import { OpeningBookService, LichessAuthService } from '@services';
import type { BookMovesData } from '@model/opening-explorer.model';
import type { Action } from '@ngrx/store';

describe('ExplorerEffects', () => {
  let effects: ExplorerEffects;
  let actions$: Observable<Action>;
  let bookService: OpeningBookService;
  let authService: LichessAuthService;

  const mockBookMoves: BookMovesData = {
    fetch: 'success',
    moves: [
      {
        san: 'e4',
        moveCount: 180,
        details: {
          whiteWins: 100,
          blackWins: 30,
          draws: 50,
          count: 180,
          totalOpponentElo: 0,
          hasData: true,
        },
      },
      {
        san: 'd4',
        moveCount: 145,
        details: {
          whiteWins: 80,
          blackWins: 25,
          draws: 40,
          count: 145,
          totalOpponentElo: 0,
          hasData: true,
        },
      },
    ],
    openingName: "C20 King's Pawn Game",
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ExplorerEffects,
        provideMockActions(() => actions$),
        {
          provide: OpeningBookService,
          useValue: {
            fetchBookMoves: vi.fn(),
          },
        },
        {
          provide: LichessAuthService,
          useValue: {
            isLoggedIn: vi.fn(),
          },
        },
      ],
    });

    effects = TestBed.inject(ExplorerEffects);
    bookService = TestBed.inject(OpeningBookService);
    authService = TestBed.inject(LichessAuthService);
  });

  describe('fetchBook$', () => {
    it('should dispatch fetchBookSuccess when logged in and fetch succeeds', async () => {
      const fen = 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1';
      actions$ = of(ExplorerActions.fetchBook({ fen }));
      vi.mocked(authService.isLoggedIn).mockReturnValue(true);
      vi.mocked(bookService.fetchBookMoves).mockResolvedValue(mockBookMoves);

      const result = await effects.fetchBook$.pipe(take(1)).toPromise();
      expect(result).toEqual(ExplorerActions.fetchBookSuccess({ bookMoves: mockBookMoves }));
    });

    it('should dispatch fetchBookFailure when not logged in', async () => {
      const fen = 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1';
      actions$ = of(ExplorerActions.fetchBook({ fen }));
      vi.mocked(authService.isLoggedIn).mockReturnValue(false);

      const result = await effects.fetchBook$.pipe(take(1)).toPromise();
      expect(result).toEqual(ExplorerActions.fetchBookFailure());
    });

    it('should dispatch fetchBookFailure when fetch fails', async () => {
      const fen = 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1';
      actions$ = of(ExplorerActions.fetchBook({ fen }));
      vi.mocked(authService.isLoggedIn).mockReturnValue(true);
      vi.mocked(bookService.fetchBookMoves).mockRejectedValue(new Error('Network error'));

      const result = await effects.fetchBook$.pipe(take(1)).toPromise();
      expect(result).toEqual(ExplorerActions.fetchBookFailure());
    });
  });
});
