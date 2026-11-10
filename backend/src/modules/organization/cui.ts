// M9: the Romanian tax id (CUI / CIF). Stored normalized: digits only, no "RO" prefix, no spaces,
// dots or leading zeros, so "RO 018 547 290" and "18547290" are the same NGO.
const CHECK_KEY = '753217532';

export function normalizeCui(value: string): string {
  if (typeof value !== 'string') return value;
  return value
    .replace(/[\s.-]/g, '')
    .toUpperCase()
    .replace(/^RO/, '')
    .replace(/^0+(?=\d)/, '');
}

// 2 to 10 digits, the last one the check digit: the others, padded left to 9 digits, times the
// key 753217532, summed, times 10, modulo 11 (10 counts as 0).
export function isValidCui(value: string): boolean {
  const cui = normalizeCui(value);
  if (!/^[1-9]\d{1,9}$/.test(cui)) return false;
  const body = cui.slice(0, -1).padStart(9, '0');
  const sum = [...body].reduce(
    (total, digit, index) => total + +digit * +CHECK_KEY[index],
    0,
  );
  const control = ((sum * 10) % 11) % 10;
  return control === +cui.slice(-1);
}
