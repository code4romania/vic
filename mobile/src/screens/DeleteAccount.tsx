import React from 'react';
import ModalLayout from '../layouts/ModalLayout';
import { Text, useTheme } from '@ui-kitten/components';
import { ALLOW_FONT_SCALLING } from '../common/constants/constants';
import { ButtonType } from '../common/enums/button-type.enum';
import { useTranslation } from 'react-i18next';
import FormLayout from '../layouts/FormLayout';
import { useDeleteAccountMutation } from '../services/user/user.service';
import { useAuth } from '../hooks/useAuth';
import { SvgXml } from 'react-native-svg';
import upsIcon from '../assets/svg/ups-icon';
import { StyleSheet, View } from 'react-native';

const DeleteAccount = ({ navigation }: any) => {
  const { t } = useTranslation('delete_account');
  const { logout } = useAuth();
  const theme = useTheme();

  const {
    mutate: deleteAccount,
    isLoading: isDeletingAccount,
    error: deleteAccountError,
  } = useDeleteAccountMutation();

  const onConfirmDeleteAccount = () => {
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
        onActionButtonClick: onConfirmDeleteAccount,
        actionLabel: t('confirm'),
        loading: isDeletingAccount,
      }}
      onDismiss={navigation.goBack}
    >
      <FormLayout>
        <View style={styles.contentContainer}>
          <SvgXml xml={upsIcon} width={100} height={100} />
          <Text allowFontScaling={ALLOW_FONT_SCALLING} category="h1" style={styles.header}>
            {`${t('header')}`}
          </Text>
          <Text allowFontScaling={ALLOW_FONT_SCALLING} category="p1" style={styles.paragraph}>
            {`${t('paragraph')}`}
          </Text>
        </View>

        {!!deleteAccountError && (
          <Text
            allowFontScaling={ALLOW_FONT_SCALLING}
            style={{ color: theme['color-danger-500'] }}
            category="p1"
          >
            {`${t('error', { value: process.env.EXPO_PUBLIC_CONTACT_EMAIL })}`}
          </Text>
        )}
      </FormLayout>
    </ModalLayout>
  );
};

export default DeleteAccount;

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    gap: 24,
  },
  header: {
    paddingHorizontal: 16,
    textAlign: 'center',
  },
  paragraph: {
    textAlign: 'center',
    lineHeight: 24,
  },
});
