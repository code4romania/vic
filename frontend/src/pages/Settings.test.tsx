import React from 'react';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import Settings from './Settings';
import { renderPage, t } from '../test/render';
import { useErrorToast, useSuccessToast } from '../hooks/useToast';

vi.mock('../hooks/useToast', () => ({ useErrorToast: vi.fn(), useSuccessToast: vi.fn() }));
vi.mock('../common/utils/utils', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../common/utils/utils')>()),
  downloadExcel: vi.fn(),
}));
import { downloadExcel } from '../common/utils/utils';
import { ADMIN, api, server } from '../test/server';

const ORGANIZATION = {
  id: 'org-1',
  name: 'Asociația Test',
  email: 'contact@test.ro',
  phone: '+40700000001',
  website: 'https://test.ro',
  description: 'Ajutăm comunitatea.',
  logo: null,
  taxId: '12345678',
};

const TEAM = [
  {
    id: ADMIN.id,
    name: ADMIN.name,
    email: ADMIN.email,
    phone: '+40700000000',
    status: 'active',
    inviteExpiresAt: null,
    lastInviteSentAt: null,
    lastInviteSentBy: null,
    lastLoginAt: null,
  },
  {
    id: 'u-2',
    name: 'Ion Popescu',
    email: 'ion@ong.test',
    phone: '+40700000002',
    status: 'invite_sent',
    inviteExpiresAt: null,
    lastInviteSentAt: null,
    lastInviteSentBy: null,
    lastLoginAt: null,
  },
];

