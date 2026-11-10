import React from 'react';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import SuperAdminLists from './SuperAdminLists';
import { renderPage, t } from '../test/render';
import { api, server } from '../test/server';

const meta = (totalItems: number) => ({
  itemCount: totalItems,
  totalItems,
  itemsPerPage: 10,
  totalPages: 1,
  currentPage: 1,
});

describe('Super admin lists (#511)', () => {
  let organizationParams: URLSearchParams[] = [];
  let volunteerParams: URLSearchParams[] = [];

  beforeEach(() => {
    organizationParams = [];
    volunteerParams = [];
    server.use(
      http.get(api('/admin/organizations'), ({ request }) => {
        organizationParams.push(new URL(request.url).searchParams);
        return HttpResponse.json({
          items: [
            {
              id: 'o1',
              name: 'Crucea Verde',
              email: 'contact@crucea.ro',
              phone: '+40700000001',
              taxId: 'RO123456',
              status: 'active',
              validatedAt: '2026-10-01T10:00:00Z',
              createdOn: '2026-09-30T10:00:00Z',
              volunteers: 12,
            },
          ],
          meta: meta(1),
        });
      }),
      http.get(api('/admin/volunteers'), ({ request }) => {
        volunteerParams.push(new URL(request.url).searchParams);
        return HttpResponse.json({
          items: [
            {
              id: 'u1',
              name: 'Elena Pop',
              email: 'elena@example.ro',
              phone: '+40720000001',
              createdOn: '2026-10-02T10:00:00Z',
              organizations: ['Crucea Verde', 'VIC'],
            },
          ],
          meta: meta(1),
        });
      }),
    );
  });

  const render = (route: string, isSuperAdmin = true) =>
    renderPage(<SuperAdminLists />, { route, path: '/admin/:list', auth: { isSuperAdmin } });

  it('lists every organization with its CUI, status and active volunteers', async () => {
    render('/admin/organizations');
    expect(await screen.findByText('Crucea Verde')).toBeInTheDocument();
    expect(screen.getByText('RO123456')).toBeInTheDocument();
    expect(screen.getByText(t('super_admin:status.active'))).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(organizationParams[0].get('page')).toBe('1');
    expect(organizationParams[0].get('limit')).toBe('10');
    expect(volunteerParams).toHaveLength(0);
  });

  it('searches the volunteers list on the server', async () => {
    render('/admin/volunteers');
    expect(await screen.findByText('Elena Pop')).toBeInTheDocument();
    const organizations = screen.getByRole('list', { name: 'Crucea Verde, VIC' });
    expect(
      within(organizations)
        .getAllByRole('listitem')
        .map((item) => item.textContent),
    ).toEqual(['Crucea Verde', 'VIC']);

    await userEvent.type(screen.getByPlaceholderText(t('super_admin:search.volunteers')), 'elena');
    await waitFor(() =>
      expect(volunteerParams.some((params) => params.get('search') === 'elena')).toBe(true),
    );
  });

  it('counts the results and sends pending organizations to the validation page', async () => {
    server.use(
      http.get(api('/admin/organizations'), () =>
        HttpResponse.json({
          items: [
            {
              id: 'o2',
              name: 'Asociatia Noua',
              email: 'noua@ong.test',
              phone: '',
              taxId: 'RO999',
              status: 'pending',
              validatedAt: null,
              createdOn: '2026-11-01T10:00:00Z',
              volunteers: 0,
            },
          ],
          meta: meta(1),
        }),
      ),
    );
    render('/admin/organizations');
    expect(await screen.findByText('Asociatia Noua')).toBeInTheDocument();
    expect(screen.getByText(t('super_admin:status.pending'))).toBeInTheDocument();
    expect(
      screen.getByText(t('super_admin:found.organizations', { count: 1 })),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: t('super_admin:review') })).toBeInTheDocument();
  });

  it('is forbidden to a plain admin', () => {
    render('/admin/organizations', false);
    expect(screen.queryByText(t('super_admin:title'))).not.toBeInTheDocument();
    expect(organizationParams).toHaveLength(0);
  });
});
