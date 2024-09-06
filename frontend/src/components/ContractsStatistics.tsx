import React from 'react';
import StatisticsCard from './StatisticsCard';
import { useTranslation } from 'react-i18next';

export const ContractsStatistics = () => {
  const { t } = useTranslation('volunteering_contracts');

  return (
    <div className="flex flex-col sm:flex-row  gap-2">
      <StatisticsCard
        label={t('statistics.active_contracts')}
        // todo: get active contracts count
        value={'13'}
        action={{
          label: 'Vezi lista',
          // todo: add functionality to view list of active contracts
          onClick: () => {},
        }}
      />
      <StatisticsCard
        label={t('statistics.in_signing_contracts')}
        // todo: get in signing contracts count
        value={'1'}
        action={{
          label: 'Vezi lista',
          // todo: add functionality to view list of in signing contracts
          onClick: () => {},
        }}
      />
      <StatisticsCard
        label={t('statistics.saved_contracts')}
        // todo: get saved contracts count
        value={'5'}
        action={{
          label: 'Vezi lista',
          // todo: add functionality to view list of saved contracts
          onClick: () => {},
        }}
      />
      <StatisticsCard
        label={t('statistics.to_expire_soon')}
        // todo: get to expire soon contracts count
        value={'12'}
        action={{
          label: 'Vezi lista',
          // todo: add functionality to view list of to expire soon contracts
          onClick: () => {},
        }}
      />
    </div>
  );
};
