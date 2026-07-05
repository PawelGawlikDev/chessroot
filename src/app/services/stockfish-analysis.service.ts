import { Injectable, signal, DestroyRef, inject } from '@angular/core';
import { Chess } from 'chess.js';

export interface AnalysisResult {
  evaluation: { type: 'cp'; value: number } | { type: 'mate'; value: number } | null;
  bestMove: { uci: string; san: string } | null;
  pv: string[];
  depth: number;
}

@Injectable({ providedIn: 'root' })
export class StockfishAnalysisService {
  private destroyRef = inject(DestroyRef);

  public $enabled = signal(false);
  public $ready = signal(false);
  public $isAnalyzing = signal(false);
  public $result = signal<AnalysisResult>({
    evaluation: null,
    bestMove: null,
    pv: [],
    depth: 0,
  });

  public $depth = signal(18);

  private worker: Worker | null = null;
  private analyzedFen: string | null = null;

  constructor() {
    this.destroyRef.onDestroy(() => this.disable());
  }

  public enable(): void {
    if (this.worker) return;
    this.$enabled.set(true);

    try {
      this.worker = new Worker('/assets/stockfish/stockfish.js');
      this.worker.onmessage = (event) => this.handleMessage(event);
      this.worker.onerror = () => {
        console.error('[Stockfish] Worker error');
        this.disable();
      };
      this.worker.postMessage('uci');
    } catch (error) {
      console.error('[Stockfish] Failed to load worker:', error);
      this.disable();
    }
  }

  public disable(): void {
    if (this.worker) {
      try {
        this.worker.postMessage('quit');
      } catch {
        /* ignore */
      }
      this.worker.terminate();
      this.worker = null;
    }
    this.analyzedFen = null;
    this.$ready.set(false);
    this.$enabled.set(false);
    this.$isAnalyzing.set(false);
    this.$result.set({ evaluation: null, bestMove: null, pv: [], depth: 0 });
  }

  public toggle(): void {
    this.$enabled() ? this.disable() : this.enable();
  }

  public setDepth(depth: number): void {
    this.$depth.set(Math.max(1, Math.min(99, depth)));
  }

  public analyzePosition(fen: string): void {
    if (!this.worker || !this.$enabled() || !this.$ready()) return;
    this.analyzedFen = fen;
    this.worker.postMessage('stop');
    this.worker.postMessage(`position fen ${fen}`);
    this.worker.postMessage(`go depth ${this.$depth()}`);
    this.$isAnalyzing.set(true);
  }

  private handleMessage(event: MessageEvent): void {
    const line = event.data;
    if (typeof line !== 'string') return;

    if (line.startsWith('uciok')) {
      this.worker?.postMessage('isready');
      return;
    }
    if (line.startsWith('readyok')) {
      this.$ready.set(true);
      return;
    }
    if (line.startsWith('bestmove')) {
      this.$isAnalyzing.set(false);
      return;
    }

    if (!line.startsWith('info') || !line.includes(' pv ')) return;

    const pvIndex = line.indexOf(' pv ');
    const pvString = line.substring(pvIndex + 4);
    const uciMoves = pvString.split(' ').filter(Boolean);
    if (uciMoves.length === 0) return;

    let isBlackToMove = false;
    if (this.analyzedFen) {
      const parts = this.analyzedFen.split(' ');
      if (parts.length > 1 && parts[1] === 'b') isBlackToMove = true;
    }

    let evaluation: AnalysisResult['evaluation'] = null;
    const cpMatch = line.match(/score cp (-?\d+)/);
    const mateMatch = line.match(/score mate (-?\d+)/);
    if (mateMatch) {
      let mate = parseInt(mateMatch[1], 10);
      if (isBlackToMove) mate = -mate;
      evaluation = { type: 'mate', value: mate };
    } else if (cpMatch) {
      let cp = parseInt(cpMatch[1], 10);
      if (isBlackToMove) cp = -cp;
      evaluation = { type: 'cp', value: cp };
    }

    const depthMatch = line.match(/depth (\d+)/);
    const depth = depthMatch ? parseInt(depthMatch[1], 10) : 0;

    let bestMove: AnalysisResult['bestMove'] = null;
    if (this.analyzedFen && uciMoves[0]) {
      try {
        const chess = new Chess(this.analyzedFen);
        const uci = uciMoves[0];
        const m = chess.move({
          from: uci.substring(0, 2),
          to: uci.substring(2, 4),
          promotion: uci.substring(4, 5),
        });
        if (m) bestMove = { uci, san: m.san };
      } catch {
        /* skip */
      }
    }

    this.$result.set({ evaluation, bestMove, pv: uciMoves, depth });
  }
}
