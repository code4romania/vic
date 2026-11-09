import React, { ReactElement, ReactNode } from 'react';
import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthContext, AuthContextProps } from '../contexts/auth/AuthContext';
import i18n from '../common/config/i18n';
import { ADMIN } from './server';

export const t = (key: string, options?: Record<string, unknown>): string =>
  i18n.t(key, options) as string;

export const newQueryClient = () =>
  new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });

export const authValue = (overrides: Partial<AuthContextProps> = {}): AuthContextProps => ({
  isAuthenticated: true,
  profile: ADMIN,
  isSuperAdmin: false,
  logout: vi.fn(),
  startSession: vi.fn(),
  ...overrides,
});

interface Options {
  route?: string;
  // The route pattern the element is mounted on, e.g. "/login/link".
  path?: string;
  auth?: Partial<AuthContextProps>;
  // Extra routes, e.g. a stub "/" to see where a page navigates.
  routes?: ReactNode;
}

// The page inside the providers it needs, with a fake AuthContext.
export const renderPage = (element: ReactElement, options: Options = {}) => {
  const { route = '/', path = '*', auth, routes } = options;
  const value = authValue(auth);
  const queryClient = newQueryClient();
  const result = render(
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={value}>
        <MemoryRouter initialEntries={[route]}>
          <Routes>
            {routes}
            <Route path={path} element={element} />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    </QueryClientProvider>,
  );
  return { ...result, auth: value, queryClient };
};
