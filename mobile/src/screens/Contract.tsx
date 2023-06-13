import React from 'react';
import PageLayout from '../layouts/PageLayout';
import Disclaimer from '../components/Disclaimer';
import OrganizationIdentity from '../components/OrganizationIdentity';
import { Text } from '@ui-kitten/components';
import ContractItem from '../components/ContractItem';
import { ContractStatus } from '../common/enums/contract.status.enum';
import FormLayout from '../layouts/FormLayout';
import { ButtonType } from '../common/enums/button-type.enum';
import { useTranslation } from 'react-i18next';

const contract = {
  id: '1234',
  name: 'Contract 123123',
  status: ContractStatus.VALIDATE_ONG,
  startDate: new Date('2023-02-01'),
  endDate: new Date('2023-06-30'),
};

const Contract = ({ navigation }: any) => {
  const { t } = useTranslation('documents');

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
          contract.status === ContractStatus.VALIDATE_VOLUNTEER ? t('upload') : t('cancel'),
        primaryBtnType:
          contract.status === ContractStatus.VALIDATE_VOLUNTEER
            ? ButtonType.PRIMARY
            : ButtonType.DANGER,
      }}
    >
      <Disclaimer
        color="yellow"
        text={
          contract.status === ContractStatus.VALIDATE_ONG
            ? t('disclaimer_ong')
            : t('disclaimer_volunteer')
        }
      />
      <FormLayout>
        <OrganizationIdentity name="Asociația ZEN" uri="https://picsum.photos/200" />
        <Text>{`${
          contract.status === ContractStatus.VALIDATE_ONG
            ? t('contract_description_ong')
            : t('contract_description_volunteer')
        }`}</Text>
        <ContractItem
          id={contract.id}
          title={contract.name}
          iconRightName="download"
          startDate={contract.startDate}
          endDate={contract.endDate}
          status={ContractStatus.PENDING}
          onPress={onContractPress}
        />
      </FormLayout>
    </PageLayout>
  );
};

export default Contract;
