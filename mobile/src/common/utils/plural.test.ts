import { romanianNeedsDe } from './plural';

describe('romanianNeedsDe', () => {
  it.each([
    [1, false],
    [5, false],
    [19, false],
    [20, true],
    [42, true],
    [100, true],
    [101, false],
    [119, false],
    [120, true],
    [1000, true],
    [1005, false],
  ])('%i → %s', (count, expected) => {
    expect(romanianNeedsDe(count)).toBe(expected);
  });
});
