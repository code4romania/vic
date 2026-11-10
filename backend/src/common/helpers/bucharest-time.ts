// VIC's users are in Romania: a date with no time ("2026-11-20", a contract's last day, a filter's
// day) means that calendar day in Europe/Bucharest, whatever the server's own time zone is.
export const APP_TIME_ZONE = 'Europe/Bucharest';

const dayFormat = new Intl.DateTimeFormat('en-CA', {
  timeZone: APP_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

const partsFormat = new Intl.DateTimeFormat('en-US', {
  timeZone: APP_TIME_ZONE,
  hourCycle: 'h23',
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
  second: 'numeric',
});

// The calendar day of an instant in Bucharest, as YYYY-MM-DD.
export function bucharestDay(instant: Date = new Date()): string {
  return dayFormat.format(instant);
}

// Bucharest's offset from UTC at an instant, in milliseconds (2 h in winter, 3 h in summer).
function offsetAt(instant: Date): number {
  const parts = Object.fromEntries(
    partsFormat
      .formatToParts(instant)
      .filter((part) => part.type !== 'literal')
      .map((part) => [part.type, +part.value]),
  );
  const asUtc = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second,
  );
  return asUtc - Math.floor(instant.getTime() / 1000) * 1000;
}

// The instant a Bucharest day (YYYY-MM-DD) starts.
export function startOfBucharestDay(day: string): Date {
  const [year, month, date] = day.split('-').map(Number);
  const utcMidnight = Date.UTC(year, month - 1, date);
  let instant = utcMidnight - offsetAt(new Date(utcMidnight));
  // around a DST switch the offset at the result can differ from the first guess
  instant = utcMidnight - offsetAt(new Date(instant));
  return new Date(instant);
}

// The last millisecond of a Bucharest day (YYYY-MM-DD).
export function endOfBucharestDay(day: string): Date {
  const [year, month, date] = day.split('-').map(Number);
  const next = new Date(Date.UTC(year, month - 1, date + 1))
    .toISOString()
    .slice(0, 10);
  return new Date(startOfBucharestDay(next).getTime() - 1);
}

// An instant's day in Bucharest as Romanians write it: 20.11.2026.
export function formatBucharestDate(instant: Date): string {
  const [year, month, day] = bucharestDay(instant).split('-');
  return `${day}.${month}.${year}`;
}
