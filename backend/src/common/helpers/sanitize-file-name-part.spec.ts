import { sanitizeFileNamePart } from './sanitize-file-name-part';

describe('sanitizeFileNamePart', () => {
  it.each([
    ['12/2026', '12-2026'],
    ['QA589\\2026', 'QA589-2026'],
    ['12/\\:*?"<>|2026', '12---------2026'],
    ['  QA589-2026  ', 'QA589-2026'],
    ['12.2026', '12.2026'],
    ['', 'document'],
    ['   ', 'document'],
    ['..--', 'document'],
    ['/\\:*?"<>|', 'document'],
  ])('sanitizes %j to %j', (input, expected) => {
    expect(sanitizeFileNamePart(input)).toBe(expected);
  });

  it.each([...Array.from({ length: 32 }, (_, code) => code), 127])(
    'replaces control character %i',
    (code) => {
      expect(sanitizeFileNamePart(`12${String.fromCharCode(code)}2026`)).toBe(
        '12-2026',
      );
    },
  );
});
