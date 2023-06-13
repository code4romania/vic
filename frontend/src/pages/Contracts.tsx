import React, { useEffect } from 'react';
import PageLayout from '../layouts/PageLayout';
import Tabs from '../components/Tabs';
import i18n from '../common/config/i18n';
import { SelectItem } from '../components/Select';
import PageHeader from '../components/PageHeader';
import { ContractType } from '../common/enums/contract-type.enum';
import TemplatesTableWithQueryParams from '../containers/query/TemplatesTableWithQueryParams';
import { ContractsProps } from '../containers/query/ContractsWithQueryParams';
import ContractsTableWithQueryParams from '../containers/query/ContractsTableWithQueryParams';
import { useTranslation } from 'react-i18next';
import StatisticsCard from '../components/StatisticsCard';
import { useActiveContractsCountQuery } from '../services/contracts/contracts.service';
import { useErrorToast } from '../hooks/useToast';
import { InternalErrors } from '../common/errors/internal-errors.class';

const DocumentsTabsOptions: SelectItem<ContractType>[] = [
  { key: ContractType.CONTRACT, value: i18n.t('general:contracts') },
  { key: ContractType.TEMPLATE, value: i18n.t('general:templates') },
];

const Contracts = ({ query, setQuery }: ContractsProps) => {
  const { t } = useTranslation('documents');

  // active count
  const { data: numberOfActiveContracts, error } = useActiveContractsCountQuery();

  useEffect(() => {
    if (error)
      useErrorToast(InternalErrors.CONTRACT_ERRORS.getError(error.response?.data.code_error));
  }, [error]);

  const onTabClick = (tab: ContractType) => {
    setQuery({ contractType: tab }, 'push');
  };

  const onStatisticsCardClick = () => {
    console.log('click here');
  };

  return (
    <PageLayout>
      <PageHeader>{t('title')}</PageHeader>
      <p className="text-cool-gray-500">{t('description')}</p>
      <Tabs<ContractType>
        tabs={DocumentsTabsOptions}
        onClick={onTabClick}
        defaultTab={DocumentsTabsOptions.find((tab) => tab.key === query?.contractType)}
      >
        {query?.contractType === ContractType.CONTRACT && (
          <>
            <div className="max-w-[350px]">
              <StatisticsCard
                label={t('contracts.statistics.title')}
                value={numberOfActiveContracts?.toString() || '0'}
                action={{
                  label: t('contracts.statistics.action'),
                  onClick: onStatisticsCardClick,
                }}
              />
            </div>
            <ContractsTableWithQueryParams />
          </>
        )}
        {query?.contractType === ContractType.TEMPLATE && <TemplatesTableWithQueryParams />}
      </Tabs>
    </PageLayout>
  );
};

export default Contracts;
