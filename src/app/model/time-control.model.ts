export interface TimeControl {
  initial?: number;
  increment?: number;
  correspondence?: number;
}

export interface LichessTimeControl {
  initial: number;
  increment: number;
  totalTime: number;
}
