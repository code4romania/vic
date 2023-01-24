import React, { useState } from 'react';
import { ArrowLeftCircleIcon, ArrowRightCircleIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ROUTES } from '../common/constants/routes';
import { classNames } from '../common/utils/utils';
import { IRoute } from '../common/interfaces/route.interface';

const SideMenu = () => {
  const navigate = useNavigate();
  const [isNarrow, setIsNarrow] = useState<boolean>(false);
  const [currentMenuItemId, setCurrentMenuItemId] = useState<number>(0);
  const { t } = useTranslation('side_menu');

  const handleMenuItemClick = (item: IRoute) => {
    setCurrentMenuItemId(item.id);
    navigate(`${item.href}`);
  };

  return (
    <nav
      className={classNames(
        isNarrow ? 'w-[5.5rem]' : 'w-[16.5rem]',
        'transition-width duration-300 ease-out p-6 pt-10 space-y-4 bg-gray-900 rounded-xl font-titilliumBold cursor-pointer select-none h-fit sticky top-5',
      )}
      aria-label="Sidebar"
    >
      {ROUTES.map((item) => (
        <a
          aria-label={item.name}
          key={item.name}
          className={classNames(
            item.id === currentMenuItemId ? 'bg-turquoise/[0.15] text-turquoise' : '',
            isNarrow ? 'justify-center px-0 space-x-0' : 'px-4 space-x-5 ',
            'menu-item',
          )}
          onClick={() => handleMenuItemClick(item)}
        >
          <item.icon className="w-6 h-6" />
          <span
            className={classNames(
              isNarrow ? '-translate-x-2 hidden' : '',
              'transition-transform duration-50 whitespace-nowrap',
            )}
          >
            {item.name}
          </span>
        </a>
      ))}
      <div className="pt-60 space-y-4">
        <a
          aria-label="menu"
          key={'menu'}
          onClick={() => setIsNarrow((res) => !res)}
          className={classNames(isNarrow ? 'justify-center px-0' : 'px-4 space-x-5 ', 'menu-item')}
        >
          {isNarrow ? (
            <ArrowRightCircleIcon className="w-6 h-6" />
          ) : (
            <ArrowLeftCircleIcon className="w-6 h-6" />
          )}
          <span
            className={classNames(
              isNarrow ? '-translate-x-16 w-0 hidden' : '',
              'transition-all duration-50 whitespace-nowrap',
            )}
          >
            {t('collapse')}
          </span>
        </a>
      </div>
    </nav>
  );
};

export default SideMenu;
