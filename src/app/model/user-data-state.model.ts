import { Platform } from '@enums';
import { ChessColor } from './chess-site.model';

export type UserDataState = {
  platform: Platform;
  playerColor: ChessColor;
  fromDate: string | null;
  toDate: string | null;
  timeControls: Record<string, boolean>;
};
