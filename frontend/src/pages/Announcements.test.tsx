import React from 'react';
import { Route } from 'react-router-dom';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import Announcements from './Announcements';
import AddAnnouncement from './AddAnnouncement';
import { renderPage, t } from '../test/render';
import { api, server } from '../test/server';

const meta = (totalItems: number) => ({
  itemCount: totalItems,
  totalItems,
  itemsPerPage: 10,
  totalPages: totalItems ? 1 : 0,
  currentPage: 1,
});

const ANNOUNCEMENT = {
  id: 'a1',
  name: 'Voluntari pentru weekend',
  description: 'Avem nevoie de ajutor la depozit.',
  status: 'active',
  type: 'recruitment',
  volunteersNeeded: 4,
  displayStartDate: '2026-11-01T00:00:00Z',
  displayEndDate: '2026-11-30T00:00:00Z',
  publishedOn: '2026-11-01T08:00:00Z',
  archivedOn: null,
  updatedOn: '2026-11-02T08:00:00Z',
  targetedVolunteers: 0,
};

const useApi = (onList?: (url: URL) => void) =>
  server.use(
    http.get(api('/announcement'), ({ request }) => {
      onList?.(new URL(request.url));
      return HttpResponse.json({ items: [ANNOUNCEMENT], meta: meta(1) });
    }),
    http.get(api('/announcement/counters'), () =>
      HttpResponse.json({ active: 3, inactive: 1, archived: 5, responses: 42 }),
    ),
    http.get(api('/announcement/a1/responses'), () =>
      HttpResponse.json({ items: [], meta: meta(2) }),
    ),
  );

describe('Announcements (#502)', () => {
  it('shows active, inactive, archived and total responses from the API', async () => {
    useApi();
    renderPage(<Announcements query={{ limit: 10, page: 1 }} setQuery={vi.fn()} />);

    expect(await screen.findByText('42')).toBeInTheDocument();
    expect(screen.getByText(t('announcement:counters.responses'))).toBeInTheDocument();
    const counter = (key: string) =>
      screen
        .getAllByText(t(`announcement:counters.${key}`))
        .find((element) => element.tagName === 'P')?.nextSibling;
    expect(counter('active')).toHaveTextContent('3');
    expect(counter('inactive')).toHaveTextContent('1');
    expect(counter('archived')).toHaveTextContent('5');
  });

  it('lists the active announcements as cards with volunteers needed and responses', async () => {
    let listed: URL | undefined;
    useApi((url) => (listed = url));
    renderPage(<Announcements query={{ limit: 10, page: 1 }} setQuery={vi.fn()} />);

    const card = await screen.findByRole('article', { name: ANNOUNCEMENT.name });
    expect(listed?.searchParams.get('status')).toBe('active');
    expect(within(card).getByText(ANNOUNCEMENT.description)).toBeInTheDocument();
    expect(
      within(card).getByText(t('announcement:card.volunteers_needed', { count: 4 })),
    ).toBeInTheDocument();
    expect(within(card).getByText('01.11.2026 - 30.11.2026')).toBeInTheDocument();
    expect(
      await within(card).findByText(t('announcement:card.responses', { count: 2 })),
    ).toBeInTheDocument();
    expect(within(card).getByText(t('announcement:type_short.recruitment'))).toBeInTheDocument();
  });

  it('switches the status tab through the query', async () => {
    useApi();
    const setQuery = vi.fn();
    renderPage(<Announcements query={{ limit: 10, page: 1 }} setQuery={setQuery} />);

    const archived = await screen.findByRole('tab', { name: /Arhivate/ });
    await waitFor(() => expect(within(archived).getByText('5')).toBeInTheDocument());
    await userEvent.click(archived);
    expect(setQuery).toHaveBeenCalledWith({ status: 'archived', page: 1 });
  });

  it('duplicates an announcement into a prefilled create form', async () => {
    useApi();
    renderPage(<Announcements query={{ limit: 10, page: 1 }} setQuery={vi.fn()} />, {
      routes: <Route path="/add" element={<AddAnnouncement />} />,
    });

    const card = await screen.findByRole('article', { name: ANNOUNCEMENT.name });
    await userEvent.click(within(card).getAllByRole('button')[1]);
    await userEvent.click(await screen.findByText(t('announcement:actions.duplicate')));

    expect(await screen.findByText(t('announcement:create.duplicate_title'))).toBeInTheDocument();
    expect(screen.getByDisplayValue(ANNOUNCEMENT.name)).toBeInTheDocument();
    expect(screen.getByDisplayValue(ANNOUNCEMENT.description)).toBeInTheDocument();
    expect(screen.getByDisplayValue('4')).toBeInTheDocument();
  });
});
