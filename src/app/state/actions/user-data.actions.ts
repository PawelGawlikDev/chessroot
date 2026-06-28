import { createActionGroup, props } from '@ngrx/store';
import { Platform } from '@enums';
import { ChessColor } from '@model';

export const UserActions = createActionGroup({
  source: 'User Data',
  events: {
    'Update Platform': props<{ platform: Platform }>(),
    'Update Player Color': props<{ playerColor: ChessColor }>(),
    'Update From Date': props<{ fromDate: string | null }>(),
    'Update To Date': props<{ toDate: string | null }>(),
    'Update Time Controls': props<{ timeControls: Record<string, boolean> }>(),
  },
});
