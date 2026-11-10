import { http, HttpResponse } from 'msw';
import {
  formatEditActivityLogPayload,
  getActivityLogs,
  getActivityLogsForDownload,
} from './activity-log.api';
import { api, server } from '../../test/server';

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

describe('hours export (major 6)', () => {
  it('sends every filter the list sends, the registration date included', async () => {
    const seen: Record<string, URLSearchParams> = {};
    server.use(
      http.get(api('/activity-log'), ({ request }) => {
        seen.list = new URL(request.url).searchParams;
        return HttpResponse.json({ items: [], meta: {} });
      }),
      http.get(api('/activity-log/download'), ({ request }) => {
        seen.download = new URL(request.url).searchParams;
        return new HttpResponse(new ArrayBuffer(1));
      }),
    );
    const filters = {
      limit: 10,
      page: 1,
      search: 'ana',
      approvedOrRejectedBy: 'admin-1',
      executionDateStart: new Date(2026, 9, 1),
      executionDateEnd: new Date(2026, 9, 31),
      registrationDateStart: new Date(2026, 10, 1),
      registrationDateEnd: new Date(2026, 10, 9),
    };

    await getActivityLogs(filters);
    await getActivityLogsForDownload(filters);

    expect(seen.download.get('registrationDateStart')).toBeTruthy();
    expect(Object.fromEntries(seen.download)).toEqual(Object.fromEntries(seen.list));
  });
});
