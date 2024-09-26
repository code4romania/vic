import React, { Fragment, useEffect, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useLocation, useNavigate } from 'react-router-dom';
import { IChildRoute, IRoute } from '../common/interfaces/route.interface';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { classNames } from '../common/utils/utils';
import { ROUTES } from '../common/constants/routes';
import MenuItem from './MenuItem';

interface SlidingMenuProps {
  isOpen: boolean;
  setSlidingMenuOpen: (isOpen: boolean) => void;
}

export default function SlidingMenu({ isOpen, setSlidingMenuOpen }: SlidingMenuProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeParentRoute, setActiveParentRoute] = useState<IRoute>(ROUTES[0]);
  const [activeSubRoute, setActiveSubRoute] = useState<IChildRoute | null>(null);

  useEffect(() => {
    const splittedLocation = location.pathname.split('/');
    const parentRoute = ROUTES.find((route) => route.href === splittedLocation[1]);

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
  }, [location]);

  const onMenuItemClick = (item: IRoute, childRoute?: IChildRoute) => {
    navigate(childRoute ? `${childRoute.href}` : `${item.href}`);
    setSlidingMenuOpen(false);
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-30" onClose={setSlidingMenuOpen}>
        <Transition.Child
          as={Fragment}
          enter="ease-in-out duration-500"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-500"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
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
                        className="rounded-md text-gray-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-white"
                        onClick={setSlidingMenuOpen.bind(null, false)}
                      >
                        <XMarkIcon className="w-6 h-6" />
                        <span className="sr-only">Close panel</span>
                      </button>
                    </div>
                  </Transition.Child>
                  <div className="h-full overflow-y-auto bg-gray-900">
                    <div className="space-y-6">
                      <nav
                        className={classNames(
                          'w-full',
                          'transition-width duration-300 ease-out p-6 pt-10 space-y-4 bg-gray-900 rounded-xl cursor-pointer select-none',
                        )}
                        aria-label="Sidebar"
                      >
                        {ROUTES.map((item) => (
                          <MenuItem
                            key={item.id}
                            item={item}
                            activeParentRoute={activeParentRoute}
                            activeSubRoute={activeSubRoute}
                            isNarrow={false}
                            onClick={onMenuItemClick}
                          />
                        ))}
                        <div className="text-white text-xs fixed bottom-4">{`v${APP_VERSION}`}</div>
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
