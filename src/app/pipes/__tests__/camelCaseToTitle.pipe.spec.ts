import { CamelCaseToTitlePipe } from '../camelCaseToTitle.pipe';

describe('CamelCaseToTitlePipe', () => {
  let pipe: CamelCaseToTitlePipe;

  beforeEach(() => {
    pipe = new CamelCaseToTitlePipe();
  });

  it('should create', () => {
    expect(pipe).toBeTruthy();
  });

  it('should transform camelCase to Title Case', () => {
    expect(pipe.transform('camelCase')).toBe('Camel Case');
  });

  it('should transform PascalCase to Title Case', () => {
    expect(pipe.transform('PascalCase')).toBe('Pascal Case');
  });

  it('should transform multiple words', () => {
    expect(pipe.transform('thisIsACamelCaseString')).toBe('This Is A Camel Case String');
  });

  it('should return empty string for empty input', () => {
    expect(pipe.transform('')).toBe('');
  });

  it('should return null/undefined for null input', () => {
    expect(pipe.transform(null as unknown as string)).toBeNull();
  });

  it('should return undefined for undefined input', () => {
    expect(pipe.transform(undefined as unknown as string)).toBeUndefined();
  });

  it('should handle single word', () => {
    expect(pipe.transform('hello')).toBe('Hello');
  });

  it('should handle single character', () => {
    expect(pipe.transform('a')).toBe('A');
  });

  it('should handle single letter words', () => {
    expect(pipe.transform('aWord')).toBe('A Word');
  });
});
