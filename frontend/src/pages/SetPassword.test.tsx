import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { Route } from 'react-router-dom';
import SetPassword from './SetPassword';
import { renderPage, t } from '../test/render';
import { ADMIN, api, businessError, server } from '../test/server';
import { ITokenInfo } from '../common/interfaces/auth.interface';

const tokenInfo = (info: Partial<ITokenInfo>) =>
  server.use(
    http.get(api('/auth/token/:secret'), () =>
      HttpResponse.json({
        type: 'invite',
        purpose: 'transition',
        realm: 'web',
        maskedEmail: 'a•••@ong.test',
        ...info,
      }),
    ),
  );

const open = (auth = {}) =>
  renderPage(<SetPassword />, {
    route: '/set-password?token=secret-1',
    path: '/set-password',
    auth,
    routes: <Route path="/" element={<div>home</div>} />,
  });

const choose = async (password: string, confirm = password) => {
  await userEvent.type(
    await screen.findByLabelText(t('set_password:form.password.label')),
    password,
  );
  await userEvent.type(screen.getByLabelText(t('set_password:form.confirm.label')), confirm);
  await userEvent.click(screen.getByRole('button', { name: t('set_password:submit') }));
};

describe('SetPassword', () => {
  it.each([
    ['transition', 'set_password:title.transition'],
    ['invite', 'set_password:title.invite'],
    ['reset', 'set_password:title.reset'],
  ] as const)('words a %s link by its purpose (R16)', async (purpose, key) => {
    tokenInfo({ purpose, organizationName: 'Asociatia Test' });
    open();
    expect(
      await screen.findByRole('heading', { name: t(key, { organization: 'Asociatia Test' }) }),
    ).toBeInTheDocument();
    expect(screen.queryByText(t('set_password:description.volunteer_social'))).toBeNull();
  });

  it("a volunteer's transition link adds the social sign-in sentence (R36)", async () => {
    tokenInfo({ purpose: 'transition', realm: 'mobile' });
    open();
    expect(
      await screen.findByText(t('set_password:description.volunteer_social')),
    ).toBeInTheDocument();
  });

  it('refuses a weak password and a mismatched confirmation', async () => {
    const setPassword = vi.fn();
    server.use(
      http.post(api('/auth/set-password'), () => {
        setPassword();
        return HttpResponse.json({});
      }),
    );
    open();
    await choose('weak', 'other');
    expect(await screen.findAllByText(t('set_password:form.password.rule'))).not.toHaveLength(0);
    expect(screen.getByText(t('set_password:form.confirm.mismatch'))).toBeInTheDocument();
    expect(setPassword).not.toHaveBeenCalled();
  });

  it('web realm: starts the session and goes to /', async () => {
    const startSession = vi.fn().mockResolvedValue(undefined);
    open({ startSession });
    await choose('Secret#123');
    await waitFor(() =>
      expect(startSession).toHaveBeenCalledWith({
        accessToken: 'access-2',
        expiresIn: 900,
        user: ADMIN,
      }),
    );
    expect(await screen.findByText('home')).toBeInTheDocument();
  });

  it('mobile realm: Open the app with the email, no session (R17)', async () => {
    vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue('Mozilla/5.0 (Linux; Android 14)');
    tokenInfo({ purpose: 'transition', realm: 'mobile' });
    server.use(
      http.post(api('/auth/set-password'), () =>
        HttpResponse.json({ realm: 'mobile', email: 'vol@ong.test' }),
      ),
    );
    const startSession = vi.fn();
    open({ startSession });
    await choose('Secret#123');

    expect(await screen.findByText(t('set_password:done.open_app'))).toBeInTheDocument();
    expect(screen.getByRole('link', { name: t('auth:open_app') })).toHaveAttribute(
      'href',
      'vic://login?email=vol%40ong.test',
    );
    expect(startSession).not.toHaveBeenCalled();
    vi.restoreAllMocks();
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

  it('a link that dies between load and submit (AUTH_005) switches to the expired state', async () => {
    server.use(http.post(api('/auth/set-password'), () => businessError(400, 'AUTH_005')));
    open();
    await choose('Secret#123');
    expect(await screen.findByText(t('auth:expired_link.description'))).toBeInTheDocument();
  });
});
