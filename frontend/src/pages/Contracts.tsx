import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  CheckCircleIcon,
  ClockIcon,
  DocumentCheckIcon,
  DocumentMinusIcon,
  DocumentTextIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import PageHeader from '../components/PageHeader';
import StatisticsCard from '../components/StatisticsCard';
import ContractsTableWithQueryParams from '../containers/query/ContractsTableWithQueryParams';
import PageLayout from '../layouts/PageLayout';
import Card from '../layouts/CardLayout';
import { ContractStatus } from '../common/enums/contract-status.enum';
import { useContractCountersQuery } from '../services/contracts/contracts.service';

const COUNTERS = [
  { status: ContractStatus.SIGNED, Icon: DocumentCheckIcon, color: 'text-figure-green' },
  { status: ContractStatus.PENDING, Icon: DocumentTextIcon, color: 'text-figure-amber' },
  { status: ContractStatus.EXPIRED, Icon: DocumentMinusIcon, color: 'text-cool-gray-500' },
];

// VIC 2.0, #486/#489: every contract and certificate the NGO uploaded, signed, with its period.
// No templates and no generation of contracts; certificates are generated (#490).
const Contracts = () => {
  const { t } = useTranslation('documents');
  const { data: counters } = useContractCountersQuery();

  const list = (key: 'upload' | 'status') =>
    (t(`page.how.${key}.items`, { returnObjects: true }) as string[]).map((item) => (
      <li key={item}>{item}</li>
    ));

  return (
    <PageLayout>
      <ContractsTableWithQueryParams
        renderHeader={(actions) => (
          <>
            <PageHeader subtitle={t('page.subtitle')} actions={actions}>
              {t('page.title')}
            </PageHeader>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 xl:gap-6">
              {COUNTERS.map(({ status, Icon, color }) => (
                <StatisticsCard
                  key={status}
                  label={t(`page.counters.${status}.label`)}
                  value={`${counters?.[status] ?? '-'}`}
                  icon={<Icon className={`w-5 h-5 ${color}`} aria-hidden="true" />}
                  info={
                    <span className="text-cool-gray-500 font-roboto">
                      {t(`page.counters.${status}.info`)}
                    </span>
                  }
                />
              ))}
            </div>
          </>
        )}
      />
      <Card>
        <div className="p-5 sm:p-6 flex flex-col gap-4">
          <h2 className="flex items-center gap-2">
            <InformationCircleIcon className="w-5 h-5 text-navy" aria-hidden="true" />
            {t('page.how.title')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="flex items-center gap-2 mb-2">
                <ClockIcon className="w-5 h-5 text-navy" aria-hidden="true" />
                {t('page.how.upload.title')}
              </h3>
              <ul className="list-disc pl-6 space-y-1 text-cool-gray-600">{list('upload')}</ul>
            </div>
            <div>
              <h3 className="flex items-center gap-2 mb-2">
                <CheckCircleIcon className="w-5 h-5 text-navy" aria-hidden="true" />
                {t('page.how.status.title')}
              </h3>
              <ul className="list-disc pl-6 space-y-1 text-cool-gray-600">{list('status')}</ul>
            </div>
          </div>
        </div>
      </Card>
    </PageLayout>
  );
};

export default Contracts;
