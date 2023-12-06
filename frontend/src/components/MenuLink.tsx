import React from 'react';
import { IRoute } from '../common/interfaces/route.interface';
import { classNames } from '../common/utils/utils';

interface MenuLinkProps {
  item: IRoute;
  active: boolean;
  isNarrow?: boolean;
  onClick: (item: IRoute) => void;
}

const MenuLink = ({ item, active, isNarrow, onClick }: MenuLinkProps) => {
  return (
    <a
      id={`${item.name}__menu-item`}
      aria-label={item.name}
      className={classNames(
        active ? 'bg-yellow/[0.15] text-yellow' : 'text-gray-50',
        active && item.childRoutes ? 'bg-transparent' : '',
        isNarrow ? 'justify-center px-0 space-x-0' : 'px-4 space-x-5 ',
        'h-10 flex items-center px-2 py-2 font-medium rounded-md hover:bg-yellow/[0.15]  hover:text-yellow',
      )}
      onClick={() => onClick(item)}
    >
      {item.icon ? <item.icon className="w-6 h-6" /> : <div className="w-6 h-6"></div>}
      <span
        className={classNames(
          isNarrow ? '-translate-x-2 hidden' : '',
          'transition-transform duration-50 whitespace-nowrap',
        )}
      >
        {item.name}
      </span>
    </a>
  );
};

export default MenuLink;
