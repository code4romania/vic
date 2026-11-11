import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import VolunteerActivities from './VolunteerActivities';
import { renderPage, t } from '../test/render';
import { api, server } from '../test/server';
import { VolunteerStatus } from '../common/enums/volunteer-status.enum';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual<object>('react-router-dom')),
  useNavigate: () => mockNavigate,
}));

describe('VolunteerActivities (#481)', () => {
  it('lists the activities in every status and opens the add form in activity mode', async () => {
    const params: URLSearchParams[] = [];
    server.use(
      http.get(api('/activity-log'), ({ request }) => {
        params.push(new URL(request.url).searchParams);
        return HttpResponse.json({
          items: [
            {
              id: 'l1',
              date: '2026-11-01',
              hours: 5,
              status: 'pending',
              volunteer: { id: 'v1', name: 'Elena Pop' },
              activityType: { id: 't1', name: 'Strângere de fonduri', icon: 'package' },
              createdOn: '2026-11-01T10:00:00.000Z',
            },
          ],
          meta: { itemCount: 1, totalItems: 1, itemsPerPage: 10, totalPages: 1, currentPage: 1 },
        });
      }),
    );

    renderPage(
      <VolunteerActivities
        volunteerId="v1"
        volunteerName="Elena Pop"
        volunteerStatus={VolunteerStatus.ACTIVE}
      />,
    );

    expect(await screen.findByText('Strângere de fonduri')).toBeInTheDocument();
    expect(screen.getByText('5h')).toBeInTheDocument();
    await waitFor(() => expect(params.length).toBeGreaterThan(0));
    expect(params[0].get('source')).toBe('activity');
    expect(params[0].get('volunteerId')).toBe('v1');
    expect(params[0].has('resolutionStatus')).toBe(false);

    await userEvent.click(screen.getByRole('button', { name: t('volunteer:activities.add') }));
    expect(mockNavigate).toHaveBeenCalledWith(
      '/activity-log/add?volunteerId=v1&volunteerName=Elena+Pop&activity=true',
    );
  });

  it('hides adding an activity for an inactive volunteer', async () => {
    server.use(
      http.get(api('/activity-log'), () =>
        HttpResponse.json({
          items: [],
          meta: { itemCount: 0, totalItems: 0, itemsPerPage: 10, totalPages: 0, currentPage: 1 },
        }),
      ),
    );
    renderPage(<VolunteerActivities volunteerId="v1" volunteerStatus={VolunteerStatus.INACTIVE} />);
    expect(await screen.findByText(t('volunteer:activities.title'))).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: t('volunteer:activities.add') })).toBeNull();
  });
});
