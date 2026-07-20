import { checkmateAtMoveNumber } from '../checkmate-at-move-number';
import { PgnMove } from '@mliebelt/pgn-types';

function makeMove(notation: string, turn: 'w' | 'b', check?: string, fig?: string): PgnMove {
  return {
    drawOffer: false,
    moveNumber: turn === 'w' ? 1 : 1,
    notation: {
      notation,
      fig: fig || null,
      strike: null,
      col: '',
      row: '',
      check: check,
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

describe('checkmateAtMoveNumber', () => {
  it('should return empty when last move is not checkmate', () => {
    const moves = [makeMove('e4', 'w'), makeMove('e5', 'b')];
    expect(checkmateAtMoveNumber(moves, 1)).toEqual([]);
  });

  it('should return empty when move number does not match', () => {
    const moves = [
      makeMove('e4', 'w'),
      makeMove('e5', 'b'),
      makeMove('Qh5', 'w'),
      makeMove('Nc6', 'b'),
      makeMove('Bc4', 'w'),
      makeMove('Nf6', 'b'),
      makeMove('Qxf7#', 'w', '#'),
    ];
    expect(checkmateAtMoveNumber(moves, 3)).toEqual([]);
  });

  it('should return trophy when checkmate at correct move number', () => {
    const moves = [
      makeMove('e4', 'w'),
      makeMove('e5', 'b'),
      makeMove('Qh5', 'w'),
      makeMove('Nc6', 'b'),
      makeMove('Bc4', 'w'),
      makeMove('Nf6', 'b'),
      makeMove('Qxf7#', 'w', '#'),
    ];
    const result = checkmateAtMoveNumber(moves, 4);
    expect(result).toEqual([{ color: 'w', onMoveNumber: 7 }]);
  });

  it('should return trophy for black checkmate', () => {
    const moves = [
      makeMove('f3', 'w'),
      makeMove('e5', 'b'),
      makeMove('g4', 'w'),
      makeMove('Qh4#', 'b', '#'),
    ];
    const result = checkmateAtMoveNumber(moves, 2);
    expect(result).toEqual([{ color: 'b', onMoveNumber: 4 }]);
  });
});
