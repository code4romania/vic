import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { QueryClientProvider } from 'react-query';
import AuthContextProvider from './AuthContextProvider';
import { useAuth } from '../../hooks/useAuth';
import { ADMIN, api, businessError, server } from '../../test/server';
import { newQueryClient, t } from '../../test/render';
import API from '../../services/api';
import { tokenStore } from '../../services/auth/token.store';
import i18n from '../../common/config/i18n';
import { readStoredLanguage, storeLanguage } from '../../common/config/language';

const Probe = () => {
  const { isAuthenticated, isSuperAdmin, profile, logout } = useAuth();
  return (
    <div>
      <span>{isAuthenticated ? 'in' : 'out'}</span>
      <span>{isSuperAdmin ? 'super' : 'plain'}</span>
      <span>{profile?.name ?? 'nobody'}</span>
      <button onClick={() => logout()}>logout</button>
    </div>
  );
};

const renderProvider = () => {
  const queryClient = newQueryClient();
  queryClient.setQueryData(['organization'], { id: 'cached' });
  render(
    <QueryClientProvider client={queryClient}>
      <AuthContextProvider>
        <Probe />
      </AuthContextProvider>
    </QueryClientProvider>,
  );
  return queryClient;
};

describe('AuthContextProvider', () => {
  it('refresh ok → getMe → authenticated, isSuperAdmin from the presenter', async () => {
    server.use(
      http.post(api('/auth/web/refresh'), () =>
        HttpResponse.json({ accessToken: 'boot', expiresIn: 900 }),
      ),
      http.get(api('/auth/web/me'), () => HttpResponse.json({ ...ADMIN, superAdmin: true })),
    );
    renderProvider();

    expect(await screen.findByText('in')).toBeInTheDocument();
    expect(screen.getByText('super')).toBeInTheDocument();
    expect(screen.getByText(ADMIN.name)).toBeInTheDocument();
    expect(tokenStore.get()).toBe('boot');
  });

  it('refresh fails → logged out and no getMe', async () => {
    const me = vi.fn();
    server.use(
      http.get(api('/auth/web/me'), () => {
        me();
        return HttpResponse.json(ADMIN);
      }),
    );
    renderProvider();

    expect(await screen.findByText('out')).toBeInTheDocument();
    expect(me).not.toHaveBeenCalled();
  });

  it('logout flips the flag, clears the token and the query cache', async () => {
    server.use(
      http.post(api('/auth/web/refresh'), () =>
        HttpResponse.json({ accessToken: 'boot', expiresIn: 900 }),
      ),
    );
    const queryClient = renderProvider();
    await screen.findByText('in');

    await userEvent.click(screen.getByRole('button', { name: 'logout' }));

    await waitFor(() => expect(screen.getByText('out')).toBeInTheDocument());
    expect(tokenStore.get()).toBeNull();
    expect(queryClient.getQueryData(['organization'])).toBeUndefined();
  });

  it('403 AUTH_004 mid-session (organization suspended) logs out once and shows why (major 10)', async () => {
    const logouts = vi.fn();
    server.use(
      http.post(api('/auth/web/refresh'), () =>
        HttpResponse.json({ accessToken: 'boot', expiresIn: 900 }),
      ),
      http.get(api('/volunteer'), () => businessError(403, 'AUTH_004')),
      http.post(api('/auth/web/logout'), () => {
        logouts();
        return new HttpResponse(null, { status: 204 });
      }),
    );
    const queryClient = renderProvider();
    await screen.findByText('in');

    await Promise.allSettled([API.get('/volunteer'), API.get('/volunteer')]);

    expect(
      await screen.findByRole('heading', { name: t('auth:access_blocked.title') }),
    ).toBeInTheDocument();
    expect(screen.queryByText('in')).not.toBeInTheDocument();
    expect(tokenStore.get()).toBeNull();
    expect(queryClient.getQueryData(['organization'])).toBeUndefined();
    await waitFor(() => expect(logouts).toHaveBeenCalledTimes(1));
  });

  describe('the tab comes back into view (#690)', () => {
    const bootOk = () =>
      http.post(api('/auth/web/refresh'), () =>
        HttpResponse.json({ accessToken: 'boot', expiresIn: 900 }),
      );
    const showTab = () => {
      Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true });
      document.dispatchEvent(new Event('visibilitychange'));
    };

    it('the admin was disabled meanwhile: /me and the refresh are refused → logged out, cache dropped', async () => {
      let disabled = false;
      server.use(
        http.post(api('/auth/web/refresh'), () =>
          disabled
            ? businessError(401, 'AUTH_008')
            : HttpResponse.json({ accessToken: 'boot', expiresIn: 900 }),
        ),
        http.get(api('/auth/web/me'), () =>
          disabled ? new HttpResponse(null, { status: 401 }) : HttpResponse.json(ADMIN),
        ),
      );
      const queryClient = renderProvider();
      await screen.findByText('in');

      disabled = true;
      showTab();

      expect(await screen.findByText('out')).toBeInTheDocument();
      expect(tokenStore.get()).toBeNull();
      expect(queryClient.getQueryData(['organization'])).toBeUndefined();
    });

    it('the NGO was suspended meanwhile: 403 AUTH_004 → the access blocked screen', async () => {
      let suspended = false;
      server.use(
        bootOk(),
        http.get(api('/auth/web/me'), () =>
          suspended ? businessError(403, 'AUTH_004') : HttpResponse.json(ADMIN),
        ),
      );
      renderProvider();
      await screen.findByText('in');

      suspended = true;
      showTab();

      expect(
        await screen.findByRole('heading', { name: t('auth:access_blocked.title') }),
      ).toBeInTheDocument();
    });

    it('the session is still good: stays logged in, one check for focus + visibilitychange', async () => {
      const me = vi.fn();
      server.use(
        bootOk(),
        http.get(api('/auth/web/me'), () => {
          me();
          return HttpResponse.json({
            ...ADMIN,
            name: me.mock.calls.length > 1 ? 'Nume nou' : ADMIN.name,
          });
        }),
      );
      renderProvider();
      await screen.findByText('in');

      showTab();
      window.dispatchEvent(new Event('focus'));

      expect(await screen.findByText('Nume nou')).toBeInTheDocument();
      expect(screen.getByText('in')).toBeInTheDocument();
      expect(me).toHaveBeenCalledTimes(2); // bootstrap + one check
    });
  });
  describe('the account language', () => {
    const bootAs = (language: 'ro' | 'en' | null) => {
      const saves: unknown[] = [];
      server.use(
        http.post(api('/auth/web/refresh'), () =>
          HttpResponse.json({ accessToken: 'boot', expiresIn: 900 }),
        ),
        http.get(api('/auth/web/me'), () => HttpResponse.json({ ...ADMIN, language })),
        http.patch(api('/auth/web/language'), async ({ request }) => {
          const body = (await request.json()) as { language: string };
          saves.push(body);
          return HttpResponse.json({ language: body.language });
        }),
      );
      return saves;
    };

    it('an existing admin opens the app in the language of the account, not of the browser', async () => {
      await i18n.changeLanguage('en'); // an English browser
      const saves = bootAs('ro');
      renderProvider();

      expect(await screen.findByText('in')).toBeInTheDocument();
      expect(i18n.language).toBe('ro');
      expect(document.documentElement.lang).toBe('ro');
      expect(readStoredLanguage()).toEqual({ language: 'ro', pending: false });
      expect(saves).toEqual([]);
    });

    it('a language picked on the login page is saved on the account after login', async () => {
      await i18n.changeLanguage('en');
      storeLanguage('en', true);
      const saves = bootAs('ro');
      renderProvider();

      expect(await screen.findByText('in')).toBeInTheDocument();
      expect(i18n.language).toBe('en');
      await waitFor(() => expect(saves).toEqual([{ language: 'en', explicit: true }]));
    });

    it('a new account takes the language on screen, without overwriting', async () => {
      await i18n.changeLanguage('en');
      const saves = bootAs(null);
      renderProvider();

      expect(await screen.findByText('in')).toBeInTheDocument();
      await waitFor(() => expect(saves).toEqual([{ language: 'en', explicit: false }]));
      expect(i18n.language).toBe('en');
    });

    it('a failing language request never blocks the session', async () => {
      await i18n.changeLanguage('en');
      storeLanguage('en', true);
      server.use(
        http.post(api('/auth/web/refresh'), () =>
          HttpResponse.json({ accessToken: 'boot', expiresIn: 900 }),
        ),
        http.patch(api('/auth/web/language'), () => businessError(500, 'INTERNAL_ERROR')),
      );
      renderProvider();

      expect(await screen.findByText('in')).toBeInTheDocument();
      expect(readStoredLanguage()).toEqual({ language: 'en', pending: true });
    });

    it('a change made on another browser arrives when the tab comes back into view', async () => {
      let language: 'ro' | 'en' = 'ro';
      server.use(
        http.post(api('/auth/web/refresh'), () =>
          HttpResponse.json({ accessToken: 'boot', expiresIn: 900 }),
        ),
        http.get(api('/auth/web/me'), () => HttpResponse.json({ ...ADMIN, language })),
      );
      renderProvider();
      await screen.findByText('in');
      expect(i18n.language).toBe('ro');

      language = 'en';
      window.dispatchEvent(new Event('focus'));

      await waitFor(() => expect(i18n.language).toBe('en'));
      expect(screen.getByText('in')).toBeInTheDocument();
    });
  });
});
