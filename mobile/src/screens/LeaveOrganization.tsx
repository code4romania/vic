import React, { useMemo, useRef } from 'react';
import ModalLayout from '../layouts/ModalLayout';
import OrganizationIdentity from '../components/OrganizationIdentity';
import { useOrganization } from '../store/organization/organization.selector';
import { Text, useTheme } from '@ui-kitten/components';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ButtonType } from '../common/enums/button-type.enum';
import BottomSheet from '@gorhom/bottom-sheet';
import SafeAreaBottomSheet from '../components/SafeAreaBottomSheet';
import { renderBackdrop } from '../components/BottomSheet';
import { useLeaveOrganizationMutation } from '../services/organization/organization.service';
import Toast from 'react-native-toast-message';
import { InternalErrors } from '../common/errors/internal-errors.class';
import Paragraph from '../components/Paragraph';
import InlineLink from '../components/InlineLink';
import Button from '../components/Button';
import { ALLOW_FONT_SCALLING } from '../common/constants/constants';
import { useReducedMotion } from 'react-native-reanimated';

// The organization comes in the route params (#592): the organization store is only filled once
// its profile was opened, so leaving straight from Profil › Organizațiile mele did nothing.
const LeaveOrganization = ({ navigation, route }: any) => {
  const { t } = useTranslation('leave_ngo');

  const theme = useTheme();

  // bottom sheet ref
  const bottomSheetRef = useRef<BottomSheet>(null);
  // bottom sheet snap points
  const snapPoints = useMemo(() => [1, 360], []);

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

  const reducedMotion = useReducedMotion();

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
    bottomSheetRef.current?.close();
  };

  const onOpenBottomSheet = () => {
    bottomSheetRef.current?.expand();
  };

  return (
    <>
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
      </ModalLayout>
      <SafeAreaBottomSheet
        backdropComponent={renderBackdrop}
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enableDynamicSizing={false}
        animateOnMount={reducedMotion ? false : true}
      >
        <View style={styles.bottomSheetContainer}>
          <View style={styles.textContainer}>
            <Text allowFontScaling={ALLOW_FONT_SCALLING} category="h1">{`${t(
              'modal.confirm_leave_organization.heading',
            )}`}</Text>
            <Paragraph style={styles.bottomSheetParagraph}>{`${t(
              'modal.confirm_leave_organization.paragraph',
            )}`}</Paragraph>
          </View>
          <View style={styles.buttonsContainer}>
            <Button
              label={t('modal.confirm_leave_organization.action_label')}
              status={'danger'}
              onPress={onLeaveOrganizationConfirm}
            />
            <InlineLink
              style={{ color: theme['cool-gray-700'] }}
              label={t('general:back')}
              onPress={onCloseBottomSheet}
            />
          </View>
        </View>
      </SafeAreaBottomSheet>
    </>
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
  bottomSheetContainer: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingVertical: 8,
    gap: 24,
  },
  textContainer: {
    gap: 4,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  bottomSheetParagraph: {
    textAlign: 'center',
  },
  buttonsContainer: {
    gap: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
