// The Romanian tax id (CUI / CIF), checked like the backend: "RO", spaces, dots and dashes are
// ignored, then 2 to 10 digits whose last one is the check digit (key 753217532).
const CHECK_KEY = '753217532';

export const normalizeCui = (value: string): string =>
  value
    .replace(/[\s.-]/g, '')
    .toUpperCase()
    .replace(/^RO/, '')
    .replace(/^0+(?=\d)/, '');

export const isValidCui = (value?: string | null): boolean => {
  if (!value) return false;
  const cui = normalizeCui(value);
  if (!/^[1-9]\d{1,9}$/.test(cui)) return false;
  const body = cui.slice(0, -1).padStart(9, '0');
  const sum = [...body].reduce((total, digit, index) => total + +digit * +CHECK_KEY[index], 0);
  return ((sum * 10) % 11) % 10 === +cui.slice(-1);
};
