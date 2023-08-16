import React, { useEffect } from 'react';
import ModalLayout from '../layouts/ModalLayout';
import OrganizationIdentity from '../components/OrganizationIdentity';
import FormLayout from '../layouts/FormLayout';
import LoadingScreen from '../components/LoadingScreen';
import { useTranslation } from 'react-i18next';
import Toast from 'react-native-toast-message';
import { InternalErrors } from '../common/errors/internal-errors.class';
import Paragraph from '../components/Paragraph';
import ReadOnlyElement from '../components/ReadOnlyElement';
import { useRejectedAccessRequest } from '../services/access-request/access-request.service';
import { format } from 'date-fns';
import { useTheme } from '@ui-kitten/components';

const RequestRejectedReason = ({ navigation, route }: any) => {
  const theme = useTheme();
  // translations
  const { t } = useTranslation('access_request');

  const { accessRequestId } = route.params;
  // contract request
  const {
    data: accessRequest,
    isFetching: isLoadingAccessRequest,
    error: getAccessRequestError,
  } = useRejectedAccessRequest(accessRequestId);

  useEffect(() => {
    // go back and show error
    if (getAccessRequestError) {
      Toast.show({
        type: 'error',
        text1: `${InternalErrors.ACCESS_REQUEST_ERRORS.getError(
          (getAccessRequestError as any).response?.data.code_error,
        )}`,
      });
      navigation.goBack();
    }
  }, [getAccessRequestError, navigation]);

  return (
    <ModalLayout title={t('title')} onDismiss={navigation.goBack}>
      {isLoadingAccessRequest && <LoadingScreen />}
      {!isLoadingAccessRequest && accessRequest && (
        <>
          <FormLayout>
            <OrganizationIdentity
              name={accessRequest.organizationName}
              uri={accessRequest.organizationLogo}
            />
            <Paragraph style={{ color: theme['cool-gray-800'] }}>{`${t('paragraph', {
              date: format(new Date(accessRequest.createdOn), 'dd/MM/y'),
            })}`}</Paragraph>
            <ReadOnlyElement label={t('reason')} value={accessRequest.rejectionReason} />
          </FormLayout>
        </>
      )}
    </ModalLayout>
  );
};

export default RequestRejectedReason;
