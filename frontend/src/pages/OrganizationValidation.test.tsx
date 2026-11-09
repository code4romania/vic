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

describe('OrganizationValidation', () => {
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
