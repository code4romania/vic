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
import { DocumentContract } from '../services/documents/documents.api';
import { isAfter } from 'date-fns';
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
        (contract: DocumentContract) =>
          contract.status === DocumentContractStatus.PENDING_APPROVAL_NGO ||
          contract.status === DocumentContractStatus.PENDING_NGO_REPRESENTATIVE_SIGNATURE ||
          contract.status === DocumentContractStatus.PENDING_VOLUNTEER_SIGNATURE,
      ),
    [allContracts, isLoadingAllContracts],
  );

  const approvedContracts = useMemo(
    () =>
      allContracts &&
      !isLoadingAllContracts &&
      allContracts.items.filter(
        (contract: DocumentContract) => contract.status === DocumentContractStatus.APPROVED,
      ),
    [allContracts, isLoadingAllContracts],
  );

  const rejectedContracts = useMemo(
    () =>
      allContracts &&
      !isLoadingAllContracts &&
      allContracts.items.filter(
        (contract: DocumentContract) =>
          contract.status === DocumentContractStatus.REJECTED_NGO ||
          contract.status === DocumentContractStatus.REJECTED_VOLUNTEER,
      ),
    [allContracts, isLoadingAllContracts],
  );

  const actionExpiredContracts = useMemo(
    () =>
      allContracts &&
      !isLoadingAllContracts &&
      allContracts.items.filter(
        (contract: DocumentContract) => contract.status === DocumentContractStatus.ACTION_EXPIRED,
      ),
    [allContracts, isLoadingAllContracts],
  );

  // an activeContract exists if the current date is between the document start and end date
  const activeContractExists = useMemo(
    () =>
      approvedContracts &&
      approvedContracts.find(
        (contract: DocumentContract) =>
          isAfter(new Date(), new Date(contract.documentStartDate)) &&
          isAfter(new Date(contract.documentEndDate), new Date()),
      ),
    [approvedContracts],
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

  const onContractPress = (contract: DocumentContract) => {
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
            {pendingSignatureContracts.map((item: DocumentContract, index: number) => (
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
        {(approvedContracts.length > 0 || rejectedContracts.length > 0) && (
          <View style={styles.contractsContainer}>
            <Text
              category="p2"
              allowFontScaling={ALLOW_FONT_SCALLING}
            >{`${t('approved_history')}`}</Text>
            {approvedContracts.map((item: DocumentContract, index: number) => {
              const { color, backgroundColor, info } = mapContractToColor(item, t);
              return (
                <View key={item.documentId}>
                  <ContractItem
                    id={item.documentId}
                    title={item.documentNumber}
                    leftIcon={<DocumentIcon color={color} backgroundColor={backgroundColor} />}
                    rightIconName={'chevron-right'}
                    startDate={item.documentStartDate}
                    endDate={item.documentEndDate}
                    // todo: download contract
                    onPress={() => onContractPress(item)}
                    info={info}
                  />
                  {rejectedContracts.length > 0 ? (
                    <Divider />
                  ) : (
                    index < approvedContracts.length - 1 && <Divider />
                  )}
                </View>
              );
            })}
            {rejectedContracts.map((item: DocumentContract, index: number) => {
              return (
                <View key={item.documentId}>
                  <ContractItem
                    id={item.documentId}
                    title={item.documentNumber}
                    leftIcon={<DocumentIcon color={'red-500'} backgroundColor={'red-50'} />}
                    rightIconName={'chevron-right'}
                    startDate={item.documentStartDate}
                    endDate={item.documentEndDate}
                    // todo: download contract
                    onPress={() => onContractPress(item)}
                    info={`${t('rejected')}`}
                  />
                  {index < rejectedContracts.length - 1 && <Divider />}
                </View>
              );
            })}
            {actionExpiredContracts.map((item: DocumentContract, index: number) => {
              return (
                <View key={item.documentId}>
                  <ContractItem
                    id={item.documentId}
                    title={item.documentNumber}
                    leftIcon={
                      <DocumentIcon color={'color-danger-800'} backgroundColor={'red-50'} />
                    }
                    rightIconName={'chevron-right'}
                    startDate={item.documentStartDate}
                    endDate={item.documentEndDate}
                    // todo: download contract
                    onPress={() => onContractPress(item)}
                    info={`${t('action_expired')}`}
                  />
                  {index < actionExpiredContracts.length - 1 && <Divider />}
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
