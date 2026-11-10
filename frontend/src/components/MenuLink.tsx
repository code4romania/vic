import React from 'react';
import { IRoute } from '../common/interfaces/route.interface';
import { classNames } from '../common/utils/utils';

interface MenuLinkProps {
  item: IRoute;
  active: boolean;
  isNarrow?: boolean;
  isChild?: boolean;
  onClick: (item: IRoute) => void;
}

const MenuLink = ({ item, active, isNarrow, isChild, onClick }: MenuLinkProps) => {
  return (
    <a
      id={`${item.name}__menu-item`}
      aria-label={item.name}
      aria-current={active ? 'page' : undefined}
      title={isNarrow ? item.name : undefined}
      className={classNames(
        active && !item.childRoutes
          ? 'bg-navy-100 text-navy'
          : active
            ? 'text-navy'
            : 'text-cool-gray-600 hover:bg-cool-gray-100 hover:text-cool-gray-900',
        isNarrow ? 'justify-center px-0' : 'px-3 gap-3',
        isChild ? 'h-9 pl-12 text-sm' : 'h-11',
        'flex items-center rounded-lg font-robotoMedium text-[15px] transition-colors',
      )}
      onClick={() => onClick(item)}
    >
      {item.icon ? (
        <item.icon className="w-5 h-5 shrink-0" aria-hidden="true" />
      ) : (
        !isChild && <div className="w-5 h-5" />
      )}
      <span className={classNames(isNarrow ? 'hidden' : '', 'whitespace-nowrap truncate')}>
        {item.name}
      </span>
    </a>
  );
};

export default MenuLink;
