import React from 'react';
import { IRoute } from '../common/interfaces/route.interface';
import MenuLink from './MenuLink';

interface MenuItemProps {
  item: IRoute;
  currentMenuItem: IRoute;
  isNarrow?: boolean;
  onClick: (item: IRoute) => void;
}

const MenuItem = ({ item, currentMenuItem, isNarrow, onClick }: MenuItemProps) => {
  return item.childRoutes ? (
    <div>
      <MenuLink
        item={item}
        active={item.id === currentMenuItem.id}
        isNarrow={isNarrow}
        onClick={onClick}
      />
      {item.childRoutes.map((childRoute) => (
        <MenuLink
          key={childRoute.id}
          item={childRoute}
          active={childRoute.id === currentMenuItem.id}
          isNarrow={isNarrow}
          onClick={onClick}
        />
      ))}
    </div>
  ) : (
    <MenuLink
      item={item}
      active={item.id === currentMenuItem.id}
      isNarrow={isNarrow}
      onClick={onClick}
    />
  );
};

export default MenuItem;
