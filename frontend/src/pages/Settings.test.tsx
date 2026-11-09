import React from 'react';
import { screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import Settings from './Settings';
import { renderPage, t } from '../test/render';
import { ADMIN, api, server } from '../test/server';

const ORGANIZATION = {
  id: 'org-1',
  name: 'Asociația Test',
  email: 'contact@test.ro',
  phone: '+40700000001',
  website: 'https://test.ro',
  description: 'Ajutăm comunitatea.',
  logo: null,
};

describe('Settings (#506, #509)', () => {
  beforeEach(() => {
    server.use(http.get(api('/organization'), () => HttpResponse.json(ORGANIZATION)));
  });

  afterEach(() => vi.unstubAllEnvs());

  it('keeps the admin account apart from the public organization profile', async () => {
    renderPage(<Settings />, { route: '/settings' });

    expect(screen.getByText(t('settings:account.title'))).toBeInTheDocument();
    expect(screen.getByText(ADMIN.email)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: t('settings:account.team') })).toHaveAttribute(
      'href',
      '/organization/team',
    );

    expect(await screen.findByText(ORGANIZATION.name)).toBeInTheDocument();
    expect(screen.getByText(ORGANIZATION.email)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: t('settings:organization.edit') })).toHaveAttribute(
      'href',
      '/organization/edit',
    );
  });

  it('opens the configured About links in a new tab and hides missing ones', () => {
    vi.stubEnv('VITE_TERMS_URL', 'https://vic.test/terms');
    vi.stubEnv('VITE_PRIVACY_URL', 'https://vic.test/privacy');
    vi.stubEnv('VITE_HELP_CENTER_URL', '');
    renderPage(<Settings />, { route: '/settings' });

    const terms = screen.getByRole('link', { name: t('settings:about.terms') });
    expect(terms).toHaveAttribute('href', 'https://vic.test/terms');
    expect(terms).toHaveAttribute('target', '_blank');
    expect(screen.getByRole('link', { name: t('settings:about.privacy') })).toHaveAttribute(
      'href',
      'https://vic.test/privacy',
    );
    expect(screen.queryByRole('link', { name: t('settings:about.help') })).not.toBeInTheDocument();
  });
});
