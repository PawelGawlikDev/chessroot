export const BATCH_SIZE = 10;

export const CIRC = 2 * Math.PI * 80;

export type TimeControlFilterKey = keyof typeof TIME_CONTROL_FILTERS;

export const TIME_CONTROL_FILTERS = {
  ultraBullet: { label: 'Ultrabullet' },
  bullet: { label: 'Bullet' },
  blitz: { label: 'Blitz' },
  rapid: { label: 'Rapid' },
  classical: { label: 'Classical' },
  correspondence: { label: 'Correspondence' },
} as const;

export const INITIAL_TIME_CONTROLS: Record<string, boolean> = {
  ultraBullet: true,
  bullet: true,
  blitz: true,
  rapid: true,
  classical: true,
  correspondence: true,
};
