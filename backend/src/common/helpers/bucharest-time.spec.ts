import {
  bucharestDay,
  endOfBucharestDay,
  formatBucharestDate,
  startOfBucharestDay,
} from './bucharest-time';

describe('Bucharest days', () => {
  it('reads the calendar day in Bucharest, not UTC', () => {
    expect(bucharestDay(new Date('2026-11-10T22:30:00Z'))).toBe('2026-11-11');
    expect(bucharestDay(new Date('2026-07-10T20:59:00Z'))).toBe('2026-07-10');
    expect(bucharestDay(new Date('2026-07-10T21:00:00Z'))).toBe('2026-07-11');
  });

  it('starts and ends a day at Bucharest midnight, in winter and summer', () => {
    expect(startOfBucharestDay('2026-11-20').toISOString()).toBe(
      '2026-11-19T22:00:00.000Z',
    );
    expect(endOfBucharestDay('2026-11-20').toISOString()).toBe(
      '2026-11-20T21:59:59.999Z',
    );
    expect(startOfBucharestDay('2026-07-01').toISOString()).toBe(
      '2026-06-30T21:00:00.000Z',
    );
    expect(endOfBucharestDay('2026-12-31').toISOString()).toBe(
      '2026-12-31T21:59:59.999Z',
    );
  });

  it('handles the daylight saving switches', () => {
    // 29 March 2026: 03:00 becomes 04:00; 25 October 2026: 04:00 becomes 03:00
    expect(startOfBucharestDay('2026-03-29').toISOString()).toBe(
      '2026-03-28T22:00:00.000Z',
    );
    expect(endOfBucharestDay('2026-03-29').toISOString()).toBe(
      '2026-03-29T20:59:59.999Z',
    );
    expect(startOfBucharestDay('2026-10-25').toISOString()).toBe(
      '2026-10-24T21:00:00.000Z',
    );
    expect(endOfBucharestDay('2026-10-25').toISOString()).toBe(
      '2026-10-25T21:59:59.999Z',
    );
  });

  it('writes an instant as its Bucharest day, dd.MM.yyyy', () => {
    expect(formatBucharestDate(new Date('2026-11-19T22:30:00Z'))).toBe(
      '20.11.2026',
    );
  });
});
