import { ChessColor } from './chess-site.model';
import { Title } from './title.model';
import { LichessTimeControl } from './time-control.model';

export interface LichessGameParameters {
  since?: number;
  until?: number;
  max?: number;
  vs?: string;
  rated?: boolean;
  perfType?: string;
  color?: ChessColor;
  analysed?: boolean;
  moves?: boolean;
  pgnInJson?: boolean;
  tags?: boolean;
  clocks?: boolean;
  evals?: boolean;
  opening?: boolean;
  ongoing?: boolean;
  finished?: boolean;
  literate?: boolean;
  players?: string;
  sort?: 'dateAsc' | 'dateDesc';
}

interface LichessGameUser {
  user?: {
    name: string;
    title?: Title;
    patron?: boolean;
    id: string;
  };
  rating?: number;
  ratingDiff?: number;
  provisional?: boolean;
  analysis?: {
    inaccuracy: number;
    mistake: number;
    blunder: number;
    acpl: number;
  };
  aiLevel?: number;
}

export interface LichessGame {
  id: string;
  rated: boolean;
  variant: string;
  speed: string;
  perf: string;
  createdAt: number;
  lastMoveAt: number;
  status: string;
  players: {
    white: LichessGameUser;
    black: LichessGameUser;
  };
  winner: ChessColor;
  moves: string;
  opening?: {
    eco: string;
    name: string;
    ply: number;
  };
  pgn?: string;
  clocks?: number[];
  initialFen?: string;
  clock: LichessTimeControl;
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

export interface LichessPlayer {
  id: string;
  username: string;
  disabled: boolean;
  tosViolation: boolean;
  perfs: {
    bullet: {
      games: number;
      rating: number;
      rd: number;
      prog: number;
    };
    blitz: {
      games: number;
      rating: number;
      rd: number;
      prog: number;
    };
    rapid: {
      games: number;
      rating: number;
      rd: number;
      prog: number;
    };
  };
  title: string;
  patron: boolean;
  createdAt: number;
  online: boolean;
  profile: {
    bio: string;
    firstName: string;
    lastName: string;
    links: string;
    country: string;
    location: string;
  };
  seenAt: number;
  playTime: {
    total: number;
    tv: number;
  };
  url: string;
  count?: {
    all: number;
  };
  followable: boolean;
  following: boolean;
  blocking: boolean;
  followsYou: boolean;
}

export interface LichessArena {
  nbPlayers: number;
  duels: {
    id: string;
    p: {
      n: string;
      r: number;
      k: number;
    }[];
  }[];
  isFinished: boolean;
  podium: object[];
  pairingsClosed: boolean;
  stats: {
    games: number;
    moves: number;
    whiteWins: number;
    blackWins: number;
    draws: number;
    berserks: number;
    averageRating: number;
  };
  standing: {
    page: number;
    players: object[];
  };
  id: string;
  createdBy: string;
  startsAt: string;
  system: string;
  fullName: string;
  minutes: number;
  perf: {
    key: string;
    name: string;
    icon: string;
  };
  clock: {
    limit: number;
    increment: number;
  };
  variant: string;
  rated: boolean;
  berserkable: boolean;
  verdicts: {
    list: object[];
    accepted: boolean;
  };
  schedule: {
    freq: string;
    speed: string;
  };
}

export interface LichessSwiss {
  id: string;
  createdBy: string;
  startsAt: string;
  name: string;
  clock: {
    limit: number;
    increment: number;
  };
  variant: string;
  round: number;
  nbRounds: number;
  nbPlayers: number;
  nbOngoing: number;
  status: string;
  stats: {
    games: number;
    whiteWins: number;
    blackWins: number;
    draws: number;
    byes: number;
    absences: number;
    averageRating: number;
  };
  rated: boolean;
}
