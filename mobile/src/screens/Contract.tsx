import React, { useEffect, useState } from 'react';
import PageLayout from '../layouts/PageLayout';
import { useContractQuery, useSignContractMutation } from '../services/contract/contract.service';
import LoadingScreen from '../components/LoadingScreen';
import { useTranslation } from 'react-i18next';
import Disclaimer from '../components/Disclaimer';
import { ContractStatus } from '../common/enums/contract-status.enum';
import Toast from 'react-native-toast-message';
import { InternalErrors } from '../common/errors/internal-errors.class';
import { useActiveOrganization } from '../store/organization/active-organization.selector';
import OrganizationIdentity from '../components/OrganizationIdentity';
import FormLayout from '../layouts/FormLayout';
import { Text, useTheme } from '@ui-kitten/components';
import { StyleSheet, View } from 'react-native';
import ContractItem from '../components/ContractItem';
import { PendingContractIcon } from './Documents';
import { ButtonType } from '../common/enums/button-type.enum';
import * as FileSystem from 'expo-file-system';
import { shareAsync } from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import useStore from '../store/store';

const Contract = ({ navigation, route }: any) => {
  const { t } = useTranslation('documents');
  // contract param
  const { id } = route.params;
  // theme
  const theme = useTheme();
  // document state
  const [selectedContract, setSelectedContract] = useState<DocumentPicker.DocumentResult | null>(
    null,
  );
  // active organization
  const { activeOrganization } = useActiveOrganization();
  // bottom sheet state
  const { open: openBottomSheet, close: closeBottomSheet } = useStore();
  // contract request
  const {
    data: contract,
    isFetching: isLoadingContract,
    error: getContractError,
  } = useContractQuery(id);

  // sign contract
  const { mutate: signContract, isLoading: isUploadingContract } = useSignContractMutation();

  useEffect(() => {
    // go back and show error
    if (getContractError) {
      Toast.show({
        type: 'error',
        text1: `${InternalErrors.CONTRACT_ERRORS.getError(
          (getContractError as any).response?.data.code_error,
        )}`,
      });
      navigation.goBack();
    }
  }, [getContractError, navigation]);

  const onDownloadContract = async () => {
    if (contract) {
      let LocalPath = FileSystem.documentDirectory + contract.contractFileName;
      const file = await FileSystem.downloadAsync(contract?.path, LocalPath);
      shareAsync(file.uri);
    }
  };

  const onSelectContract = async () => {
    const result = await DocumentPicker.getDocumentAsync();
    // don't show the bottom sheet if the user canceled the upload file from the device
    if (result.type !== 'cancel') {
      setSelectedContract(result);
      openBottomSheet();
    }
  };

  const onCancelSelection = async () => {
    closeBottomSheet();
    setSelectedContract(null);
  };

  const onUploadContract = async () => {
    if (selectedContract) {
      signContract(
        { contractId: id, contract: selectedContract },
        {
          onSuccess: () => {
            // show success toast and get back to the previous page and update state
            Toast.show({ text1: `${t('contract.upload.success')}`, type: 'success' });
            navigation.goBack({ shouldRefetch: true });
          },
          onError: (error) => {
            Toast.show({
              text1: `${InternalErrors.EVENT_ERRORS.getError(
                (error as any).response?.data.code_error,
              )}`,
              type: 'error',
            });
          },
        },
      );
    }
  };

  const onCancelAndUploadNewContract = () => {
    console.log('cancel and upload new contract');
  };

  const buildPageActions = () => {
    if (contract?.status === ContractStatus.PENDING_VOLUNTEER) {
      return {
        onPrimaryActionButtonClick: onSelectContract,
        primaryActionLabel: t('contract.actions.upload'),
        primaryBtnType: ButtonType.PRIMARY,
        loading: isUploadingContract,
      };
    }

    if (contract?.status === ContractStatus.PENDING_ADMIN) {
      return {
        onPrimaryActionButtonClick: onCancelAndUploadNewContract,
        primaryActionLabel: t('contract.actions.cancel'),
        primaryBtnType: ButtonType.DANGER,
        loading: isUploadingContract,
      };
    }
  };

  return (
    <PageLayout
      title={t('contract.title', { contractNumber: contract?.contractNumber || '' })}
      onBackButtonPress={navigation.goBack}
      actionsOptions={buildPageActions()}
      bottomSheetOptions={{
        paragraph: (
          <View style={styles.bottomSheetParagraphContainer}>
            <Text category="p1">{`${t('contract.bottom_sheet.parapgraph')}`}</Text>
            <Text category="p2" style={{ color: theme['color-success-500'] }}>
              {(selectedContract as any)?.name || ''}
            </Text>
          </View>
        ),
        heading: t('contract.bottom_sheet.heading'),
        primaryAction: {
          label: t('contract.bottom_sheet.label'),
          onPress: onUploadContract,
        },
        secondaryAction: {
          label: t('general:back'),
          onPress: onCancelSelection,
        },
      }}
    >
      {isLoadingContract && <LoadingScreen />}
      {!isLoadingContract && contract && (
        <>
          {(contract.status === ContractStatus.PENDING_ADMIN ||
            contract.status === ContractStatus.PENDING_VOLUNTEER) && (
            <Disclaimer color="yellow" text={t(`contract.disclaimer.${contract.status}`)} />
          )}
          <FormLayout>
            {activeOrganization && (
              <OrganizationIdentity
                name={activeOrganization.name}
                uri={activeOrganization.logo || ''}
              />
            )}
            <Text category="p1" style={styles.paragraph}>{`${t(
              `contract.paragraph.${contract.status}`,
            )}`}</Text>
            <ContractItem
              id={contract.id}
              title={contract.contractNumber}
              startDate={contract.startDate}
              endDate={contract.endDate}
              leftIcon={<PendingContractIcon />}
              onPress={onDownloadContract}
            />
          </FormLayout>
        </>
      )}
    </PageLayout>
  );
};

export default Contract;

const styles = StyleSheet.create({
  paragraph: {
    lineHeight: 24,
  },
  bottomSheetParagraphContainer: {
    paddingVertical: 8,
    flexDirection: 'column',
    gap: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
