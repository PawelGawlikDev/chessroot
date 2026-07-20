import { pawnCaptures } from '@utils/pawn-captures.util';

describe('pawnCaptures', () => {
  it('should return the correct squares for white pawn captures', () => {
    expect(pawnCaptures('w', 'e4')).toEqual(['d3', 'f3']);
    expect(pawnCaptures('w', 'a2')).toEqual(['b1']);
    expect(pawnCaptures('w', 'h7')).toEqual(['g6']);
  });

  it('should return the correct squares for black pawn captures', () => {
    expect(pawnCaptures('b', 'e5')).toEqual(['d6', 'f6']);
    expect(pawnCaptures('b', 'a7')).toEqual(['b8']);
    expect(pawnCaptures('b', 'h2')).toEqual(['g3']);
  });

  it('should return an empty array if there are no valid capture squares', () => {
    expect(pawnCaptures('w', 'a1')).toEqual([]);
    expect(pawnCaptures('b', 'h8')).toEqual([]);
  });

  it('should return empty array for white pawn on bottom rank (rank 1)', () => {
    expect(pawnCaptures('w', 'e1')).toEqual([]);
    expect(pawnCaptures('w', 'h1')).toEqual([]);
  });

  it('should return empty array for black pawn on top rank (rank 8)', () => {
    expect(pawnCaptures('b', 'e8')).toEqual([]);
    expect(pawnCaptures('b', 'a8')).toEqual([]);
  });

  it('should return different offsets for white vs black on the same square', () => {
    const whiteCaptures = pawnCaptures('w', 'e5');
    const blackCaptures = pawnCaptures('b', 'e5');
    expect(whiteCaptures).toEqual(['d4', 'f4']);
    expect(blackCaptures).toEqual(['d6', 'f6']);
    expect(whiteCaptures).not.toEqual(blackCaptures);
  });

  it('should return results in sorted order', () => {
    const captures = pawnCaptures('w', 'e5');
    const sorted = [...captures].sort((a, b) => a.localeCompare(b));
    expect(captures).toEqual(sorted);
  });

  it('should return single capture square for white on left file', () => {
    expect(pawnCaptures('w', 'a5')).toEqual(['b4']);
  });

  it('should return single capture square for black on right file', () => {
    expect(pawnCaptures('b', 'h5')).toEqual(['g6']);
  });
});
