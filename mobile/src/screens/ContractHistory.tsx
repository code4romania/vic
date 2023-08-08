import React, { useCallback } from 'react';
import PageLayout from '../layouts/PageLayout';
import InfiniteListLayout from '../layouts/InfiniteListLayout';
import { useTranslation } from 'react-i18next';
import { useContractHistoryInfiniteQuery } from '../services/contract/contract.service';
import { useUserProfile } from '../store/profile/profile.selector';
import ContractItem from '../components/ContractItem';
import { IContractListItem } from '../common/interfaces/contract-list-item.interface';
import { DocumentIcon } from './Documents';
import OrganizationSkeletonListItem from '../components/skeleton/organization-sekelton-item';
import { useFocusEffect } from '@react-navigation/native';
import { mapContractStatus } from '../common/utils/helpers';
import { Platform } from 'react-native';
import { MIME_TYPES } from '../common/constants/constants';
import * as FileSystem from 'expo-file-system';
import { shareAsync } from 'expo-sharing';

const ContractHistory = ({ navigation }: any) => {
  const { t } = useTranslation('documents');

  const { userProfile } = useUserProfile();

  const {
    data: closedActiveContracts,
    isFetching: isLoadingClosedActiveContracts,
    error: errorFetchingClosedActiveContractsContracts,
    hasNextPage: hasNextPageHistory,
    fetchNextPage: fetchHistoryNextPage,
    refetch: reloadHistory,
    isFetchingNextPage,
  } = useContractHistoryInfiniteQuery(userProfile?.activeOrganization?.volunteerId as string);

  useFocusEffect(
    useCallback(() => {
      // Your onInit logic goes here
      reloadHistory();
    }, [reloadHistory]),
  );

  const onLoadMoreHistory = () => {
    if (!isLoadingClosedActiveContracts && hasNextPageHistory) {
      fetchHistoryNextPage();
    }
  };

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

  const onRenderHistoryContractListItem = ({ item }: { item: IContractListItem }) => {
    const layoutProps = mapContractStatus(item.status);
    return (
      <ContractItem
        id={item.id}
        title={item.contractNumber}
        info={layoutProps?.label ? `${t(layoutProps?.label)}` : ''}
        leftIcon={
          <DocumentIcon color={layoutProps?.color} backgroundColor={layoutProps?.backgroundColor} />
        }
        startDate={item.startDate}
        endDate={item.endDate}
        rightIconName={'download'}
        onPress={onDownloadContract.bind(null, item)}
      />
    );
  };

  return (
    <PageLayout title={t('sections.closed')} onBackButtonPress={navigation.goBack}>
      <InfiniteListLayout<IContractListItem>
        pages={closedActiveContracts?.pages}
        renderItem={onRenderHistoryContractListItem}
        loadMore={onLoadMoreHistory}
        isLoading={isLoadingClosedActiveContracts && !isFetchingNextPage}
        refetch={reloadHistory}
        loadingLayout={<OrganizationSkeletonListItem />}
        loadingElementsCount="small"
        errorMessage={
          errorFetchingClosedActiveContractsContracts ? `${t('errors.generic')}` : undefined
        }
      />
    </PageLayout>
  );
};

export default ContractHistory;
