import { contentDisposition, contentTypeFor } from './file-response';

describe('file-response', () => {
  it('derives the content type from the stored key', () => {
    expect(contentTypeFor('contracts/org/uuid-semnat.pdf')).toBe(
      'application/pdf',
    );
    expect(contentTypeFor('contracts/org/uuid-vechi.DOCX')).toBe(
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    );
    expect(contentTypeFor('contracts/org/uuid-vechi.doc')).toBe(
      'application/msword',
    );
    expect(contentTypeFor('contracts/org/fara-extensie')).toBe(
      'application/octet-stream',
    );
  });

  it('keeps a plain name as is, inline or as an attachment', () => {
    expect(contentDisposition('Contract_12-2026.pdf', 'inline')).toBe(
      `inline; filename="Contract_12-2026.pdf"; filename*=UTF-8''Contract_12-2026.pdf`,
    );
    expect(contentDisposition('Contract_1.pdf', 'attachment')).toMatch(
      /^attachment; /,
    );
  });

  it('gives an ASCII fallback and the exact UTF-8 name for diacritics and quotes', () => {
    const header = contentDisposition(
      'Model „școală” – ăîâșț "v2" (final).pdf',
      'attachment',
    );
    const [, ascii] = header.match(/filename="([^"]*)"/) ?? [];
    expect(ascii).toBe('Model _scoala_ _ aiast _v2_ (final).pdf');
    const [, encoded] = header.match(/filename\*=UTF-8''(.*)$/) ?? [];
    expect(decodeURIComponent(encoded)).toBe(
      'Model „școală” – ăîâșț "v2" (final).pdf',
    );
    expect(encoded).not.toMatch(/[ "'()]/);
  });
});
