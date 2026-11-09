import React from 'react';
import { useTranslation } from 'react-i18next';
import { usePendingContractsInfiniteQuery } from '../services/contract/contract.service';
import { useUserProfile } from '../store/profile/profile.selector';
import { ContractsListPage } from '../components/documents/ContractsListPage';

const PendingContracts = ({ navigation }: any) => {
  const { t } = useTranslation('documents');
  const { userProfile } = useUserProfile();
  const query = usePendingContractsInfiniteQuery(
    userProfile?.activeOrganization?.volunteerId as string,
  );
  return (
    <ContractsListPage
      navigation={navigation}
      title={`${t('sections.pending')}`}
      kind="pending"
      query={query as any}
      testID="pending-contracts"
    />
  );
};

export default PendingContracts;
