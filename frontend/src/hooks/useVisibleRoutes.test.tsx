import React, { ReactNode } from 'react';
import { renderHook } from '@testing-library/react';
import { findParentRoute, useVisibleRoutes } from './useVisibleRoutes';
import { AuthContext } from '../contexts/auth/AuthContext';
import { authValue } from '../test/render';

const wrapper = (isSuperAdmin: boolean) => {
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <AuthContext.Provider value={authValue({ isSuperAdmin })}>{children}</AuthContext.Provider>
  );
  return Wrapper;
};

describe('useVisibleRoutes', () => {
  it('hides super-admin-only entries from plain admins', () => {
    const { result } = renderHook(() => useVisibleRoutes(), { wrapper: wrapper(false) });
    expect(result.current.map((route) => route.href)).not.toContain('admin/validation');
    expect(
      result.current
        .find((route) => route.href === 'organization')
        ?.childRoutes?.map((c) => c.href),
    ).toEqual(['organization', 'organization/team']);
  });

  it('shows them to super admins', () => {
    const { result } = renderHook(() => useVisibleRoutes(), { wrapper: wrapper(true) });
    expect(result.current.map((route) => route.href)).toContain('admin/validation');
  });

  it('finds the entry for a path, including two-segment ones', () => {
    const { result } = renderHook(() => useVisibleRoutes(), { wrapper: wrapper(true) });
    expect(findParentRoute(result.current, '/admin/validation')?.href).toBe('admin/validation');
    expect(findParentRoute(result.current, '/organization/team')?.href).toBe('organization');
    expect(findParentRoute(result.current, '/events/1')?.href).toBe('events');
  });
});
