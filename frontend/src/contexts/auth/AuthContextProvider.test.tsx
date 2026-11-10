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
});
