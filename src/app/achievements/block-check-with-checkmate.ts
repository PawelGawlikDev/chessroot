import { PgnMove } from '@mliebelt/pgn-types';
import { TrophyCheckResult } from './types';

export function blockCheckWithCheckmate(moves: PgnMove[]): TrophyCheckResult {
  for (let i = 1; i < moves.length; i++) {
    const move = moves[i];
    const prevMove = moves[i - 1];

    if (
      move.notation.check === '#' &&
      prevMove.notation.check === '+' &&
      move.notation.fig !== 'K' &&
      move.notation.strike !== 'x'
    ) {
      return [
        {
          color: move.turn,
          onMoveNumber: i,
        },
      ];
    }
  }

  return [];
}
