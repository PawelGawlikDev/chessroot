export interface OpeningStat {
  name: string;
  count: number;
  wins: number;
  losses: number;
  draws: number;
}

export interface OpponentStat {
  username: string;
  games: number;
  wins: number;
  losses: number;
  draws: number;
}

export interface TimeControlStat {
  name: string;
  total: number;
  wins: number;
  losses: number;
  draws: number;
}

export interface Insights {
  totalGames: number;
  wins: number;
  losses: number;
  draws: number;
  winsAsWhite: number;
  lossesAsWhite: number;
  drawsAsWhite: number;
  whiteGames: number;
  winsAsBlack: number;
  lossesAsBlack: number;
  drawsAsBlack: number;
  blackGames: number;
  openings: OpeningStat[];
  topOpponents: OpponentStat[];
  timeControls: TimeControlStat[];
}
