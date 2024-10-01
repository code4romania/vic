import React from 'react';
import StatisticsCard from './StatisticsCard';
import { useTranslation } from 'react-i18next';
import { IDocumentContractsStatistics } from '../common/interfaces/document-contract.interface';
import { UpdateType } from '../common/interfaces/hoc-query-props.interface';
import { DocumentContractsTableQueryProps } from './DocumentContractsTable';
import { DocumentContractStatusForFilter } from '../common/enums/document-contract-status.enum';

interface ContractsStatisticsProps {
  statistics: IDocumentContractsStatistics;
  isLoading: boolean;
  setQuery: (changes: DocumentContractsTableQueryProps, updateType?: UpdateType) => void;
}

export const ContractsStatistics = ({ statistics, isLoading, setQuery }: ContractsStatisticsProps) => {
  const { t } = useTranslation('volunteering_contracts');

  return (
    <div className="flex flex-col sm:flex-row  gap-2">
      <StatisticsCard
        className="w-full"
        label={t('statistics.saved_contracts')}
        value={statistics?.pendingNgoRepresentativeSignature.toString()}
        action={{
          label: t('statistics.view_list'),
          onClick: () => { setQuery({ status: DocumentContractStatusForFilter.PENDING_NGO_REPRESENTATIVE_SIGNATURE }, 'push') },
        }}
        isLoading={isLoading}
      />
      <StatisticsCard
        className="w-full"
        label={t('statistics.in_signing_contracts')}
        value={statistics?.pendingVolunteerSignature.toString()}
        action={{
          label: t('statistics.view_list'),
          onClick: () => { setQuery({ status: DocumentContractStatusForFilter.PENDING_VOLUNTEER_SIGNATURE }, 'push') },
        }}
        isLoading={isLoading}
      />

      <StatisticsCard
        className="w-full"
        label={t('statistics.active_contracts')}
        value={statistics?.activeContracts.toString()}
        action={{
          label: t('statistics.view_list'),
          onClick: () => { setQuery({ status: DocumentContractStatusForFilter.ACTIVE }, 'push') },
        }}
        isLoading={isLoading}
      />
      <StatisticsCard
        className="w-full"
        label={t('statistics.to_expire_soon')}
        value={statistics?.soonToExpire.toString()}
        action={{
          label: t('statistics.view_list'),
          onClick: () => { setQuery({ endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), status: DocumentContractStatusForFilter.ACTIVE }, 'push') },
        }}
        isLoading={isLoading}
      />
    </div>
  );
};
