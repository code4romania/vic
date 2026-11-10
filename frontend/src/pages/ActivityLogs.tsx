import React from 'react';
import { CheckCircleIcon, ClockIcon, PlusIcon, XCircleIcon } from '@heroicons/react/24/outline';
import PageLayout from '../layouts/PageLayout';
import Tabs, { TabItem } from '../components/Tabs';
import i18n from '../common/config/i18n';
import PageHeader from '../components/PageHeader';
import Button from '../components/Button';
import StatisticsCard from '../components/StatisticsCard';
import { useNavigate } from 'react-router';
import { ActivityLogResolutionStatus } from '../common/enums/activity-log-resolution-status.enum';
import ActivityLogTableWithQueryParams from '../containers/query/ActivityLogTableWithQueryParams';
import { ActivityLogsProps } from '../containers/query/ActivityLogsWithQueryParams';
import { useActivityLogCounterQuery } from '../services/activity-log/activity-log.service';
import { useValidationGate } from '../hooks/useValidationGate';

const ActivityLogTabsOptions: TabItem<ActivityLogResolutionStatus>[] = [
  { key: ActivityLogResolutionStatus.NEW, value: i18n.t('activity_log:pending') },
  { key: ActivityLogResolutionStatus.SOLVED, value: i18n.t('activity_log:past') },
];

// Hours, not entries: the API counts the hours in each state.
const COUNTERS = [
  { key: 'pending', Icon: ClockIcon, color: 'text-figure-amber' },
  { key: 'approved', Icon: CheckCircleIcon, color: 'text-figure-green' },
  { key: 'rejected', Icon: XCircleIcon, color: 'text-figure-red' },
] as const;

const ActivityLogs = ({ query, setQuery }: ActivityLogsProps) => {
  // routing
  const navigate = useNavigate();
  const { gate } = useValidationGate();
  const { data: counters } = useActivityLogCounterQuery();

  const onTabClick = (tab: ActivityLogResolutionStatus) => {
    setQuery({ resolutionStatus: tab }, 'push');
  };

  return (
    <PageLayout>
      <PageHeader
        subtitle={i18n.t('activity_log:description')}
        actions={
          <Button
            className="btn-primary"
            label={i18n.t('activity_log:add')}
            icon={<PlusIcon className="h-5 w-5" aria-hidden="true" />}
            onClick={() => navigate('add')}
            {...gate}
          />
        }
      >
        {i18n.t('side_menu:options.activity_log')}
      </PageHeader>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 xl:gap-6">
        {COUNTERS.map(({ key, Icon, color }) => (
          <StatisticsCard
            key={key}
            label={i18n.t(`activity_log:counters.${key}.label`)}
            value={
              counters
                ? i18n.t('activity_log:counters.hours', { count: Number(counters[key]) })
                : '-'
            }
            icon={<Icon className={`w-5 h-5 ${color}`} aria-hidden="true" />}
            info={
              <span className="text-cool-gray-500 font-roboto">
                {i18n.t(`activity_log:counters.${key}.info`)}
              </span>
            }
          />
        ))}
      </div>
      <Tabs<ActivityLogResolutionStatus>
        tabs={ActivityLogTabsOptions}
        onClick={onTabClick}
        defaultTab={ActivityLogTabsOptions.find((tab) => tab.key === query?.resolutionStatus)}
      >
        {query?.resolutionStatus === ActivityLogResolutionStatus.NEW && (
          <ActivityLogTableWithQueryParams resolutionStatus={ActivityLogResolutionStatus.NEW} />
        )}
        {query?.resolutionStatus === ActivityLogResolutionStatus.SOLVED && (
          <ActivityLogTableWithQueryParams resolutionStatus={ActivityLogResolutionStatus.SOLVED} />
        )}
      </Tabs>
    </PageLayout>
  );
};

export default ActivityLogs;
