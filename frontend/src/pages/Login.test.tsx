import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { Route } from 'react-router-dom';
import { AxiosError } from 'axios';
import Login from './Login';
import { renderPage, t } from '../test/render';
import { api, server } from '../test/server';

const apiError = (status: number, code_error: string) =>
  Object.assign(new AxiosError('failed'), {
    response: { status, data: { code_error, message: code_error } },
  });

const fill = async (email = 'ana@ong.test', password = 'Secret#123') => {
  await userEvent.type(screen.getByLabelText(t('login:form.email.label')), email);
  await userEvent.type(screen.getByLabelText(t('login:form.password.label')), password);
  await userEvent.click(screen.getByRole('button', { name: t('login:submit') }));
};

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe('Login', () => {
  it('blocks an invalid email without calling login', async () => {
    const { auth } = renderPage(<Login />, { auth: { isAuthenticated: false } });
    await fill('not-an-email');
    expect(await screen.findByText(t('login:form.email.invalid'))).toBeInTheDocument();
    expect(auth.login).not.toHaveBeenCalled();
  });

  it('logs in and goes to /', async () => {
    const login = vi.fn().mockResolvedValue(undefined);
    renderPage(<Login />, {
      route: '/login',
      path: '/login',
      auth: { isAuthenticated: false, login },
      routes: <Route path="/" element={<div>home</div>} />,
    });
    await fill();
    expect(login).toHaveBeenCalledWith('ana@ong.test', 'Secret#123');
    expect(await screen.findByText('home')).toBeInTheDocument();
  });

  it.each(['AUTH_001', 'AUTH_002', 'AUTH_003', 'AUTH_004'])(
    'shows the %s message',
    async (code) => {
      const login = vi.fn().mockRejectedValue(apiError(401, code));
      renderPage(<Login />, { auth: { isAuthenticated: false, login } });
      await fill();
      expect(await screen.findByRole('alert')).toHaveTextContent(t(`auth:errors.${code}`));
    },
  );

  it('never says an email was sent on a wrong password (AUTH_001)', async () => {
    const login = vi.fn().mockRejectedValue(apiError(401, 'AUTH_001'));
    renderPage(<Login />, { auth: { isAuthenticated: false, login } });
    await fill();
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(t('auth:errors.AUTH_001'));
    // "trimis" / "sent": nothing says a link or code went out.
    expect(alert).not.toHaveTextContent(/trimis|sent/i);
    expect(
      screen.queryByRole('button', { name: t('login:resend_verification.button') }),
    ).toBeNull();
  });

  it('AUTH_003 offers the confirmation resend on /auth/web/resend-verification (R15)', async () => {
    let body: unknown;
    server.use(
      http.post(api('/auth/web/resend-verification'), async ({ request }) => {
        body = await request.json();
        return new HttpResponse(null, { status: 200 });
      }),
    );
    const login = vi.fn().mockRejectedValue(apiError(403, 'AUTH_003'));
    renderPage(<Login />, { auth: { isAuthenticated: false, login } });
    await fill();

    await userEvent.click(
      await screen.findByRole('button', { name: t('login:resend_verification.button') }),
    );
    await waitFor(() => expect(body).toEqual({ email: 'ana@ong.test' }));
  });

  it('AUTH_012 shows the volunteer box with Open the app and the store links on a phone', async () => {
    vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue(
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)',
    );
    const login = vi.fn().mockRejectedValue(apiError(409, 'AUTH_012'));
    renderPage(<Login />, { auth: { isAuthenticated: false, login } });
    await fill('vol@ong.test');

    expect(await screen.findByText(t('login:volunteer_account.title'))).toBeInTheDocument();
    expect(screen.getByRole('link', { name: t('auth:open_app') })).toHaveAttribute(
      'href',
      'vic://login?email=vol%40ong.test',
    );
    expect(screen.getByRole('link', { name: 'App Store' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Google Play' })).toBeInTheDocument();
  });

  it('AUTH_012 on a desktop shows only the store links', async () => {
    const login = vi.fn().mockRejectedValue(apiError(409, 'AUTH_012'));
    renderPage(<Login />, { auth: { isAuthenticated: false, login } });
    await fill('vol@ong.test');
    await screen.findByText(t('login:volunteer_account.title'));
    expect(screen.queryByRole('link', { name: t('auth:open_app') })).toBeNull();
    expect(screen.getByRole('link', { name: 'App Store' })).toBeInTheDocument();
  });

  it('shows the migration notice until VITE_MIGRATION_NOTICE_UNTIL, and not after', () => {
    renderPage(<Login />, { auth: { isAuthenticated: false } });
    expect(screen.getByText(t('login:migration_notice'))).toBeInTheDocument();
  });

  it('hides the migration notice after the date', () => {
    vi.stubEnv('VITE_MIGRATION_NOTICE_UNTIL', '2000-01-01');
    renderPage(<Login />, { auth: { isAuthenticated: false } });
    expect(screen.queryByText(t('login:migration_notice'))).toBeNull();
  });
});
