import { isValidCui, normalizeCui } from './cui';

describe('CUI', () => {
  it('normalizes the RO prefix, spaces, dots and leading zeros', () => {
    expect(normalizeCui('RO 18 547 290')).toBe('18547290');
    expect(normalizeCui('ro018547290')).toBe('18547290');
    expect(normalizeCui('18.547.290')).toBe('18547290');
  });

  it('checks the control digit (key 753217532)', () => {
    expect(isValidCui('18547290')).toBe(true);
    expect(isValidCui('RO14350073')).toBe(true);
    expect(isValidCui('12345674')).toBe(true);
    expect(isValidCui('12345678')).toBe(false);
    expect(isValidCui('1')).toBe(false);
    expect(isValidCui('12345678901')).toBe(false);
    expect(isValidCui('RO')).toBe(false);
    expect(isValidCui('12a45674')).toBe(false);
  });
});
