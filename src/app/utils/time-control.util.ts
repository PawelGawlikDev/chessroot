import { TimeControl, TIME_CONTROL_FILTERS } from '@model';

export function mapGameToTimeControlKey(tc: TimeControl): string | null {
  if (tc.correspondence) return 'correspondence';

  const initial = tc.initial ?? 0;
  const increment = tc.increment ?? 0;
  const totalSec = initial + increment * 40;

  if (totalSec < 60) return 'ultraBullet';
  if (totalSec < 180) return 'bullet';
  if (totalSec < 480) return 'blitz';
  if (totalSec < 1500) return 'rapid';
  if (totalSec < 86400) return 'classical';
  return 'correspondence';
}

export function timeControlsToPerfType(timeControls: Record<string, boolean>): string | undefined {
  const selected = Object.entries(timeControls)
    .filter(([, enabled]) => enabled)
    .map(([key]) => key);

  const allKeys = Object.keys(TIME_CONTROL_FILTERS);
  if (selected.length === 0 || selected.length === allKeys.length) return undefined;

  return selected.join(',');
}
