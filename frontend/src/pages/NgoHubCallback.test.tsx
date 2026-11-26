import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { Route } from 'react-router-dom';
import NgoHubCallback from './NgoHubCallback';
import { LocationProbe, renderPage, t } from '../test/render';
import { ADMIN, api, businessError, server } from '../test/server';

const ROUTE =
  '/login/ngohub/callback?code=the-code&state=the-state&iss=https%3A%2F%2Fid.ngohub.test';
const SESSION = { accessToken: 'access', expiresIn: 900, user: ADMIN };
const REGISTRATION = {
  ticket: 't'.repeat(43),
  prefill: {
    organization: {
      name: 'Asociatia din NGO Hub',
      taxId: '12345678',
      email: 'contact@ngo.test',
      phone: '+40712345678',
      address: 'Str. Exemplu 1',
      description: '',
      website: '',
      logoUrl: null,
    },
    admin: { email: 'ana@ngo.test', firstName: 'Ana', lastName: 'Pop' },
  },
};

const render = (route = ROUTE) =>
  renderPage(<NgoHubCallback />, {
    route,
    path: '/login/ngohub/callback',
    auth: { isAuthenticated: false },
    routes: (
      <>
        <Route path="/" element={<LocationProbe />} />
        <Route path="/register/ngohub" element={<LocationProbe />} />
      </>
    ),
  });

const capture = (answer: () => Response) => {
  const bodies: unknown[] = [];
  server.use(
    http.post(api('/auth/web/ngohub/callback'), async ({ request }) => {
      bodies.push(await request.json());
      return answer();
    }),
  );
  return bodies;
};

describe('NGO Hub callback page', () => {
  it('posts the code, state and iss once, and starts the session', async () => {
    const bodies = capture(() => HttpResponse.json(SESSION));
    const { auth } = render();

    await waitFor(() => expect(auth.startSession).toHaveBeenCalledWith(SESSION));
    expect(bodies).toEqual([
      { code: 'the-code', state: 'the-state', iss: 'https://id.ngohub.test' },
    ]);
    expect(await screen.findByTestId('location')).toHaveTextContent(/^\/$/);
  });

  it('takes an unknown NGO to the prefilled registration, with the ticket in the history state', async () => {
    capture(() => HttpResponse.json({ registration: REGISTRATION }));
    const { auth } = render();

    const location = await screen.findByTestId('location');
    expect(location).toHaveTextContent('/register/ngohub');
    expect(JSON.parse(location.dataset.state as string)).toEqual(REGISTRATION);
    expect(auth.startSession).not.toHaveBeenCalled();
  });

  it('shows why the API refused, e.g. an employee (AUTH_017)', async () => {
    capture(() => businessError(403, 'AUTH_017'));
    render();
    expect(await screen.findByText(t('auth:errors.AUTH_017'))).toBeInTheDocument();
  });

  it('takes the code out of the URL before showing anything', async () => {
    capture(() => businessError(401, 'AUTH_019'));
    renderPage(
      <>
        <NgoHubCallback />
        <LocationProbe />
      </>,
      { route: ROUTE, path: '/login/ngohub/callback', auth: { isAuthenticated: false } },
    );
    await waitFor(() =>
      expect(screen.getByTestId('location')).toHaveTextContent(/^\/login\/ngohub\/callback$/),
    );
    await screen.findByText(t('auth:errors.AUTH_019'));
  });

  it('a cancel in NGO Hub calls nothing', async () => {
    const bodies = capture(() => HttpResponse.json(SESSION));
    render('/login/ngohub/callback?error=access_denied&state=s');
    expect(await screen.findByText(t('ngohub:callback.cancelled'))).toBeInTheDocument();
    expect(bodies).toEqual([]);
  });

  it('hides the page URL from the Referer while it is shown', async () => {
    capture(() => businessError(401, 'AUTH_019'));
    const { unmount } = render();
    await screen.findByText(t('auth:errors.AUTH_019'));
    expect(document.querySelector('meta[name="referrer"]')?.getAttribute('content')).toBe(
      'no-referrer',
    );
    unmount();
    expect(document.querySelector('meta[name="referrer"]')).toBeNull();
  });
});
