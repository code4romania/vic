import { formatEditActivityLogPayload } from './activity-log.api';

const base = {
  date: new Date(2026, 10, 3),
  hours: 2,
  mentions: '',
  volunteer: { value: 'vol-1', label: 'Ion' },
  task: { value: 'task-1', label: 'Logistică' },
};

describe('formatEditActivityLogPayload', () => {
  it('sends the chosen event', () => {
    expect(
      formatEditActivityLogPayload({ ...base, event: { value: 'ev-1', label: 'Maraton' } }),
    ).toMatchObject({ eventId: 'ev-1', activityTypeId: 'task-1', date: '2026-11-03' });
  });

  it('sends eventId null when the event was removed, so the backend clears it', () => {
    const payload = formatEditActivityLogPayload({ ...base, event: undefined });
    expect(payload).toHaveProperty('eventId', null);
    expect(payload).not.toHaveProperty('volunteer');
  });
});
