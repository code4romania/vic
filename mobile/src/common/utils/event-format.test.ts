import i18n from '../config/i18n';
import { formatDayMonth, formatPostedAt } from './event-format';

// The words and the month names depend on the language, the order of a date does not: each
// language is checked on its own.
describe.each([
  {
    language: 'ro',
    today: 'Azi, 14:30',
    yesterday: 'Ieri, 09:05',
    thisYear: '2 oct, 08:00',
    lastYear: '12 nov 2025',
    november: '13 nov',
    january: '2 ian',
  },
  {
    language: 'en',
    today: 'Today, 14:30',
    yesterday: 'Yesterday, 09:05',
    thisYear: '2 Oct, 08:00',
    lastYear: '12 Nov 2025',
    november: '13 Nov',
    january: '2 Jan',
  },
])(
  'dates in $language',
  ({ language, today, yesterday, thisYear, lastYear, november, january }) => {
    const now = new Date(2026, 10, 10, 18, 0);

    beforeEach(() => i18n.changeLanguage(language));

    describe('formatPostedAt (audit #21, #22)', () => {
      it('says today / yesterday with the time', () => {
        expect(formatPostedAt(new Date(2026, 10, 10, 14, 30), now)).toBe(today);
        expect(formatPostedAt(new Date(2026, 10, 9, 9, 5), now)).toBe(yesterday);
      });

      it('shows the day this year and the year before that', () => {
        expect(formatPostedAt(new Date(2026, 9, 2, 8, 0), now)).toBe(thisYear);
        expect(formatPostedAt(new Date(2025, 10, 12, 8, 0), now)).toBe(lastYear);
      });

      it('is empty when an older backend sends no date', () => {
        expect(formatPostedAt(undefined, now)).toBe('');
        expect(formatPostedAt('not a date', now)).toBe('');
      });
    });

    describe('formatDayMonth (event rows of „Adaugă ore”)', () => {
      it('gives the day and the short month, shown as „13 NOV” in overline', () => {
        expect(formatDayMonth(new Date(2026, 10, 13, 9, 0))).toBe(november);
        expect(formatDayMonth(new Date(2026, 0, 2).toISOString())).toBe(january);
      });

      it('is empty when an older backend sends no date', () => {
        expect(formatDayMonth(undefined)).toBe('');
        expect(formatDayMonth(null)).toBe('');
        expect(formatDayMonth('not a date')).toBe('');
      });
    });
  },
);