describe('Settings (#506, #508, #509)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    server.use(
      http.get(api('/organization'), () => HttpResponse.json(ORGANIZATION)),
      http.get(api('/organization/team'), () => HttpResponse.json(TEAM)),
    );
  });

  afterEach(() => vi.unstubAllEnvs());

  it('has the four tabs of the prototype', () => {
    renderPage(<Settings />, { route: '/settings' });
    for (const tab of ['account', 'notifications', 'security', 'about']) {
      expect(screen.getByLabelText(t(`settings:tabs.${tab}`))).toBeInTheDocument();
    }
  });

  it('Setări cont: the admin account, the organization and who has access', async () => {
    renderPage(<Settings />, { route: '/settings' });

    expect(screen.getByText(t('settings:account.title'))).toBeInTheDocument();
    expect(screen.getAllByText(ADMIN.email).length).toBeGreaterThan(0);
    expect(await screen.findByText(ORGANIZATION.name)).toBeInTheDocument();
    expect(screen.getByText(ORGANIZATION.taxId)).toBeInTheDocument();
    // #506: the organization is edited on its own page
    expect(screen.getByRole('link', { name: t('settings:organization.edit') })).toHaveAttribute(
      'href',
      '/organization',
    );

    expect(await screen.findByText('Ion Popescu')).toBeInTheDocument();
    expect(screen.getByText(t('team:status_short.invite_sent'))).toBeInTheDocument();
    expect(screen.getByRole('link', { name: t('settings:team.manage') })).toHaveAttribute(
      'href',
      '/organization/team',
    );
  });

  it('inviting an admin from Setări asks for the emailed code (#508)', async () => {
    renderPage(<Settings />, { route: '/settings' });
    await userEvent.click(screen.getByText(t('settings:team.invite')));
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText(t('settings:security.code.send'))).toBeInTheDocument();
  });

  it('Notificări: the address the emails go to, with no toggles we do not support', () => {
    renderPage(<Settings />, { route: '/settings?tab=notifications' });
    expect(screen.getByText(t('settings:notifications.title'))).toBeInTheDocument();
    expect(screen.getByText(ADMIN.email)).toBeInTheDocument();
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
    expect(screen.queryByRole('switch')).not.toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: t('settings:notifications.approvals_link') }),
    ).toHaveAttribute('href', '/approvals');
  });

  it('Despre și sprijin: opens the configured links in a new tab and hides missing ones', () => {
    vi.stubEnv('VITE_TERMS_URL', 'https://vic.test/terms');
    vi.stubEnv('VITE_PRIVACY_URL', 'https://vic.test/privacy');
    vi.stubEnv('VITE_HELP_CENTER_URL', '');
    renderPage(<Settings />, { route: '/settings?tab=about' });

    const terms = screen.getByRole('link', { name: t('settings:about.terms') });
    expect(terms).toHaveAttribute('href', 'https://vic.test/terms');
    expect(terms).toHaveAttribute('target', '_blank');
    expect(screen.getByRole('link', { name: t('settings:about.privacy') })).toHaveAttribute(
      'href',
      'https://vic.test/privacy',
    );
    expect(screen.queryByRole('link', { name: t('settings:about.help') })).not.toBeInTheDocument();
  });

  it('switching tabs keeps the tab in the URL', async () => {
    renderPage(<Settings />, { route: '/settings' });
    await userEvent.click(screen.getByLabelText(t('settings:tabs.security')));
    expect(await screen.findByText(t('settings:security.data_title'))).toBeInTheDocument();
    expect(screen.queryByText(t('settings:account.title'))).not.toBeInTheDocument();
  });

  // #508
  describe('Date și securitate', () => {
    // #593: the export and the backup need the emailed code
    it('exports every volunteer after the emailed code, and links to the history', async () => {
      let exportCode: string | null = null;
      let action: unknown;
      server.use(
        http.post(api('/security/code'), async ({ request }) => {
          action = await request.json();
          return HttpResponse.json({ maskedEmail: 'a•••@ong.test' });
        }),
        http.get(api('/volunteer/download'), ({ request }) => {
          exportCode = request.headers.get('x-sensitive-code');
          return new HttpResponse(new ArrayBuffer(1));
        }),
      );
      renderPage(<Settings />, { route: '/settings?tab=security' });
      expect(
        screen.getByRole('link', { name: t('settings:security.history.action') }),
      ).toHaveAttribute('href', '/actions-archive');
      await userEvent.click(
        screen.getByRole('button', { name: t('settings:security.export.action') }),
      );
      const dialog = await screen.findByRole('dialog');
      const confirm = within(dialog).getByRole('button', {
        name: t('settings:security.download_code.confirm'),
      });
      expect(confirm).toBeDisabled();
      expect(exportCode).toBeNull();

      await userEvent.click(
        within(dialog).getByRole('button', { name: t('settings:security.code.send') }),
      );
      await userEvent.type(
        await within(dialog).findByLabelText(t('settings:security.code.label')),
        '123456',
      );
      await userEvent.click(confirm);
      await waitFor(() => expect(downloadExcel).toHaveBeenCalled());
      expect(action).toEqual({ action: 'EXPORT_VOLUNTEERS' });
      expect(exportCode).toBe('123456');
    });

    it.each(['AUTH_005', 'AUTH_015'])('shows %s when the backup code is refused', async (code) => {
      server.use(
        http.post(api('/security/code'), () => HttpResponse.json({ maskedEmail: 'a•••@ong.test' })),
        http.get(api('/security/backup'), () =>
          HttpResponse.json({ statusCode: 400, code_error: code }, { status: 400 }),
        ),
      );
      renderPage(<Settings />, { route: '/settings?tab=security' });
      await userEvent.click(
        screen.getByRole('button', { name: t('settings:security.backup.action') }),
      );
      const dialog = await screen.findByRole('dialog');
      await userEvent.click(
        within(dialog).getByRole('button', { name: t('settings:security.code.send') }),
      );
      await userEvent.type(
        await within(dialog).findByLabelText(t('settings:security.code.label')),
        '000000',
      );
      await userEvent.click(
        within(dialog).getByRole('button', { name: t('settings:security.download_code.confirm') }),
      );
      await waitFor(() => expect(useErrorToast).toHaveBeenCalledWith(t(`auth:errors.${code}`)));
      expect(downloadExcel).not.toHaveBeenCalled();
    });

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
      renderPage(<Settings />, { route: '/settings?tab=security', auth: { refreshProfile } });
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
      renderPage(<Settings />, { route: '/settings?tab=security', auth: { logout } });
      await waitFor(() =>
        expect(screen.getByRole('button', { name: t('settings:danger.action') })).toBeEnabled(),
      );
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
