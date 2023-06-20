import React from 'react';
import PageLayout from '../layouts/PageLayout';
import { Text } from '@ui-kitten/components';
import OrganizationIdentity from '../components/OrganizationIdentity';
import { StyleSheet } from 'react-native';
import { View } from 'react-native';
import { useActiveOrganization } from '../store/organization/active-organization.selector';
import ContractList from '../components/ContractList';
import { ContractStatus } from '../common/enums/contract-status.enum';
import { useTranslation } from 'react-i18next';
import { useContractsInfiniteQuery } from '../services/contract/contract.service';
import { mapPagesToItems } from '../common/utils/helpers';
import { IContractListItem } from '../common/interfaces/contract-list-item.interface';
import LoadingScreen from '../components/LoadingScreen';
import { JSONStringifyError } from '../common/utils/utils';

interface ContractsProps {
  navigation: any;
  volunteerId: string;
}

const Contracts = ({ volunteerId, navigation }: ContractsProps) => {
  // translations
  const { t } = useTranslation('documents');

  // load pending contracts
  const {
    data: pendingContracts,
    isFetching: isLoadingPendingContracts,
    error: errorFetchingPendingContracts,
  } = useContractsInfiniteQuery(volunteerId, ContractStatus.PENDING_VOLUNTEER);

  const {
    data: closedActiveContracts,
    isFetching: isLoadingClosedActiveContracts,
    error: errorFetchingClosedActiveContractsContracts,
  } = useContractsInfiniteQuery(volunteerId, ContractStatus.ACTIVE);

  const onContractPress = (id: string) => {
    console.log('contract pressed', id);
  };

  const onPendingContractPress = (id: string) => {
    navigation.navigate('contract', { id });
  };

  if (errorFetchingPendingContracts) {
    return <Text>{JSONStringifyError(errorFetchingPendingContracts as any)}</Text>;
  }

  if (errorFetchingClosedActiveContractsContracts) {
    return <Text>{JSONStringifyError(errorFetchingClosedActiveContractsContracts as any)}</Text>;
  }

  if (isLoadingPendingContracts || isLoadingClosedActiveContracts) {
    return <LoadingScreen />;
  }

  return (
    <>
      <ContractList
        heading={t('sections.pending')}
        status={ContractStatus.PENDING_VOLUNTEER}
        contracts={mapPagesToItems<IContractListItem>(pendingContracts?.pages)}
        onContractItemPress={onPendingContractPress}
      />
      <ContractList
        heading={t('sections.closed')}
        status={ContractStatus.CLOSED}
        contracts={mapPagesToItems<IContractListItem>(closedActiveContracts?.pages)}
        onContractItemPress={onContractPress}
      />
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
