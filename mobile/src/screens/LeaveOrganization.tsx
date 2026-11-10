import React, { useRef } from 'react';
import ModalLayout from '../layouts/ModalLayout';
import OrganizationIdentity from '../components/OrganizationIdentity';
import { useOrganization } from '../store/organization/organization.selector';
import { Text } from '@ui-kitten/components';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ButtonType } from '../common/enums/button-type.enum';
import { useLeaveOrganizationMutation } from '../services/organization/organization.service';
import Toast from 'react-native-toast-message';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { Sheet, VButton } from '../components/ui';
import { InternalErrors } from '../common/errors/internal-errors.class';
import { ALLOW_FONT_SCALLING } from '../common/constants/constants';

// The organization comes in the route params (#592): the organization store is only filled once
// its profile was opened, so leaving straight from Profil › Organizațiile mele did nothing.
const LeaveOrganization = ({ navigation, route }: any) => {
  const { t } = useTranslation('leave_ngo');

  const bottomSheetRef = useRef<BottomSheetModal>(null);

  const { isLoading: isLeavingOrganization, mutate: leaveOrganization } =
    useLeaveOrganizationMutation();

  const { organization: storedOrganization } = useOrganization();
  const organization = route?.params?.volunteerId
    ? {
        name: route.params.name as string,
        logo: route.params.logo as string | undefined,
        volunteerId: route.params.volunteerId as string,
      }
    : storedOrganization?.volunteer
      ? {
          name: storedOrganization.name,
          logo: storedOrganization.logo,
          volunteerId: storedOrganization.volunteer.id,
        }
      : undefined;

  const onLeaveOrganizationConfirm = () => {
    onCloseBottomSheet();
    if (!organization) {
      Toast.show({ type: 'error', text1: `${t('errors.generic')}` });
      return;
    }
    leaveOrganization(
      { volunteerId: organization.volunteerId },
      {
        onSuccess: () => {
          navigation.goBack();
        },
        onError: (error: any) => {
          Toast.show({
            type: 'error',
            text1: `${InternalErrors.ORGANIZATION_ERRORS.getError(
              error.response?.data.code_error,
            )}`,
          });
        },
      },
    );
  };

  const onCloseBottomSheet = () => {
    bottomSheetRef.current?.dismiss();
  };

  const onOpenBottomSheet = () => {
    bottomSheetRef.current?.present();
  };

  return (
    <ModalLayout
      title={t('header')}
      actionsOptions={{
        buttonType: ButtonType.DANGER,
        onActionButtonClick: onOpenBottomSheet,
        actionLabel: `${t('action_btn')}`,
        loading: isLeavingOrganization,
      }}
      onDismiss={navigation.goBack}
    >
      <View style={styles.container}>
        {organization && (
          <OrganizationIdentity uri={organization.logo || ''} name={organization.name} />
        )}
        <Text allowFontScaling={ALLOW_FONT_SCALLING} category="p1" style={styles.paragraph}>
          {`${t('paragraph')}`}
        </Text>
      </View>
      {/* inside the modal's own sheet provider, sized to its content */}
      <Sheet
        ref={bottomSheetRef}
        title={`${t('modal.confirm_leave_organization.heading')}`}
        subtitle={`${t('modal.confirm_leave_organization.paragraph')}`}
        testID="leave-organization-sheet"
      >
        <VButton
          variant="danger"
          label={t('modal.confirm_leave_organization.action_label')}
          onPress={onLeaveOrganizationConfirm}
          testID="leave-organization-confirm"
        />
        <VButton variant="soft" label={t('general:back')} onPress={onCloseBottomSheet} />
      </Sheet>
    </ModalLayout>
  );
};

export default LeaveOrganization;

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    flex: 1,
    gap: 16,
  },
  paragraph: {
    lineHeight: 24,
  },
});
