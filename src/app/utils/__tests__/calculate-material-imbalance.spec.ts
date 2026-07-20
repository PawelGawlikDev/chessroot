import { calculateMaterialImbalance } from '@utils/calculate-material-imbalance.util';

describe('calculateMaterialImbalance', () => {
  it('should return 0 for an empty position', () => {
    expect(calculateMaterialImbalance('')).toBe(0);
  });

  it('should return the correct imbalance for a simple position', () => {
    expect(calculateMaterialImbalance('rnbqkbnr')).toBe(-31);
    expect(calculateMaterialImbalance('RNBQKBNR')).toBe(31);
    expect(calculateMaterialImbalance('rnbqkbnrp')).toBe(-32);
    expect(calculateMaterialImbalance('RNBQKBNRP')).toBe(32);
  });

  it('should return the correct imbalance for a complex position', () => {
    expect(calculateMaterialImbalance('rnbqkbnrppppppppPPPPPPPPRNBQKBNR')).toBe(0);
    expect(calculateMaterialImbalance('rnbqkbnrpppppppPPRNB QKBNR')).toBe(-5);
    expect(calculateMaterialImbalance('rnbqkbnrpppppppPPRNBQKBNR')).toBe(-5);
    expect(calculateMaterialImbalance('rnbqkbnrpppppppPPRNBQKBNRP')).toBe(-4);
  });

  it('should return correct value for individual black pieces', () => {
    expect(calculateMaterialImbalance('p')).toBe(-1);
    expect(calculateMaterialImbalance('n')).toBe(-3);
    expect(calculateMaterialImbalance('b')).toBe(-3);
    expect(calculateMaterialImbalance('r')).toBe(-5);
    expect(calculateMaterialImbalance('q')).toBe(-9);
  });

  it('should return correct value for individual white pieces', () => {
    expect(calculateMaterialImbalance('P')).toBe(1);
    expect(calculateMaterialImbalance('N')).toBe(3);
    expect(calculateMaterialImbalance('B')).toBe(3);
    expect(calculateMaterialImbalance('R')).toBe(5);
    expect(calculateMaterialImbalance('Q')).toBe(9);
  });

  it('should ignore kings', () => {
    expect(calculateMaterialImbalance('k')).toBe(0);
    expect(calculateMaterialImbalance('K')).toBe(0);
    expect(calculateMaterialImbalance('kK')).toBe(0);
  });

  it('should ignore non-piece characters', () => {
    expect(calculateMaterialImbalance('........')).toBe(0);
    expect(calculateMaterialImbalance('12345678')).toBe(0);
    expect(calculateMaterialImbalance(' ')).toBe(0);
    expect(calculateMaterialImbalance('/')).toBe(0);
  });

  it('should return positive value when white has material advantage', () => {
    expect(calculateMaterialImbalance('P')).toBe(1);
    expect(calculateMaterialImbalance('PP')).toBe(2);
    expect(calculateMaterialImbalance('rP')).toBe(-4);
    expect(calculateMaterialImbalance('RP')).toBe(6);
  });

  it('should return negative value when black has material advantage', () => {
    expect(calculateMaterialImbalance('p')).toBe(-1);
    expect(calculateMaterialImbalance('pp')).toBe(-2);
    expect(calculateMaterialImbalance('pR')).toBe(4);
    expect(calculateMaterialImbalance('pr')).toBe(-6);
  });
});
