import React, { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { ArrowRightOnRectangleIcon, ChevronUpDownIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { classNames } from '../common/utils/utils';

interface UserMenuProps {
  isNarrow?: boolean;
  placement?: 'up' | 'down';
}

export const initialsOf = (name?: string) =>
  (name || '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

// The signed-in admin, with the logout action. Sits at the bottom of the side menu and in the
// header on small screens.
const UserMenu = ({ isNarrow, placement = 'up' }: UserMenuProps) => {
  const { logout, profile } = useAuth();
  const { t } = useTranslation('header');

  return (
    <Menu as="div" className="relative">
      <Menu.Button
        id="account_menu__open-btn"
        className={classNames(
          isNarrow ? 'justify-center' : 'gap-3 px-2',
          'w-full flex items-center py-2 rounded-lg hover:bg-cool-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-navy',
        )}
      >
        <span className="w-9 h-9 shrink-0 rounded-full bg-navy text-yellow flex items-center justify-center text-sm font-robotoBold">
          {initialsOf(profile?.name)}
        </span>
        {!isNarrow && (
          <>
            <span className="flex-1 min-w-0 text-left">
              <span className="block truncate text-sm font-robotoMedium text-cool-gray-900">
                {profile?.name || ''}
              </span>
              <span className="block truncate text-xs text-cool-gray-500">
                {profile?.email || ''}
              </span>
            </span>
            <ChevronUpDownIcon className="w-4 h-4 text-cool-gray-400" aria-hidden="true" />
          </>
        )}
      </Menu.Button>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="opacity-0 scale-95"
        enterTo="opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="opacity-100 scale-100"
        leaveTo="opacity-0 scale-95"
      >
        <Menu.Items
          className={classNames(
            placement === 'up' ? 'bottom-full mb-2 left-0' : 'top-full mt-2 right-0',
            'absolute z-20 w-56 rounded-lg bg-white shadow-menu ring-1 ring-cool-gray-200 py-1 focus:outline-none',
          )}
        >
          <Menu.Item>
            {({ active }) => (
              <button
                id="logout__menu-item"
                aria-label={t('menu.options.logout')}
                type="button"
                className={classNames(
                  active ? 'bg-cool-gray-100' : '',
                  'w-full flex items-center gap-3 px-4 py-2 text-sm text-cool-gray-700',
                )}
                onClick={logout}
              >
                <ArrowRightOnRectangleIcon
                  className="h-5 w-5 text-cool-gray-500"
                  aria-hidden="true"
                />
                {t('menu.options.logout')}
              </button>
            )}
          </Menu.Item>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

export default UserMenu;
