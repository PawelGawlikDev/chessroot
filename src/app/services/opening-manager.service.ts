import { Injectable, signal } from '@angular/core';
import type { NavigatorPly } from '@model/opening-explorer.model';
import { Chess } from 'chess.js';

@Injectable({ providedIn: 'root' })
export class OpeningManagerService {
  private plys: NavigatorPly[] = [];
  private $currentIndex = signal(0);
  public readonly currentIndex = this.$currentIndex.asReadonly();

  constructor() {
    this.reset();
  }

  public reset(): void {
    const rootFen = new Chess().fen();
    this.plys = [{ fen: rootFen, move: null }];
    this.$currentIndex.set(0);
  }

  public fen(): string {
    return this.plys[this.$currentIndex()]?.fen ?? new Chess().fen();
  }

  public currentMove(): number {
    return Math.floor((this.$currentIndex() - 1) / 2);
  }

  public canGoForward(): boolean {
    return this.$currentIndex() < this.plys.length - 1;
  }

  public canGoBack(): boolean {
    return this.$currentIndex() > 0;
  }

  public moveForward(): NavigatorPly | null {
    if (!this.canGoForward()) return null;
    this.$currentIndex.update((i) => i + 1);
    return this.plys[this.$currentIndex()];
  }

  public moveBack(): NavigatorPly | null {
    if (!this.canGoBack()) return null;
    this.$currentIndex.update((i) => i - 1);
    return this.plys[this.$currentIndex()];
  }

  public moveTo(index: number): NavigatorPly | null {
    if (index < 0 || index >= this.plys.length) return null;
    this.$currentIndex.set(index);
    return this.plys[index];
  }

  public addPly(fen: string, move: { from: string; to: string; san: string }): NavigatorPly {
    const nextIndex = this.$currentIndex() + 1;

    if (nextIndex < this.plys.length && this.plys[nextIndex].move?.san === move.san) {
      this.$currentIndex.set(nextIndex);
      return this.plys[nextIndex];
    }

    this.plys = this.plys.slice(0, nextIndex);
    const entry: NavigatorPly = { fen, move };
    this.plys.push(entry);
    this.$currentIndex.set(this.plys.length - 1);
    return entry;
  }
}
