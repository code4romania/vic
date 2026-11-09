import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import AddEventVolunteersModal from './AddEventVolunteersModal';
import { renderPage, t } from '../test/render';
import { api, server } from '../test/server';

const candidates = {
  placesLeft: 1,
  items: [
    {
      volunteerId: 'v1',
      name: 'Ana Pop',
      email: 'ana@ong.ro',
      department: 'Logistică',
      totalHours: 8,
      registered: false,
    },
    {
      volunteerId: 'v2',
      name: 'Bogdan Ion',
      email: 'bogdan@ong.ro',
      department: 'Logistică',
      totalHours: 0,
      registered: false,
    },
    {
      volunteerId: 'v3',
      name: 'Elena Dinu',
      email: 'elena@ong.ro',
      department: 'Logistică',
      totalHours: 3,
      registered: true,
    },
  ],
};

describe('AddEventVolunteersModal (#496)', () => {
  it('shows hours and who is registered, keeps to the places left and adds the selection', async () => {
    const posted: unknown[] = [];
    server.use(
      http.get(api('/event/e1/candidates'), () => HttpResponse.json(candidates)),
      http.post(api('/event/e1/volunteers'), async ({ request }) => {
        posted.push(await request.json());
        return HttpResponse.json([{ ...candidates.items[0], registered: true }], { status: 201 });
      }),
    );
    const onClose = vi.fn();
    renderPage(<AddEventVolunteersModal eventId="e1" onClose={onClose} />);

    expect(await screen.findByText('Ana Pop')).toBeInTheDocument();
    expect(screen.getByText(t('events:add_volunteers.hours', { count: 8 }))).toBeInTheDocument();
    expect(screen.getByText(t('events:add_volunteers.registered'))).toBeInTheDocument();
    const [ana, bogdan, elena] = screen.getAllByRole('checkbox');
    expect(elena).toBeDisabled();
    expect(screen.getByRole('status')).toHaveTextContent(
      t('events:add_volunteers.places', { count: 1 }),
    );

    await userEvent.click(ana);
    await userEvent.click(bogdan);
    // two selected, one place left: the button is off
    expect(
      screen.getByRole('button', { name: t('events:add_volunteers.submit', { count: 2 }) }),
    ).toBeDisabled();

    await userEvent.click(bogdan);
    await userEvent.click(
      screen.getByRole('button', { name: t('events:add_volunteers.submit', { count: 1 }) }),
    );
    await waitFor(() => expect(posted).toEqual([{ volunteerIds: ['v1'] }]));
    await waitFor(() => expect(onClose).toHaveBeenCalled());
  });
});
