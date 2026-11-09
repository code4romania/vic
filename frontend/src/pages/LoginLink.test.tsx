import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { Route } from 'react-router-dom';
import LoginLink from './LoginLink';
import { renderPage, t } from '../test/render';
import { ADMIN, api, businessError, server } from '../test/server';
import { ITokenInfo } from '../common/interfaces/auth.interface';

const tokenInfo = (info: Partial<ITokenInfo>) =>
  server.use(
    http.get(api('/auth/token/:secret'), () =>
      HttpResponse.json({
        type: 'login',
        purpose: 'login',
        realm: 'web',
        maskedEmail: 'a•••@ong.test',
        ...info,
      }),
    ),
  );

const open = (auth = {}) =>
  renderPage(<LoginLink />, {
    route: '/login/link?token=secret-1',
    path: '/login/link',
    auth,
    routes: <Route path="/" element={<div>home</div>} />,
  });

const countLinkCalls = () => {
  const calls: unknown[] = [];
  server.use(
    http.post(api('/auth/login-link'), async ({ request }) => {
      calls.push(await request.json());
      return HttpResponse.json({ accessToken: 'access-2', expiresIn: 900, user: ADMIN });
    }),
  );
  return calls;
};

describe('LoginLink (#514)', () => {
  it.each([
    ['login', 'login_link:title.login'],
    ['transition', 'login_link:title.transition'],
    ['invite', 'login_link:title.invite'],
  ] as const)('words a %s link by its purpose', async (purpose, key) => {
    tokenInfo({
      purpose,
      type: purpose === 'login' ? 'login' : 'invite',
      organizationName: 'Asociatia Test',
    });
    open();
    expect(
      await screen.findByRole('heading', { name: t(key, { organization: 'Asociatia Test' }) }),
    ).toBeInTheDocument();
  });

  it('does not use the token on page load (email scanners prefetch links)', async () => {
    const calls = countLinkCalls();
    open();
    await screen.findByRole('button', { name: t('login_link:submit') });
    expect(calls).toHaveLength(0);
  });

  it('the button logs in, starts the session and goes to /', async () => {
    const calls = countLinkCalls();
    const startSession = vi.fn().mockResolvedValue(undefined);
    open({ startSession });
    await userEvent.click(await screen.findByRole('button', { name: t('login_link:submit') }));
    await waitFor(() =>
      expect(startSession).toHaveBeenCalledWith({
        accessToken: 'access-2',
        expiresIn: 900,
        user: ADMIN,
      }),
    );
    expect(calls).toEqual([{ token: 'secret-1' }]);
    expect(await screen.findByText('home')).toBeInTheDocument();
  });

  it('a volunteer link points to the app and never posts the token', async () => {
    const calls = countLinkCalls();
    tokenInfo({ purpose: 'transition', type: 'invite', realm: 'mobile' });
    open();
    expect(await screen.findByText(t('login_link:volunteer.open_app'))).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: t('login_link:submit') })).toBeNull();
    expect(calls).toHaveLength(0);
  });

  it('an email confirmation link goes to /confirm-email', async () => {
    tokenInfo({ purpose: 'verify_email', type: 'verify_email' });
    renderPage(<LoginLink />, {
      route: '/login/link?token=secret-1',
      path: '/login/link',
      routes: <Route path="/confirm-email" element={<div>confirm page</div>} />,
    });
    expect(await screen.findByText('confirm page')).toBeInTheDocument();
  });

  it('an expired link (AUTH_005) offers a new one, ending in "check your email"', async () => {
    let resent = false;
    server.use(
      http.get(api('/auth/token/:secret'), () => businessError(400, 'AUTH_005')),
      http.post(api('/auth/token/:secret/resend'), () => {
        resent = true;
        return new HttpResponse(null, { status: 200 });
      }),
    );
    open();
    await userEvent.click(
      await screen.findByRole('button', { name: t('auth:expired_link.resend') }),
    );
    expect(await screen.findByText(t('auth:expired_link.sent'))).toBeInTheDocument();
    expect(resent).toBe(true);
  });

  it('a link that dies before the click (AUTH_005) switches to the expired state', async () => {
    server.use(http.post(api('/auth/login-link'), () => businessError(400, 'AUTH_005')));
    open();
    await userEvent.click(await screen.findByRole('button', { name: t('login_link:submit') }));
    expect(await screen.findByText(t('auth:expired_link.description'))).toBeInTheDocument();
  });

  it('a disabled login (AUTH_004) shows the message and stays on the page', async () => {
    server.use(http.post(api('/auth/login-link'), () => businessError(403, 'AUTH_004')));
    open();
    await userEvent.click(await screen.findByRole('button', { name: t('login_link:submit') }));
    expect(await screen.findByRole('alert')).toHaveTextContent(t('auth:errors.AUTH_004'));
  });

  it('no token: the expired state with a link back to the login page', async () => {
    renderPage(<LoginLink />, { route: '/login/link', path: '/login/link' });
    expect(
      await screen.findByRole('link', { name: t('auth:expired_link.new_login') }),
    ).toHaveAttribute('href', '/login');
  });
});
