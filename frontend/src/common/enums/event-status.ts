export enum EventStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

// What to show (VIC 2.0): a published event past its end date is "finished" (Finalizat)
export enum EventDisplayStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  FINISHED = 'finished',
  ARCHIVED = 'archived',
}
