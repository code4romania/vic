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

// A real link (href): reachable with Tab, opened with Enter, and "open in a new tab" works.
// A plain click stays in the app (client-side navigation).
const MenuLink = ({ item, active, isNarrow, isChild, onClick }: MenuLinkProps) => {
  const onLinkClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    // modifier keys or the middle button: let the browser open a new tab or window
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0)
      return;
    event.preventDefault();
    onClick(item);
  };

  return (
    <a
      id={`${item.name}__menu-item`}
      href={`/${item.href}`}
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
        'flex items-center rounded-lg font-robotoMedium text-[15px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-navy',
      )}
      onClick={onLinkClick}
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
