import { ExplorerActions } from '@state/actions';
import { explorerReducer, initialExplorerState } from '../explorer.reducer';

describe('explorerReducer', () => {
  it('should return initial state', () => {
    const action = { type: 'Unknown' };
    const state = explorerReducer(initialExplorerState, action);
    expect(state).toBe(initialExplorerState);
  });

  it('should update fetch state to pending on fetchBook action', () => {
    const state = explorerReducer(
      initialExplorerState,
      ExplorerActions.fetchBook({ fen: 'someFen' }),
    );
    expect(state.bookMoves.fetch).toBe('pending');
  });

  it('should update bookMoves on fetchBookSuccess action', () => {
    const newBookMoves = {
      fetch: 'success' as const,
      openingName: "C20 King's Pawn Game",
      moves: [
        {
          san: 'e4',
          moveCount: 6,
          details: {
            averageElo: 2112,
            whiteWins: 1,
            draws: 2,
            blackWins: 3,
            count: 6,
            totalOpponentElo: 2000,
            hasData: true,
          },
        },
      ],
    };
    const state = explorerReducer(
      initialExplorerState,
      ExplorerActions.fetchBookSuccess({ bookMoves: newBookMoves }),
    );
    expect(state.bookMoves).toEqual(newBookMoves);
  });
});
