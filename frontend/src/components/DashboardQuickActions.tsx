import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarIcon,
  DocumentCheckIcon,
  MegaphoneIcon,
  UserPlusIcon,
} from '@heroicons/react/24/outline';
import i18n from '../common/config/i18n';
import Card from '../layouts/CardLayout';
import CardBody from './CardBody';
import CardHeader from './CardHeader';
import { useValidationGate } from '../hooks/useValidationGate';

const t = (key: string): string => `${i18n.t(`dashboard:quick_actions.${key}`)}`;

const ACTIONS = [
  { key: 'add_volunteer', href: '/volunteers/add', Icon: UserPlusIcon, needsValidation: true },
  { key: 'add_event', href: '/events/add', Icon: CalendarIcon, needsValidation: true },
  { key: 'add_announcement', href: '/announcements/add', Icon: MegaphoneIcon, needsValidation: true },
  // as in the design: the fourth shortcut opens the contracts
  { key: 'manage_contracts', href: '/documents/contracts', Icon: DocumentCheckIcon },
];

// Shortcuts to the forms admins open most often.
const DashboardQuickActions = () => {
  const navigate = useNavigate();
  const { gate } = useValidationGate();

  return (
    <Card>
      <CardHeader>
        <div>
          <h2>{t('title')}</h2>
          <p className="text-sm text-cool-gray-600">{t('subtitle')}</p>
        </div>
      </CardHeader>
      <CardBody>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {ACTIONS.map(({ key, href, Icon, needsValidation }) => (
            <button
              key={key}
              type="button"
              className="flex flex-col items-center justify-center gap-2 rounded-lg border border-cool-gray-200 px-3 py-5 text-sm font-robotoMedium text-cool-gray-900 hover:border-navy hover:bg-navy-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-cool-gray-200 disabled:hover:bg-white"
              onClick={() => navigate(href)}
              {...(needsValidation ? gate : {})}
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
