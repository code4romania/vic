import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Login from '../pages/Login';
import { renderPage, t } from '../test/render';
import { markNgoHubPromptLogin } from './NgoHubLoginButton';

const START = 'http://api.test/auth/web/ngohub/start';

describe('Continue with NGO Hub on the login page', () => {
  const assign = vi.fn();

  beforeEach(() => {
    assign.mockReset();
    localStorage.clear();
    vi.stubGlobal('location', { ...window.location, assign });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('is hidden unless VITE_NGOHUB_ENABLED is true', () => {
    vi.stubEnv('VITE_NGOHUB_ENABLED', '');
    renderPage(<Login />, { auth: { isAuthenticated: false } });
    expect(screen.queryByRole('button', { name: t('login:ngohub') })).toBeNull();
  });

  it('goes to the API start route; after a VIC logout once with prompt=login', async () => {
    vi.stubEnv('VITE_NGOHUB_ENABLED', 'true');
    renderPage(<Login />, { auth: { isAuthenticated: false } });
    const button = screen.getByRole('button', { name: t('login:ngohub') });

    await userEvent.click(button);
    expect(assign).toHaveBeenLastCalledWith(START);

    markNgoHubPromptLogin();
    await userEvent.click(button);
    expect(assign).toHaveBeenLastCalledWith(`${START}?prompt=login`);

    await userEvent.click(button);
    expect(assign).toHaveBeenLastCalledWith(START);
  });

  it('shows the error /start sent the browser back with', () => {
    renderPage(<Login />, {
      auth: { isAuthenticated: false },
      route: '/login?ngohub_error=AUTH_020',
    });
    expect(screen.getByText(t('auth:errors.AUTH_020'))).toBeInTheDocument();
  });
});
