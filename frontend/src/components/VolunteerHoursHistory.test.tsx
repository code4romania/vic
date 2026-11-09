import React from 'react';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

  it('adds hours from the modal (#483): approved, with an optional event; refreshes the list', async () => {
    const posted: unknown[] = [];
    let calls = 0;
    server.use(
      http.get(api('/activity-log'), () => {
        calls += 1;
        return HttpResponse.json({
          items: calls > 1 ? [item('n', 6, 'approved')] : [],
          meta: { itemCount: 0, totalItems: 0, itemsPerPage: 10, totalPages: 0, currentPage: 1 },
        });
      }),
      http.post(api('/activity-log'), async ({ request }) => {
        posted.push(await request.json());
        return HttpResponse.json({}, { status: 201 });
      }),
      http.get(api('/listing/*'), () => HttpResponse.json({ items: [], meta: {} })),
    );

    renderPage(<VolunteerHoursHistory volunteerId="v1" volunteerStatus={VolunteerStatus.ACTIVE} />);

    await userEvent.click(
      await screen.findByRole('button', { name: t('volunteer:add_hours.title') }),
    );
    const dialog = await screen.findByRole('dialog');
    await userEvent.type(within(dialog).getByLabelText(t('volunteer:add_hours.hours')), '6');
    await userEvent.type(
      within(dialog).getByLabelText(t('volunteer:add_hours.description')),
      'Inventar',
    );
    await userEvent.click(within(dialog).getByRole('button', { name: t('general:save') }));

    await waitFor(() => expect(posted).toHaveLength(1));
    expect(posted[0]).toMatchObject({ volunteerId: 'v1', hours: 6, mentions: 'Inventar' });
    expect(posted[0]).not.toHaveProperty('eventId');
    expect(await screen.findByText('6h')).toBeInTheDocument();
  });

  it('hides "Add hours" for a blocked or inactive volunteer (#483)', async () => {
    server.use(
      http.get(api('/activity-log'), () =>
        HttpResponse.json({
          items: [],
          meta: { itemCount: 0, totalItems: 0, itemsPerPage: 10, totalPages: 0, currentPage: 1 },
        }),
      ),
    );
    for (const status of [VolunteerStatus.BLOCKED, VolunteerStatus.INACTIVE]) {
      const { unmount } = renderPage(
        <VolunteerHoursHistory volunteerId="v1" volunteerStatus={status} />,
      );
      expect(await screen.findByText(t('volunteer:hours_history.title'))).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: t('volunteer:add_hours.title') })).toBeNull();
      unmount();
    }
  });
});
