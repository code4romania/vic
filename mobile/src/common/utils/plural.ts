// Romanian numerals take "de" from 20 on, except when the last two digits are 01–19:
// "5 locuri", "20 de locuri", "101 locuri", "119 persoane", "120 de persoane".
export const romanianNeedsDe = (count: number): boolean => {
  const rest = Math.abs(count) % 100;
  return count !== 0 && (rest === 0 || rest >= 20);
};
