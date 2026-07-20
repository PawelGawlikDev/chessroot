import { castleFork } from '../castle-fork';
import { PgnMove } from '@mliebelt/pgn-types';

function makeMove(
  notation: string,
  turn: 'w' | 'b',
  fig?: string,
  strike?: 'x',
  check?: string,
): PgnMove {
  const col = notation.length > 1 ? notation[notation.length - 2] : '';
  const row = notation.length > 1 ? notation[notation.length - 1] : '';
  return {
    drawOffer: false,
    moveNumber: 1,
    notation: {
      fig: fig || null,
      strike: strike || null,
      col,
      row,
      check: check || undefined,
      promotion: null,
      notation,
      disc: undefined,
      drop: false,
    },
    variations: [],
    nag: [],
    commentDiag: {},
    turn,
  } as unknown as PgnMove;
}

describe('castleFork', () => {
  it('should return empty array when no castle with check in game', () => {
    const moves = [
      makeMove('e4', 'w'),
      makeMove('e5', 'b'),
      makeMove('Nf3', 'w'),
      makeMove('Nc6', 'b'),
    ];
    expect(castleFork(moves)).toEqual([]);
  });

  it('should return empty array when castle with check but no king capture follow-up', () => {
    const moves = [
      makeMove('e4', 'w'),
      makeMove('e5', 'b'),
      makeMove('O-O+', 'w', 'K', undefined, '+'),
      makeMove('Nf6', 'b'),
      makeMove('d4', 'w'),
    ];
    expect(castleFork(moves)).toEqual([]);
  });

  it('should return empty array when castle with check is at the end of game', () => {
    const moves = [
      makeMove('e4', 'w'),
      makeMove('e5', 'b'),
      makeMove('O-O+', 'w', 'K', undefined, '+'),
    ];
    expect(castleFork(moves)).toEqual([]);
  });

  it('should detect castle fork when king captures after castle with check', () => {
    const moves = [
      makeMove('e4', 'w'),
      makeMove('e5', 'b'),
      makeMove('O-O+', 'w', 'K', undefined, '+'),
      makeMove('Ke7', 'b', 'K'),
      makeMove('Kxe6', 'w', 'K', 'x'),
    ];
    const result = castleFork(moves);
    expect(result).toEqual([{ color: 'w', onMoveNumber: 2 }]);
  });

  it('should return empty array when king moves but does not capture', () => {
    const moves = [
      makeMove('e4', 'w'),
      makeMove('e5', 'b'),
      makeMove('O-O+', 'w', 'K', undefined, '+'),
      makeMove('Ke7', 'b', 'K'),
      makeMove('Kf1', 'w', 'K'),
    ];
    expect(castleFork(moves)).toEqual([]);
  });

  it('should return empty array when it is not a king move', () => {
    const moves = [
      makeMove('e4', 'w'),
      makeMove('e5', 'b'),
      makeMove('O-O+', 'w', 'K', undefined, '+'),
      makeMove('Ke7', 'b', 'K'),
      makeMove('Nxe6', 'w', 'N', 'x'),
    ];
    expect(castleFork(moves)).toEqual([]);
  });

  it('should return first match when multiple castle forks exist', () => {
    const moves = [
      makeMove('e4', 'w'),
      makeMove('e5', 'b'),
      makeMove('O-O+', 'w', 'K', undefined, '+'),
      makeMove('Ke7', 'b', 'K'),
      makeMove('Kxe6', 'w', 'K', 'x'),
      makeMove('O-O+', 'b', 'K', undefined, '+'),
      makeMove('Kd1', 'w', 'K'),
      makeMove('Kxe2', 'b', 'K', 'x'),
    ];
    const result = castleFork(moves);
    expect(result).toEqual([{ color: 'w', onMoveNumber: 2 }]);
  });
});
