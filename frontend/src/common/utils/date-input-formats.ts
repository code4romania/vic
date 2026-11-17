// The formats a typed date is read with, the first one being the one shown (#673).
// react-datepicker falls back to `new Date(text)` when the text does not match a single format, and that
// reads "01.12.26" US style, as 12 January. With a list it never falls back. It keeps the LAST format that
// matches, so the 4-digit-year forms come first: "yyyy" also accepts "26" (as the year 0026), while "yy"
// never accepts "2026", so a 2-digit year ends up as 20xx.
export const typedDateFormats = (displayFormat: string): string[] => {
  const withoutComma = displayFormat.replace(', ', ' ');
  const fullYear = Array.from(new Set([displayFormat, withoutComma]));
  const shortYear = displayFormat.includes('yyyy')
    ? fullYear.map((format) => format.replace('yyyy', 'yy'))
    : [];
  return [...fullYear, ...shortYear];
};
