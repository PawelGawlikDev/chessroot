import { lefongTrap } from '../lefong-trap';
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

describe('lefongTrap', () => {
  it('should return empty when no fianchetto bishop capture in first 10 moves', () => {
    const pgn = '1. e4 e5 2. Nf3 Nc6 3. Bb5 a6';
    expect(lefongTrap(pgnToMoves(pgn))).toEqual([]);
  });

  it('should return empty when game has no bishop captures on fianchetto squares', () => {
    const pgn = '1. d4 d5 2. c4 e6 3. Nc3 Nf6 4. Bg5 Be7';
    expect(lefongTrap(pgnToMoves(pgn))).toEqual([]);
  });

  it('should detect Bh6, Bg7 from f8, Bxg7 (you move bishop first)', () => {
    // 1.d4 d5 2.Bf4 (dark-squared bishop to f4) g6 3.Bh6 (f4-g5-h6) Bg7 (f8-g7) 4.Bxg7
    const pgn = '1. d4 d5 2. Bf4 g6 3. Bh6 Bg7 4. Bxg7';
    const result = lefongTrap(pgnToMoves(pgn));
    expect(result).toEqual([{ color: 'w', onMoveNumber: 4 }]);
  });

  it('should detect Ba6, Bb7 from c8, Bxb7 (you move bishop first)', () => {
    // 1.e4 b6 2.Ba6 (f1-e2-d3-c4-b5-a6) Bb7 3.Bxb7
    const pgn = '1. e4 b6 2. Ba6 Bb7 3. Bxb7';
    const result = lefongTrap(pgnToMoves(pgn));
    expect(result).toEqual([{ color: 'w', onMoveNumber: 2 }]);
  });

  it('should detect Bg7 from f8, Bh6, then Bxg7 (they move bishop first)', () => {
    // 1.d4 g6 2.Bf4 Bg7 3.Bh6 Nf6 4.Bxg7
    // Sequence at moveNumber=3 (0-indexed): Bg7 from f8, Bh6, Nf6, Bxg7
    const pgn = '1. d4 g6 2. Bf4 Bg7 3. Bh6 Nf6 4. Bxg7';
    const result = lefongTrap(pgnToMoves(pgn));
    expect(result).toEqual([{ color: 'w', onMoveNumber: 4 }]);
  });

  it('should return empty for empty moves', () => {
    expect(lefongTrap([])).toEqual([]);
  });
});
