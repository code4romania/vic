import React from 'react';
import { useTranslation } from 'react-i18next';
import { useContractHistoryInfiniteQuery } from '../services/contract/contract.service';
import { useUserProfile } from '../store/profile/profile.selector';
import { ContractsListPage } from '../components/documents/ContractsListPage';

const ContractHistory = ({ navigation }: any) => {
  const { t } = useTranslation('documents');
  const { userProfile } = useUserProfile();
  const query = useContractHistoryInfiniteQuery(
    userProfile?.activeOrganization?.volunteerId as string,
  );
  return (
    <ContractsListPage
      navigation={navigation}
      title={`${t('sections.closed')}`}
      kind="signed"
      query={query as any}
      testID="contract-history"
    />
  );
};

export default ContractHistory;
