import React from 'react';
import { IRoute } from '../common/interfaces/route.interface';
import { classNames } from '../common/utils/utils';

interface MenuItemProps {
  item: IRoute;
  active: boolean;
  isNarrow?: boolean;
  onClick: (item: IRoute) => void;
}

const MenuItem = ({ item, active, isNarrow, onClick }: MenuItemProps) => {
  return (
    <a
      aria-label={item.name}
      className={classNames(
        active ? 'bg-turquoise/[0.15] text-turquoise' : 'text-gray-50',
        isNarrow ? 'justify-center px-0 space-x-0' : 'px-4 space-x-5 ',
        'h-10 flex items-center px-2 py-2 font-medium rounded-md hover:bg-turquoise/[0.15]  hover:text-turquoise',
      )}
      onClick={onClick.bind(null, item)}
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
  );
};

export default MenuItem;
