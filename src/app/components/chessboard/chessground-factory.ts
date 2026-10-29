import { InjectionToken } from '@angular/core';
import { Chessground } from 'chessground';
import type { Api } from 'chessground/api';
import type { Config } from 'chessground/config';

export type ChessgroundFactory = (element: HTMLElement, config: Config) => Api;

/**
 * Board factory used by {@link ChessBoardComponent}.
 *
 * It is injectable so tests can supply a fake board without mocking the
 * `chessground` module. Module mocking was unreliable here: depending on how the
 * bundler resolved the dependency, the spec and the component could end up with
 * different module instances, so the component silently used the real board.
 */
export const CHESSGROUND_FACTORY = new InjectionToken<ChessgroundFactory>('CHESSGROUND_FACTORY', {
  providedIn: 'root',
  factory: () => Chessground,
});
