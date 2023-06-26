import React from 'react';
import PageLayout from '../layouts/PageLayout';
import { Text, useTheme } from '@ui-kitten/components';
import OrganizationIdentity from '../components/OrganizationIdentity';
import { StyleSheet } from 'react-native';
import { View } from 'react-native';
import { useActiveOrganization } from '../store/organization/active-organization.selector';
import { useTranslation } from 'react-i18next';
import {
  useContractHistoryInfiniteQuery,
  usePendingContractsInfiniteQuery,
} from '../services/contract/contract.service';
import InfiniteListLayout from '../layouts/InfiniteListLayout';
import { IContractListItem } from '../common/interfaces/contract-list-item.interface';
import ContractItem from '../components/ContractItem';
import GrayIcon from '../components/GreyIcon';
import SectionWrapper from '../components/SectionWrapper';

interface ContractsProps {
  navigation: any;
  volunteerId: string;
}

export const PendingContractIcon = () => {
  const theme = useTheme();
  return (
    <GrayIcon
      name={'file-text'}
      style={{
        color: theme['yellow-500'],
      }}
    />
  );
};

export const CloseContractIcon = () => {
  const theme = useTheme();
  return (
    <GrayIcon
      name={'file-text'}
      style={{
        color: theme['gray-50'],
      }}
    />
  );
};

const Contracts = ({ volunteerId, navigation }: ContractsProps) => {
  // translations
  const { t } = useTranslation('documents');

  const {
    data: pendingContracts,
    isFetching: isFetchingPendingContracts,
    error: errorFetchingPendingContracts,
    hasNextPage: hasPendingNextPage,
    fetchNextPage: fetchPendingContractsNextPage,
    refetch: reloadPendingContracts,
  } = usePendingContractsInfiniteQuery(volunteerId);

  const {
    data: closedActiveContracts,
    isFetching: isLoadingClosedActiveContracts,
    error: errorFetchingClosedActiveContractsContracts,
    hasNextPage: hasNextPageHistory,
    fetchNextPage: fetchHistoryNextPage,
    refetch: reloadHistory,
  } = useContractHistoryInfiniteQuery(volunteerId);

  const onDownloadContract = (id: string) => {
    console.log('contract pressed', id);
  };

  const onPendingContractPress = (id: string) => {
    navigation.navigate('contract', { id });
  };

  const onLoadMoreHistory = () => {
    if (!isLoadingClosedActiveContracts && hasNextPageHistory) {
      fetchHistoryNextPage();
    }
  };

  const onLoadMorePending = () => {
    if (!isFetchingPendingContracts && hasPendingNextPage) {
      fetchPendingContractsNextPage();
    }
  };

  const onRenderHistoryContractListItem = ({ item }: { item: IContractListItem }) => (
    <ContractItem
      id={item.id}
      title={item.contractNumber}
      leftIcon={<CloseContractIcon />}
      startDate={item.startDate}
      endDate={item.endDate}
      rightIconName={'download'}
      onPress={onDownloadContract.bind(null, item.id)}
    />
  );

  const onRenderPendingContractListItem = ({ item }: { item: IContractListItem }) => (
    <ContractItem
      id={item.id}
      title={item.contractNumber}
      leftIcon={<PendingContractIcon />}
      startDate={item.startDate}
      endDate={item.endDate}
      rightIconName={'chevron-right'}
      onPress={onPendingContractPress.bind(null, item.id)}
    />
  );

  return (
    <>
      {pendingContracts?.pages[0].meta.totalItems !== 0 && !isFetchingPendingContracts && (
        <SectionWrapper title={t('sections.pending')}>
          <InfiniteListLayout<IContractListItem>
            pages={pendingContracts?.pages}
            renderItem={onRenderPendingContractListItem}
            loadMore={onLoadMorePending}
            isLoading={isFetchingPendingContracts}
            refetch={reloadPendingContracts}
            errorMessage={errorFetchingPendingContracts ? `${t('errors.generic')}` : undefined}
          />
        </SectionWrapper>
      )}
      <SectionWrapper title={t('sections.closed')}>
        <InfiniteListLayout<IContractListItem>
          pages={closedActiveContracts?.pages}
          renderItem={onRenderHistoryContractListItem}
          loadMore={onLoadMoreHistory}
          isLoading={isLoadingClosedActiveContracts}
          refetch={reloadHistory}
          errorMessage={
            errorFetchingClosedActiveContractsContracts ? `${t('errors.generic')}` : undefined
          }
        />
      </SectionWrapper>
    </>
  );
};

const Documents = ({ navigation }: any) => {
  // translations
  const { t } = useTranslation('documents');
  const { activeOrganization } = useActiveOrganization();

  return (
    <PageLayout onBackButtonPress={navigation.goBack} title={t('general:documents')}>
      <View style={styles.container}>
        {activeOrganization && (
          <OrganizationIdentity
            name={activeOrganization.name}
            uri={activeOrganization?.logo || ''}
          />
        )}
        <Text>{`${t('documents:description')}`}</Text>
        <Contracts
          navigation={navigation}
          volunteerId={activeOrganization?.volunteerId as string}
        />
      </View>
    </PageLayout>
  );
};

export default Documents;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 16,
  },
});
