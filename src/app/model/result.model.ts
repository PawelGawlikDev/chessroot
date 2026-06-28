import { ChessColor } from './chess-site.model';

export type GameResultString = '1-0' | '0-1' | '½-½' | '*';

export interface Result {
  winner?: ChessColor;
  outcome?: 'draw';
  via?:
    | 'agreement'
    | 'insufficient'
    | 'repetition'
    | 'stalemate'
    | 'checkmate'
    | 'resignation'
    | 'timeout'
    | 'abandonment'
    | 'noStart'
    | 'cheat'
    | '50moves'
    | 'variant';
  label: GameResultString;
}
