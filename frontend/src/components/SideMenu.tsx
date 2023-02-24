import React, { useState } from 'react';
import { ArrowLeftCircleIcon, ArrowRightCircleIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ROUTES } from '../common/constants/routes';
import { classNames } from '../common/utils/utils';
import { IRoute } from '../common/interfaces/route.interface';
import MenuItem from './MenuItem';
import MenuLink from './MenuLink';

const SideMenu = () => {
  const navigate = useNavigate();
  const [isNarrow, setIsNarrow] = useState<boolean>(false);
  const [currentMenuItem, setCurrentMenuItem] = useState<IRoute>(ROUTES[0]);
  const { t } = useTranslation('side_menu');

  const onMenuItemClick = (item: IRoute) => {
    setCurrentMenuItem(item);
    navigate(`${item.href}`);
  };

  return (
    <nav
      className={classNames(
        isNarrow ? 'w-[5.5rem]' : 'w-[16.5rem]',
        'transition-width duration-300 ease-out p-6 pt-10 space-y-4 bg-gray-900 rounded-xl cursor-pointer select-none h-fit sticky top-5',
      )}
      aria-label="Sidebar"
    >
      {ROUTES.map((item) => (
        <MenuItem
          key={item.id}
          item={item}
          currentMenuItem={currentMenuItem}
          isNarrow={isNarrow}
          onClick={onMenuItemClick}
        />
      ))}
      <div className="pt-60 space-y-4">
        <MenuLink
          item={{
            id: -1,
            name: t('collapse'),
            icon: isNarrow ? ArrowRightCircleIcon : ArrowLeftCircleIcon,
            href: '',
          }}
          active={false}
          isNarrow={isNarrow}
          onClick={setIsNarrow.bind(null, !isNarrow)}
        />
      </div>
      <div className="text-white text-xs">{`v${APP_VERSION}`}</div>
    </nav>
  );
};

export default SideMenu;
