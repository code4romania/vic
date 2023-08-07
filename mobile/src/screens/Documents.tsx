import React, { useCallback } from 'react';
import PageLayout from '../layouts/PageLayout';
import { Divider, Text, useTheme } from '@ui-kitten/components';
import OrganizationIdentity from '../components/OrganizationIdentity';
import { Platform, StyleSheet } from 'react-native';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  useContractHistoryInfiniteQuery,
  usePendingContractsInfiniteQuery,
} from '../services/contract/contract.service';
import { IContractListItem } from '../common/interfaces/contract-list-item.interface';
import ContractItem from '../components/ContractItem';
import GrayIcon from '../components/GreyIcon';
import SectionWrapper from '../components/SectionWrapper';
import { useFocusEffect } from '@react-navigation/native';
import { useUserProfile } from '../store/profile/profile.selector';
import * as FileSystem from 'expo-file-system';
import { shareAsync } from 'expo-sharing';
import { ALLOW_FONT_SCALLING, MIME_TYPES } from '../common/constants/constants';
import DocumentSkeletonList from '../components/skeleton/documents-skeleton-list';
import { mapContractStatus } from '../common/utils/helpers';
import ScrollViewLayout from '../layouts/ScrollViewLayout';
import SeeAllAction from '../components/SeeAllAction';
import { ListEmptyComponent } from '../layouts/InfiniteListLayout';

interface ContractsProps {
  navigation: any;
  volunteerId: string;
}

export const DocumentIcon = ({
  color,
  backgroundColor,
}: {
  backgroundColor?: string;
  color?: string;
}) => {
  const theme = useTheme();
  return (
    <GrayIcon
      name={'file-text'}
      backgroundColor={backgroundColor}
      style={{
        color: theme[color || 'gray-50'],
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
    refetch: reloadPendingContracts,
  } = usePendingContractsInfiniteQuery(volunteerId);

  const {
    data: closedActiveContracts,
    isFetching: isLoadingClosedActiveContracts,
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

  const onSeeAllPendingActionPress = () => {
    navigation.navigate('pending-contracts');
  };

  const onSeeAllSignedActionPress = () => {
    navigation.navigate('contract-history');
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

  if (isFetchingPendingContracts || isLoadingClosedActiveContracts) {
    return <DocumentSkeletonList />;
  }

  return (
    <ScrollViewLayout>
      {pendingContracts?.pages[0].meta.totalItems !== 0 && (
        <SectionWrapper
          title={t('sections.pending')}
          action={<SeeAllAction onPress={onSeeAllPendingActionPress} />}
        >
          <View>
            {pendingContracts?.pages[0].items.map((item, index) => (
              <View key={item.id}>
                <ContractItem
                  id={item.id}
                  title={item.contractNumber}
                  leftIcon={<DocumentIcon color="yellow-500" backgroundColor="yellow-50" />}
                  startDate={item.startDate}
                  endDate={item.endDate}
                  rightIconName={'chevron-right'}
                  onPress={onPendingContractPress.bind(null, item.id)}
                />
                {index < pendingContracts.pages[0].items.length - 1 && <Divider />}
              </View>
            ))}
          </View>
        </SectionWrapper>
      )}
      <SectionWrapper
        title={t('sections.closed')}
        action={<SeeAllAction onPress={onSeeAllSignedActionPress} />}
      >
        <View>
          {closedActiveContracts?.pages[0].items.map((item, index) => (
            <View key={item.id}>
              <View>{onRenderHistoryContractListItem({ item })}</View>
              {index < closedActiveContracts.pages[0].items.length - 1 && <Divider />}
            </View>
          ))}
          {closedActiveContracts?.pages[0].items.length === 0 && <ListEmptyComponent />}
        </View>
      </SectionWrapper>
    </ScrollViewLayout>
  );
};

const Documents = ({ navigation, route }: any) => {
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
          volunteerId={
            route.params?.volunteerId || (userProfile?.activeOrganization?.volunteerId as string)
          }
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
