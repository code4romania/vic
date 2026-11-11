import React from 'react';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import OrganizationValidation from './OrganizationValidation';
import { renderPage, t } from '../test/render';
import { api, server } from '../test/server';
import { useSuccessToast } from '../hooks/useToast';

vi.mock('../hooks/useToast', () => ({ useSuccessToast: vi.fn(), useErrorToast: vi.fn() }));

const PENDING = [
  {
    id: 'org-9',
    name: 'Asociatia Noua',
    taxId: 'RO999',
    email: 'noua@ong.test',
    phone: '+40700000009',
    address: 'Str. Noua',
    description: 'd'.repeat(60),
    website: null,
    logo: null,
    registeredOn: '2026-11-05T10:00:00.000Z',
    firstAdmin: { id: 'u-9', name: 'Tudor Noua', email: 'tudor@noua.test', phone: '+40711' },
  },
];

const meta = (totalItems: number) => ({
  itemCount: totalItems,
  totalItems,
  itemsPerPage: 1,
  totalPages: 1,
  currentPage: 1,
});

describe('OrganizationValidation', () => {
  beforeEach(() => {
    server.use(
      http.get(api('/admin/organizations'), ({ request }) => {
        const status = new URL(request.url).searchParams.get('status');
        return HttpResponse.json({ items: [], meta: meta(status === 'active' ? 14 : 3) });
      }),
    );
  });

  it('shows the CUI, the first admin and both self-declarations, with the counters', async () => {
    server.use(
      http.get(api('/admin/organizations/pending-validation'), () => HttpResponse.json(PENDING)),
    );
    renderPage(<OrganizationValidation />, { auth: { isSuperAdmin: true } });

    expect(await screen.findByText('Asociatia Noua')).toBeInTheDocument();
    expect(screen.getByText('Tudor Noua')).toBeInTheDocument();
    expect(screen.getByText(t('validation:declarations.registered_ngo'))).toBeInTheDocument();
    expect(screen.getByText(t('validation:declarations.representative'))).toBeInTheDocument();
    expect(screen.getByText(t('validation:list_title', { count: 1 }))).toBeInTheDocument();
    expect(await screen.findByText('14')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('counts only validated active organizations', async () => {
    const organizationParams: URLSearchParams[] = [];
    server.use(
      http.get(api('/admin/organizations/pending-validation'), () => HttpResponse.json(PENDING)),
      http.get(api('/admin/organizations'), ({ request }) => {
        const params = new URL(request.url).searchParams;
        organizationParams.push(params);
        const total =
          params.get('status') === 'active'
            ? params.get('awaitingValidation') === 'false'
              ? 14
              : 15
            : 3;
        return HttpResponse.json({ items: [], meta: meta(total) });
      }),
    );
    renderPage(<OrganizationValidation />, { auth: { isSuperAdmin: true } });

    const activeCard = screen.getByText(t('validation:stats.active')).parentElement!;
    expect(await within(activeCard).findByText('14')).toBeInTheDocument();
    const activeParams = organizationParams.find((params) => params.get('status') === 'active');
    expect(activeParams?.get('status')).toBe('active');
    expect(activeParams?.get('awaitingValidation')).toBe('false');
  });

  it('says so when no organization waits', async () => {
    server.use(
      http.get(api('/admin/organizations/pending-validation'), () => HttpResponse.json([])),
    );
    renderPage(<OrganizationValidation />, { auth: { isSuperAdmin: true } });
    expect(await screen.findByText(t('validation:empty.title'))).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: t('validation:actions.validate') })).toBeNull();
  });

  it('is a 403 for plain admins and loads nothing', async () => {
    const load = vi.fn();
    server.use(
      http.get(api('/admin/organizations/pending-validation'), () => {
        load();
        return HttpResponse.json(PENDING);
      }),
    );
    renderPage(<OrganizationValidation />, { auth: { isSuperAdmin: false } });
    expect(screen.getByRole('heading', { name: t('forbidden:title') })).toBeInTheDocument();
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(load).not.toHaveBeenCalled();
  });

  it.each(['validate', 'suspend'] as const)('%s asks first, then toasts', async (action) => {
    let called = '';
    server.use(
      http.get(api('/admin/organizations/pending-validation'), () => HttpResponse.json(PENDING)),
      http.patch(api(`/admin/organizations/:id/${action}`), ({ params }) => {
        called = String(params.id);
        return HttpResponse.json({});
      }),
    );
    renderPage(<OrganizationValidation />, { auth: { isSuperAdmin: true } });

    expect(await screen.findByText('Asociatia Noua')).toBeInTheDocument();
    // #469: validated on the CUI; there is no statute any more
    expect(screen.getByText('RO999')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: t(`validation:actions.${action}`) }));
    const dialog = await screen.findByRole('dialog');
    expect(called).toBe('');
    await userEvent.click(
      within(dialog).getByRole('button', { name: t(`validation:actions.${action}`) }),
    );

    await waitFor(() =>
      expect(useSuccessToast).toHaveBeenCalledWith(
        t(`validation:toast.${action}`, { name: 'Asociatia Noua' }),
      ),
    );
    expect(called).toBe('org-9');
  });
});
