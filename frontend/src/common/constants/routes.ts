import i18n from '../config/i18n';
import {
  RectangleGroupIcon,
  ShieldCheckIcon,
  SunIcon,
  UsersIcon,
  BuildingOffice2Icon,
} from '@heroicons/react/24/outline';
import {
  ClockIcon,
  PuzzlePieceIcon,
  CalendarIcon,
  ArchiveBoxIcon,
  DocumentDuplicateIcon,
  CheckBadgeIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/solid';

import { IRoute } from '../interfaces/route.interface';
import { MegaphoneIcon } from '@heroicons/react/24/solid';

export const ROUTES: IRoute[] = [
  { id: 0, name: i18n.t('side_menu:options.dashboard'), href: '', icon: RectangleGroupIcon },
  // #499: volunteer applications, hours and event registrations in one place
  {
    id: 10,
    name: i18n.t('side_menu:options.approvals'),
    href: 'approvals',
    icon: CheckBadgeIcon,
  },
  {
    id: 1,
    name: i18n.t('side_menu:options.organization'),
    href: 'organization',
    icon: SunIcon,
    childRoutes: [
      { id: 11, name: i18n.t('side_menu:options.organization_profile'), href: 'organization' },
      { id: 12, name: i18n.t('side_menu:options.team'), href: 'organization/team' },
    ],
  },
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
  // #506
  {
    id: 11,
    name: i18n.t('side_menu:options.settings'),
    href: 'settings',
    icon: Cog6ToothIcon,
  },
  {
    id: 9,
    name: i18n.t('side_menu:options.validation'),
    href: 'admin/validation',
    icon: ShieldCheckIcon,
    roles: ['super_admin'],
  },
  // #511
  {
    id: 12,
    name: i18n.t('side_menu:options.all_organizations'),
    href: 'admin/organizations',
    icon: BuildingOffice2Icon,
    roles: ['super_admin'],
  },
  {
    id: 13,
    name: i18n.t('side_menu:options.all_volunteers'),
    href: 'admin/volunteers',
    icon: UsersIcon,
    roles: ['super_admin'],
  },
];
