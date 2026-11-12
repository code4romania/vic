import React, { useRef } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import Svg, { Path } from 'react-native-svg';
import { useTranslation } from 'react-i18next';
import { Sheet, VButton, VText } from '../components/ui';
import ModalLayout from '../layouts/ModalLayout';
import { ButtonType } from '../common/enums/button-type.enum';
import { useDeleteAccountMutation } from '../services/user/user.service';
import { useAuth } from '../hooks/useAuth';
import { colors, spacing } from '../common/theme/tokens';

/** Solid danger circle with a white trash can (no pastel illustration). */
const DangerIcon = () => (
  <View
    style={styles.icon}
    testID="delete-account-icon"
    accessibilityElementsHidden
    importantForAccessibility="no-hide-descendants"
  >
    <Svg
      width={30}
      height={30}
      viewBox="0 0 24 24"
      fill="none"
      stroke={colors.white}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6" />
    </Svg>
  </View>
);

const DeleteAccount = ({ navigation }: any) => {
  const { t } = useTranslation('delete_account');
  const { logout } = useAuth();

  const {
    mutate: deleteAccount,
    isLoading: isDeletingAccount,
    error: deleteAccountError,
  } = useDeleteAccountMutation();

  const confirmSheet = useRef<BottomSheetModal>(null);

  // irreversible: a second, explicit confirmation before anything is deleted
  const onConfirmDeleteAccount = () => {
    confirmSheet.current?.dismiss();
    deleteAccount(undefined, {
      onSuccess: () => {
        logout();
      },
    });
  };

  return (
    <ModalLayout
      title={t('title')}
      actionsOptions={{
        buttonType: ButtonType.DANGER,
        onActionButtonClick: () => confirmSheet.current?.present(),
        actionLabel: t('confirm'),
        loading: isDeletingAccount,
      }}
      onDismiss={navigation.goBack}
    >
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <DangerIcon />
        <VText variant="h2" accessibilityRole="header">
          {`${t('header')}`}
        </VText>
        <VText variant="sub">{`${t('paragraph')}`}</VText>

        {!!deleteAccountError && (
          <VText variant="body" color={colors.danger} accessibilityRole="alert">
            {`${t('error', { value: process.env.EXPO_PUBLIC_CONTACT_EMAIL })}`}
          </VText>
        )}
      </ScrollView>
      <Sheet
        ref={confirmSheet}
        title={`${t('second_confirmation.title')}`}
        subtitle={`${t('second_confirmation.description')}`}
        testID="delete-account-sheet"
      >
        <VButton
          variant="danger"
          label={`${t('second_confirmation.action')}`}
          onPress={onConfirmDeleteAccount}
          testID="delete-account-confirm"
        />
        <VButton
          variant="soft"
          label={`${t('general:cancel')}`}
          onPress={() => confirmSheet.current?.dismiss()}
        />
      </Sheet>
    </ModalLayout>
  );
};

export default DeleteAccount;

const styles = StyleSheet.create({
  // ModalLayout pads by 16: 4 more for the 20pt page margins
  content: {
    paddingHorizontal: spacing.gutter - spacing.l,
    paddingTop: spacing.l,
    paddingBottom: spacing.xl,
    gap: spacing.m,
  },
  icon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.s,
  },
});
