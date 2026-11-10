import React from 'react';
import { useTranslation } from 'react-i18next';
import { IChildRoute, IRoute } from '../common/interfaces/route.interface';
import { classNames } from '../common/utils/utils';
import MenuItem from './MenuItem';

interface MenuListProps {
  routes: IRoute[];
  activeParentRoute: IRoute;
  activeSubRoute?: IChildRoute | null;
  isNarrow?: boolean;
  onClick: (item: IRoute, childRoute?: IChildRoute) => void;
}

const isVicAdmin = (route: IRoute) => !!route.roles?.includes('super_admin');

// The menu entries of the NGO, then, for VIC super admins, their own entries under a separator and
// a "Administrare VIC" heading, so they are not mixed with the NGO's pages.
const MenuList = ({ routes, isNarrow, ...rest }: MenuListProps) => {
  const { t } = useTranslation('side_menu');
  const ngo = routes.filter((route) => !isVicAdmin(route));
  const vic = routes.filter(isVicAdmin);

  return (
    <>
      {ngo.map((item) => (
        <MenuItem key={item.id} item={item} isNarrow={isNarrow} {...rest} />
      ))}
      {vic.length > 0 && (
        <div
          role="group"
          aria-label={t('sections.vic_admin')}
          className="mt-3 pt-3 border-t border-cool-gray-200 space-y-0.5"
        >
          <p
            aria-hidden="true"
            className={classNames(
              isNarrow ? 'sr-only' : '',
              'px-3 pb-1 text-xs font-robotoMedium uppercase tracking-wide text-cool-gray-600',
            )}
          >
            {t('sections.vic_admin')}
          </p>
          {vic.map((item) => (
            <MenuItem key={item.id} item={item} isNarrow={isNarrow} {...rest} />
          ))}
        </div>
      )}
    </>
  );
};

export default MenuList;
