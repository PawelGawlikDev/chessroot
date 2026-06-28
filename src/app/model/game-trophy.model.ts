export interface GameTrophy {
  gameId: string;
  opponent: string;
  opponentTitle: string;
  link: string;
  date: string;
  color: 'w' | 'b';
  onMoveNumber?: number;
}
