import React from 'react';
import { screen } from '@testing-library/react';
import { Route } from 'react-router-dom';
import RootRoute from './RootRoute';
import NotFound from '../pages/NotFound';
import { renderPage, t } from '../test/render';

vi.mock('../layouts/MainLayout', async () => {
  const { Outlet } = await import('react-router-dom');
  return {
    default: () => (
      <div>
        app-layout
        <Outlet />
      </div>
    ),
  };
});

const routes = (
  <>
    <Route path="/" element={<RootRoute />}>
      <Route index element={<div>dashboard</div>} />
      <Route path="organization" element={<div>organization page</div>} />
    </Route>
    <Route path="/login" element={<div>login page</div>} />
  </>
);

describe('RootRoute (R29)', () => {
  it('"/" shows the landing page when logged out', () => {
    renderPage(<NotFound />, { route: '/', routes, auth: { isAuthenticated: false } });
    expect(screen.getByRole('heading', { name: t('landing:title') })).toBeInTheDocument();
    expect(screen.queryByText('dashboard')).not.toBeInTheDocument();
  });

  it('"/" shows the dashboard when logged in', () => {
    renderPage(<NotFound />, { route: '/', routes });
    expect(screen.getByText('dashboard')).toBeInTheDocument();
  });

  it('a private page logged out goes to /login', () => {
    renderPage(<NotFound />, {
      route: '/organization',
      routes,
      auth: { isAuthenticated: false },
    });
    expect(screen.getByText('login page')).toBeInTheDocument();
  });

  it('an unknown route is a 404', () => {
    renderPage(<NotFound />, { route: '/nope', routes });
    expect(screen.getByRole('heading', { name: t('not_found:title') })).toBeInTheDocument();
  });
});
