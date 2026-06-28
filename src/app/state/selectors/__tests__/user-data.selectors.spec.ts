import { Platform } from '@enums';
import { UserDataState, INITIAL_TIME_CONTROLS } from '@model';
import {
  selectPlatform,
  selectPlayerColor,
  selectFromDate,
  selectToDate,
  selectTimeControls,
} from '../user-data.selectors';

describe('UserData Selectors', () => {
  const mockState: UserDataState = {
    platform: Platform.Lichess,
    playerColor: 'black',
    fromDate: '2024-01-01',
    toDate: '2024-12-31',
    timeControls: { ...INITIAL_TIME_CONTROLS, bullet: false },
  };

  it('should select the platform from the state', () => {
    const result = selectPlatform.projector(mockState);
    expect(result).toBe('lichess');
  });

  it('should select the playerColor from the state', () => {
    const result = selectPlayerColor.projector(mockState);
    expect(result).toBe('black');
  });

  it('should select the fromDate from the state', () => {
    const result = selectFromDate.projector(mockState);
    expect(result).toBe('2024-01-01');
  });

  it('should select the toDate from the state', () => {
    const result = selectToDate.projector(mockState);
    expect(result).toBe('2024-12-31');
  });

  it('should select the timeControls from the state', () => {
    const result = selectTimeControls.projector(mockState);
    expect(result).toEqual({ ...INITIAL_TIME_CONTROLS, bullet: false });
  });
});
