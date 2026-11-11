import { sanitizeFileName } from './sanitize-file-name';

describe('sanitizeFileName', () => {
  it.each([
    ['Contract_QA589/2026.pdf', 'Contract_QA589-2026.pdf'],
    ['Contract_12/2026.pdf', 'Contract_12-2026.pdf'],
    ['Contract_12\\2026.pdf', 'Contract_12-2026.pdf'],
    ['Contract_QA589-2026.pdf', 'Contract_QA589-2026.pdf'],
    ['Adeverinta_12.2026.docx', 'Adeverinta_12.2026.docx'],
    ['  Contract_12.pdf  ', 'Contract_12.pdf'],
  ])('sanitizes %s to %s', (input, expected) => {
    expect(sanitizeFileName(input)).toBe(expected);
  });

  it.each(['/', '\\', ':', '*', '?', '"', '<', '>', '|'])('replaces %s', (character) => {
    expect(sanitizeFileName(`Contract_12${character}2026.pdf`)).toBe('Contract_12-2026.pdf');
  });

  it.each([...Array.from({ length: 32 }, (_, code) => code), 127])(
    'replaces control character %i',
    (code) => {
      expect(sanitizeFileName(`Contract_12${String.fromCharCode(code)}2026.pdf`)).toBe(
        'Contract_12-2026.pdf',
      );
    },
  );

  it.each(['', '   ', '.', '..', '---', '.-.-', '/\\:*?"<>|', '\u0000\u001f\u007f'])(
    'uses a safe fallback for %j',
    (input) => {
      expect(sanitizeFileName(input)).toBe('document.pdf');
    },
  );
});
