import {
  EventDisplayStatus,
  EventStatus,
  getEventDisplayStatus,
} from './event-status.enum';

describe('getEventDisplayStatus (#492)', () => {
  const now = new Date('2026-11-09T12:00:00Z');

  it('a published event past its end date is finished', () => {
    expect(
      getEventDisplayStatus(
        {
          status: EventStatus.PUBLISHED,
          endDate: new Date('2026-11-09T11:59:00Z'),
        },
        now,
      ),
    ).toBe(EventDisplayStatus.FINISHED);
  });

  it('a published event still running, or without end date, stays published', () => {
    expect(
      getEventDisplayStatus(
        {
          status: EventStatus.PUBLISHED,
          endDate: new Date('2026-11-10T00:00:00Z'),
        },
        now,
      ),
    ).toBe(EventDisplayStatus.PUBLISHED);
    // no end date: running through its start day (in Bucharest)
    expect(
      getEventDisplayStatus(
        {
          status: EventStatus.PUBLISHED,
          startDate: new Date('2026-11-09T08:00:00Z'),
          endDate: null,
        },
        now,
      ),
    ).toBe(EventDisplayStatus.PUBLISHED);
  });

  it('a published event without end date is finished after its start day', () => {
    expect(
      getEventDisplayStatus(
        {
          status: EventStatus.PUBLISHED,
          startDate: new Date('2026-11-08T08:00:00Z'),
          endDate: null,
        },
        now,
      ),
    ).toBe(EventDisplayStatus.FINISHED);
  });

  it('drafts and archived events keep their status', () => {
    const past = new Date('2020-01-01T00:00:00Z');
    expect(
      getEventDisplayStatus({ status: EventStatus.DRAFT, endDate: past }, now),
    ).toBe(EventDisplayStatus.DRAFT);
    expect(
      getEventDisplayStatus(
        { status: EventStatus.ARCHIVED, endDate: past },
        now,
      ),
    ).toBe(EventDisplayStatus.ARCHIVED);
  });
});
