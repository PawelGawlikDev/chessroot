export interface MoveStats {
  whiteWins: number;
  blackWins: number;
  draws: number;
  count: number;
  totalOpponentElo: number;
  averageElo?: number;
  hasData: boolean;
}

export interface ExplorerMove {
  san: string;
  orig: string;
  dest: string;
  moveCount: number;
  details: MoveStats;
  level: number;
  compareTo?: CompareInfo;
}

export interface CompareInfo {
  bookScore: number;
  userScore: number;
  values: [number, number];
}

export interface PgnStats {
  index?: number;
  result: string;
  white: string;
  black: string;
  whiteElo: number;
  blackElo: number;
  url?: string;
  date?: string;
  numberOfPlys: number;
}

export interface NavigatorPly {
  fen: string;
  move: { from: string; to: string; san: string } | null;
}

export interface BookApiMove {
  san: string;
  white: number;
  black: number;
  draws: number;
  averageRating: number;
}

export interface BookApiResponse {
  moves: BookApiMove[];
  topGames?: { id: string }[];
  opening?: { name: string; eco: string };
}

export interface BookMovesData {
  fetch: 'success' | 'pending' | 'failed' | 'off';
  moves?: {
    san: string;
    details: MoveStats;
    moveCount: number;
  }[];
  openingName?: string;
}

export interface OpeningBookConfig {
  bookType: 'off' | 'masters' | 'lichess';
  ratings: number[];
  speeds: string[];
}

export const DEFAULT_BOOK_CONFIG: OpeningBookConfig = {
  bookType: 'lichess',
  ratings: [2000, 2200, 2500],
  speeds: ['rapid', 'classical'],
};

export const RATING_OPTIONS = [1600, 1800, 2000, 2200, 2500];

export const SPEED_OPTIONS = [
  { key: 'bullet', label: 'Bullet' },
  { key: 'blitz', label: 'Blitz' },
  { key: 'rapid', label: 'Rapid' },
  { key: 'classical', label: 'Classical' },
  { key: 'correspondence', label: 'Correspondence' },
];

export interface PlayerGameResult {
  result: string;
  white: string;
  black: string;
  whiteElo: string;
  blackElo: string;
  url?: string;
  date?: string;
  numberOfPlys: number;
}
