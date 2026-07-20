import { TestBed } from '@angular/core/testing';
import { StockfishAnalysisService } from '../stockfish-analysis.service';

class MockWorker {
  public static instances: MockWorker[] = [];
  public onmessage: ((event: MessageEvent) => void) | null = null;
  public onerror: ((event: Event) => void) | null = null;
  public postMessage = vi.fn();
  public terminate = vi.fn();

  public constructor() {
    MockWorker.instances.push(this);
  }

  public simulateMessage(data: string) {
    this.onmessage?.({ data } as MessageEvent);
  }
}

describe('StockfishAnalysisService', () => {
  let service: StockfishAnalysisService;

  beforeEach(() => {
    MockWorker.instances = [];
    Object.defineProperty(globalThis, 'Worker', {
      configurable: true,
      writable: true,
      value: MockWorker,
    });
    TestBed.configureTestingModule({});
    service = TestBed.inject(StockfishAnalysisService);
    vi.clearAllMocks();
  });

  afterEach(() => {
    Reflect.deleteProperty(globalThis, 'Worker');
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have correct initial signal values', () => {
    expect(service.$enabled()).toBe(false);
    expect(service.$ready()).toBe(false);
    expect(service.$isAnalyzing()).toBe(false);
    expect(service.$result()).toEqual({
      evaluation: null,
      bestMove: null,
      pv: [],
      depth: 0,
    });
    expect(service.$depth()).toBe(18);
  });

  describe('setDepth', () => {
    it('should set depth', () => {
      service.setDepth(10);
      expect(service.$depth()).toBe(10);
    });

    it('should clamp depth to minimum 1', () => {
      service.setDepth(0);
      expect(service.$depth()).toBe(1);
      service.setDepth(-5);
      expect(service.$depth()).toBe(1);
    });

    it('should clamp depth to maximum 99', () => {
      service.setDepth(100);
      expect(service.$depth()).toBe(99);
      service.setDepth(200);
      expect(service.$depth()).toBe(99);
    });
  });

  describe('toggle', () => {
    it('should enable when disabled', () => {
      service.enable = vi.fn();
      service.toggle();
      expect(service.enable).toHaveBeenCalled();
    });

    it('should disable when enabled', () => {
      service.disable = vi.fn();
      service['$enabled'].set(true);
      service.toggle();
      expect(service.disable).toHaveBeenCalled();
    });
  });

  describe('enable', () => {
    it('should create a Worker and set $enabled to true', () => {
      service.enable();
      expect(service.$enabled()).toBe(true);
      expect(MockWorker.instances.length).toBe(1);
      expect(MockWorker.instances[0].postMessage).toHaveBeenCalledWith('uci');
    });

    it('should not create a new Worker if one already exists', () => {
      service.enable();
      service.enable();
      expect(MockWorker.instances.length).toBe(1);
    });
  });

  describe('disable', () => {
    beforeEach(() => {
      service.enable();
      vi.clearAllMocks();
    });

    it('should terminate the Worker and reset signals', () => {
      const worker = MockWorker.instances[0];
      service.disable();
      expect(worker.postMessage).toHaveBeenCalledWith('quit');
      expect(worker.terminate).toHaveBeenCalled();
      expect(service.$enabled()).toBe(false);
      expect(service.$ready()).toBe(false);
      expect(service.$isAnalyzing()).toBe(false);
      expect(service.$result()).toEqual({
        evaluation: null,
        bestMove: null,
        pv: [],
        depth: 0,
      });
    });
  });

  describe('handleMessage', () => {
    it('should postMessage "isready" after receiving "uciok"', () => {
      service.enable();
      const worker = MockWorker.instances[0];
      worker.simulateMessage('uciok');
      expect(worker.postMessage).toHaveBeenCalledWith('isready');
    });

    it('should set $ready to true after receiving "readyok"', () => {
      service.enable();
      const worker = MockWorker.instances[0];
      worker.simulateMessage('uciok');
      worker.simulateMessage('readyok');
      expect(service.$ready()).toBe(true);
    });

    it('should not analyze position when not ready', () => {
      service.enable();
      service.analyzePosition('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
      const worker = MockWorker.instances[0];
      expect(worker.postMessage).not.toHaveBeenCalledWith(expect.stringContaining('position fen'));
    });

    it('should analyze position when ready', () => {
      service.enable();
      const worker = MockWorker.instances[0];
      worker.simulateMessage('uciok');
      worker.simulateMessage('readyok');
      const fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
      service.analyzePosition(fen);
      expect(worker.postMessage).toHaveBeenCalledWith('stop');
      expect(worker.postMessage).toHaveBeenCalledWith(`position fen ${fen}`);
      expect(worker.postMessage).toHaveBeenCalledWith(`go depth ${service.$depth()}`);
      expect(service.$isAnalyzing()).toBe(true);
    });

    it('should set $isAnalyzing to false when receiving "bestmove"', () => {
      service.enable();
      const worker = MockWorker.instances[0];
      worker.simulateMessage('uciok');
      worker.simulateMessage('readyok');
      service.analyzePosition('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
      worker.simulateMessage('bestmove e2e4');
      expect(service.$isAnalyzing()).toBe(false);
    });

    it('should parse cp score from info line', () => {
      service.enable();
      const worker = MockWorker.instances[0];
      worker.simulateMessage('uciok');
      worker.simulateMessage('readyok');
      const fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
      service.analyzePosition(fen);
      worker.simulateMessage('info depth 10 score cp 50 pv e2e4 e7e5');
      expect(service.$result().evaluation).toEqual({ type: 'cp', value: 50 });
      expect(service.$result().depth).toBe(10);
    });

    it('should parse mate score from info line', () => {
      service.enable();
      const worker = MockWorker.instances[0];
      worker.simulateMessage('uciok');
      worker.simulateMessage('readyok');
      const fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
      service.analyzePosition(fen);
      worker.simulateMessage('info depth 10 score mate 3 pv e2e4');
      expect(service.$result().evaluation).toEqual({ type: 'mate', value: 3 });
    });

    it('should negate scores when it is black to move', () => {
      service.enable();
      const worker = MockWorker.instances[0];
      worker.simulateMessage('uciok');
      worker.simulateMessage('readyok');
      const fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR b KQkq - 0 1';
      service.analyzePosition(fen);
      worker.simulateMessage('info depth 10 score cp 50 pv e7e5');
      expect(service.$result().evaluation).toEqual({ type: 'cp', value: -50 });
    });

    it('should parse UCI moves into SAN bestMove', () => {
      service.enable();
      const worker = MockWorker.instances[0];
      worker.simulateMessage('uciok');
      worker.simulateMessage('readyok');
      const fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
      service.analyzePosition(fen);
      worker.simulateMessage('info depth 10 score cp 50 pv e2e4 e7e5');
      expect(service.$result().bestMove).toEqual({ uci: 'e2e4', san: 'e4' });
    });

    it('should ignore non-string data', () => {
      service.enable();
      const worker = MockWorker.instances[0];
      worker.onmessage?.({ data: 123 } as MessageEvent);
      expect(service.$result().evaluation).toBeNull();
    });

    it('should ignore lines not starting with info or not containing pv', () => {
      service.enable();
      const worker = MockWorker.instances[0];
      worker.simulateMessage('uciok');
      worker.simulateMessage('readyok');
      const fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
      service.analyzePosition(fen);
      worker.simulateMessage('info string some other info');
      expect(service.$result().evaluation).toBeNull();
    });
  });

  describe('cleanup', () => {
    it('should reset all signals when disable is called', () => {
      service.enable();
      expect(service.$enabled()).toBe(true);
      service.disable();
      expect(service.$enabled()).toBe(false);
      expect(service.$ready()).toBe(false);
      expect(service.$isAnalyzing()).toBe(false);
    });
  });
});
