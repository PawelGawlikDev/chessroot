import { knightMoves } from '@utils/knight-moves.util';

describe('knightMoves', () => {
  it('should return correct knight moves from d4', () => {
    const moves = knightMoves('d4');
    expect(moves).toEqual(['b3', 'b5', 'c2', 'c6', 'e2', 'e6', 'f3', 'f5']);
  });

  it('should return correct knight moves from a1', () => {
    const moves = knightMoves('a1');
    expect(moves).toEqual(['b3', 'c2']);
  });

  it('should return correct knight moves from h8', () => {
    const moves = knightMoves('h8');
    expect(moves).toEqual(['f7', 'g6']);
  });

  it('should return correct knight moves from e5', () => {
    const moves = knightMoves('e5');
    expect(moves).toEqual(['c4', 'c6', 'd3', 'd7', 'f3', 'f7', 'g4', 'g6']);
  });

  it('should return correct knight moves from a8 (top-left corner)', () => {
    const moves = knightMoves('a8');
    expect(moves).toEqual(['b6', 'c7']);
  });

  it('should return correct knight moves from h1 (bottom-right corner)', () => {
    const moves = knightMoves('h1');
    expect(moves).toEqual(['f2', 'g3']);
  });

  it('should return correct knight moves from a4 (file edge, non-corner)', () => {
    const moves = knightMoves('a4');
    expect(moves).toEqual(['b2', 'b6', 'c3', 'c5']);
  });

  it('should return correct knight moves from e1 (bottom edge, non-corner)', () => {
    const moves = knightMoves('e1');
    expect(moves).toEqual(['c2', 'd3', 'f3', 'g2']);
  });

  it('should return correct knight moves from e8 (top edge, non-corner)', () => {
    const moves = knightMoves('e8');
    expect(moves).toEqual(['c7', 'd6', 'f6', 'g7']);
  });

  it('should return correct knight moves from h5 (file edge, non-corner)', () => {
    const moves = knightMoves('h5');
    expect(moves).toEqual(['f4', 'f6', 'g3', 'g7']);
  });

  it('should return results in sorted order', () => {
    const moves = knightMoves('d4');
    const sorted = [...moves].sort((a, b) => a.localeCompare(b));
    expect(moves).toEqual(sorted);
  });
});
