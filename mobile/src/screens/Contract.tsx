import React from 'react';
import PageLayout from '../layouts/PageLayout';
import Disclaimer from '../components/Disclaimer';
import OrganizationIdentity from '../components/OrganizationIdentity';
import i18n from '../common/config/i18n';
import { Text } from '@ui-kitten/components';
import ContractItem from '../components/ContractItem';
import FormLayout from '../layouts/FormLayout';
import { ButtonType } from '../common/enums/button-type.enum';
import { ContractStatus } from '../common/enums/contract-status.enum';
import { useContractQuery } from '../services/contract/contract.service';
import LoadingScreen from '../components/LoadingScreen';
import { useActiveOrganization } from '../store/organization/active-organization.selector';
import * as FileSystem from 'expo-file-system';
import { shareAsync } from 'expo-sharing';
import { CloseContractIcon, PendingContractIcon } from '../components/ContractList';

const Contract = ({ navigation, route }: any) => {
  // contract param
  const { id } = route.params;
  // contract request
  const { data: contract, isFetching: isLoadingContract, error } = useContractQuery(id);
  // active organization
  const { activeOrganization } = useActiveOrganization();

  console.log('isLoadingContract', isLoadingContract, contract);
  console.log('error', error);

  const onDownloadContract = async () => {
    if (contract) {
      let LocalPath = FileSystem.documentDirectory + contract.contractFileName;
      const file = await FileSystem.downloadAsync(contract?.path, LocalPath);
      shareAsync(file.uri);
    }
  };

  const uploadContract = () => {
    console.log('upload contract');
  };

  if (!contract || error) {
    return <></>;
  }

  if (isLoadingContract) {
    <LoadingScreen />;
  }

  return (
    <PageLayout
      title={contract.contractNumber}
      onBackButtonPress={navigation.goBack}
      actionsOptions={{
        onPrimaryActionButtonClick: uploadContract,
        primaryActionLabel:
          contract.status === ContractStatus.PENDING_VOLUNTEER
            ? i18n.t('documents:upload')
            : i18n.t('documents:cancel'),
        primaryBtnType:
          contract.status === ContractStatus.PENDING_VOLUNTEER
            ? ButtonType.PRIMARY
            : ButtonType.DANGER,
      }}
    >
      <Disclaimer
        color="yellow"
        text={
          contract.status === ContractStatus.PENDING_ADMIN
            ? i18n.t('documents:disclaimer_ong')
            : i18n.t('documents:disclaimer_volunteer')
        }
      />
      <FormLayout>
        <OrganizationIdentity
          name={activeOrganization?.name || ''}
          uri={activeOrganization?.logo || ''}
        />
        <Text>{`${
          contract.status === ContractStatus.PENDING_ADMIN
            ? i18n.t('documents:contract_description_ong')
            : i18n.t('documents:contract_description_volunteer')
        }`}</Text>
        <ContractItem
          id={contract.id}
          title={contract.contractNumber}
          startDate={contract.startDate}
          endDate={contract.endDate}
          leftIcon={
            contract.status !== ContractStatus.PENDING_VOLUNTEER ? (
              <PendingContractIcon />
            ) : (
              <CloseContractIcon />
            )
          }
          onPress={onDownloadContract}
        />
      </FormLayout>
    </PageLayout>
  );
};

export default Contract;
