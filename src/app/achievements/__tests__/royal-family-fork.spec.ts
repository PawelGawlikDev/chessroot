import { royalFamilyFork } from '../royal-family-fork';
import { PgnMove } from '@mliebelt/pgn-types';
import { Chess } from 'chess.js';

function pgnToMoves(pgn: string): PgnMove[] {
  const chess = new Chess();
  chess.loadPgn(pgn);
  const history = chess.history({ verbose: true });
  return history.map(
    (m, i) =>
      ({
        drawOffer: false,
        moveNumber: Math.floor(i / 2) + 1,
        notation: {
          notation: m.san,
          fig: m.piece !== 'p' ? m.piece.toUpperCase() : null,
          strike: m.captured ? 'x' : null,
          col: m.to[0],
          row: m.to[1],
          check: m.san.endsWith('#') ? '#' : m.san.endsWith('+') ? '+' : undefined,
          promotion: m.promotion ? `=${m.promotion.toUpperCase()}` : null,
          disc: undefined,
          drop: false,
        },
        variations: [],
        nag: [],
        commentDiag: {},
        turn: m.color as 'w' | 'b',
      }) as unknown as PgnMove,
  );
}

describe('royalFamilyFork', () => {
  it('should return empty when no knight checks in game', () => {
    const pgn = '1. e4 e5 2. d4 d5';
    expect(royalFamilyFork(pgnToMoves(pgn))).toEqual([]);
  });

  it('should return empty for normal knight check', () => {
    // Nf3 doesn't check. Nc6 doesn't check. Nf6 doesn't check.
    const pgn = '1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6';
    expect(royalFamilyFork(pgnToMoves(pgn))).toEqual([]);
  });

  it('should return empty when game has no moves', () => {
    expect(royalFamilyFork([])).toEqual([]);
  });

  it('should detect royal family fork when knight checks and attacks king, queen, rook, and bishop', () => {
    // White knight on d5 captures c7 with check (Nxc7+).
    // Knight attacks: Ka6 (king), Ra8 (rook), Qe8 (queen), Ba6 (bishop) = 4 non-pawn pieces
    // including k, q, r. Knight cannot be captured. White achieves the fork.
    const pgn =
      '1. h3 g5 2. a4 b6 3. Nf3 b5 4. a5 Ba6 5. Ra3 e5 6. Ra4 Ke7 7. c4 Qc8 8. Nc3 Nh6 9. Nd5+ Ke6 10. c5 Qe8 11. Nxc7+ Kf5 12. b4 Bb7 13. Ra1 Bd6 14. e4+ Bxe4 15. Nh4+ Kf4 16. Ra2 Bc2 17. Ne6+ Qxe6 18. d4+ Ke4 19. Kd2 Qb3 20. Ra1 Kd5';
    const result = royalFamilyFork(pgnToMoves(pgn));
    expect(result).toEqual([{ color: 'w', onMoveNumber: 21 }]);
  });
});
