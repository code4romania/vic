import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import Events from './Events';
import { EventState } from '../common/enums/event-state.enum';
import { renderPage, t } from '../test/render';
import { api, server } from '../test/server';

describe('Events tabs (#495)', () => {
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
      expect((await screen.findAllByText(t(`events:tabs.${tab}`))).length).toBeGreaterThan(0);
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
});
