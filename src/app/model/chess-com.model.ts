export interface ChesscomGameParameters {
  since?: number;
  until?: number;
  max?: number;
}

export interface ChessComGamePlayer {
  rating: number;
  result: string;
  '@id': string;
  username: string;
  uuid: string;
}

export interface ChessComGame {
  url: string;
  pgn: string;
  time_control: string;
  end_time: number;
  rated: boolean;
  accuracies: {
    white: number;
    black: number;
  };
  tcn: string;
  uuid: string;
  initial_setup: string;
  fen: string;
  time_class: string;
  rules: string;
  white: ChessComGamePlayer;
  black: ChessComGamePlayer;
  tournament: string;
}

export interface ChessComArchives {
  archives: string[];
}

export interface ChessComArchive {
  games: ChessComGame[];
}

export interface ChessComPlayer {
  avatar: string;
  player_id: number;
  '@id': string;
  url: string;
  name: string;
  username: string;
  title: string;
  followers: number;
  country: string;
  location: string;
  last_online: number;
  joined: number;
  status: string;
  is_streamer: boolean;
  verified: boolean;
}

interface ChesscomPerfRating {
  last: {
    rating: number;
  };
  record: {
    win: number;
    loss: number;
    draw: number;
  };
}

export interface ChesscomStats {
  chess_blitz?: ChesscomPerfRating;
  chess_bullet?: ChesscomPerfRating;
  chess_daily?: ChesscomPerfRating;
  chess_rapid?: ChesscomPerfRating;
  fide?: number;
  lessons?: object;
  puzzle_rush?: object;
  tactics?: object;
}

export interface ChessComTournament {
  name: string;
  url: string;
  creator: string;
  status: string;
  start_time: number;
  finish_time: number;
  settings: {
    type: string;
    rules: string;
    is_rated: boolean;
    is_official: boolean;
    is_invite_only: boolean;
    user_advance_count: number;
    winner_places: number;
    registered_user_count: number;
    total_rounds: number;
    time_class: string;
    time_control: string;
  };
  players: {
    username: string;
    status: string;
  }[];
  rounds: string[];
}
