import { blockCheckWithCheckmate } from '../block-check-with-checkmate';
import { PgnMove } from '@mliebelt/pgn-types';

function makeMove(
  notation: string,
  turn: 'w' | 'b',
  opts: Partial<{ fig: string; strike: string; check: string; col: string; row: string }> = {},
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

describe('blockCheckWithCheckmate', () => {
  it('should return empty when no check-then-mate sequence', () => {
    const moves = [makeMove('e4', 'w'), makeMove('e5', 'b')];
    expect(blockCheckWithCheckmate(moves)).toEqual([]);
  });

  it('should return empty when check is not followed by checkmate', () => {
    const moves = [makeMove('Qh5+', 'w', { check: '+' }), makeMove('g6', 'b')];
    expect(blockCheckWithCheckmate(moves)).toEqual([]);
  });

  it('should return trophy when opponent checks and next move is non-capture non-king checkmate', () => {
    const moves = [
      makeMove('Qh5+', 'b', { check: '+' }),
      makeMove('Nf3#', 'w', { fig: 'N', check: '#' }),
    ];
    const result = blockCheckWithCheckmate(moves);
    expect(result).toEqual([{ color: 'w', onMoveNumber: 1 }]);
  });

  it('should return empty when checkmate is by king', () => {
    const moves = [
      makeMove('Qh5+', 'b', { check: '+' }),
      makeMove('Kd7#', 'w', { fig: 'K', check: '#' }),
    ];
    expect(blockCheckWithCheckmate(moves)).toEqual([]);
  });

  it('should return empty when checkmate is a capture', () => {
    const moves = [
      makeMove('Qh5+', 'b', { check: '+' }),
      makeMove('Qxf7#', 'w', { fig: 'Q', strike: 'x', check: '#' }),
    ];
    expect(blockCheckWithCheckmate(moves)).toEqual([]);
  });

  it('should return trophy when pawn delivers mate after being checked', () => {
    const moves = [makeMove('Qe5+', 'b', { check: '+' }), makeMove('f4#', 'w', { check: '#' })];
    const result = blockCheckWithCheckmate(moves);
    expect(result).toEqual([{ color: 'w', onMoveNumber: 1 }]);
  });

  it('should return empty for single move', () => {
    expect(blockCheckWithCheckmate([makeMove('e4', 'w')])).toEqual([]);
  });

  it('should find the first occurrence in a long game', () => {
    const moves = [
      makeMove('e4', 'w'),
      makeMove('e5', 'b'),
      makeMove('Qh5+', 'b', { check: '+' }),
      makeMove('Nf3#', 'w', { fig: 'N', check: '#' }),
    ];
    const result = blockCheckWithCheckmate(moves);
    expect(result).toEqual([{ color: 'w', onMoveNumber: 3 }]);
  });
});
