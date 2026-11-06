import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { Route } from 'react-router-dom';
import ConfirmEmail from './ConfirmEmail';
import { renderPage, t } from '../test/render';
import { api, businessError, server } from '../test/server';

const open = (auth = {}) =>
  renderPage(<ConfirmEmail />, {
    route: '/confirm-email?token=secret-1',
    path: '/confirm-email',
    auth,
    routes: <Route path="/" element={<div>home</div>} />,
  });

describe('ConfirmEmail', () => {
  it('NGO link: confirms once, starts the session, goes to /', async () => {
    let calls = 0;
    server.use(
      http.post(api('/auth/confirm-email'), () => {
        calls++;
        return HttpResponse.json({ accessToken: 'access-3', expiresIn: 900 });
      }),
    );
    const startSession = vi.fn().mockResolvedValue(undefined);
    open({ startSession });

    expect(await screen.findByText('home')).toBeInTheDocument();
    expect(startSession).toHaveBeenCalledWith({ accessToken: 'access-3', expiresIn: 900 });
    expect(calls).toBe(1);
  });

  it('mobile link: "Email confirmed. Open the app" with the email, no session (R17)', async () => {
    vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue('Mozilla/5.0 (iPhone)');
    server.use(
      http.post(api('/auth/confirm-email'), () =>
        HttpResponse.json({ realm: 'mobile', email: 'vol@ong.test' }),
      ),
    );
    const startSession = vi.fn();
    open({ startSession });

    expect(await screen.findByText(t('confirm_email:done.open_app'))).toBeInTheDocument();
    expect(screen.getByRole('link', { name: t('auth:open_app') })).toHaveAttribute(
      'href',
      'vic://login?email=vol%40ong.test',
    );
    expect(startSession).not.toHaveBeenCalled();
    vi.restoreAllMocks();
  });

  it('a dead link offers a new one', async () => {
    let resent = false;
    server.use(
      http.post(api('/auth/confirm-email'), () => businessError(400, 'AUTH_005')),
      http.post(api('/auth/token/:secret/resend'), () => {
        resent = true;
        return new HttpResponse(null, { status: 200 });
      }),
    );
    open();
    await userEvent.click(
      await screen.findByRole('button', { name: t('auth:expired_link.resend') }),
    );
    await waitFor(() => expect(resent).toBe(true));
    expect(await screen.findByText(t('auth:expired_link.sent'))).toBeInTheDocument();
  });
});
