import React from 'react';
import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route } from 'react-router-dom';
import RootRoute from './RootRoute';
import NotFound from '../pages/NotFound';
import { renderPage, t } from '../test/render';
import i18n from '../common/config/i18n';

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

  it('a language change draws the logged-in area again, without leaving the page', async () => {
    await i18n.changeLanguage('ro');
    const Page = () => (
      <label>
        note <input defaultValue="" />
        <span>{i18n.t('general:save')}</span>
      </label>
    );
    renderPage(<NotFound />, {
      route: '/organization',
      routes: (
        <Route path="/" element={<RootRoute />}>
          <Route path="organization" element={<Page />} />
        </Route>
      ),
    });
    await userEvent.type(screen.getByLabelText(/note/), 'unsaved');
    expect(screen.getByText(i18n.t('general:save', { lng: 'ro' }))).toBeInTheDocument();

    await act(async () => {
      await i18n.changeLanguage('en');
    });

    // a text read while drawing, by a page that does not listen for the language
    expect(screen.getByText(i18n.t('general:save', { lng: 'en' }))).toBeInTheDocument();
    expect(screen.getByText('app-layout')).toBeInTheDocument();
    // the price of the redraw: an unsaved form on the open page is emptied
    expect(screen.getByLabelText(/note/)).toHaveValue('');
  });

  it('an unknown route is a 404', () => {
    renderPage(<NotFound />, { route: '/nope', routes });
    expect(screen.getByRole('heading', { name: t('not_found:title') })).toBeInTheDocument();
  });
});
