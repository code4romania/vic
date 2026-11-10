import React from 'react';
import { useNavigate } from 'react-router';
import { CalendarIcon, ClockIcon, UsersIcon } from '@heroicons/react/24/outline';
import i18n from '../common/config/i18n';
import Card from '../layouts/CardLayout';
import { usePendingApprovalsQuery } from '../services/approvals/approvals.service';
import CardBody from './CardBody';
import CardHeader from './CardHeader';
import LoadErrorContent from './LoadErrorContent';

const t = (key: string, options?: Record<string, unknown>): string =>
  `${i18n.t(`dashboard:pending.${key}`, options)}`;

const ROWS = [
  { key: 'volunteers', count: 'accessRequests', Icon: UsersIcon },
  { key: 'hours', count: 'activityLogs', Icon: ClockIcon },
  { key: 'events', count: 'eventRegistrations', Icon: CalendarIcon },
] as const;

// What waits for the organization's decision, with a shortcut to each tab of Aprobări.
const DashboardPendingApprovals = () => {
  const navigate = useNavigate();
  const { data, error, refetch } = usePendingApprovalsQuery();

  return (
    <Card>
      <CardHeader>
        <div>
          <h2>{t('title')}</h2>
          <p className="text-sm text-cool-gray-500">{t('subtitle')}</p>
        </div>
        {!!data?.total && (
          <span className="min-w-[2rem] h-8 px-2 rounded-lg bg-figure-red text-white font-robotoBold flex items-center justify-center">
            {data.total}
          </span>
        )}
      </CardHeader>
      <CardBody>
        {error ? (
          <LoadErrorContent onRetry={refetch} />
        ) : data && !data.total ? (
          <p className="text-cool-gray-500">{t('none')}</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {ROWS.map(({ key, count, Icon }) => (
              <li
                key={key}
                className="flex items-center gap-3 rounded-lg border border-cool-gray-200 px-4 py-3"
              >
                <span className="w-9 h-9 shrink-0 rounded-lg bg-navy-100 text-navy flex items-center justify-center">
                  <Icon className="w-5 h-5" aria-hidden="true" />
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block font-robotoMedium text-cool-gray-900">{t(key)}</span>
                  <span className="block text-sm text-cool-gray-500">
                    {t('count', { count: data?.[count] ?? 0 })}
                  </span>
                </span>
                <button
                  type="button"
                  className="btn-secondary"
                  disabled={!data?.[count]}
                  onClick={() => navigate(`/approvals/${key}`)}
                >
                  {t('review')}
                </button>
              </li>
            ))}
          </ul>
        )}
      </CardBody>
    </Card>
  );
};

export default DashboardPendingApprovals;
