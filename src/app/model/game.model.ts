import { ChessSite } from './chess-site.model';
import { Title } from './title.model';
import { TimeControl } from './time-control.model';
import { Result } from './result.model';

export interface GamePlayer {
  username?: string;
  title: Title;
  rating?: number;
}

interface BaseObject {
  site: ChessSite;
  type: 'profile' | 'game' | TournamentType;
}

type TournamentType = 'arena' | 'swiss';

export interface Game extends BaseObject {
  site: ChessSite;
  type: 'game';
  id: string;
  links: {
    white: string;
    black: string;
  };
  timestamp: number;
  lastMoveAt?: number;
  isStandard: boolean;
  result: Result;
  players: {
    white: GamePlayer;
    black: GamePlayer;
  };
  timeControl: TimeControl;
  opening: {
    eco: string;
    name: string;
  };
  moves: object[];
  clocks: number[];
  analysis?: Analysis[];
}

interface Analysis {
  eval?: number;
  mate?: number;
  best?: string;
  variation?: string;
  judgment?: {
    name: string;
    comment: string;
  };
}

export type GameCallback = (game: Game) => void;
