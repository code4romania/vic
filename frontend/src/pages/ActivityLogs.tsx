import React from 'react';
import PageLayout from '../layouts/PageLayout';
import Tabs from '../components/Tabs';
import i18n from '../common/config/i18n';
import { SelectItem } from '../components/Select';
import PageHeaderAdd from '../components/PageHeaderAdd';
import { useNavigate } from 'react-router';
import { ActivityLogResolutionStatus } from '../common/enums/activity-log-resolution-status.enum';
import ActivityLogTableWithQueryParams from '../containers/query/ActivityLogTableWithQueryParams';
import { ActivityLogsProps } from '../containers/query/ActivityLogsWithQueryParams';

const ActivityLogTabsOptions: SelectItem<ActivityLogResolutionStatus>[] = [
  { key: ActivityLogResolutionStatus.NEW, value: i18n.t('activity_log:pending') },
  { key: ActivityLogResolutionStatus.SOLVED, value: i18n.t('activity_log:past') },
];

const ActivityLogs = ({ query, setQuery }: ActivityLogsProps) => {
  // routing
  const navigate = useNavigate();

  const onAddButtonPress = () => {
    navigate('add');
  };

  const onTabClick = (tab: ActivityLogResolutionStatus) => {
    setQuery({ resolutionStatus: tab }, 'push');
  };

  return (
    <PageLayout>
      <PageHeaderAdd onAddButtonPress={onAddButtonPress} label={i18n.t('activity_log:add')}>
        {i18n.t('side_menu:options.activity_log')}
      </PageHeaderAdd>
      <p className="text-cool-gray-500">{i18n.t('activity_log:description')}</p>
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
