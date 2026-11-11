import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import DashboardQuickActions from '../components/DashboardQuickActions';
import { renderPage, t } from '../test/render';
import { api, server } from '../test/server';

const organization = (validatedAt: string | null) =>
  http.get(api('/organization'), () =>
    HttpResponse.json({ id: 'org-1', name: 'Asociatia Test', status: 'active', validatedAt }),
  );

const button = (key: string) =>
  screen.getByRole('button', { name: t(`dashboard:quick_actions.${key}`) });

describe('validation gate (blocker 5)', () => {
  it('disables what needs a validated organization and says why', async () => {
    server.use(organization(null));
    renderPage(<DashboardQuickActions />);

    await waitFor(() => expect(button('add_volunteer')).toBeDisabled());
    expect(button('add_event')).toBeDisabled();
    // Contracts can be managed before validation.
    expect(button('manage_contracts')).toBeEnabled();
    expect(button('add_volunteer')).toHaveAttribute('title', t('organization:validation_required'));
    expect(button('add_announcement')).toBeDisabled();
    expect(button('add_announcement')).toHaveAttribute('title', t('organization:validation_required'));
  });

  it('leaves everything enabled for a validated organization', async () => {
    server.use(organization('2026-11-01T10:00:00.000Z'));
    const { queryClient } = renderPage(<DashboardQuickActions />);

    await waitFor(() => expect(queryClient.getQueryData(['organization'])).toBeDefined());
    expect(button('add_volunteer')).toBeEnabled();
    expect(button('add_volunteer')).not.toHaveAttribute('title');
    expect(button('add_announcement')).toBeEnabled();
    expect(button('add_announcement')).not.toHaveAttribute('title');
  });
});
