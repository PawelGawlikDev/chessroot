import { AchievementMetadata } from '@achievements';
import { GameTrophy } from './game-trophy.model';

export interface AchievementResult {
  key: string;
  metadata: AchievementMetadata;
  trophies: GameTrophy[];
  trophyCount: number;
}
