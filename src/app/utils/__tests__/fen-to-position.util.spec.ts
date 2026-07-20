import { fenToPosition, positionToFiles } from '@utils/fen-to-position.utils';

describe('fen-to-position utils', () => {
  describe('fenToPosition', () => {
    it('should convert fen to position', () => {
      const fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
      const position = fenToPosition(fen);
      expect(position).toBe('rnbqkbnrpppppppp................................PPPPPPPPRNBQKBNR');
    });

    it('should return 64 dots for an empty board', () => {
      const fen = '8/8/8/8/8/8/8/8 w - - 0 1';
      const position = fenToPosition(fen);
      expect(position).toBe('................................................................');
      expect(position.length).toBe(64);
    });

    it('should handle FEN with mixed digits and pieces', () => {
      const fen = '1n1q4/8/8/8/8/8/8/4Q1N1 w - - 0 1';
      const position = fenToPosition(fen);
      expect(position).toBe('.n.q........................................................Q.N.');
    });

    it('should handle FEN with rank having all 8 empty squares', () => {
      const fen = '8/pppppppp/8/8/8/8/PPPPPPPP/8 w - - 0 1';
      const position = fenToPosition(fen);
      expect(position).toBe('........pppppppp................................PPPPPPPP........');
    });

    it('should handle FEN with rank having no empty squares', () => {
      const fen = 'rnbqkbnr/1ppppppp/8/8/8/8/1PPPPPPP/RNBQKBNR w KQkq - 0 1';
      const position = fenToPosition(fen);
      expect(position).toBe('rnbqkbnr.ppppppp.................................PPPPPPPRNBQKBNR');
    });

    it('should ignore FEN metadata after the first space', () => {
      const fen1 = '8/8/8/8/8/8/8/8 w - - 0 1';
      const fen2 = '8/8/8/8/8/8/8/8 b KQkq - 5 10';
      expect(fenToPosition(fen1)).toBe(fenToPosition(fen2));
    });
  });

  describe('positionToFiles', () => {
    it('should convert position to files', () => {
      const position = 'rnbqkbnrpppppppp................................PPPPPPPPRNBQKBNR';
      const files = positionToFiles(position);
      expect(files).toEqual([
        'rp....PR',
        'np....PN',
        'bp....PB',
        'qp....PQ',
        'kp....PK',
        'bp....PB',
        'np....PN',
        'rp....PR',
      ]);
    });

    it('should return empty array for empty position string', () => {
      const files = positionToFiles('');
      expect(files).toEqual([]);
    });

    it('should handle position shorter than 64 characters', () => {
      const files = positionToFiles('abcd');
      expect(files).toEqual(['a', 'b', 'c', 'd']);
    });

    it('should correctly transpose 64-character position into 8 files', () => {
      const position = '1234567812345678123456781234567812345678123456781234567812345678';
      const files = positionToFiles(position);
      expect(files).toHaveLength(8);
      files.forEach((file) => {
        expect(file).toHaveLength(8);
      });
      expect(files[0]).toBe('11111111');
      expect(files[1]).toBe('22222222');
      expect(files[7]).toBe('88888888');
    });
  });
});
