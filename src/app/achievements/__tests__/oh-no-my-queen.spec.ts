import { ohNoMyQueen } from '../oh-no-my-queen';
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

describe('ohNoMyQueen', () => {
  it('should return empty when game did not end in checkmate', () => {
    const pgn = '1. e4 e5 2. Nf3 Nc6 3. Bb5 a6';
    expect(ohNoMyQueen(pgnToMoves(pgn))).toEqual([]);
  });

  it('should return empty when there are promoted queens', () => {
    const pgn =
      '1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O b5 6. Bb3 Be7 7. Re1 d6 8. c3 O-O 9. h3 Nb8 10. d4 Nbd7 11. Nbd2 Bb7 12. Bc2 Re8 13. Nf1 Bf8 14. Ng3 g6 15. Bg5 h6 16. Bd2 Bg7 17. a4 c5 18. d5 c4 19. b4 Nh5 20. Nxh5 gxh5';
    expect(ohNoMyQueen(pgnToMoves(pgn))).toEqual([]);
  });

  it('should return empty for simple non-mate position', () => {
    const moves = [pgnToMoves('1. e4')[0]];
    expect(ohNoMyQueen(moves)).toEqual([]);
  });

  it('should detect queen captured then checkmate 3 moves later (white wins)', () => {
    // Black captures white queen at index 9 (Bxd1), white checkmates at index 12 (Nd5#)
    // Diff = 3, white has no queen, black still has queen
    const pgn = '1. e4 e5 2. Nf3 d6 3. Bc4 Bg4 4. Nc3 g6 5. Nxe5 Bxd1 6. Bxf7+ Ke7 7. Nd5#';
    const result = ohNoMyQueen(pgnToMoves(pgn));
    expect(result).toEqual([{ color: 'w', onMoveNumber: 9 }]);
  });

  it('should return empty when no queen is captured', () => {
    const pgn = '1. e4 e5 2. Qh5 Nc6 3. Bc4 Nf6 4. Qxf7#';
    expect(ohNoMyQueen(pgnToMoves(pgn))).toEqual([]);
  });
});
