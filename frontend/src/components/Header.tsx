import React, { Fragment } from 'react';
import logo from '../assets/images/logo.svg';
import {
  Bars3Icon,
  ChevronDownIcon,
  CogIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { Menu, Transition } from '@headlessui/react';
import { classNames } from '../common/utils/utils';

interface HeaderProps {
  openSlidingMenu: (isOpen: boolean) => void;
}

const Header = ({ openSlidingMenu }: HeaderProps) => {
  const { logout, isAuthenticated, profile } = useAuth();
  const navigate = useNavigate();

  const { t } = useTranslation('header');

  const onNavigate = (route: string): void => navigate(route);

  return (
    <header className="bg-white py-4 px-4 md:px-10">
      <nav className="w-full flex justify-between items-center">
        <div className="flex gap-4">
          {isAuthenticated && (
            <div className="flex md:hidden items-center">
              <button
                id="side_menu__open-btn"
                aria-label="Menu"
                className="flex items-center gap-4 hover:bg-green-tab py-2 px-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-indigo-500"
                onClick={openSlidingMenu.bind(null, true)}
              >
                <Bars3Icon className="w-5 h-5" />
              </button>
            </div>
          )}
          <div className="flex items-center cursor-pointer" onClick={onNavigate.bind(null, '/')}>
            <img
              src={logo}
              alt="Code 4 Romania - Teo"
              className="h-full w-full sm:max-h-full max-h-10"
            />
          </div>
        </div>
        {isAuthenticated && (
          <div className="flex space-x-4 items-center">
            <Menu as="div" className="relative inline-block text-left">
              <div>
                <Menu.Button
                  id="account_menu__open-btn"
                  className="flex items-center gap-4 hover:bg-green-tab sm:py-2 sm:px-4 py-1 px-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-indigo-500"
                >
                  <h4 className="tracking-wide text-right">{profile?.name || ''}</h4>
                  <ChevronDownIcon className="w-5 h-5 md:w-6 md:h-6 text-gray-900" />
                </Menu.Button>
              </div>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="origin-top-right  absolute right-0 mt-2 w-40 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="py-1 divide-y divide-gray-200">
                    <Menu.Item>
                      {({ active }) => (
                        <a
                          id="profile__menu-item"
                          aria-label="my account"
                          className={classNames(
                            active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                            'group flex items-center px-4 py-2 ',
                          )}
                          onClick={onNavigate.bind(null, '/account')}
                        >
                          <CogIcon
                            className="mr-3 sm:h-5 sm:w-5 h-4 w-4 text-gray-800 "
                            aria-hidden="true"
                          />
                          <small>{t('menu.options.my_account')}</small>
                        </a>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <a
                          id="logout__menu-item"
                          aria-label="logout"
                          className={classNames(
                            active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                            'group flex items-center px-4 py-2',
                          )}
                          onClick={logout}
                        >
                          <ArrowRightOnRectangleIcon
                            className="mr-3 sm:h-5 sm:w-5 h-4 w-4 text-gray-800 "
                            aria-hidden="true"
                          />
                          <small>{t('menu.options.logout')}</small>
                        </a>
                      )}
                    </Menu.Item>
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
