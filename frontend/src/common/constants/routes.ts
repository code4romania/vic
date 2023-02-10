import i18n from '../config/i18n';
import { RectangleGroupIcon, SunIcon } from '@heroicons/react/24/outline';
import { IRoute } from '../interfaces/route.interface';
import { UsersIcon } from '@heroicons/react/24/solid';

export const ROUTES: IRoute[] = [
  { id: 0, name: i18n.t('side_menu:options.dashboard'), href: '', icon: RectangleGroupIcon },
  { id: 1, name: i18n.t('side_menu:options.organization'), href: 'organization', icon: SunIcon },
  {
    id: 2,
    name: i18n.t('side_menu:options.access_codes'),
    href: 'volunteers/access-codes',
    icon: UsersIcon,
  },
  {
    id: 3,
    name: i18n.t('side_menu:options.volunteers.access_requests'),
    href: 'volunteers/requests',
    icon: UsersIcon,
  },
  { id: 4, name: 'Editare coduri access', href: 'access-codes/edit', icon: SunIcon },
];
