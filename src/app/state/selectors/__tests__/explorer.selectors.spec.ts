import '@angular/compiler';
import type { ExplorerState } from '@state/reducers/explorer.reducer';
import { selectExplorerState, selectBookMoves } from '../explorer.selectors';

describe('Explorer Selectors', () => {
  it('should select the explorer state', () => {
    const state: ExplorerState = {
      bookMoves: { fetch: 'off' },
    };
    const result = selectExplorerState.projector(state);
    expect(result).toEqual({ bookMoves: { fetch: 'off' } });
  });

  describe('selectBookMoves', () => {
    it('should select bookMoves from the explorer state', () => {
      const state: ExplorerState = {
        bookMoves: { fetch: 'off' },
      };
      const result = selectBookMoves.projector(state);
      expect(result).toEqual({ fetch: 'off' });
    });

    it('should select bookMoves when fetch is pending', () => {
      const state: ExplorerState = {
        bookMoves: { fetch: 'pending', openingName: 'Sicilian Defense' },
      };
      const result = selectBookMoves.projector(state);
      expect(result).toEqual({ fetch: 'pending', openingName: 'Sicilian Defense' });
    });

    it('should select bookMoves when fetch is success', () => {
      const state: ExplorerState = {
        bookMoves: {
          fetch: 'success',
          openingName: "King's Pawn Game",
          moves: [
            {
              san: 'e5',
              details: {
                whiteWins: 100,
                blackWins: 80,
                draws: 50,
                count: 230,
                totalOpponentElo: 4600,
                hasData: true,
              },
              moveCount: 230,
            },
          ],
        },
      };
      const result = selectBookMoves.projector(state);
      expect(result.fetch).toBe('success');
      expect(result.openingName).toBe("King's Pawn Game");
      expect(result.moves).toHaveLength(1);
    });

    it('should select bookMoves when fetch is failed', () => {
      const state: ExplorerState = {
        bookMoves: { fetch: 'failed', openingName: 'Some Opening' },
      };
      const result = selectBookMoves.projector(state);
      expect(result).toEqual({ fetch: 'failed', openingName: 'Some Opening' });
    });
  });
});
