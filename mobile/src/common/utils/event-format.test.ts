import '../config/i18n';
import { formatDayMonth, formatPostedAt } from './event-format';

describe('formatPostedAt (audit #21, #22)', () => {
  const now = new Date(2026, 10, 10, 18, 0);

  it('says today / yesterday with the time', () => {
    expect(formatPostedAt(new Date(2026, 10, 10, 14, 30), now)).toBe('Azi, 14:30');
    expect(formatPostedAt(new Date(2026, 10, 9, 9, 5), now)).toBe('Ieri, 09:05');
  });

  it('shows the day this year and the year before that', () => {
    expect(formatPostedAt(new Date(2026, 9, 2, 8, 0), now)).toBe('2 oct, 08:00');
    expect(formatPostedAt(new Date(2025, 10, 12, 8, 0), now)).toBe('12 nov 2025');
  });

  it('is empty when an older backend sends no date', () => {
    expect(formatPostedAt(undefined, now)).toBe('');
    expect(formatPostedAt('not a date', now)).toBe('');
  });
});

describe('formatDayMonth (event rows of „Adaugă ore”)', () => {
  it('gives the day and the short month, shown as „13 NOV” in overline', () => {
    expect(formatDayMonth(new Date(2026, 10, 13, 9, 0))).toBe('13 nov');
    expect(formatDayMonth(new Date(2026, 0, 2).toISOString())).toBe('2 ian');
  });

  it('is empty when an older backend sends no date', () => {
    expect(formatDayMonth(undefined)).toBe('');
    expect(formatDayMonth(null)).toBe('');
    expect(formatDayMonth('not a date')).toBe('');
  });
});
