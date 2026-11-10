import { ACTIVITY_LOG_DATE_MIN, endOfToday, isFutureDay } from './date-bounds';

describe('date bounds (audit #14)', () => {
  it('hours start on 1 January 2000, not 1970', () => {
    expect(ACTIVITY_LOG_DATE_MIN.getFullYear()).toBe(2000);
    expect(ACTIVITY_LOG_DATE_MIN.getMonth()).toBe(0);
    expect(ACTIVITY_LOG_DATE_MIN.getDate()).toBe(1);
  });

  it('today is allowed, tomorrow is not', () => {
    const now = new Date();
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    expect(isFutureDay(now)).toBe(false);
    expect(isFutureDay(endOfToday())).toBe(false);
    expect(isFutureDay(tomorrow)).toBe(true);
    expect(isFutureDay(undefined)).toBe(false);
  });
});
