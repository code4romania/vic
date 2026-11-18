import { normalizePhone } from './organization-fields';

// #689: phones typed the national way are stored like the rest, +40…
describe('normalizePhone', () => {
  it.each([
    ['0720000202', '+40720000202'],
    [' 0722 000 000 ', '+40722000000'],
    ['0722.000.000', '+40722000000'],
    ['0722-000-000', '+40722000000'],
    ['+40722000000', '+40722000000'],
    ['+33 6 12 34 56 78', '+33 6 12 34 56 78'],
    ['072200', '072200'],
  ])('%p is stored as %p', (typed, stored) => {
    expect(normalizePhone(typed)).toBe(stored);
  });

  it('leaves non-strings to the validators', () => {
    expect(normalizePhone(undefined)).toBeUndefined();
    expect(normalizePhone(12)).toBe(12);
  });
});
