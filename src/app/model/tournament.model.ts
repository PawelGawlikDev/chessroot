import { ChessSite } from './chess-site.model';
import { TimeControl } from './time-control.model';

export type TournamentType = 'arena' | 'swiss';

export interface Tournament {
  id: string;
  url: string;
  name: string;
  timeControl: TimeControl;
  isFinished: boolean;
  playerCount: number;
  stats?: {
    games: number;
  };
  site: ChessSite;
  type: TournamentType;
}
