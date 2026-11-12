import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import ModalLayout from '../layouts/ModalLayout';
import OrganizationIdentity from '../components/OrganizationIdentity';
import FormLayout from '../layouts/FormLayout';
import LoadingScreen from '../components/LoadingScreen';
import { useTranslation } from 'react-i18next';
import Toast from 'react-native-toast-message';
import { InternalErrors } from '../common/errors/internal-errors.class';
import { VText } from '../components/ui';
import { useRejectedAccessRequest } from '../services/access-request/access-request.service';
import { format } from 'date-fns';
import { colors, radius, spacing } from '../common/theme/tokens';
import { AppText } from '../design/components';

const RequestRejectedReason = ({ navigation, route }: any) => {
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
        <FormLayout>
          <View style={styles.content}>
            <OrganizationIdentity
              name={accessRequest.organizationName}
              uri={accessRequest.organizationLogo}
            />
            <VText variant="sub">{`${t('paragraph', {
              date: format(new Date(accessRequest.createdOn), 'dd/MM/y'),
            })}`}</VText>
            <View style={styles.reason}>
              <AppText variant="overline" color={colors.muted}>{`${t('reason')}`}</AppText>
              <VText variant="body">{accessRequest.rejectionReason || '-'}</VText>
            </View>
          </View>
        </FormLayout>
      )}
    </ModalLayout>
  );
};

export default RequestRejectedReason;

const styles = StyleSheet.create({
  // the modal's content sits at 16: 4 more align it with the 20pt gutter of the title
  content: {
    gap: spacing.l,
    paddingTop: spacing.l,
    paddingHorizontal: spacing.gutter - spacing.l,
  },
  // the reason on a paper card: the modal is white
  reason: {
    gap: spacing.xs,
    padding: 14,
    borderRadius: radius.field,
    backgroundColor: colors.canvas,
  },
});
