import {
  consecutiveCapturesAnySquare,
  consecutiveCapturesSameSquare,
} from '../consecutive-captures';
import { PgnMove } from '@mliebelt/pgn-types';

function makeMove(
  notation: string,
  turn: 'w' | 'b',
  strike?: string,
  col?: string,
  row?: string,
): PgnMove {
  return {
    drawOffer: false,
    moveNumber: 1,
    notation: {
      notation,
      fig: null,
      strike: strike || null,
      col: col || '',
      row: row || '',
      check: undefined,
      promotion: null,
      disc: undefined,
      drop: false,
    },
    variations: [],
    nag: [],
    commentDiag: {},
    turn,
  } as unknown as PgnMove;
}

describe('consecutiveCapturesAnySquare', () => {
  it('should return empty when no consecutive captures', () => {
    const moves = [
      makeMove('exd5', 'w', 'x'),
      makeMove('e5', 'b'),
      makeMove('d4', 'w'),
      makeMove('exd4', 'b', 'x'),
    ];
    expect(consecutiveCapturesAnySquare(moves, 2)).toEqual([]);
  });

  it('should return trophy when there are consecutive captures', () => {
    const moves = [makeMove('exd5', 'w', 'x'), makeMove('exd5', 'b', 'x'), makeMove('d4', 'w')];
    const result = consecutiveCapturesAnySquare(moves, 2);
    expect(result).toEqual([
      { color: 'w', onMoveNumber: 0 },
      { color: 'b', onMoveNumber: 0 },
    ]);
  });

  it('should handle 3 consecutive captures', () => {
    const moves = [
      makeMove('e4', 'w'),
      makeMove('e5', 'b'),
      makeMove('exd5', 'w', 'x'),
      makeMove('exd5', 'b', 'x'),
      makeMove('Nxd5', 'w', 'x'),
    ];
    const result = consecutiveCapturesAnySquare(moves, 3);
    expect(result).toEqual([
      { color: 'w', onMoveNumber: 2 },
      { color: 'b', onMoveNumber: 2 },
    ]);
  });
});

describe('consecutiveCapturesSameSquare', () => {
  it('should return empty when captures are on different squares', () => {
    const moves = [makeMove('exd5', 'w', 'x', 'e', '5'), makeMove('exd4', 'b', 'x', 'e', '4')];
    expect(consecutiveCapturesSameSquare(moves, 2)).toEqual([]);
  });

  it('should return trophy when captures are on same square', () => {
    const moves = [makeMove('exd5', 'w', 'x', 'd', '5'), makeMove('Qxd5', 'b', 'x', 'd', '5')];
    const result = consecutiveCapturesSameSquare(moves, 2);
    expect(result).toEqual([
      { color: 'w', onMoveNumber: 0 },
      { color: 'b', onMoveNumber: 0 },
    ]);
  });
});
