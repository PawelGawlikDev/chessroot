import { simplifyCount } from '../simple-count.util';

describe('simplifyCount', () => {
  describe('values under 10,000', () => {
    it('should return "0" for zero', () => {
      expect(simplifyCount(0)).toBe('0');
    });

    it('should return "1" for one', () => {
      expect(simplifyCount(1)).toBe('1');
    });

    it('should return "999" for 999', () => {
      expect(simplifyCount(999)).toBe('999');
    });

    it('should return "9999" for 9999', () => {
      expect(simplifyCount(9999)).toBe('9999');
    });
  });

  describe('values 10,000 to 999,999', () => {
    it('should return "10k" for 10,000', () => {
      expect(simplifyCount(10_000)).toBe('10k');
    });

    it('should return "15k" for 15,400', () => {
      expect(simplifyCount(15_400)).toBe('15k');
    });

    it('should return "100k" for 100,000', () => {
      expect(simplifyCount(100_000)).toBe('100k');
    });

    it('should return "1000k" for 999,999', () => {
      expect(simplifyCount(999_999)).toBe('1000k');
    });
  });

  describe('values 1,000,000 and above', () => {
    it('should return "1.0M" for 1,000,000', () => {
      expect(simplifyCount(1_000_000)).toBe('1.0M');
    });

    it('should return "1.5M" for 1,500,000', () => {
      expect(simplifyCount(1_500_000)).toBe('1.5M');
    });

    it('should return "1.2M" for 1,234,567', () => {
      expect(simplifyCount(1_234_567)).toBe('1.2M');
    });

    it('should return "10.0M" for 10,000,000', () => {
      expect(simplifyCount(10_000_000)).toBe('10.0M');
    });
  });
});
