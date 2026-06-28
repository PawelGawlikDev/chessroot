import { AchievementMetadata } from '@achievements';
import { AchievementResult } from './achievement-result.model';

export interface CategoryResult {
  category: AchievementMetadata['category'];
  categoryTitle: string;
  goals: AchievementResult[];
}
