import { Chess, Move, Square } from 'chess.js';
import { Game } from '@model';
import { TrophyCheckResult } from './types';

export function doubleCheckCheckmate(game: Game, fen: string): TrophyCheckResult {
  if (game.result.via !== 'checkmate') {
    return [];
  }

  const chess = new Chess(fen);

  if (!chess.isCheck()) {
    return [];
  }

  const turn = chess.turn();
  const opponent = turn === 'w' ? 'b' : 'w';
  const board = chess.board();

  let kingSquare: Square | null = null;
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (piece && piece.type === 'k' && piece.color === turn) {
        kingSquare = (String.fromCharCode(97 + c) + (8 - r)) as Square;
        break;
      }
    }
    if (kingSquare) break;
  }

  if (!kingSquare) return [];

  let attackerCount = 0;
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (piece && piece.color === opponent) {
        const from = (String.fromCharCode(97 + c) + (8 - r)) as Square;
        const moves = chess.moves({ square: from, verbose: true }) as Move[];
        if (moves.some((m) => m.to === kingSquare)) {
          attackerCount++;
        }
      }
    }
  }

  if (attackerCount === 2) {
    return [
      {
        color: game.result.winner === 'white' ? 'w' : 'b',
        onMoveNumber: game.moves.length,
      },
    ];
  }

  return [];
}
