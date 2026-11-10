import {
  APP_TIME_ZONE,
  bucharestDay,
  endOfBucharestDay,
} from 'src/common/helpers/bucharest-time';

// When an event is over. An event with no end date lasts until the end of its start day (in
// Bucharest): before, it never reached "Finalizate", kept taking registrations and its pending
// registrations could never be decided.
export function eventEndsAt(event: {
  startDate: Date | string;
  endDate?: Date | string | null;
}): Date {
  return event.endDate
    ? new Date(event.endDate)
    : endOfBucharestDay(bucharestDay(new Date(event.startDate)));
}

export function hasEventEnded(
  event: { startDate: Date | string; endDate?: Date | string | null },
  now: Date = new Date(),
): boolean {
  return eventEndsAt(event).getTime() <= now.getTime();
}

// The same in SQL, from the start and end expressions of a query (columns or query builder
// properties, e.g. `eventEndSql('e.start_date', 'e.end_date')`).
export function eventEndSql(start: string, end: string): string {
  return `COALESCE(${end}, ((((${start}) AT TIME ZONE '${APP_TIME_ZONE}')::date + 1)::timestamp AT TIME ZONE '${APP_TIME_ZONE}'))`;
}
