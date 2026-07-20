import { buildPgnList } from '../build-png-list.util';
import type { NavigatorPly } from '@model';

function makePly(san: string | null): NavigatorPly {
  return {
    fen: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1',
    move: san ? { from: 'e2', to: 'e4', san } : null,
  };
}

describe('buildPgnList', () => {
  it('should return empty array for empty input', () => {
    const result = buildPgnList([]);
    expect(result).toEqual([]);
  });

  it('should skip the first ply (index 0 = root position)', () => {
    const plys: NavigatorPly[] = [{ fen: 'start', move: null }, makePly('e4')];
    const result = buildPgnList(plys);
    expect(result).toEqual([{ moveNumber: 1, whitePly: 'e4', blackPly: '' }]);
  });

  it('should create one entry for a single white ply', () => {
    const plys: NavigatorPly[] = [{ fen: 'start', move: null }, makePly('d4')];
    const result = buildPgnList(plys);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ moveNumber: 1, whitePly: 'd4', blackPly: '' });
  });

  it('should group white and black moves into one entry', () => {
    const plys: NavigatorPly[] = [{ fen: 'start', move: null }, makePly('e4'), makePly('e5')];
    const result = buildPgnList(plys);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ moveNumber: 1, whitePly: 'e4', blackPly: 'e5' });
  });

  it('should produce correct move numbers for multiple full moves', () => {
    const plys: NavigatorPly[] = [
      { fen: 'start', move: null },
      makePly('e4'), // white 1
      makePly('e5'), // black 1
      makePly('Nf3'), // white 2
      makePly('Nc6'), // black 2
      makePly('Bb5'), // white 3
    ];
    const result = buildPgnList(plys);
    expect(result).toHaveLength(3);
    expect(result[0]).toEqual({ moveNumber: 1, whitePly: 'e4', blackPly: 'e5' });
    expect(result[1]).toEqual({ moveNumber: 2, whitePly: 'Nf3', blackPly: 'Nc6' });
    expect(result[2]).toEqual({ moveNumber: 3, whitePly: 'Bb5', blackPly: '' });
  });

  it('should skip plys where move is null', () => {
    const plys: NavigatorPly[] = [
      { fen: 'start', move: null },
      makePly('e4'),
      { fen: 'some-fen', move: null }, // null move skipped
      makePly('Nf3'),
    ];
    const result = buildPgnList(plys);
    // Index 1 (e4) -> white move for move 1
    // Index 2 -> null move, skipped
    // Index 3 (Nf3) -> white move for move 2
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ moveNumber: 1, whitePly: 'e4', blackPly: '' });
    expect(result[1]).toEqual({ moveNumber: 2, whitePly: 'Nf3', blackPly: '' });
  });

  it('should handle a game ending on a black move', () => {
    const plys: NavigatorPly[] = [
      { fen: 'start', move: null },
      makePly('e4'),
      makePly('e5'),
      makePly('Nf3'),
      makePly('Nc6'),
    ];
    const result = buildPgnList(plys);
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ moveNumber: 1, whitePly: 'e4', blackPly: 'e5' });
    expect(result[1]).toEqual({ moveNumber: 2, whitePly: 'Nf3', blackPly: 'Nc6' });
  });
});
