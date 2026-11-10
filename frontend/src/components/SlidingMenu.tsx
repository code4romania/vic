import React, { Fragment, useEffect, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useLocation, useNavigate } from 'react-router-dom';
import { IChildRoute, IRoute } from '../common/interfaces/route.interface';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { classNames } from '../common/utils/utils';
import { findParentRoute, useVisibleRoutes } from '../hooks/useVisibleRoutes';
import MenuItem from './MenuItem';

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
            <div className="pointer-events-none fixed inset-y-0 left-0 flex max-w-full pr-10">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-500 sm:duration-700"
                enterFrom="translate-x-[-18rem]"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-500 sm:duration-700"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-[-18rem]"
              >
                <Dialog.Panel className="pointer-events-auto relative w-72">
                  <Transition.Child
                    as={Fragment}
                    enter="ease-in-out duration-500"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in-out duration-500"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <div className="absolute top-0 -right-8 flex pt-4">
                      <button
                        id="close_panel__btn"
                        aria-label="Close panel"
                        type="button"
                        className="rounded-md text-white hover:text-cool-gray-200 focus:outline-none focus:ring-2 focus:ring-white"
                        onClick={setSlidingMenuOpen.bind(null, false)}
                      >
                        <XMarkIcon className="w-6 h-6" />
                        <span className="sr-only">Close panel</span>
                      </button>
                    </div>
                  </Transition.Child>
                  <div className="h-full overflow-y-auto bg-white">
                    <div className="space-y-6">
                      <nav
                        className={classNames(
                          'w-full',
                          'p-3 pt-6 space-y-0.5 bg-white cursor-pointer select-none',
                        )}
                        aria-label="Sidebar"
                      >
                        {routes.map((item) => (
                          <MenuItem
                            key={item.id}
                            item={item}
                            activeParentRoute={activeParentRoute}
                            activeSubRoute={activeSubRoute}
                            isNarrow={false}
                            onClick={onMenuItemClick}
                          />
                        ))}
                        <div className="text-cool-gray-400 text-xs px-3 pt-6">{`v${APP_VERSION}`}</div>
                      </nav>
                    </div>
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
