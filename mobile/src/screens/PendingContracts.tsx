import React, { useCallback } from 'react';
import PageLayout from '../layouts/PageLayout';
import InfiniteListLayout from '../layouts/InfiniteListLayout';
import { useTranslation } from 'react-i18next';
import { usePendingContractsInfiniteQuery } from '../services/contract/contract.service';
import { useUserProfile } from '../store/profile/profile.selector';
import ContractItem from '../components/ContractItem';
import { IContractListItem } from '../common/interfaces/contract-list-item.interface';
import { DocumentIcon } from './Documents';
import OrganizationSkeletonListItem from '../components/skeleton/organization-sekelton-item';
import { useFocusEffect } from '@react-navigation/native';

const PendingContracts = ({ navigation }: any) => {
  const { t } = useTranslation('documents');

  const { userProfile } = useUserProfile();

  const {
    data: pendingContracts,
    isFetching: isFetchingPendingContracts,
    error: errorFetchingPendingContracts,
    hasNextPage: hasPendingNextPage,
    fetchNextPage: fetchPendingContractsNextPage,
    refetch: reloadPendingContracts,
    isFetchingNextPage,
  } = usePendingContractsInfiniteQuery(userProfile?.activeOrganization?.volunteerId as string);

  useFocusEffect(
    useCallback(() => {
      // Your onInit logic goes here
      reloadPendingContracts();
    }, [reloadPendingContracts]),
  );

  const onLoadMorePending = () => {
    if (!isFetchingPendingContracts && hasPendingNextPage) {
      fetchPendingContractsNextPage();
    }
  };

  const onPendingContractPress = (id: string) => {
    navigation.navigate('contract', { id });
  };

  const onRenderPendingContractListItem = ({ item }: { item: IContractListItem }) => (
    <ContractItem
      id={item.id}
      title={item.contractNumber}
      leftIcon={<DocumentIcon color="yellow-500" backgroundColor="yellow-50" />}
      startDate={item.startDate}
      endDate={item.endDate}
      rightIconName={'chevron-right'}
      onPress={onPendingContractPress.bind(null, item.id)}
    />
  );

  return (
    <PageLayout title={t('sections.pending')} onBackButtonPress={navigation.goBack}>
      <InfiniteListLayout<IContractListItem>
        pages={pendingContracts?.pages}
        renderItem={onRenderPendingContractListItem}
        loadMore={onLoadMorePending}
        isLoading={isFetchingPendingContracts && !isFetchingNextPage}
        refetch={reloadPendingContracts}
        loadingLayout={<OrganizationSkeletonListItem />}
        loadingElementsCount="small"
        errorMessage={errorFetchingPendingContracts ? `${t('errors.generic')}` : undefined}
      />
    </PageLayout>
  );
};

export default PendingContracts;
