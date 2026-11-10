import React from 'react';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import Settings from './Settings';
import { renderPage, t } from '../test/render';
import { useErrorToast, useSuccessToast } from '../hooks/useToast';

vi.mock('../hooks/useToast', () => ({ useErrorToast: vi.fn(), useSuccessToast: vi.fn() }));
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
    expect(screen.getAllByText(ADMIN.email).length).toBeGreaterThan(0);
    expect(screen.getByRole('link', { name: t('settings:account.team') })).toHaveAttribute(
      'href',
      '/organization/team',
    );

    expect(await screen.findByText(ORGANIZATION.name)).toBeInTheDocument();
    expect(screen.getByText(ORGANIZATION.email)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: t('settings:organization.edit') })).toHaveAttribute(
      'href',
      '/organization',
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

  // #508
  describe('Date și securitate', () => {
    it('shows the always-on email code, and changes the email with both codes', async () => {
      const sent: unknown[] = [];
      server.use(
        http.post(api('/security/email/codes'), async ({ request }) => {
          sent.push(await request.json());
          return HttpResponse.json({ maskedEmail: 'a•••@ong.test', newEmail: 'nou@ong.test' });
        }),
        http.post(api('/security/email'), async ({ request }) => {
          sent.push(await request.json());
          return HttpResponse.json({ email: 'nou@ong.test' });
        }),
      );
      const refreshProfile = vi.fn();
      renderPage(<Settings />, { route: '/settings', auth: { refreshProfile } });
      expect(screen.getByText(t('settings:security.two_factor.on'))).toBeInTheDocument();

      await userEvent.click(
        screen.getByRole('button', { name: t('settings:security.email.action') }),
      );
      const dialog = await screen.findByRole('dialog');
      await userEvent.type(
        within(dialog).getByLabelText(t('settings:security.email.new_email')),
        'nou@ong.test',
      );
      await userEvent.click(
        within(dialog).getByRole('button', { name: t('settings:security.email.send') }),
      );
      const [current, next] = await within(dialog).findAllByRole('textbox');
      await userEvent.type(current, '12a3456');
      await userEvent.type(next, '654321');
      await userEvent.click(
        within(dialog).getByRole('button', { name: t('settings:security.email.confirm') }),
      );
      await waitFor(() => expect(refreshProfile).toHaveBeenCalled());
      expect(sent).toEqual([
        { newEmail: 'nou@ong.test' },
        { code: '123456', newEmailCode: '654321' },
      ]);
      expect(useSuccessToast).toHaveBeenCalled();
    });

    it('deletes the organization only after the typed name and the emailed code', async () => {
      let deleted: unknown;
      server.use(
        http.post(api('/security/code'), () => HttpResponse.json({ maskedEmail: 'a•••@ong.test' })),
        http.post(api('/security/organization/delete'), async ({ request }) => {
          deleted = await request.json();
          return new HttpResponse(null, { status: 204 });
        }),
      );
      const logout = vi.fn().mockResolvedValue(undefined);
      renderPage(<Settings />, { route: '/settings', auth: { logout } });
      await screen.findByText(ORGANIZATION.name);
      await userEvent.click(screen.getByRole('button', { name: t('settings:danger.action') }));
      const dialog = await screen.findByRole('dialog');
      const confirm = within(dialog).getByRole('button', { name: t('settings:danger.confirm') });
      expect(confirm).toBeDisabled();

      await userEvent.type(
        within(dialog).getByLabelText(t('settings:danger.type_name', { name: ORGANIZATION.name })),
        'asociația   test',
      );
      await userEvent.click(
        within(dialog).getByRole('button', { name: t('settings:security.code.send') }),
      );
      await userEvent.type(
        await within(dialog).findByLabelText(t('settings:security.code.label')),
        '111222',
      );
      expect(confirm).toBeEnabled();
      await userEvent.click(confirm);
      await waitFor(() => expect(logout).toHaveBeenCalled());
      expect(deleted).toEqual({ confirmation: 'asociația   test', code: '111222' });
      expect(useErrorToast).not.toHaveBeenCalled();
    });
  });
});
