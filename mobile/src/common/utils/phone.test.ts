import { normalizePhoneNumber } from './phone';

describe('normalizePhoneNumber', () => {
  it.each([
    ['0799111333', '799111333'],
    ['799111333', '799111333'],
    ['0', ''],
    ['', ''],
    ['0700111333', '700111333'],
    ['7991113334', '7991113334'],
    ['invalid', 'invalid'],
  ])('normalizes %j to %j without hiding validation errors', (value, expected) => {
    expect(normalizePhoneNumber(value)).toBe(expected);
  });
});
