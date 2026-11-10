import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import Volunteers from './Volunteers';
import { renderPage, t } from '../test/render';
import { api, server } from '../test/server';

const volunteer = (id: string, name: string, status: string, totalHours: number) => ({
  id,
  status,
  source: status === 'candidate' ? 'Târg ONG' : null,
  isFavorite: false,
  totalHours,
  organizationId: 'org-1',
  createdOn: '2026-01-01T00:00:00.000Z',
  updatedOn: '2026-01-01T00:00:00.000Z',
  user: { id: `u-${id}`, name, phone: '+40700000000' },
  profile: { email: `${id}@ong.test`, activeSince: '2026-01-01T00:00:00.000Z' },
});

const page = (items: unknown[]) => ({
  items,
  meta: {
    itemCount: items.length,
    totalItems: items.length,
    itemsPerPage: 10,
    totalPages: 1,
    currentPage: 1,
  },
});

describe('Volunteers (#475, #476)', () => {
  it('lists every status in one table with hours, status and source; asks for no status by default', async () => {
    const params: URLSearchParams[] = [];
    server.use(
      http.get(api('/volunteer'), ({ request }) => {
        params.push(new URL(request.url).searchParams);
        return HttpResponse.json(
          page([
            volunteer('a', 'Ana Activ', 'active', 12),
            volunteer('c', 'Cora Candidat', 'candidate', 0),
          ]),
        );
      }),
      http.get(api('/listing/activity-types'), () => HttpResponse.json([])),
      http.get(api('/listing/*'), () => HttpResponse.json([])),
    );

    renderPage(<Volunteers query={{ limit: 10, page: 1 }} setQuery={vi.fn()} />);

    expect(await screen.findByText('Ana Activ')).toBeInTheDocument();
    expect(screen.getByText('Cora Candidat')).toBeInTheDocument();
    expect(screen.getByText('12h')).toBeInTheDocument();
    expect(screen.getByText(t('volunteers:status_label.candidate'))).toBeInTheDocument();
    expect(screen.getByText('Târg ONG')).toBeInTheDocument();
    expect(screen.getByText(t('volunteers:found', { count: 2 }))).toBeInTheDocument();
    expect(screen.queryByRole('tab')).toBeNull();
    await waitFor(() => expect(params.length).toBeGreaterThan(0));
    expect(params[0].has('status')).toBe(false);
  });

  it('sends the status and activity filters from the URL', async () => {
    const params: URLSearchParams[] = [];
    server.use(
      http.get(api('/volunteer'), ({ request }) => {
        params.push(new URL(request.url).searchParams);
        return HttpResponse.json(page([]));
      }),
      http.get(api('/listing/*'), () => HttpResponse.json([])),
    );

    renderPage(
      <Volunteers
        query={{ limit: 10, page: 1, volunteerStatus: 'inactive', activityTypeId: 'type-1' }}
        setQuery={vi.fn()}
      />,
    );

    await waitFor(() => expect(params.length).toBeGreaterThan(0));
    expect(params[0].get('status')).toBe('inactive');
    expect(params[0].get('activityTypeId')).toBe('type-1');
  });
});
