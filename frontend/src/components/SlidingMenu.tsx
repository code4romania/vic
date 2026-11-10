import React, { Fragment, useEffect, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useLocation, useNavigate } from 'react-router-dom';
import { IChildRoute, IRoute } from '../common/interfaces/route.interface';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { findParentRoute, useVisibleRoutes } from '../hooks/useVisibleRoutes';
import MenuList from './MenuList';
import UserMenu from './UserMenu';
import logo from '../assets/images/app_logo.svg';
import i18n from '../common/config/i18n';

interface SlidingMenuProps {
  isOpen: boolean;
  setSlidingMenuOpen: (isOpen: boolean) => void;
}

export default function SlidingMenu({ isOpen, setSlidingMenuOpen }: SlidingMenuProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const routes = useVisibleRoutes();
  const [activeParentRoute, setActiveParentRoute] = useState<IRoute>(routes[0]);
  const [activeSubRoute, setActiveSubRoute] = useState<IChildRoute | null>(null);

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
    setSlidingMenuOpen(false);
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={setSlidingMenuOpen}>
        <Transition.Child
          as={Fragment}
          enter="ease-in-out duration-500"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-500"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-cool-gray-900/40 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 left-0 flex max-w-full">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-500 sm:duration-700"
                enterFrom="translate-x-[-18rem]"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-500 sm:duration-700"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-[-18rem]"
              >
                <Dialog.Panel className="pointer-events-auto relative w-72 max-w-[85vw] h-full flex flex-col bg-white shadow-menu">
                  {/* the panel's own header: the logo, and the close button inside the panel */}
                  <div className="h-16 shrink-0 px-4 flex items-center justify-between border-b border-cool-gray-200">
                    <img src={logo} alt="VIC" className="h-8" />
                    <button
                      id="close_panel__btn"
                      aria-label={`${i18n.t('general:close')}`}
                      type="button"
                      className="p-2.5 -mr-2 rounded-lg text-cool-gray-700 hover:bg-cool-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-navy"
                      onClick={setSlidingMenuOpen.bind(null, false)}
                    >
                      <XMarkIcon className="w-6 h-6" aria-hidden="true" />
                    </button>
                  </div>
                  <nav
                    className="flex-1 overflow-y-auto p-3 space-y-0.5 bg-white cursor-pointer select-none"
                    aria-label={`${i18n.t('side_menu:aria')}`}
                  >
                    <MenuList
                      routes={routes}
                      activeParentRoute={activeParentRoute}
                      activeSubRoute={activeSubRoute}
                      onClick={onMenuItemClick}
                    />
                  </nav>
                  {/* who is signed in, and "Ieșire", as at the bottom of the desktop menu */}
                  <div className="shrink-0 border-t border-cool-gray-200 px-3 py-3 space-y-1">
                    <UserMenu />
                    <p className="pl-3 text-xs text-cool-gray-500">{`v${APP_VERSION}`}</p>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
