import { toHours } from './hours';

describe('toHours', () => {
  it('reads the numeric strings the counters API sends', () => {
    expect(toHours('42')).toBe(42);
    expect(toHours('1.5')).toBe(1.5);
    expect(toHours('42') + toHours(0) + toHours('1')).toBe(43);
  });

  it('falls back to 0 for missing or invalid values', () => {
    expect(toHours(undefined)).toBe(0);
    expect(toHours(null)).toBe(0);
    expect(toHours('abc')).toBe(0);
  });
});
