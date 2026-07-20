import {
  castleAfterMove40,
  pawnCheckmate,
  g5mate,
  knightCornerMate,
  castleKingsideWithCheckmate,
  castleQueensideWithCheckmate,
  checkmateWithKing,
  promoteToBishopCheckmate,
  promoteToKnightCheckmate,
  promotePawnBeforeMoveNumber,
} from '../move-checks';
import { PgnMove } from '@mliebelt/pgn-types';

function makeMove(
  notation: string,
  turn: 'w' | 'b',
  opts: Partial<{
    fig: string;
    strike: string;
    check: string;
    promotion: string;
    col: string;
    row: string;
  }> = {},
): PgnMove {
  return {
    drawOffer: false,
    moveNumber: 1,
    notation: {
      notation,
      fig: opts.fig || null,
      strike: opts.strike || null,
      col: opts.col || '',
      row: opts.row || '',
      check: opts.check || undefined,
      promotion: opts.promotion || null,
      disc: undefined,
      drop: false,
    },
    variations: [],
    nag: [],
    commentDiag: {},
    turn,
  } as unknown as PgnMove;
}

describe('castleAfterMove40', () => {
  it('should return empty when no castling', () => {
    const moves = [makeMove('e4', 'w'), makeMove('e5', 'b')];
    expect(castleAfterMove40(moves)).toEqual([]);
  });

  it('should return empty when castling before move 40', () => {
    const moves = [makeMove('O-O', 'w')];
    expect(castleAfterMove40(moves)).toEqual([]);
  });

  it('should return trophy for white castling after move 40', () => {
    const moves = Array.from({ length: 81 }, (_, i) =>
      makeMove(i % 2 === 0 ? 'e4' : 'e5', i % 2 === 0 ? 'w' : 'b'),
    );
    moves.push(makeMove('O-O', 'w'));
    const result = castleAfterMove40(moves);
    expect(result).toEqual([{ color: 'w', onMoveNumber: 82 }]);
  });
});

describe('pawnCheckmate', () => {
  it('should return empty when last move is not checkmate', () => {
    const moves = [makeMove('e4', 'w')];
    expect(pawnCheckmate(moves)).toEqual([]);
  });

  it('should return empty when last move has a piece', () => {
    const moves = [makeMove('Qf7#', 'w', { fig: 'Q', check: '#' })];
    expect(pawnCheckmate(moves)).toEqual([]);
  });

  it('should return trophy for pawn checkmate', () => {
    const moves = [makeMove('e6#', 'w', { check: '#' })];
    const result = pawnCheckmate(moves);
    expect(result).toEqual([{ color: 'w', onMoveNumber: 1 }]);
  });
});

describe('g5mate', () => {
  it('should return empty when not g5 checkmate', () => {
    const moves = [makeMove('e4#', 'w', { check: '#' })];
    expect(g5mate(moves)).toEqual([]);
  });

  it('should return trophy for g5 checkmate', () => {
    const moves = [makeMove('g5#', 'w', { check: '#', col: 'g', row: '5' })];
    const result = g5mate(moves);
    expect(result).toEqual([{ color: 'w', onMoveNumber: 1 }]);
  });
});

describe('knightCornerMate', () => {
  it('should return empty when not knight checkmate', () => {
    const moves = [makeMove('Qa1#', 'w', { fig: 'Q', check: '#' })];
    expect(knightCornerMate(moves)).toEqual([]);
  });

  it('should return empty when knight not on corner', () => {
    const moves = [makeMove('Ne5#', 'w', { fig: 'N', check: '#' })];
    expect(knightCornerMate(moves)).toEqual([]);
  });

  it('should return trophy for knight corner checkmate', () => {
    const moves = [makeMove('Na1#', 'w', { fig: 'N', check: '#', col: 'a', row: '1' })];
    const result = knightCornerMate(moves);
    expect(result).toEqual([{ color: 'w', onMoveNumber: 1 }]);
  });
});

