import React, { useMemo } from 'react';
import PageLayout from '../layouts/PageLayout';
import { usePaddingTop } from '../hooks/usePaddingTop';
import { useTranslation } from 'react-i18next';
import { useUserProfile } from '../store/profile/profile.selector';
import OrganizationIdentity from '../components/OrganizationIdentity';
import { View, StyleSheet } from 'react-native';
import { Divider, Text } from '@ui-kitten/components';
import { ALLOW_FONT_SCALLING } from '../common/constants/constants';
import { useGetContractsQuery } from '../services/documents/documents.service';
import ContractItem from '../components/ContractItem';
import { DocumentIcon } from './Documents';
import { IDocumentContract } from '../services/documents/documents.api';
import Disclaimer from '../components/Disclaimer';
import DocumentSkeletonList from '../components/skeleton/documents-skeleton-list';
import { DocumentContractStatus } from '../common/enums/document-contract-status.enum';
import { mapContractToColor } from '../common/utils/document-contracts.helpers';
import ScrollViewLayout from '../layouts/ScrollViewLayout';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const DocumentsContracts = ({ navigation }: any) => {
  const { t } = useTranslation('documents-contract');
  const paddingTop = usePaddingTop();
  const insets = useSafeAreaInsets();

  const { userProfile } = useUserProfile();

  const { data: allContracts, isLoading: isLoadingAllContracts } = useGetContractsQuery(
    userProfile?.activeOrganization?.volunteerId,
    { organizationId: userProfile?.activeOrganization?.id },
  );

  const pendingSignatureContracts = useMemo(
    () =>
      allContracts &&
      !isLoadingAllContracts &&
      allContracts.items.filter(
        (contract: IDocumentContract) =>
          contract.status === DocumentContractStatus.PENDING_APPROVAL_NGO ||
          contract.status === DocumentContractStatus.PENDING_NGO_REPRESENTATIVE_SIGNATURE ||
          contract.status === DocumentContractStatus.PENDING_VOLUNTEER_SIGNATURE,
      ),
    [allContracts, isLoadingAllContracts],
  );

  // all contracts that are not pending
  const contractsHistory = useMemo(() => {
    return (
      allContracts &&
      !isLoadingAllContracts &&
      allContracts.items.filter(
        (contract: IDocumentContract) =>
          contract.status !== DocumentContractStatus.PENDING_APPROVAL_NGO &&
          contract.status !== DocumentContractStatus.PENDING_NGO_REPRESENTATIVE_SIGNATURE &&
          contract.status !== DocumentContractStatus.PENDING_VOLUNTEER_SIGNATURE,
      )
    );
  }, [allContracts, isLoadingAllContracts]);

  const activeContractExists = useMemo(
    () =>
      contractsHistory &&
      contractsHistory.find(
        (contract: IDocumentContract) => contract.status === DocumentContractStatus.ACTIVE,
      ),
    [contractsHistory],
  );

  if (isLoadingAllContracts) {
    return (
      <PageLayout
        onBackButtonPress={navigation.goBack}
        title={t('title')}
        headerStyle={{ paddingTop: paddingTop }}
      >
        <View style={styles.container}>
          {userProfile?.activeOrganization && (
            <OrganizationIdentity
              name={userProfile?.activeOrganization.name}
              uri={userProfile?.activeOrganization?.logo || ''}
            />
          )}
          <DocumentSkeletonList />
        </View>
      </PageLayout>
    );
  }

  const onContractPress = (contract: IDocumentContract) => {
    navigation.navigate('documents/contract', { contract });
  };

  return (
    <PageLayout
      onBackButtonPress={navigation.goBack}
      title={t('title')}
      headerStyle={{ paddingTop: paddingTop }}
    >
      {!activeContractExists && (
        <Disclaimer color={'red'} text={`${t('no_active_contract.title')}`} />
      )}
      <ScrollViewLayout style={[styles.container, { marginBottom: insets.bottom + 16 }]}>
        {userProfile?.activeOrganization && (
          <OrganizationIdentity
            name={userProfile?.activeOrganization.name}
            uri={userProfile?.activeOrganization?.logo || ''}
          />
        )}
        <Text category="p1" allowFontScaling={ALLOW_FONT_SCALLING}>
          {activeContractExists ? `${t('description')}` : `${t('no_active_contract_description')}`}
        </Text>

        {/* pending documents section */}
        {pendingSignatureContracts.length > 0 && (
          <View style={styles.contractsContainer}>
            <Text
              category="p2"
              allowFontScaling={ALLOW_FONT_SCALLING}
            >{`${t('pending_documents')}`}</Text>
            {/* pending volunteer signature contracts list */}
            {pendingSignatureContracts.map((item: IDocumentContract, index: number) => (
              <View key={item.documentId}>
                <ContractItem
                  id={item.documentId}
                  title={item.documentNumber}
                  leftIcon={<DocumentIcon color="yellow-500" backgroundColor="yellow-50" />}
                  startDate={item.documentStartDate}
                  endDate={item.documentEndDate}
                  rightIconName={'chevron-right'}
                  onPress={() => onContractPress(item)}
                />
                {index < pendingSignatureContracts.length - 1 && <Divider />}
              </View>
            ))}
          </View>
        )}

        {/* contracts history: approved & rejected */}
        {contractsHistory.length > 0 && (
          <View style={styles.contractsContainer}>
            <Text
              category="p2"
              allowFontScaling={ALLOW_FONT_SCALLING}
            >{`${t('approved_history')}`}</Text>
            {contractsHistory.map((item: IDocumentContract, index: number) => {
              const { color, backgroundColor, info } = mapContractToColor(item);
              return (
                <View key={item.documentId}>
                  <ContractItem
                    id={item.documentId}
                    title={item.documentNumber}
                    leftIcon={<DocumentIcon color={color} backgroundColor={backgroundColor} />}
                    rightIconName={'chevron-right'}
                    startDate={item.documentStartDate}
                    endDate={item.documentEndDate}
                    onPress={() => onContractPress(item)}
                    info={info}
                  />
                  {index < contractsHistory.length - 1 && <Divider />}
                </View>
              );
            })}
          </View>
        )}
      </ScrollViewLayout>
    </PageLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 24,
  },
  contractsContainer: {
    gap: 8,
  },
});
