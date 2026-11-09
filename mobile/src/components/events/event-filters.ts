import { endOfMonth, endOfWeek, startOfDay } from 'date-fns';

export type EventWhen = 'any' | 'week' | 'month';

export interface EventFilters {
  search: string;
  when: EventWhen;
  organizationId?: string;
}

export const EMPTY_EVENT_FILTERS: EventFilters = { search: '', when: 'any' };

/** Query params for GET /mobile/event: events that start between startFrom and startTo. */
export const toEventQueryFilters = (filters: EventFilters, now: Date = new Date()) => {
  const range =
    filters.when === 'week'
      ? { startFrom: startOfDay(now), startTo: endOfWeek(now, { weekStartsOn: 1 }) }
      : filters.when === 'month'
        ? { startFrom: startOfDay(now), startTo: endOfMonth(now) }
        : null;
  return {
    ...(filters.organizationId ? { organizationId: filters.organizationId } : {}),
    ...(range
      ? { startFrom: range.startFrom.toISOString(), startTo: range.startTo.toISOString() }
      : {}),
  };
};

/** How many filters are set, for the badge on the filter button (search text not counted). */
export const countActiveFilters = (filters: EventFilters) =>
  (filters.when !== 'any' ? 1 : 0) + (filters.organizationId ? 1 : 0);
