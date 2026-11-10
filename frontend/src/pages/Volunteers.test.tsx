import React from 'react';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

  it('a Candidate with a VIC account can be activated from the row menu; one without cannot (#590)', async () => {
    const activated: string[] = [];
    const withAccount = { ...volunteer('c1', 'Cora Cont', 'candidate', 0) };
    withAccount.user = { ...withAccount.user, hasAccount: true } as typeof withAccount.user;
    const withoutAccount = { ...volunteer('c2', 'Dan Fără', 'candidate', 0) };
    withoutAccount.user = {
      ...withoutAccount.user,
      hasAccount: false,
    } as typeof withoutAccount.user;
    server.use(
      http.get(api('/volunteer'), () => HttpResponse.json(page([withAccount, withoutAccount]))),
      http.patch(api('/volunteer/:id/activate'), ({ params }) => {
        activated.push(params.id as string);
        return HttpResponse.json({ ...withAccount, status: 'active' });
      }),
      http.get(api('/listing/*'), () => HttpResponse.json([])),
    );

    renderPage(<Volunteers query={{ limit: 10, page: 1 }} setQuery={vi.fn()} />);

    const rowOf = async (name: string) =>
      (await screen.findByText(name)).closest('[role="row"]') as HTMLElement;

    await userEvent.click(
      within(await rowOf('Dan Fără'))
        .getAllByRole('button')
        .at(-1) as HTMLElement,
    );
    expect(screen.queryByText(t('volunteers:popover.activate'))).toBeNull();
    await userEvent.keyboard('{Escape}');

    await userEvent.click(
      within(await rowOf('Cora Cont'))
        .getAllByRole('button')
        .at(-1) as HTMLElement,
    );
    await userEvent.click(await screen.findByText(t('volunteers:popover.activate')));
    await waitFor(() => expect(activated).toEqual(['c1']));
  });
});
