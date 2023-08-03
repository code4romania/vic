import React, { useCallback } from 'react';
import PageLayout from '../layouts/PageLayout';
import { Text, useTheme } from '@ui-kitten/components';
import OrganizationIdentity from '../components/OrganizationIdentity';
import { Platform, StyleSheet } from 'react-native';
import { View } from 'react-native';
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
import { useFocusEffect } from '@react-navigation/native';
import { useUserProfile } from '../store/profile/profile.selector';
import OrganizationSkeletonListItem from '../components/skeleton/organization-sekelton-item';
import * as FileSystem from 'expo-file-system';
import { shareAsync } from 'expo-sharing';
import { ALLOW_FONT_SCALLING, MIME_TYPES } from '../common/constants/constants';
import DocumentSkeletonList from '../components/skeleton/documents-skeleton-list';

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

  useFocusEffect(
    useCallback(() => {
      // Your onInit logic goes here
      reloadPendingContracts();
      reloadHistory();
    }, [reloadPendingContracts, reloadHistory]),
  );

  const onDownloadContract = async (contract: IContractListItem) => {
    if (contract) {
      let LocalPath = FileSystem.documentDirectory + contract.contractFileName;
      const file = await FileSystem.downloadAsync(contract?.path, LocalPath);
      save(
        file.uri,
        contract.contractFileName,
        MIME_TYPES[contract.contractFileName.split('.')[1]] as string,
      );
    }
  };

  const save = async (uri: string, fileName: string, mimetype: string) => {
    // This has support only for Android 11 or more as expo requires to eject project in order to save to downloads
    if (Platform.OS === 'android' && Platform.Version >= 30) {
      const permissions =
        await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();

      if (permissions.granted) {
        const base64 = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        await FileSystem.StorageAccessFramework.createFileAsync(
          permissions.directoryUri,
          fileName,
          mimetype,
        )
          .then(async (resultUri) => {
            await FileSystem.writeAsStringAsync(resultUri, base64, {
              encoding: FileSystem.EncodingType.Base64,
            });
          })
          .catch(console.log);
      } else {
        shareAsync(uri);
      }
    } else {
      shareAsync(uri);
    }
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
      onPress={onDownloadContract.bind(null, item)}
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

  if (isFetchingPendingContracts || isLoadingClosedActiveContracts) {
    return <DocumentSkeletonList />;
  }

  return (
    <View style={styles.contractsContainer}>
      {pendingContracts?.pages[0].meta.totalItems !== 0 && (
        <SectionWrapper title={t('sections.pending')}>
          <InfiniteListLayout<IContractListItem>
            pages={pendingContracts?.pages}
            renderItem={onRenderPendingContractListItem}
            loadMore={onLoadMorePending}
            isLoading={isFetchingPendingContracts}
            refetch={reloadPendingContracts}
            loadingLayout={<OrganizationSkeletonListItem />}
            loadingElementsCount="small"
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
          loadingLayout={<OrganizationSkeletonListItem />}
          loadingElementsCount="small"
          errorMessage={
            errorFetchingClosedActiveContractsContracts ? `${t('errors.generic')}` : undefined
          }
        />
      </SectionWrapper>
    </View>
  );
};

const Documents = ({ navigation }: any) => {
  // translations
  const { t } = useTranslation('documents');
  const { userProfile } = useUserProfile();

  return (
    <PageLayout onBackButtonPress={navigation.goBack} title={t('general:documents')}>
      <View style={styles.container}>
        {userProfile?.activeOrganization && (
          <OrganizationIdentity
            name={userProfile?.activeOrganization.name}
            uri={userProfile?.activeOrganization?.logo || ''}
          />
        )}
        <Text category="p1" allowFontScaling={ALLOW_FONT_SCALLING}>{`${t(
          'documents:description',
        )}`}</Text>
        <Contracts
          navigation={navigation}
          volunteerId={userProfile?.activeOrganization?.volunteerId as string}
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
  contractsContainer: {
    paddingTop: 16,
  },
});
