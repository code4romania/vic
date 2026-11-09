import React from 'react';
import { screen, waitFor, within } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import VolunteerEvents from './VolunteerEvents';
import VolunteerStats from './VolunteerStats';
import { renderPage, t } from '../test/render';
import { api, server } from '../test/server';

const event = (id: string, name: string, hours = 0) => ({
  id,
  name,
  startDate: '2026-11-20T10:00:00.000Z',
  endDate: '2026-11-21T10:00:00.000Z',
  location: 'București',
  hours,
});

describe('Volunteer profile events and counters (#480, #485)', () => {
  it('lists the upcoming and the finished events, read only', async () => {
    server.use(
      http.get(api('/volunteer/v-1/events'), () =>
        HttpResponse.json({
          upcoming: [event('e-1', 'Maraton')],
          finished: [event('e-2', 'Concert', 4), event('e-3', 'Gală')],
        }),
      ),
    );
    renderPage(<VolunteerEvents volunteerId="v-1" />);

    const upcoming = await screen.findByRole('region', { name: t('volunteer:events.upcoming') });
    expect(within(upcoming).getByText('Maraton')).toBeInTheDocument();
    expect(within(upcoming).getByText(`${t('volunteer:events.upcoming')} (1)`)).toBeInTheDocument();

    const finished = screen.getByRole('region', { name: t('volunteer:events.finished') });
    expect(within(finished).getByText('Concert')).toBeInTheDocument();
    expect(
      within(finished).getByText(t('volunteer:events.hours', { hours: 4 })),
    ).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('says when there are no events', async () => {
    server.use(
      http.get(api('/volunteer/v-1/events'), () =>
        HttpResponse.json({ upcoming: [], finished: [] }),
      ),
    );
    renderPage(<VolunteerEvents volunteerId="v-1" />);
    expect(await screen.findAllByText(t('volunteer:events.none'))).toHaveLength(2);
  });

  it('shows the approved hours and the number of events', async () => {
    server.use(
      http.get(api('/volunteer/v-1/stats'), () => HttpResponse.json({ totalHours: 12, events: 3 })),
    );
    renderPage(<VolunteerStats volunteerId="v-1" />);
    // the counters render "-" until the stats arrive
    await waitFor(() =>
      expect(screen.getByLabelText(t('volunteer:stats.hours'))).toHaveTextContent('12'),
    );
    expect(screen.getByLabelText(t('volunteer:stats.events'))).toHaveTextContent('3');
  });
});
