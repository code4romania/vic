// Calendar bounds for the dates a volunteer picks.

// Hours are logged for days that already happened (or today), from 2000 on.
export const ACTIVITY_LOG_DATE_MIN = new Date(2000, 0, 1);

// The last moment of today: the picker allows today, nothing after it.
export const endOfToday = (): Date => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
};

export const isFutureDay = (date: Date | undefined | null): boolean =>
  !!date && date.getTime() > endOfToday().getTime();
