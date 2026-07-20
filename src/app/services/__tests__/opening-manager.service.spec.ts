import { OpeningManagerService } from '../opening-manager.service';
import { TestBed } from '@angular/core/testing';
import { Chess } from 'chess.js';

describe('OpeningManagerService', () => {
  let service: OpeningManagerService;
  let startingFen: string;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OpeningManagerService);
    startingFen = new Chess().fen();
  });

  it('should create the service', () => {
    expect(service).toBeTruthy();
  });

  describe('reset', () => {
    it('should initialize with starting FEN', () => {
      service.reset();
      expect(service.fen()).toBe(startingFen);
    });

    it('should reset index to 0', () => {
      service.addPly('rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1', {
        from: 'e2',
        to: 'e4',
        san: 'e4',
      });
      expect(service.currentIndex()).toBe(1);

      service.reset();
      expect(service.currentIndex()).toBe(0);
    });
  });

  describe('initial state', () => {
    it('should return the starting FEN', () => {
      expect(service.fen()).toBe(startingFen);
    });

    it('should have canGoForward as false', () => {
      expect(service.canGoForward()).toBe(false);
    });

    it('should have canGoBack as false', () => {
      expect(service.canGoBack()).toBe(false);
    });

    it('should return -1 for currentMove at start', () => {
      expect(service.currentMove()).toBe(-1);
    });
  });

  describe('moveForward and moveBack at start', () => {
    it('moveForward should return null when at start', () => {
      expect(service.moveForward()).toBeNull();
    });

    it('moveBack should return null when at start', () => {
      expect(service.moveBack()).toBeNull();
    });
  });

  describe('addPly', () => {
    const e4Fen = 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1';
    const e4e5Fen = 'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e6 0 2';

    it('should add a move and advance the index', () => {
      const result = service.addPly(e4Fen, { from: 'e2', to: 'e4', san: 'e4' });
      expect(result.move?.san).toBe('e4');
      expect(result.fen).toBe(e4Fen);
      expect(service.currentIndex()).toBe(1);
    });

    it('should update fen() after adding a ply', () => {
      service.addPly(e4Fen, { from: 'e2', to: 'e4', san: 'e4' });
      expect(service.fen()).toBe(e4Fen);
    });

    it('should make canGoBack true after adding a ply', () => {
      service.addPly(e4Fen, { from: 'e2', to: 'e4', san: 'e4' });
      expect(service.canGoBack()).toBe(true);
    });

    it('should allow multiple sequential plies', () => {
      service.addPly(e4Fen, { from: 'e2', to: 'e4', san: 'e4' });
      service.addPly(e4e5Fen, { from: 'e7', to: 'e5', san: 'e5' });
      expect(service.currentIndex()).toBe(2);
      expect(service.fen()).toBe(e4e5Fen);
    });

    it('should update currentMove correctly after adding plies', () => {
      expect(service.currentMove()).toBe(-1);

      service.addPly(e4Fen, { from: 'e2', to: 'e4', san: 'e4' });
      expect(service.currentMove()).toBe(0);

      service.addPly(e4e5Fen, { from: 'e7', to: 'e5', san: 'e5' });
      expect(service.currentMove()).toBe(0);

      const d4Fen = 'rnbqkbnr/pppp1ppp/8/4p3/3PP3/8/PPP2PPP/RNBQKBNR b KQkq d3 0 2';
      service.addPly(d4Fen, { from: 'd2', to: 'd4', san: 'd4' });
      expect(service.currentMove()).toBe(1);
    });
  });

  describe('moveBack', () => {
    it('should return to the previous position', () => {
      const e4Fen = 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1';
      service.addPly(e4Fen, { from: 'e2', to: 'e4', san: 'e4' });

      const ply = service.moveBack();
      expect(ply).not.toBeNull();
      expect(ply!.fen).toBe(startingFen);
      expect(service.currentIndex()).toBe(0);
    });
  });

  describe('moveForward', () => {
    it('should return to the position after moveBack', () => {
      const e4Fen = 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1';
      service.addPly(e4Fen, { from: 'e2', to: 'e4', san: 'e4' });

      service.moveBack();
      const ply = service.moveForward();
      expect(ply).not.toBeNull();
      expect(ply!.fen).toBe(e4Fen);
      expect(service.currentIndex()).toBe(1);
    });

    it('should have canGoForward true after moveBack', () => {
      const e4Fen = 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1';
      service.addPly(e4Fen, { from: 'e2', to: 'e4', san: 'e4' });
      service.moveBack();
      expect(service.canGoForward()).toBe(true);
    });
  });

  describe('moveTo', () => {
    it('should navigate to a specific index', () => {
      const e4Fen = 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1';
      const e5Fen = 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1';
      service.addPly(e4Fen, { from: 'e2', to: 'e4', san: 'e4' });
      service.addPly(e5Fen, { from: 'e7', to: 'e5', san: 'e5' });

      const ply = service.moveTo(0);
      expect(ply).not.toBeNull();
      expect(ply!.fen).toBe(startingFen);
      expect(service.currentIndex()).toBe(0);
    });

    it('should return null for negative index', () => {
      expect(service.moveTo(-1)).toBeNull();
    });

    it('should return null for out-of-bounds index', () => {
      expect(service.moveTo(100)).toBeNull();
    });
  });

  describe('addPly truncation', () => {
    it('should reuse existing ply when moving to same SAN', () => {
      const e4Fen = 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1';
      service.addPly(e4Fen, { from: 'e2', to: 'e4', san: 'e4' });
      service.moveBack();

      const result = service.addPly(e4Fen, { from: 'e2', to: 'e4', san: 'e4' });
      expect(result.fen).toBe(e4Fen);
      expect(service.currentIndex()).toBe(1);
    });

    it('should truncate future plys when adding a different move after moveBack', () => {
      const e4Fen = 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1';
      const d4Fen = 'rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq d3 0 1';

      service.addPly(e4Fen, { from: 'e2', to: 'e4', san: 'e4' });
      service.moveBack();

      const result = service.addPly(d4Fen, { from: 'd2', to: 'd4', san: 'd4' });
      expect(result.move?.san).toBe('d4');
      expect(service.currentIndex()).toBe(1);
      expect(service.fen()).toBe(d4Fen);

      // Moving forward should not go to the old e4 ply anymore
      expect(service.canGoForward()).toBe(false);
    });
  });
});
