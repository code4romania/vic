import React from 'react';
import PageLayout from '../layouts/PageLayout';
import Tabs from '../components/Tabs';
import i18n from '../common/config/i18n';
import { SelectItem } from '../components/Select';
import PageHeader from '../components/PageHeader';
import { ContractType } from '../common/enums/contract-type.enum';
import TemplatesTableWithQueryParams from '../containers/query/TemplatesTableWithQueryParams';
import { ContractsProps } from '../containers/query/ContractsWithQueryParams';

const DocumentsTabsOptions: SelectItem<ContractType>[] = [
  { key: ContractType.CONTRACT, value: i18n.t('documents:contracts.list') },
  { key: ContractType.TEMPLATE, value: i18n.t('general:templates') },
];

const Contracts = ({ query, setQuery }: ContractsProps) => {
  // routing

  const onTabClick = (tab: ContractType) => {
    setQuery({ contractType: tab }, 'push');
  };

  return (
    <PageLayout>
      <PageHeader>{i18n.t('documents:contracts.title')}</PageHeader>
      <p className="text-cool-gray-500">{i18n.t('documents:contracts.description')}</p>
      <Tabs<ContractType>
        tabs={DocumentsTabsOptions}
        onClick={onTabClick}
        defaultTab={DocumentsTabsOptions.find((tab) => tab.key === query?.contractType)}
      >
        {query?.contractType === ContractType.CONTRACT && <div>{'contracts'}</div>}
        {query?.contractType === ContractType.TEMPLATE && <TemplatesTableWithQueryParams />}
      </Tabs>
    </PageLayout>
  );
};

export default Contracts;
