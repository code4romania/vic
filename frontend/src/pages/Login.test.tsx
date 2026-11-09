import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import Login from './Login';
import { renderPage, t } from '../test/render';
import { api, businessError, server } from '../test/server';

const fill = async (email = 'ana@ong.test') => {
  await userEvent.type(screen.getByLabelText(t('login:form.email.label')), email);
  await userEvent.click(screen.getByRole('button', { name: t('login:submit') }));
};

const captureRequests = () => {
  const bodies: unknown[] = [];
  server.use(
    http.post(api('/auth/web/login/request'), async ({ request }) => {
      bodies.push(await request.json());
      return new HttpResponse(null, { status: 204 });
    }),
  );
  return bodies;
};

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe('Login (magic link, #514)', () => {
  it('has no password field and no forgot-password link', () => {
    renderPage(<Login />, { auth: { isAuthenticated: false } });
    expect(document.querySelector('input[type="password"]')).toBeNull();
    expect(screen.queryByRole('link', { name: /parol|password/i })).toBeNull();
  });

  it('blocks an invalid email without calling the API', async () => {
    const bodies = captureRequests();
    renderPage(<Login />, { auth: { isAuthenticated: false } });
    await fill('not-an-email');
    expect(await screen.findByText(t('login:form.email.invalid'))).toBeInTheDocument();
    expect(bodies).toHaveLength(0);
  });

  it('asks for a link and shows "check your email"', async () => {
    const bodies = captureRequests();
    renderPage(<Login />, { auth: { isAuthenticated: false } });
    await fill('  ana@ong.test ');
    expect(
      await screen.findByText(t('login:sent.description', { email: 'ana@ong.test' })),
    ).toBeInTheDocument();
    expect(bodies).toEqual([{ email: 'ana@ong.test' }]);
  });

  it('"Send again" asks for another link for the same email', async () => {
    const bodies = captureRequests();
    renderPage(<Login />, { auth: { isAuthenticated: false } });
    await fill();
    await userEvent.click(await screen.findByRole('button', { name: t('login:sent.again') }));
    await waitFor(() => expect(bodies).toHaveLength(2));
    expect(bodies[1]).toEqual({ email: 'ana@ong.test' });
  });

  it('"Use another email" goes back to the form', async () => {
    captureRequests();
    renderPage(<Login />, { auth: { isAuthenticated: false } });
    await fill();
    await userEvent.click(await screen.findByRole('button', { name: t('login:sent.other_email') }));
    expect(screen.getByLabelText(t('login:form.email.label'))).toBeInTheDocument();
  });

  it.each([
    ['AUTH_010', 429],
    ['AUTH_004', 403],
  ])('shows the %s message', async (code, status) => {
    server.use(http.post(api('/auth/web/login/request'), () => businessError(status, code)));
    renderPage(<Login />, { auth: { isAuthenticated: false } });
    await fill();
    expect(await screen.findByRole('alert')).toHaveTextContent(t(`auth:errors.${code}`));
  });

  it('AUTH_012 shows the volunteer box with Open the app and the store links on a phone', async () => {
    vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue(
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)',
    );
    server.use(http.post(api('/auth/web/login/request'), () => businessError(409, 'AUTH_012')));
    renderPage(<Login />, { auth: { isAuthenticated: false } });
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
    server.use(http.post(api('/auth/web/login/request'), () => businessError(409, 'AUTH_012')));
    renderPage(<Login />, { auth: { isAuthenticated: false } });
    await fill('vol@ong.test');
    await screen.findByText(t('login:volunteer_account.title'));
    expect(screen.queryByRole('link', { name: t('auth:open_app') })).toBeNull();
    expect(screen.getByRole('link', { name: 'App Store' })).toBeInTheDocument();
  });

  it('shows the migration notice until VITE_MIGRATION_NOTICE_UNTIL', () => {
    renderPage(<Login />, { auth: { isAuthenticated: false } });
    expect(screen.getByText(t('login:migration_notice'))).toBeInTheDocument();
  });

  it('hides the migration notice after the date', () => {
    vi.stubEnv('VITE_MIGRATION_NOTICE_UNTIL', '2000-01-01');
    renderPage(<Login />, { auth: { isAuthenticated: false } });
    expect(screen.queryByText(t('login:migration_notice'))).toBeNull();
  });
});
