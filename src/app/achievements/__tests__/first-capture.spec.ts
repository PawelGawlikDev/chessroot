import { getMoveNumberOfFirstCapture, noCapturesBeforeMoveNumber } from '../first-capture';
import { PgnMove } from '@mliebelt/pgn-types';

function makeMove(notation: string, turn: 'w' | 'b', strike?: string): PgnMove {
  return {
    drawOffer: false,
    moveNumber: 1,
    notation: {
      notation,
      fig: null,
      strike: strike || null,
      col: '',
      row: '',
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

describe('getMoveNumberOfFirstCapture', () => {
  it('should return -1 when there are no captures', () => {
    const moves = [
      makeMove('e4', 'w'),
      makeMove('e5', 'b'),
      makeMove('d4', 'w'),
      makeMove('d5', 'b'),
    ];
    expect(getMoveNumberOfFirstCapture(moves)).toBe(-1);
  });

  it('should return index of first capture', () => {
    const moves = [
      makeMove('e4', 'w'),
      makeMove('e5', 'b'),
      makeMove('d4', 'w'),
      makeMove('d5', 'b'),
      makeMove('exd5', 'w', 'x'),
    ];
    expect(getMoveNumberOfFirstCapture(moves)).toBe(4);
  });

  it('should return 0 if first move is a capture', () => {
    const moves = [makeMove('exd5', 'w', 'x')];
    expect(getMoveNumberOfFirstCapture(moves)).toBe(0);
  });
});

describe('noCapturesBeforeMoveNumber', () => {
  it('should return empty when capture happens before the threshold', () => {
    const moves = [makeMove('e4', 'w'), makeMove('e5', 'b'), makeMove('exd5', 'w', 'x')];
    expect(noCapturesBeforeMoveNumber(moves, 3)).toEqual([]);
  });

  it('should return trophy when first capture is at or after threshold', () => {
    const moves = [
      makeMove('e4', 'w'),
      makeMove('e5', 'b'),
      makeMove('d4', 'w'),
      makeMove('d5', 'b'),
      makeMove('exd5', 'w', 'x'),
    ];
    const result = noCapturesBeforeMoveNumber(moves, 3);
    expect(result).toEqual([
      { color: 'w', onMoveNumber: 4 },
      { color: 'b', onMoveNumber: 4 },
    ]);
  });

  it('should return trophy when no captures at all and enough moves', () => {
    const moves = [
      makeMove('e4', 'w'),
      makeMove('e5', 'b'),
      makeMove('d4', 'w'),
      makeMove('d5', 'b'),
    ];
    const result = noCapturesBeforeMoveNumber(moves, 2);
    expect(result).toEqual([
      { color: 'w', onMoveNumber: 4 },
      { color: 'b', onMoveNumber: 4 },
    ]);
  });

  it('should return empty when no captures but not enough moves', () => {
    const moves = [makeMove('e4', 'w'), makeMove('e5', 'b')];
    expect(noCapturesBeforeMoveNumber(moves, 2)).toEqual([]);
  });
});
