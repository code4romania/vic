import {
  bucharestDay,
  endOfBucharestDay,
  formatBucharestDate,
  startOfBucharestDay,
  toBucharestWallClock,
  withBucharestDates,
} from './bucharest-time';
import * as XLSX from 'xlsx';
import { jsonToExcelBuffer } from './utils';
import { reportDate } from 'src/modules/volunteer/services/volunteer-report.pdf';

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

// #674: files built on the server (Excel, PDF) show Bucharest days even on a UTC server.
describe('Bucharest dates in generated files (#674)', () => {
  // midnight of 18 December 2023 in Bucharest
  const midnight18 = new Date('2023-12-17T22:00:00Z');

  it('gives the Bucharest wall-clock time as local fields, whatever the server zone', () => {
    const local = toBucharestWallClock(midnight18);
    expect([
      local.getFullYear(),
      local.getMonth() + 1,
      local.getDate(),
    ]).toEqual([2023, 12, 18]);
    expect([local.getHours(), local.getMinutes()]).toEqual([0, 0]);

    const summer = toBucharestWallClock(new Date('2026-07-10T21:30:00Z'));
    expect([summer.getDate(), summer.getHours(), summer.getMinutes()]).toEqual([
      11, 0, 30,
    ]);
  });

  it('converts only the Dates of each row', () => {
    const [row] = withBucharestDates([
      { name: 'Ana', since: midnight18, hours: 3, none: null },
    ]);
    expect(row.name).toBe('Ana');
    expect(row.hours).toBe(3);
    expect(row.none).toBeNull();
    expect((row.since as Date).getDate()).toBe(18);
  });

  it('an Excel export holds the Bucharest day', () => {
    const buffer = jsonToExcelBuffer(
      [{ 'Activ din': midnight18 }],
      'Voluntari',
    );
    const sheet = XLSX.read(buffer, { type: 'buffer' }).Sheets.Voluntari;
    const serial = sheet.A2.v as number;
    const { y, m, d } = XLSX.SSF.parse_date_code(serial);
    expect([y, m, d]).toEqual([2023, 12, 18]);
  });

  it('the volunteer report writes the Bucharest day', () => {
    expect(reportDate(midnight18)).toBe('18.12.2023');
    expect(reportDate('2023-12-17T22:00:00.000Z')).toBe('18.12.2023');
    expect(reportDate(null)).toBe('-');
  });
});
