import React from 'react';
import { useNavigate } from 'react-router';
import { CalendarIcon, ClockIcon, MegaphoneIcon, UserPlusIcon } from '@heroicons/react/24/outline';
import i18n from '../common/config/i18n';
import Card from '../layouts/CardLayout';
import CardBody from './CardBody';
import CardHeader from './CardHeader';

const t = (key: string): string => `${i18n.t(`dashboard:quick_actions.${key}`)}`;

const ACTIONS = [
  { key: 'add_volunteer', href: '/volunteers/add', Icon: UserPlusIcon },
  { key: 'add_event', href: '/events/add', Icon: CalendarIcon },
  { key: 'add_announcement', href: '/announcements/add', Icon: MegaphoneIcon },
  { key: 'add_hours', href: '/activity-log/add', Icon: ClockIcon },
];

// Shortcuts to the forms admins open most often.
const DashboardQuickActions = () => {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader>
        <h2>{t('title')}</h2>
      </CardHeader>
      <CardBody>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {ACTIONS.map(({ key, href, Icon }) => (
            <button
              key={key}
              type="button"
              className="flex flex-col items-center justify-center gap-2 rounded-lg border border-cool-gray-200 px-3 py-5 text-sm font-robotoMedium text-cool-gray-900 hover:border-navy hover:bg-navy-50 transition-colors"
              onClick={() => navigate(href)}
            >
              <Icon className="w-6 h-6 text-navy" aria-hidden="true" />
              {t(key)}
            </button>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};

export default DashboardQuickActions;
