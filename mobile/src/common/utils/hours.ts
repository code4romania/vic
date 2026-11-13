/**
 * Hour counters as numbers. The API sends them as numeric strings ("42", "1.5"), so adding them
 * concatenates ("42" + 0 + "1" = "4201") and plural checks fail ("1" !== 1).
 */
export const toHours = (value: unknown): number => {
  const hours = Number(value);
  return Number.isFinite(hours) ? hours : 0;
};
