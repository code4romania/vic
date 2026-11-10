import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { QueryParamProvider } from 'use-query-params';
import { ReactRouter6Adapter } from 'use-query-params/adapters/react-router-6';
import Event from './Event';
import { renderPage, t } from '../test/render';
import { api, server } from '../test/server';

const event = {
  id: 'e1',
  name: 'Atelier Comunicare',
  description: 'Atelier pentru comunicare',
  startDate: '2026-11-20T09:00:00Z',
  endDate: '2026-11-20T12:00:00Z',
  location: 'Sediu, București',
  isPublic: true,
  targets: [],
  status: 'published',
  displayStatus: 'published',
  capacity: 5,
};

const page = (items: object[], totalItems = items.length) => ({
  items,
  meta: { itemCount: items.length, totalItems, itemsPerPage: 10, totalPages: 1, currentPage: 1 },
});

const render = () =>
  renderPage(
    <QueryParamProvider adapter={ReactRouter6Adapter}>
      <Event />
    </QueryParamProvider>,
    { route: '/events/e1', path: '/events/:id' },
  );

describe('Event page (redesign)', () => {
  it('shows the details, the places taken and approves a pending registration (#501)', async () => {
    const approved: string[] = [];
    server.use(
      http.get(api('/event/e1'), () => HttpResponse.json(event)),
      http.get(api('/event/e1/rsvp'), () => HttpResponse.json(page([]))),
      http.get(api('/event-registrations'), ({ request }) => {
        const params = new URL(request.url).searchParams;
        expect(params.get('eventId')).toBe('e1');
        if (params.get('status') === 'approved') return HttpResponse.json(page([], 2));
        return HttpResponse.json(
          page([
            {
              id: 'r1',
              status: 'pending',
              rejectionReason: null,
              decidedOn: null,
              decidedByName: null,
              createdOn: '2026-11-08T10:00:00Z',
              event: { id: 'e1', name: 'Atelier Comunicare', startDate: event.startDate },
              user: { id: 'u1', name: 'Ion Popa', email: 'ion@example.ro' },
              volunteerId: null,
              volunteerStatus: null,
            },
          ]),
        );
      }),
      http.patch(api('/event-registrations/:id/approve'), ({ params }) => {
        approved.push(params.id as string);
        return HttpResponse.json({});
      }),
    );
    render();
    expect(await screen.findByRole('heading', { name: 'Atelier Comunicare' })).toBeInTheDocument();
    expect(screen.getByText('Atelier pentru comunicare')).toBeInTheDocument();
    expect(screen.getByText('Sediu, București')).toBeInTheDocument();
    expect(
      await screen.findByText(t('events:detail.capacity_value', { going: 2, capacity: 5 })),
    ).toBeInTheDocument();
    expect(
      await screen.findByText(t('events:detail.pending_title', { count: 1 })),
    ).toBeInTheDocument();
    await userEvent.click(
      screen.getByRole('button', { name: `${t('events:registrations.approve')} Ion Popa` }),
    );
    await waitFor(() => expect(approved).toEqual(['r1']));
  });
});
