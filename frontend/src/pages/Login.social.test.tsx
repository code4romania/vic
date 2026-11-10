import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { Route } from 'react-router-dom';
import Login from './Login';
import { renderPage, t } from '../test/render';
import { api, businessError, server } from '../test/server';

// The SDK scripts never load in jsdom: loadScript resolves and window.google / window.AppleID are fakes.
vi.mock('../common/utils/social-sdk', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../common/utils/social-sdk')>()),
  loadScript: vi.fn(() => Promise.resolve()),
}));

const SESSION = {
  accessToken: 'access',
  user: { id: 'u-1', name: 'Ana', email: 'ana@ong.test', superAdmin: false },
};

let googleCallback: ((response: { credential?: string }) => void) | undefined;
const appleSignIn = vi.fn();

const captureSocial = () => {
  const bodies: unknown[] = [];
  server.use(
    http.post(api('/auth/web/social'), async ({ request }) => {
      bodies.push(await request.json());
      return HttpResponse.json(SESSION);
    }),
  );
  return bodies;
};

beforeEach(() => {
  googleCallback = undefined;
  window.google = {
    accounts: {
      id: {
        initialize: ({ callback }) => {
          googleCallback = callback;
        },
        renderButton: (element) => {
          element.innerHTML = '<button type="button">Google</button>';
        },
      },
    },
  };
  window.AppleID = { auth: { init: vi.fn(), signIn: appleSignIn } };
});

afterEach(() => {
  vi.unstubAllEnvs();
  appleSignIn.mockReset();
  delete window.google;
  delete window.AppleID;
});

const withProviders = () => {
  vi.stubEnv('VITE_GOOGLE_CLIENT_ID', 'web-client.apps.googleusercontent.com');
  vi.stubEnv('VITE_APPLE_SERVICES_ID', 'org.commitglobal.vic.web');
};

describe('Login with Google and Apple (#512)', () => {
  it('shows no social button when no id is configured', () => {
    renderPage(<Login />, { auth: { isAuthenticated: false } });
    expect(screen.queryByTestId('google-signin')).toBeNull();
    expect(screen.queryByRole('button', { name: t('login:social.apple') })).toBeNull();
  });

  it('Google: the ID token starts a session and opens the dashboard', async () => {
    withProviders();
    const bodies = captureSocial();
    const { auth } = renderPage(<Login />, {
      auth: { isAuthenticated: false },
      route: '/login',
      path: '/login',
      routes: <Route path="/" element={<p>dashboard</p>} />,
    });

    await waitFor(() => expect(googleCallback).toBeDefined());
    googleCallback?.({ credential: 'google-id-token' });

    expect(await screen.findByText('dashboard')).toBeInTheDocument();
    expect(bodies).toEqual([{ provider: 'google', token: 'google-id-token' }]);
    expect(auth.startSession).toHaveBeenCalledWith(SESSION);
  });

  it('Apple: the popup token is sent; no admin account shows AUTH_014', async () => {
    withProviders();
    appleSignIn.mockResolvedValue({ authorization: { id_token: 'apple-id-token' } });
    let body: unknown;
    server.use(
      http.post(api('/auth/web/social'), async ({ request }) => {
        body = await request.json();
        return businessError(404, 'AUTH_014');
      }),
    );
    renderPage(<Login />, { auth: { isAuthenticated: false } });

    const apple = await screen.findByRole('button', { name: t('login:social.apple') });
    await waitFor(() => expect(apple).toBeEnabled());
    await userEvent.click(apple);

    expect(await screen.findByRole('alert')).toHaveTextContent(t('auth:errors.AUTH_014'));
    expect(body).toEqual({ provider: 'apple', token: 'apple-id-token' });
  });

  it('a volunteer account shows the open-the-app box', async () => {
    withProviders();
    server.use(http.post(api('/auth/web/social'), () => businessError(409, 'AUTH_012')));
    renderPage(<Login />, { auth: { isAuthenticated: false } });

    await waitFor(() => expect(googleCallback).toBeDefined());
    googleCallback?.({ credential: 'google-id-token' });

    expect(await screen.findByText(t('login:volunteer_account.title'))).toBeInTheDocument();
  });

  it('closing the Apple popup is not an error and sends nothing', async () => {
    withProviders();
    const bodies = captureSocial();
    appleSignIn.mockRejectedValue({ error: 'popup_closed_by_user' });
    renderPage(<Login />, { auth: { isAuthenticated: false } });

    const apple = await screen.findByRole('button', { name: t('login:social.apple') });
    await waitFor(() => expect(apple).toBeEnabled());
    await userEvent.click(apple);

    await waitFor(() => expect(appleSignIn).toHaveBeenCalled());
    expect(screen.queryByRole('alert')).toBeNull();
    expect(bodies).toHaveLength(0);
  });
});
