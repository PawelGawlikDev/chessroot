import { Chess } from 'chess.js';
import { Game } from '@model';
import { TrophyCheckResult } from './types';

type Color = 'w' | 'b';
type PieceType = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';

function isPathClear(
  board: ({ type: PieceType; color: Color } | null)[][],
  fromR: number,
  fromC: number,
  toR: number,
  toC: number,
): boolean {
  const dr = Math.sign(toR - fromR);
  const dc = Math.sign(toC - fromC);
  let r = fromR + dr;
  let c = fromC + dc;
  while (r !== toR || c !== toC) {
    if (board[r][c]) return false;
    r += dr;
    c += dc;
  }
  return true;
}

export function doubleCheckCheckmate(game: Game, fen: string): TrophyCheckResult {
  if (game.result.via !== 'checkmate') {
    return [];
  }

  let chess: Chess;
  try {
    chess = new Chess(fen);
  } catch {
    return [];
  }

  const board = chess.board();
  const turn = chess.turn();
  const opponent: Color = turn === 'w' ? 'b' : 'w';

  // Find the king of the side in check
  let kingR = -1;
  let kingC = -1;
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (piece && piece.type === 'k' && piece.color === turn) {
        kingR = r;
        kingC = c;
        break;
      }
    }
    if (kingR >= 0) break;
  }

  if (kingR < 0) return [];

  // Count how many opponent pieces attack the king
  let attackerCount = 0;
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (!piece || piece.color !== opponent) continue;

      // Check if this piece attacks the king's square
      switch (piece.type) {
        case 'p': {
          const dir = opponent === 'w' ? -1 : 1;
          if (r + dir === kingR && (c - 1 === kingC || c + 1 === kingC)) attackerCount++;
          break;
        }
        case 'n':
          if (
            (Math.abs(r - kingR) === 2 && Math.abs(c - kingC) === 1) ||
            (Math.abs(r - kingR) === 1 && Math.abs(c - kingC) === 2)
          )
            attackerCount++;
          break;
        case 'b':
          if (
            Math.abs(r - kingR) === Math.abs(c - kingC) &&
            Math.abs(r - kingR) > 0 &&
            isPathClear(board, r, c, kingR, kingC)
          )
            attackerCount++;
          break;
        case 'r':
          if (
            (r === kingR || c === kingC) &&
            (r !== kingR || c !== kingC) &&
            isPathClear(board, r, c, kingR, kingC)
          )
            attackerCount++;
          break;
        case 'q':
          if (
            (r === kingR || c === kingC || Math.abs(r - kingR) === Math.abs(c - kingC)) &&
            (r !== kingR || c !== kingC) &&
            isPathClear(board, r, c, kingR, kingC)
          )
            attackerCount++;
          break;
        case 'k':
          if (Math.abs(r - kingR) <= 1 && Math.abs(c - kingC) <= 1 && (r !== kingR || c !== kingC))
            attackerCount++;
          break;
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
