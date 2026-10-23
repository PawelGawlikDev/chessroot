import { TestBed } from '@angular/core/testing';
import { Chess } from 'chess.js';

import { OpeningManagerService } from '../opening-manager.service';

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

  describe('editing the tree', () => {
    function play(san: string): number {
      const chess = new Chess(service.fen());
      const move = chess.move(san);
      service.addPly(chess.fen(), move);
      return service.currentId();
    }

    it('removes the selected subtree and returns to its parent', () => {
      const e4 = play('e4');
      const e5 = play('e5');
      play('Nf3');
      service.moveToNode(e4);
      const c5 = play('c5');
      play('Nc3');
      expect(service.removeNode(c5)).toBe(true);
      expect(service.currentId()).toBe(e4);
      expect(service.continuations().map((n) => n.id)).toEqual([e5]);
      expect(service.nodes().map((n) => n.move?.san)).toEqual([undefined, 'e4', 'e5', 'Nf3']);
    });

    it('leaves an unrelated active branch unchanged when deleting', () => {
      const e4 = play('e4');
      const e5 = play('e5');
      service.moveToNode(e4);
      const c5 = play('c5');
      const fen = service.fen();
      service.removeNode(e5);
      expect(service.currentId()).toBe(c5);
      expect(service.fen()).toBe(fen);
    });

    it('promotes a nested variation all the way to the main line without losing moves', () => {
      const e4 = play('e4');
      const e5 = play('e5');
      const nf3 = play('Nf3');
      service.moveToNode(e4);
      play('c5');
      const nc3 = play('Nc3');
      play('d6');
      service.moveToNode(nc3);
      const e6 = play('e6');
      const fen = service.fen();
      const ids = service.nodes().map((n) => n.id);
      expect(service.promoteNode(e6)).toBe(true);
      expect(service.fen()).toBe(fen);
      expect(service.currentId()).toBe(e6);
      service.moveToNode(0);
      expect(service.line().map((n) => n.move?.san)).toEqual([undefined, 'e4', 'c5', 'Nc3', 'e6']);
      expect(
        service
          .nodes()
          .map((n) => n.id)
          .sort(),
      ).toEqual(ids.sort());
      service.moveToNode(e5);
      expect(service.line().at(-1)?.id).toBe(nf3);
    });

    it('promotes an alternative first move and handles repeated promotion', () => {
      const e4 = play('e4');
      service.moveToNode(0);
      const d4 = play('d4');
      service.promoteNode(d4);
      service.promoteNode(d4);
      service.moveToNode(0);
      expect(service.continuations().map((n) => n.id)).toEqual([d4, e4]);
    });

    it('cannot remove or promote the root or an unknown node', () => {
      for (const id of [0, -1, 999]) {
        expect(service.removeNode(id)).toBe(false);
        expect(service.promoteNode(id)).toBe(false);
      }
      expect(service.nodes()).toHaveLength(1);
    });
  });

  describe('variations', () => {
    it('should reuse existing ply when moving to same SAN', () => {
      const e4Fen = 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1';
      service.addPly(e4Fen, { from: 'e2', to: 'e4', san: 'e4' });
      service.moveBack();

      const result = service.addPly(e4Fen, { from: 'e2', to: 'e4', san: 'e4' });
      expect(result.fen).toBe(e4Fen);
      expect(service.currentIndex()).toBe(1);
    });

    it('should preserve future plies when adding a different move after moveBack', () => {
      const e4Fen = 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1';
      const d4Fen = 'rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq d3 0 1';

      service.addPly(e4Fen, { from: 'e2', to: 'e4', san: 'e4' });
      service.moveBack();

      const result = service.addPly(d4Fen, { from: 'd2', to: 'd4', san: 'd4' });
      expect(result.move?.san).toBe('d4');
      expect(service.currentIndex()).toBe(1);
      expect(service.fen()).toBe(d4Fen);

      // The new variation is a leaf; the original continuation remains at its parent.
      expect(service.canGoForward()).toBe(false);
      service.moveTo(0);
      expect(service.continuations().map((node) => node.move?.san)).toEqual(['e4', 'd4']);
      service.moveForward();
      expect(service.fen()).toBe(e4Fen);
    });

    it('should retain nested branches and navigate between nodes at the same ply', () => {
      const play = (san: string) => {
        const chess = new Chess(service.fen());
        const move = chess.move(san);
        service.addPly(chess.fen(), move);
        return service.currentId();
      };
      play('e4');
      const e5 = play('e5');
      const nf3 = play('Nf3');
      service.moveBack();
      const bc4 = play('Bc4');
      service.moveBack();
      expect(service.continuations().map((node) => node.id)).toEqual([nf3, bc4]);
      service.moveBack();
      const c5 = play('c5');
      const nc3 = play('Nc3');
      service.moveToNode(nf3);
      expect(service.line().map((node) => node.move?.san)).toEqual([undefined, 'e4', 'e5', 'Nf3']);
      service.moveToNode(nc3);
      expect(service.line().map((node) => node.move?.san)).toEqual([undefined, 'e4', 'c5', 'Nc3']);
      service.moveBack();
      expect(service.currentId()).toBe(c5);
      service.moveToNode(e5);
      play('Nf3');
      expect(service.currentId()).toBe(nf3);
      expect(service.nodes()).toHaveLength(7);
    });

    it('should reject unknown node IDs without changing the position', () => {
      expect(service.moveToNode(999)).toBeNull();
      expect(service.currentId()).toBe(0);
    });

    it('should clear the tree only on reset', () => {
      service.addPly('fen', { from: 'e2', to: 'e4', san: 'e4' });
      const id = service.currentId();
      service.moveToNode(0);
      expect(service.nodes()).toHaveLength(2);
      service.reset();
      expect(service.nodes()).toHaveLength(1);
      expect(service.moveToNode(id)).toBeNull();
    });
  });
});
