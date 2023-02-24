import React from 'react';
import { IChildRoute, IRoute } from '../common/interfaces/route.interface';
import MenuLink from './MenuLink';

interface MenuItemProps {
  item: IRoute;
  activeParentRoute: IRoute;
  isNarrow?: boolean;
  onClick: (item: IRoute, childRoute?: IChildRoute) => void;
  activeSubRoute?: IChildRoute | null;
}

const MenuItem = ({
  item,
  activeParentRoute,
  isNarrow,
  onClick,
  activeSubRoute,
}: MenuItemProps) => {
  const onChildRouteClick = (childRoute: IRoute) => {
    onClick(item, childRoute);
  };

  return item.childRoutes ? (
    <div>
      <MenuLink
        item={item}
        active={item.id === activeParentRoute.id}
        isNarrow={isNarrow}
        onClick={onClick}
      />
      {item.id === activeParentRoute.id &&
        item.childRoutes.map((childRoute) => (
          <MenuLink
            key={childRoute.id}
            item={childRoute}
            active={childRoute.id === activeSubRoute?.id}
            isNarrow={isNarrow}
            onClick={onChildRouteClick}
          />
        ))}
    </div>
  ) : (
    <MenuLink
      item={item}
      active={item.id === activeParentRoute.id}
      isNarrow={isNarrow}
      onClick={onClick}
    />
  );
};

export default MenuItem;
