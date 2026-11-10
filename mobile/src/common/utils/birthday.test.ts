import { TranslationWidth } from '@ui-kitten/components';
import { birthdayToApi, datePickerService } from './birthday';

describe('birthday (#584)', () => {
  it('sends the picked calendar day as noon UTC, whatever the local time of the pick', () => {
    // 12 May 2004, local midnight (what the picker returns)
    expect(birthdayToApi(new Date(2004, 4, 12)).toISOString()).toBe('2004-05-12T12:00:00.000Z');
    expect(birthdayToApi(new Date(2004, 4, 12, 23, 59)).toISOString()).toBe(
      '2004-05-12T12:00:00.000Z',
    );
  });

  it('names months and days in Romanian, Monday first', () => {
    const service = datePickerService('ro');
    expect(service.getMonthName(new Date(2026, 10, 1), TranslationWidth.LONG)).toBe('Noiembrie');
    expect(service.getFirstDayOfWeek()).toBe(1);
    expect(service.format(new Date(2004, 4, 12), 'DD.MM.YYYY')).toBe('12.05.2004');
  });
});
