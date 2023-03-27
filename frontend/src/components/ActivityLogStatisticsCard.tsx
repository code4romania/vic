import React from 'react';
import i18n from '../common/config/i18n';
import { useActivityLogStatisticsQuery } from '../services/activity-log/activity-log.service';
import StatisticsCard from './StatisticsCard';
import { useNavigate } from 'react-router';

const ActivityLogStatisticsCard = () => {
  const { data } = useActivityLogStatisticsQuery();

  const navigate = useNavigate();

  return (
    <StatisticsCard
      label={i18n.t('side_menu:options.activity_log')}
      value={data?.totalHours}
      info={i18n.t('statistics_card:activity_log.info', { value: data?.approvalHours })}
      action={{
        label: i18n.t('statistics_card:activity_log.label', { value: data?.approvalHours }),
        onClick: () => navigate('/activity-log'),
      }}
    />
  );
};

export default ActivityLogStatisticsCard;
