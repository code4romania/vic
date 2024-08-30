import i18n from '../config/i18n';
import { RectangleGroupIcon, SunIcon, UsersIcon } from '@heroicons/react/24/outline';
import {
  ClockIcon,
  PuzzlePieceIcon,
  CalendarIcon,
  ArchiveBoxIcon,
  DocumentDuplicateIcon,
} from '@heroicons/react/24/solid';

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
    name: i18n.t('side_menu:options.activity_log'),
    href: 'activity-log',
    icon: ClockIcon,
  },
  {
    id: 4,
    name: i18n.t('side_menu:options.activity_types'),
    href: 'activity-types',
    icon: PuzzlePieceIcon,
  },
  {
    id: 5,
    name: i18n.t('side_menu:options.events'),
    href: 'events',
    icon: CalendarIcon,
  },
  {
    id: 6,
    name: i18n.t('side_menu:options.documents'),
    href: 'documents',
    icon: DocumentDuplicateIcon,
    childRoutes: [
      {
        id: 61,
        name: i18n.t('general:contracts'),
        href: 'documents/contracts',
      },
      {
        id: 62,
        name: i18n.t('general:templates'),
        href: 'documents/templates',
      },
    ],
  },
  {
    id: 7,
    name: i18n.t('side_menu:options.actions_archive'),
    href: 'actions-archive',
    icon: ArchiveBoxIcon,
  },
  {
    id: 8,
    name: i18n.t('side_menu:options.announcements'),
    href: 'announcements',
    icon: MegaphoneIcon,
  },
];
