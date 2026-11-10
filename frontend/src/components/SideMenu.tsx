import React, { useEffect, useState } from 'react';
import { ChevronDoubleLeftIcon, ChevronDoubleRightIcon } from '@heroicons/react/24/outline';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { findParentRoute, useVisibleRoutes } from '../hooks/useVisibleRoutes';
import { classNames } from '../common/utils/utils';
import { IChildRoute, IRoute } from '../common/interfaces/route.interface';
import MenuList from './MenuList';
import UserMenu from './UserMenu';
import logo from '../assets/images/app_logo.svg';

// Below xl (laptops, tablets in landscape) the menu starts as an icon rail, so the page keeps its
// width; the button at the bottom widens it.
const RAIL = '(max-width: 1279px)';
const startsNarrow = () =>
  typeof window !== 'undefined' && !!window.matchMedia && window.matchMedia(RAIL).matches;

const SideMenu = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const routes = useVisibleRoutes();
  const [isNarrow, setIsNarrow] = useState<boolean>(startsNarrow);

  useEffect(() => {
    const query = window.matchMedia?.(RAIL);
    if (!query) return;
    const onChange = (event: MediaQueryListEvent) => setIsNarrow(event.matches);
    query.addEventListener?.('change', onChange);
    return () => query.removeEventListener?.('change', onChange);
  }, []);
  const [activeParentRoute, setActiveParentRoute] = useState<IRoute>(routes[0]);
  const [activeSubRoute, setActiveSubRoute] = useState<IChildRoute | null>(null);
  const { t } = useTranslation('side_menu');

  useEffect(() => {
    const splittedLocation = location.pathname.split('/');
    const parentRoute = findParentRoute(routes, location.pathname);

    if (parentRoute?.childRoutes?.length) {
      const subRoute = parentRoute.childRoutes.find((childRoute) =>
        childRoute.href.includes(splittedLocation[2]),
      );

      if (subRoute) {
        setActiveSubRoute(subRoute);
      } else {
        setActiveSubRoute(parentRoute.childRoutes[0]);
      }

      setActiveParentRoute(parentRoute);
    } else if (parentRoute) {
      setActiveParentRoute(parentRoute);
      setActiveSubRoute(null);
    }
  }, [location, routes]);

  const onMenuItemClick = (item: IRoute, childRoute?: IChildRoute) => {
    navigate(childRoute ? `${childRoute.href}` : `${item.href}`);
  };

  return (
    <nav
      className={classNames(
        isNarrow ? 'w-[4.75rem]' : 'w-64',
        'transition-width duration-300 ease-out h-screen sticky top-0 flex flex-col bg-white select-none',
      )}
      aria-label={t('aria')}
    >
      <Link
        to="/"
        className={classNames(
          isNarrow ? 'justify-center px-2' : 'px-5',
          'h-[4.5rem] flex items-center border-b border-cool-gray-200 cursor-pointer',
        )}
      >
        <img src={logo} alt="VIC" className={isNarrow ? 'h-7' : 'h-9'} />
      </Link>
      <div className="flex-1 overflow-y-auto no-scrollbar px-3 py-4 space-y-0.5 cursor-pointer">
        <MenuList
          routes={routes}
          activeParentRoute={activeParentRoute}
          activeSubRoute={activeSubRoute}
          isNarrow={isNarrow}
          onClick={onMenuItemClick}
        />
      </div>
      <div className="border-t border-cool-gray-200 px-3 py-3 space-y-1">
        <UserMenu isNarrow={isNarrow} />
        <div
          className={classNames(
            isNarrow ? 'justify-center' : 'justify-between pl-3',
            'flex items-center',
          )}
        >
          {!isNarrow && <span className="text-xs text-cool-gray-500">{`v${APP_VERSION}`}</span>}
          <button
            type="button"
            aria-label={isNarrow ? t('expand') : t('collapse')}
            aria-expanded={!isNarrow}
            title={isNarrow ? t('expand') : t('collapse')}
            className="p-2.5 rounded-lg text-cool-gray-600 hover:bg-cool-gray-100 hover:text-cool-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-navy"
            onClick={() => setIsNarrow(!isNarrow)}
          >
            {isNarrow ? (
              <ChevronDoubleRightIcon className="w-4 h-4" />
            ) : (
              <ChevronDoubleLeftIcon className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default SideMenu;
