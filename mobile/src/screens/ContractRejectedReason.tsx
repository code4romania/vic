import React, { useEffect } from 'react';
import ModalLayout from '../layouts/ModalLayout';
import OrganizationIdentity from '../components/OrganizationIdentity';
import FormLayout from '../layouts/FormLayout';
import LoadingScreen from '../components/LoadingScreen';
import { useTranslation } from 'react-i18next';
import Toast from 'react-native-toast-message';
import { InternalErrors } from '../common/errors/internal-errors.class';
import { useAuth } from '../hooks/useAuth';
import { useContractQuery } from '../services/contract/contract.service';
import Paragraph from '../components/Paragraph';
import ReadOnlyElement from '../components/ReadOnlyElement';

const ContractRejectedReason = ({ navigation, route }: any) => {
  console.log('ContractRejectedReason');
  // translations
  const { t } = useTranslation('documents');

  const { userProfile } = useAuth();

  const { contractId } = route.params;
  // contract request
  const {
    data: contract,
    isFetching: isLoadingContract,
    error: getContractError,
  } = useContractQuery(contractId);

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

  return (
    <ModalLayout title={t('contract_rejected.header')} onDismiss={navigation.goBack}>
      {isLoadingContract && <LoadingScreen />}
      {!isLoadingContract && contract && (
        <>
          <FormLayout>
            {userProfile?.activeOrganization && (
              <OrganizationIdentity
                name={userProfile?.activeOrganization.name}
                uri={userProfile?.activeOrganization.logo || ''}
              />
            )}
            <Paragraph>{`${t('contract_rejected.paragraph')}`}</Paragraph>
            <ReadOnlyElement
              label={t('contract_rejected.label')}
              value={contract.rejectionReason}
            />
          </FormLayout>
        </>
      )}
    </ModalLayout>
  );
};

export default ContractRejectedReason;
