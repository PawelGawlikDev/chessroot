import type { NavigatorPly } from '@model';
import { PgnMoveEntry } from '../models';

export const buildPgnList = (plys: NavigatorPly[]): PgnMoveEntry[] => {
  const result: PgnMoveEntry[] = [];
  let current: PgnMoveEntry | null = null;
  for (let i = 1; i < plys.length; i++) {
    const ply = plys[i];
    if (!ply.move) continue;
    const isWhite = i % 2 === 1;
    if (isWhite) {
      current = { moveNumber: Math.floor(i / 2) + 1, whitePly: ply.move.san, blackPly: '' };
      result.push(current);
    } else if (current) {
      current.blackPly = ply.move.san;
    }
  }
  return result;
};
