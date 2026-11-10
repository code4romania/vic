import { http, HttpResponse } from 'msw';
import { getEventRSVPsForDownload, getRsvps } from './event.api';
import { api, server } from '../../test/server';

describe('event answers export (major 6)', () => {
  it('sends the same filter params as the list', async () => {
    const seen: Record<string, URLSearchParams> = {};
    server.use(
      http.get(api('/event/:id/rsvp'), ({ request }) => {
        seen.list = new URL(request.url).searchParams;
        return HttpResponse.json({ items: [], meta: {} });
      }),
      http.get(api('/event/:id/rsvp/download'), ({ request }) => {
        seen.download = new URL(request.url).searchParams;
        return new HttpResponse(new ArrayBuffer(1));
      }),
    );

    await getRsvps('e1', 10, 1, 'name', undefined, 'ana', 'b1', 'd1', 'r1', 'yes');
    await getEventRSVPsForDownload('e1', 'name', undefined, 'ana', 'b1', 'd1', 'r1', 'yes');

    const filters = ['search', 'branch', 'department', 'role', 'going'];
    filters.forEach((key) => expect(seen.download.get(key)).toBe(seen.list.get(key)));
    expect(seen.download.get('department')).toBe('d1');
    expect(seen.download.has('departmentId')).toBe(false);
  });
});
