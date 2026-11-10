import React from 'react';
import logo from '../assets/images/app_logo.svg';
import { Bars3Icon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import UserMenu from './UserMenu';
import i18n from '../common/config/i18n';

interface HeaderProps {
  openSlidingMenu: (isOpen: boolean) => void;
}

// Top bar for screens narrower than lg (tablets, phones), where the side menu slides in from the left.
const Header = ({ openSlidingMenu }: HeaderProps) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="bg-white border-b border-cool-gray-200 shadow-none h-16 px-4 sm:px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {isAuthenticated && (
          <button
            id="side_menu__open-btn"
            aria-label={`${i18n.t('header:open_menu')}`}
            type="button"
            className="p-2 -ml-2 rounded-lg text-cool-gray-700 hover:bg-cool-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-navy"
            onClick={openSlidingMenu.bind(null, true)}
          >
            <Bars3Icon className="w-6 h-6" aria-hidden="true" />
          </button>
        )}
        <button
          type="button"
          aria-label="VIC"
          className="flex items-center rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-navy"
          onClick={() => navigate('/')}
        >
          <img src={logo} alt="VIC" className="h-8" />
        </button>
      </div>
      {isAuthenticated && <UserMenu isNarrow placement="down" />}
    </header>
  );
};

export default Header;
