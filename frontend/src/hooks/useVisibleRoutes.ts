import { useMemo } from 'react';
import { ROUTES } from '../common/constants/routes';
import { AdminRole, IChildRoute, IRoute } from '../common/interfaces/route.interface';
import { useAuth } from './useAuth';

const canSee = (route: IChildRoute, roles: AdminRole[]): boolean =>
  !route.roles || route.roles.some((role) => roles.includes(role));

// The menu entries the logged-in admin may see (SideMenu and SlidingMenu).
export const useVisibleRoutes = (): IRoute[] => {
  const { isSuperAdmin } = useAuth();

  return useMemo(() => {
    const roles: AdminRole[] = isSuperAdmin ? ['super_admin'] : [];
    return ROUTES.filter((route) => canSee(route, roles)).map((route) =>
      route.childRoutes
        ? { ...route, childRoutes: route.childRoutes.filter((child) => canSee(child, roles)) }
        : route,
    );
  }, [isSuperAdmin]);
};

// The menu entry for a path: "/admin/validation" belongs to the "admin/validation" entry.
export const findParentRoute = (routes: IRoute[], pathname: string): IRoute | undefined => {
  const [, first, second] = pathname.split('/');
  return routes.find((route) => {
    const [head, tail] = route.href.split('/');
    return head === first && (!tail || route.childRoutes?.length || tail === second);
  });
};
