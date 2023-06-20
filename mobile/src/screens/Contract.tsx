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

const contract = {
  id: '1234',
  name: 'Contract 123123',
  status: ContractStatus.PENDING_ADMIN,
  startDate: '2023-02-01',
  endDate: '2023-02-01',
};

const Contract = ({ navigation }: any) => {
  const onContractPress = (id: string) => {
    console.log('download pressed', id);
  };

  const uploadContract = () => {
    console.log('upload contract');
  };

  return (
    <PageLayout
      title={contract.name}
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
        <OrganizationIdentity name="Asociația ZEN" uri="https://picsum.photos/200" />
        <Text>{`${
          contract.status === ContractStatus.PENDING_ADMIN
            ? i18n.t('documents:contract_description_ong')
            : i18n.t('documents:contract_description_volunteer')
        }`}</Text>
        <ContractItem
          id={contract.id}
          title={contract.name}
          startDate={contract.startDate}
          endDate={contract.endDate}
          status={ContractStatus.PENDING_VOLUNTEER}
          onPress={onContractPress}
        />
      </FormLayout>
    </PageLayout>
  );
};

export default Contract;
