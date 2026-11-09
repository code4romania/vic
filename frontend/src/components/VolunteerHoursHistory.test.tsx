import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import VolunteerHoursHistory from './VolunteerHoursHistory';
import { renderPage, t } from '../test/render';
import { api, server } from '../test/server';
import { VolunteerStatus } from '../common/enums/volunteer-status.enum';

const item = (id: string, hours: number, status: string, event?: string) => ({
  id,
  date: '2026-11-01',
  hours,
  status,
  volunteer: { id: 'v1', name: 'Elena Pop' },
  activityType: { id: 't1', name: `Activitate ${id}`, icon: 'package' },
  ...(event ? { event: { id: `e-${id}`, name: event } } : {}),
  createdOn: '2026-11-01T10:00:00.000Z',
});

describe('VolunteerHoursHistory (#482)', () => {
  it('shows approved, pending and rejected hours, from events and activities, with their status', async () => {
    const params: URLSearchParams[] = [];
    server.use(
      http.get(api('/activity-log'), ({ request }) => {
        params.push(new URL(request.url).searchParams);
        return HttpResponse.json({
          items: [
            item('a', 2, 'approved', 'Maraton'),
            item('b', 3, 'pending'),
            item('c', 4, 'rejected'),
          ],
          meta: { itemCount: 3, totalItems: 3, itemsPerPage: 10, totalPages: 1, currentPage: 1 },
        });
      }),
    );

    renderPage(<VolunteerHoursHistory volunteerId="v1" volunteerStatus={VolunteerStatus.ACTIVE} />);

    expect(await screen.findByText('Maraton')).toBeInTheDocument();
    for (const status of ['approved', 'pending', 'rejected']) {
      expect(screen.getByText(t(`activity_log:display_status.${status}`))).toBeInTheDocument();
    }
    await waitFor(() => expect(params.length).toBeGreaterThan(0));
    expect(params[0].has('resolutionStatus')).toBe(false);
    expect(params[0].has('source')).toBe(false);
    expect(params[0].get('volunteerId')).toBe('v1');
  });
});
