import { describe, expect, it } from 'vitest';
import { isValidCui, normalizeCui } from './cui';

describe('CUI', () => {
  it('accepts a valid CUI with or without RO, spaces or dots', () => {
    expect(isValidCui('18547290')).toBe(true);
    expect(isValidCui('RO18547290')).toBe(true);
    expect(isValidCui('ro 185 472 90')).toBe(true);
    expect(isValidCui('RO 018.547.290')).toBe(true);
  });

  it('rejects a wrong check digit, letters and lengths outside 2-10 digits', () => {
    expect(isValidCui('18547291')).toBe(false);
    expect(isValidCui('RO12A45')).toBe(false);
    expect(isValidCui('1')).toBe(false);
    expect(isValidCui('12345678901')).toBe(false);
    expect(isValidCui('')).toBe(false);
  });

  it('normalizes to the digits only', () => {
    expect(normalizeCui('RO 018 547 290')).toBe('18547290');
  });
});
