import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { Route, useLocation } from 'react-router-dom';
import Dashboard from './Dashboard';
import { renderPage, t } from '../test/render';
import { api, server } from '../test/server';

const Where = () => <p>at {useLocation().pathname + useLocation().search}</p>;

describe('Dashboard (#466, #467)', () => {
  beforeEach(() => {
    server.use(
      http.get(api('/dashboard/overview'), () =>
        HttpResponse.json({
          activeVolunteers: 12,
          pendingAccessRequests: 3,
          upcomingEvents: 4,
          pendingContracts: 2,
          approvedHours: 340,
          pendingHours: 15,
        }),
      ),
      http.get(api('/dashboard/upcoming-events'), () =>
        HttpResponse.json([
          {
            id: 'e1',
            name: 'Curățenie în parc',
            startDate: '2026-11-20T08:00:00.000Z',
            endDate: null,
            location: 'Cluj',
            isPublic: true,
            going: 8,
            capacity: 20,
          },
          {
            id: 'e2',
            name: 'Maraton',
            startDate: '2026-11-25T08:00:00.000Z',
            endDate: null,
            location: null,
            isPublic: false,
            going: 2,
            capacity: null,
          },
        ]),
      ),
      http.get(api('/dashboard/announcement-responses'), () =>
        HttpResponse.json([
          {
            id: 'r1',
            comment: 'Vin și eu cu mașina',
            createdOn: '2026-11-09T10:00:00.000Z',
            announcementId: 'a1',
            announcementName: 'Strângere de fonduri',
            volunteerId: 'v1',
            volunteerName: 'Elena Pop',
          },
        ]),
      ),
    );
  });

  const render = () =>
    renderPage(<Dashboard />, {
      route: '/',
      path: '/',
      routes: <Route path="*" element={<Where />} />,
    });

  it('shows the four counters and no charts', async () => {
    render();
    expect(await screen.findByText('12')).toBeInTheDocument();
    expect(screen.getByText(t('dashboard:statistics.volunteers.label'))).toBeInTheDocument();
    expect(screen.getByText('3 cereri noi')).toBeInTheDocument();
    expect(
      screen.getByText(t('dashboard:statistics.events.label'), { selector: 'p' }),
    ).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText(t('dashboard:statistics.contracts.label'))).toBeInTheDocument();
    expect(screen.getByText('340')).toBeInTheDocument();
    expect(screen.getByText('15 ore de aprobat')).toBeInTheDocument();
    expect(screen.queryByText('Număr voluntari')).not.toBeInTheDocument();
    expect(screen.queryByText('Statistici voluntari organizație')).not.toBeInTheDocument();
  });

  it('opens the pending contracts from their counter', async () => {
    render();
    await userEvent.click(
      await screen.findByRole('button', { name: t('dashboard:statistics.contracts.action') }),
    );
    expect(await screen.findByText('at /documents/contracts?status=PENDING')).toBeInTheDocument();
  });

  it('lists the next events with registrations, and the latest responses', async () => {
    render();
    expect(await screen.findByText('Curățenie în parc')).toBeInTheDocument();
    expect(screen.getByText('8/20 înscriși')).toBeInTheDocument();
    expect(screen.getByText('2 înscriși')).toBeInTheDocument();
    expect(await screen.findByText('Vin și eu cu mașina')).toBeInTheDocument();
    expect(screen.getByText('la „Strângere de fonduri”')).toBeInTheDocument();

    await userEvent.click(screen.getByText('Curățenie în parc'));
    expect(await screen.findByText('at /events/e1')).toBeInTheDocument();
  });
});
