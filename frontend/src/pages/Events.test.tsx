import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import Events from './Events';
import { EventState } from '../common/enums/event-state.enum';
import { renderPage, t } from '../test/render';
import { api, server } from '../test/server';

describe('Events tabs (#495)', () => {
  beforeEach(() => {
    server.use(
      http.get(api('/listing/structures/department'), () => HttpResponse.json({ items: [] })),
      http.get(api('/event/counters'), () =>
        HttpResponse.json({ upcoming: 4, ongoing: 2, participants: 37 }),
      ),
    );
  });

  it('opens on Upcoming and asks the API for upcoming events', async () => {
    const states: (string | null)[] = [];
    server.use(
      http.get(api('/event'), ({ request }) => {
        states.push(new URL(request.url).searchParams.get('eventState'));
        return HttpResponse.json({
          items: [],
          meta: { itemCount: 0, totalItems: 0, itemsPerPage: 10, totalPages: 0, currentPage: 1 },
        });
      }),
    );

    renderPage(
      <Events query={{ limit: 10, page: 1, eventState: EventState.UPCOMING }} setQuery={vi.fn()} />,
    );

    for (const tab of ['upcoming', 'ongoing', 'past']) {
      expect((await screen.findAllByText(`${t(`events:tabs.${tab}`)} (0)`)).length).toBeGreaterThan(
        0,
      );
    }
    await waitFor(() => expect(states).toContain('upcoming'));
  });

  it('asks for ongoing events on the Ongoing tab', async () => {
    const states: (string | null)[] = [];
    server.use(
      http.get(api('/event'), ({ request }) => {
        states.push(new URL(request.url).searchParams.get('eventState'));
        return HttpResponse.json({
          items: [],
          meta: { itemCount: 0, totalItems: 0, itemsPerPage: 10, totalPages: 0, currentPage: 1 },
        });
      }),
    );
    renderPage(
      <Events query={{ limit: 10, page: 1, eventState: EventState.ONGOING }} setQuery={vi.fn()} />,
    );
    await waitFor(() => expect(states).toContain('ongoing'));
  });

  it('sends the department filter (#494) and offers "all departments"', async () => {
    const params: URLSearchParams[] = [];
    server.use(
      http.get(api('/event'), ({ request }) => {
        params.push(new URL(request.url).searchParams);
        return HttpResponse.json({
          items: [],
          meta: { itemCount: 0, totalItems: 0, itemsPerPage: 10, totalPages: 0, currentPage: 1 },
        });
      }),
      http.get(api('/listing/structures/department'), () =>
        HttpResponse.json({ items: [{ id: 'd1', name: 'Comunicare', numberOfMembers: 3 }] }),
      ),
    );
    renderPage(
      <Events
        query={{ limit: 10, page: 1, eventState: EventState.UPCOMING, departmentId: 'd1' }}
        setQuery={vi.fn()}
      />,
    );
    await waitFor(() => expect(params.some((p) => p.get('departmentId') === 'd1')).toBe(true));
    expect(await screen.findByText('Comunicare')).toBeInTheDocument();
    expect(screen.getByText(t('events:filters.department'))).toBeInTheDocument();
  });

  it('shows the counters from the API (#493)', async () => {
    server.use(
      http.get(api('/event'), () =>
        HttpResponse.json({
          items: [],
          meta: { itemCount: 0, totalItems: 0, itemsPerPage: 10, totalPages: 0, currentPage: 1 },
        }),
      ),
    );
    renderPage(
      <Events query={{ limit: 10, page: 1, eventState: EventState.UPCOMING }} setQuery={vi.fn()} />,
    );
    expect(await screen.findByText('37')).toBeInTheDocument();
    expect(screen.getByText(t('events:counters.participants'))).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText(t('events:counters.ongoing'))).toBeInTheDocument();
  });

  it('shows each tab with its count, as in the design', async () => {
    server.use(
      http.get(api('/event'), ({ request }) => {
        const params = new URL(request.url).searchParams;
        const totals: Record<string, number> = { upcoming: 3, ongoing: 2, past: 5 };
        const total = totals[params.get('eventState') as string] ?? 0;
        return HttpResponse.json({
          items: [],
          meta: {
            itemCount: 0,
            totalItems: total,
            itemsPerPage: 10,
            totalPages: 1,
            currentPage: 1,
          },
        });
      }),
    );
    renderPage(
      <Events query={{ limit: 10, page: 1, eventState: EventState.UPCOMING }} setQuery={vi.fn()} />,
    );
    expect((await screen.findAllByText(`${t('events:tabs.upcoming')} (3)`)).length).toBeGreaterThan(
      0,
    );
    expect((await screen.findAllByText(`${t('events:tabs.ongoing')} (2)`)).length).toBeGreaterThan(
      0,
    );
    expect((await screen.findAllByText(`${t('events:tabs.past')} (5)`)).length).toBeGreaterThan(0);
  });

  it('searches by name and lists an event with period, places and pending registrations', async () => {
    const searches: (string | null)[] = [];
    server.use(
      http.get(api('/event'), ({ request }) => {
        searches.push(new URL(request.url).searchParams.get('search'));
        return HttpResponse.json({
          items: [
            {
              id: 'e1',
              name: 'Atelier Comunicare',
              startDate: '2026-11-20T09:00:00Z',
              endDate: '2026-11-20T12:00:00Z',
              location: 'Sediu, București',
              isPublic: false,
              targets: [{ id: 'd1', name: 'Comunicare' }],
              status: 'published',
              displayStatus: 'published',
              capacity: 5,
              going: 2,
              notGoing: 1,
            },
          ],
          meta: { itemCount: 1, totalItems: 1, itemsPerPage: 10, totalPages: 1, currentPage: 1 },
        });
      }),
      http.get(api('/event-registrations'), ({ request }) => {
        const params = new URL(request.url).searchParams;
        const pending = params.get('status') === 'pending' && params.get('eventId') === 'e1';
        return HttpResponse.json({
          items: [],
          meta: {
            itemCount: 0,
            totalItems: pending ? 2 : 0,
            itemsPerPage: 1,
            totalPages: 1,
            currentPage: 1,
          },
        });
      }),
    );
    renderPage(
      <Events
        query={{ limit: 10, page: 1, eventState: EventState.UPCOMING, search: 'Atelier' }}
        setQuery={vi.fn()}
      />,
    );
    expect(await screen.findByText('Atelier Comunicare')).toBeInTheDocument();
    expect(searches).toContain('Atelier');
    expect(screen.getByText('Sediu, București')).toBeInTheDocument();
    expect(screen.getByText('Comunicare')).toBeInTheDocument();
    expect(screen.getByText('2 / 5')).toBeInTheDocument();
    expect(screen.getByText(t('events:page.found', { count: 1 }))).toBeInTheDocument();
    expect(await screen.findByText(t('events:table.pending', { count: 2 }))).toBeInTheDocument();
    expect(
      screen.getByRole('button', {
        name: t('events:table.view_label', { name: 'Atelier Comunicare' }),
      }),
    ).toBeInTheDocument();
  });
});
