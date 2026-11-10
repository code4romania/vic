import { hasEventEnded } from '../event-end';

export enum EventStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

// What the clients show (VIC 2.0, #492): a published event whose end date has passed
// is "finished" (Finalizat) automatically; nothing is stored for it.
export enum EventDisplayStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  FINISHED = 'finished',
  ARCHIVED = 'archived',
}

// An event with no end date is finished after its start day (see event-end.ts).
export function getEventDisplayStatus(
  event: {
    status: EventStatus;
    startDate?: Date | null;
    endDate?: Date | null;
  },
  now: Date = new Date(),
): EventDisplayStatus {
  if (
    event.status === EventStatus.PUBLISHED &&
    (event.endDate || event.startDate) &&
    hasEventEnded(event as { startDate: Date; endDate?: Date }, now)
  ) {
    return EventDisplayStatus.FINISHED;
  }
  return event.status as unknown as EventDisplayStatus;
}
