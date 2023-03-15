import i18n from '../config/i18n';
import { RectangleGroupIcon, SunIcon, UsersIcon } from '@heroicons/react/24/outline';
import { PuzzlePieceIcon, CalendarIcon } from '@heroicons/react/24/solid';

import { IRoute } from '../interfaces/route.interface';
import { MegaphoneIcon } from '@heroicons/react/24/solid';

export const ROUTES: IRoute[] = [
  { id: 0, name: i18n.t('side_menu:options.dashboard'), href: '', icon: RectangleGroupIcon },
  { id: 1, name: i18n.t('side_menu:options.organization'), href: 'organization', icon: SunIcon },
  {
    id: 2,
    name: i18n.t('side_menu:options.volunteers'),
    href: 'volunteers',
    icon: UsersIcon,
    childRoutes: [
      {
        id: 21,
        name: i18n.t('side_menu:options.volunteers_list'),
        href: 'volunteers',
      },
      {
        id: 22,
        name: i18n.t('side_menu:options.access_codes'),
        href: 'volunteers/access-codes',
      },
      {
        id: 23,
        name: i18n.t('side_menu:options.access_requests'),
        href: 'volunteers/requests',
      },
    ],
  },
  {
    id: 3,
    name: i18n.t('side_menu:options.activity_types'),
    href: 'activity-types',
    icon: PuzzlePieceIcon,
  },
  {
    id: 4,
    name: i18n.t('side_menu:options.events'),
    href: 'events',
    icon: CalendarIcon,
  },
  {
    id: 5,
    name: i18n.t('side_menu:options.announcements'),
    href: 'announcements',
    icon: MegaphoneIcon,
  },
];
