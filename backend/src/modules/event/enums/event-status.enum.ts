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

export function getEventDisplayStatus(
  event: { status: EventStatus; endDate?: Date | null },
  now: Date = new Date(),
): EventDisplayStatus {
  if (
    event.status === EventStatus.PUBLISHED &&
    event.endDate &&
    new Date(event.endDate).getTime() < now.getTime()
  ) {
    return EventDisplayStatus.FINISHED;
  }
  return event.status as unknown as EventDisplayStatus;
}
