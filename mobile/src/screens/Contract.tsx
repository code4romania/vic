import React, { useEffect } from 'react';
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
import { Text } from '@ui-kitten/components';
import { StyleSheet } from 'react-native';
import ContractItem from '../components/ContractItem';
import { PendingContractIcon } from './Documents';
import { ButtonType } from '../common/enums/button-type.enum';
import * as FileSystem from 'expo-file-system';
import { shareAsync } from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';

const Contract = ({ navigation, route }: any) => {
  const { t } = useTranslation('documents');
  // contract param
  const { id } = route.params;
  // active organization
  const { activeOrganization } = useActiveOrganization();
  // contract request
  const {
    data: contract,
    isFetching: isLoadingContract,
    error: getContractError,
  } = useContractQuery(id);

  // sign contract
  const { mutate: signContract } = useSignContractMutation();

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

  const onUploadContract = async () => {
    const result = await DocumentPicker.getDocumentAsync();
    signContract(
      { contractId: id, contract: result },
      {
        onSuccess: () => {
          console.log('done');
        },
      },
    );
  };

  const onCancelAndUploadNewContract = () => {
    console.log('cancel and upload new contract');
  };

  const buildPageActions = () => {
    if (isLoadingContract) {
      return;
    }

    return contract?.status === ContractStatus.PENDING_VOLUNTEER
      ? {
          onPrimaryActionButtonClick: onUploadContract,
          primaryActionLabel: t('contract.upload'),
          primaryBtnType: ButtonType.PRIMARY,
        }
      : {
          onPrimaryActionButtonClick: onCancelAndUploadNewContract,
          primaryActionLabel: t('contract.cancel'),
          primaryBtnType: ButtonType.DANGER,
        };
  };

  return (
    <PageLayout
      title={t('contract.title', { contractNumber: contract?.contractNumber || '' })}
      onBackButtonPress={navigation.goBack}
      actionsOptions={buildPageActions()}
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
});
