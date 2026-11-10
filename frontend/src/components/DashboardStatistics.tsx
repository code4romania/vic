import React from 'react';
import { useNavigate } from 'react-router';
import i18n from '../common/config/i18n';
import { useDashboardOverviewQuery } from '../services/dashboard/dashboard.service';
import StatisticsCard from './StatisticsCard';
import { CalendarIcon, ClockIcon, DocumentTextIcon, UsersIcon } from '@heroicons/react/24/outline';

const icon = (Icon: typeof UsersIcon, color: string) => (
  <Icon className={`w-5 h-5 ${color}`} aria-hidden="true" />
);

const t = (key: string, options?: Record<string, unknown>): string =>
  `${i18n.t(`dashboard:statistics.${key}`, options)}`;

// VIC 2.0, #466: Voluntari activi, Evenimente viitoare, Contracte în așteptare and Ore voluntariat.
const DashboardStatistics = () => {
  const navigate = useNavigate();
  const { data, isLoading } = useDashboardOverviewQuery();
  const value = (n?: number): string => (isLoading ? '' : `${n ?? 0}`);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 xl:gap-6">
      <StatisticsCard
        label={t('volunteers.label')}
        value={value(data?.activeVolunteers)}
        icon={icon(UsersIcon, 'text-navy')}
        info={
          data?.pendingAccessRequests
            ? t('volunteers.info', { count: data.pendingAccessRequests })
            : undefined
        }
        action={{ label: t('volunteers.action'), onClick: () => navigate('/volunteers') }}
      />
      <StatisticsCard
        label={t('events.label')}
        value={value(data?.upcomingEvents)}
        icon={icon(CalendarIcon, 'text-figure-green')}
        action={{ label: t('events.action'), onClick: () => navigate('/events') }}
      />
      <StatisticsCard
        label={t('contracts.label')}
        value={value(data?.pendingContracts)}
        icon={icon(DocumentTextIcon, 'text-figure-amber')}
        action={{
          label: t('contracts.action'),
          onClick: () => navigate('/documents/contracts?status=PENDING'),
        }}
      />
      <StatisticsCard
        label={t('hours.label')}
        value={value(data?.approvedHours)}
        icon={icon(ClockIcon, 'text-figure-teal')}
        info={data?.pendingHours ? t('hours.info', { count: data.pendingHours }) : undefined}
        action={{ label: t('hours.action'), onClick: () => navigate('/approvals/hours') }}
      />
    </div>
  );
};

export default DashboardStatistics;
