import { formatEventDate } from './event.helper';

describe('formatEventDate', () => {
  it('shows the time in Romania, not in the server zone', () => {
    expect(formatEventDate(new Date('2026-11-20T14:00:00Z'))).toBe(
      '20 Nov 2026, 16:00',
    );
    expect(
      formatEventDate(
        new Date('2026-07-01T06:30:00Z'),
        new Date('2026-07-01T15:00:00Z'),
      ),
    ).toBe('01 Jul 2026, 09:30 - 18:00');
  });

  it('compares the days in Romania', () => {
    // 20 November 2026, 20:00 to 23:30 in Bucharest
    expect(
      formatEventDate(
        new Date('2026-11-20T18:00:00Z'),
        new Date('2026-11-20T21:30:00Z'),
      ),
    ).toBe('20 Nov 2026, 20:00 - 23:30');
    // 23:00 on the 20th to 01:00 on the 21st, Bucharest: two days, though UTC sees one
    expect(
      formatEventDate(
        new Date('2026-11-20T21:00:00Z'),
        new Date('2026-11-20T23:00:00Z'),
      ),
    ).toBe('20 Nov 2026, 23:00 - 21 Nov 2026, 01:00');
  });
});
