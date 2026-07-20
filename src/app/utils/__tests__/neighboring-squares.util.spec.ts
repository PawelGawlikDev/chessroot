import { neighboringSquares } from '../neighboring-squares.util';

describe('neighboringSquares', () => {
  it('should return neighboring squares for a given square', () => {
    const square = 'e4';
    const expectedNeighbors = ['d3', 'd4', 'd5', 'e3', 'e5', 'f3', 'f4', 'f5'];
    const neighbors = neighboringSquares(square);
    expect(neighbors).toEqual(expectedNeighbors);
  });

  it('should return neighboring squares for a corner square', () => {
    const square = 'a1';
    const expectedNeighbors = ['a2', 'b1', 'b2'];
    const neighbors = neighboringSquares(square);
    expect(neighbors).toEqual(expectedNeighbors);
  });

  it('should return neighboring squares for an edge square', () => {
    const square = 'h5';
    const expectedNeighbors = ['g4', 'g5', 'g6', 'h4', 'h6'];
    const neighbors = neighboringSquares(square);
    expect(neighbors).toEqual(expectedNeighbors);
  });

  it('should return neighboring squares for a8 (top-left corner)', () => {
    const neighbors = neighboringSquares('a8');
    expect(neighbors).toEqual(['a7', 'b7', 'b8']);
  });

  it('should return neighboring squares for h1 (bottom-right corner)', () => {
    const neighbors = neighboringSquares('h1');
    expect(neighbors).toEqual(['g1', 'g2', 'h2']);
  });

  it('should return neighboring squares for h8 (top-right corner)', () => {
    const neighbors = neighboringSquares('h8');
    expect(neighbors).toEqual(['g7', 'g8', 'h7']);
  });

  it('should return neighboring squares for a4 (file edge, non-corner)', () => {
    const neighbors = neighboringSquares('a4');
    expect(neighbors).toEqual(['a3', 'a5', 'b3', 'b4', 'b5']);
  });

  it('should return neighboring squares for e1 (bottom edge, non-corner)', () => {
    const neighbors = neighboringSquares('e1');
    expect(neighbors).toEqual(['d1', 'd2', 'e2', 'f1', 'f2']);
  });

  it('should return neighboring squares for e8 (top edge, non-corner)', () => {
    const neighbors = neighboringSquares('e8');
    expect(neighbors).toEqual(['d7', 'd8', 'e7', 'f7', 'f8']);
  });

  it('should return results in sorted order', () => {
    const neighbors = neighboringSquares('d4');
    const sorted = [...neighbors].sort((a, b) => a.localeCompare(b));
    expect(neighbors).toEqual(sorted);
  });
});
