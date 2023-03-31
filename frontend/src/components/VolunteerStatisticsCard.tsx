import React from 'react';
import i18n from '../common/config/i18n';
import StatisticsCard from './StatisticsCard';
import { useNavigate } from 'react-router';
import { useVolunteerStatisticsQuery } from '../services/volunteer/volunteer.service';

const VolunteerStatisticsCard = () => {
  const { data } = useVolunteerStatisticsQuery();

  const navigate = useNavigate();

  return (
    <StatisticsCard
      label={i18n.t('volunteers:tabs.active')}
      value={data?.volunteers || 'N/A'}
      info={i18n.t('dashboard:statistics_card.volunteer.info', { value: data?.requests })}
      action={{
        label: i18n.t('dashboard:statistics_card.volunteer.label'),
        onClick: () => navigate('/volunteers/requests'),
      }}
    />
  );
};

export default VolunteerStatisticsCard;
