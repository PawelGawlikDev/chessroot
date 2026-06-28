export interface TrophyCheckResultItem {
  color: 'w' | 'b';
  onMoveNumber?: number;
}

export type TrophyCheckResult = TrophyCheckResultItem[];

export interface TrophyForColor {
  color: 'w' | 'b';
  onMoveNumber?: number;
}

export type TrophyForGame = Record<
  string,
  {
    date: string;
    opponent: {
      username: string;
      title: string;
    };
    link: string;
  }
>;

export type PlayerTrophiesByType = Record<string, TrophyForGame>;
