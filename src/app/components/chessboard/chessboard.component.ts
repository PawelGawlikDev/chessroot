import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  signal,
  effect,
  inject,
  DestroyRef,
} from '@angular/core';
import { NgxChessgroundComponent } from 'ngx-chessground';
import { Chessground } from 'chessground';
import type { Api } from 'chessground/api';
import type { Config } from 'chessground/config';
import type { DrawShape } from 'chessground/draw';
import type { Key } from 'chessground/types';
import { Chess } from 'chess.js';
import { toDests } from 'ngx-chessground';

@Component({
  selector: 'cr-chess-board',
  imports: [NgxChessgroundComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './chessboard.component.html',
  styleUrl: './chessboard.component.scss',
})
export class ChessBoardComponent {
  public fen = input.required<string>();
  public orientation = input<'white' | 'black'>('white');
  public turnColor = input<'white' | 'black'>('white');
  public lastMove = input<string[] | null>(null);
  public arrows = input<DrawShape[]>([]);
  public interactive = input(false);

  public movePlayed = output<string>();

  private groundApi = signal<Api | null>(null);
  private destroyRef = inject(DestroyRef);

  public runFn = signal<(el: HTMLElement) => Api>((el) => {
    const config: Config = {
      fen: this.fen(),
      orientation: this.orientation(),
      turnColor: this.turnColor(),
      lastMove: (this.lastMove() ?? undefined) as [Key, Key] | undefined,
      movable: {
        free: false,
        color: this.interactive() ? 'both' : undefined,
        dests: this.interactive() ? toDests(new Chess(this.fen())) : undefined,
        showDests: this.interactive(),
      },
      draggable: { enabled: this.interactive(), showGhost: true },
      selectable: { enabled: this.interactive() },
      events: {
        move: (orig, dest) => {
          if (!this.interactive()) return;
          try {
            const chess = new Chess(this.fen());
            const move = chess.move({ from: orig, to: dest, promotion: 'q' });
            if (move) {
              this.movePlayed.emit(move.san);
            }
          } catch {
            /* invalid move */
          }
        },
      },
      drawable: {
        enabled: true,
        visible: true,
        autoShapes: [],
      },
      highlight: { lastMove: true, check: true },
      animation: { enabled: true, duration: 400 },
      coordinates: true,
    };
    const api = Chessground(el, config);
    this.groundApi.set(api);
    return api;
  });

  constructor() {
    effect(() => {
      const api = this.groundApi();
      if (!api) return;
      const chess = new Chess();
      try {
        chess.load(this.fen());
      } catch {
        return;
      }

      const shapes = (this.arrows() ?? []).filter(
        (s) => s.orig && (s.dest === undefined || s.dest),
      );

      api.set({
        fen: this.fen(),
        orientation: this.orientation(),
        turnColor: this.turnColor(),
        lastMove: (this.lastMove() ?? undefined) as [Key, Key] | undefined,
        movable: {
          dests: this.interactive() ? toDests(chess) : undefined,
          showDests: this.interactive(),
        },
        draggable: { enabled: this.interactive() },
        selectable: { enabled: this.interactive() },
        drawable: { autoShapes: shapes },
        animation: { enabled: true, duration: 400 },
      } as Config);
    });

    this.destroyRef.onDestroy(() => {
      this.groundApi()?.destroy();
    });
  }
}