describe('castleKingsideWithCheckmate', () => {
  it('should return empty when not O-O#', () => {
    const moves = [makeMove('O-O', 'w')];
    expect(castleKingsideWithCheckmate(moves)).toEqual([]);
  });

  it('should return trophy for O-O#', () => {
    const moves = [makeMove('O-O#', 'w')];
    const result = castleKingsideWithCheckmate(moves);
    expect(result).toEqual([{ color: 'w', onMoveNumber: 1 }]);
  });
});

describe('castleQueensideWithCheckmate', () => {
  it('should return empty when not O-O-O#', () => {
    const moves = [makeMove('O-O-O', 'w')];
    expect(castleQueensideWithCheckmate(moves)).toEqual([]);
  });

  it('should return trophy for O-O-O#', () => {
    const moves = [makeMove('O-O-O#', 'w')];
    const result = castleQueensideWithCheckmate(moves);
    expect(result).toEqual([{ color: 'w', onMoveNumber: 1 }]);
  });
});

describe('checkmateWithKing', () => {
  it('should return empty when not checkmate', () => {
    const moves = [makeMove('e4', 'w')];
    expect(checkmateWithKing(moves)).toEqual([]);
  });

  it('should return empty when checkmate not with king', () => {
    const moves = [makeMove('Qf7#', 'w', { fig: 'Q', check: '#' })];
    expect(checkmateWithKing(moves)).toEqual([]);
  });

  it('should return trophy for king checkmate', () => {
    const moves = [makeMove('Ke2#', 'w', { fig: 'K', check: '#' })];
    const result = checkmateWithKing(moves);
    expect(result).toEqual([{ color: 'w', onMoveNumber: 1 }]);
  });

  it('should return trophy for O-O# (king checkmate)', () => {
    const moves = [makeMove('O-O#', 'w', { check: '#' })];
    const result = checkmateWithKing(moves);
    expect(result).toEqual([{ color: 'w', onMoveNumber: 1 }]);
  });
});

describe('promoteToBishopCheckmate', () => {
  it('should return empty when not promotion checkmate', () => {
    const moves = [makeMove('e8=Q#', 'w', { promotion: '=Q', check: '#' })];
    expect(promoteToBishopCheckmate(moves)).toEqual([]);
  });

  it('should return trophy for =B#', () => {
    const moves = [makeMove('e8=B#', 'w', { promotion: '=B', check: '#' })];
    const result = promoteToBishopCheckmate(moves);
    expect(result).toEqual([{ color: 'w', onMoveNumber: 1 }]);
  });
});

describe('promoteToKnightCheckmate', () => {
  it('should return empty when not promotion checkmate', () => {
    const moves = [makeMove('e8=Q#', 'w', { promotion: '=Q', check: '#' })];
    expect(promoteToKnightCheckmate(moves)).toEqual([]);
  });

  it('should return trophy for =N#', () => {
    const moves = [makeMove('e8=N#', 'w', { promotion: '=N', check: '#' })];
    const result = promoteToKnightCheckmate(moves);
    expect(result).toEqual([{ color: 'w', onMoveNumber: 1 }]);
  });
});

describe('promotePawnBeforeMoveNumber', () => {
  it('should return empty when no promotion', () => {
    const moves = [makeMove('e4', 'w'), makeMove('e5', 'b')];
    expect(promotePawnBeforeMoveNumber(moves, 10)).toEqual([]);
  });

  it('should return trophy for white promotion before threshold', () => {
    const moves = [
      makeMove('e4', 'w'),
      makeMove('e5', 'b'),
      makeMove('e5', 'w'),
      makeMove('e6', 'b'),
      makeMove('e7', 'w'),
      makeMove('e8', 'b'),
      makeMove('e8=Q', 'w', { promotion: '=Q' }),
    ];
    const result = promotePawnBeforeMoveNumber(moves, 10);
    expect(result).toEqual([{ color: 'w', onMoveNumber: 6 }]);
  });

  it('should return empty when promotion after threshold', () => {
    const moves = Array.from({ length: 25 }, (_, i) =>
      makeMove(i % 2 === 0 ? 'e4' : 'e5', i % 2 === 0 ? 'w' : 'b'),
    );
    moves.push(makeMove('e8=Q', 'w', { promotion: '=Q' }));
    expect(promotePawnBeforeMoveNumber(moves, 10)).toEqual([]);
  });
});
