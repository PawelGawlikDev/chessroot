import { mapGameToTimeControlKey, timeControlsToPerfType } from '../time-control.util';

describe('mapGameToTimeControlKey', () => {
  it('should return ultraBullet for total time under 60 seconds', () => {
    expect(mapGameToTimeControlKey({ initial: 30, increment: 0 })).toBe('ultraBullet');
    expect(mapGameToTimeControlKey({ initial: 0, increment: 1 })).toBe('ultraBullet');
  });

  it('should return bullet for total time between 60 and 179 seconds', () => {
    expect(mapGameToTimeControlKey({ initial: 60, increment: 0 })).toBe('bullet');
    expect(mapGameToTimeControlKey({ initial: 120, increment: 1 })).toBe('bullet');
  });

  it('should return blitz for total time between 180 and 479 seconds', () => {
    expect(mapGameToTimeControlKey({ initial: 180, increment: 0 })).toBe('blitz');
    expect(mapGameToTimeControlKey({ initial: 300, increment: 4 })).toBe('blitz');
  });

  it('should return rapid for total time between 480 and 1499 seconds', () => {
    expect(mapGameToTimeControlKey({ initial: 480, increment: 0 })).toBe('rapid');
    expect(mapGameToTimeControlKey({ initial: 600, increment: 10 })).toBe('rapid');
  });

  it('should return classical for total time between 1500 and 86399 seconds', () => {
    expect(mapGameToTimeControlKey({ initial: 1500, increment: 0 })).toBe('classical');
    expect(mapGameToTimeControlKey({ initial: 600, increment: 30 })).toBe('classical');
  });

  it('should return correspondence for total time >= 86400 seconds', () => {
    expect(mapGameToTimeControlKey({ initial: 86400, increment: 0 })).toBe('correspondence');
    expect(mapGameToTimeControlKey({ initial: 100000, increment: 0 })).toBe('correspondence');
  });

  it('should return correspondence when correspondence field is set', () => {
    expect(mapGameToTimeControlKey({ correspondence: 86400 })).toBe('correspondence');
    expect(mapGameToTimeControlKey({ initial: 60, increment: 0, correspondence: 1 })).toBe(
      'correspondence',
    );
  });

  it('should handle empty time control gracefully', () => {
    expect(mapGameToTimeControlKey({})).toBe('ultraBullet');
  });

  it('should handle undefined increment', () => {
    expect(mapGameToTimeControlKey({ initial: 300 })).toBe('blitz');
  });

  it('should handle undefined initial', () => {
    expect(mapGameToTimeControlKey({ increment: 1 })).toBe('ultraBullet');
  });
});

describe('timeControlsToPerfType', () => {
  const allOn = {
    ultraBullet: true,
    bullet: true,
    blitz: true,
    rapid: true,
    classical: true,
    correspondence: true,
  };

  const allOff = {
    ultraBullet: false,
    bullet: false,
    blitz: false,
    rapid: false,
    classical: false,
    correspondence: false,
  };

  it('should return undefined when all controls are selected', () => {
    expect(timeControlsToPerfType(allOn)).toBeUndefined();
  });

  it('should return undefined when no controls are selected', () => {
    expect(timeControlsToPerfType(allOff)).toBeUndefined();
  });

  it('should return a single perf type when one control is selected', () => {
    expect(timeControlsToPerfType({ ...allOff, bullet: true })).toBe('bullet');
  });

  it('should return comma-separated perf types when multiple controls are selected', () => {
    expect(timeControlsToPerfType({ ...allOff, bullet: true, blitz: true, classical: true })).toBe(
      'bullet,blitz,classical',
    );
  });

  it('should include correspondence when selected', () => {
    expect(
      timeControlsToPerfType({ ...allOff, ultraBullet: true, rapid: true, correspondence: true }),
    ).toBe('ultraBullet,rapid,correspondence');
  });

  it('should return keys ordered as in TIME_CONTROL_FILTERS', () => {
    const result = timeControlsToPerfType({ ...allOff, blitz: true, bullet: true, rapid: true });
    const parts = result!.split(',');
    expect(parts.indexOf('bullet')).toBeLessThan(parts.indexOf('blitz'));
    expect(parts.indexOf('blitz')).toBeLessThan(parts.indexOf('rapid'));
  });
});
