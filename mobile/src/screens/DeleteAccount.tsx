import React from 'react';
import ModalLayout from '../layouts/ModalLayout';
import { Text, useTheme } from '@ui-kitten/components';
import { ALLOW_FONT_SCALLING } from '../common/constants/constants';
import { ButtonType } from '../common/enums/button-type.enum';
import { useTranslation } from 'react-i18next';
import FormLayout from '../layouts/FormLayout';
import { useDeleteAccountMutation } from '../services/user/user.service';
import { useAuth } from '../hooks/useAuth';
import Constants from 'expo-constants';

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
        <Text allowFontScaling={ALLOW_FONT_SCALLING} category="p1">
          {`${t('paragraph')}`}
        </Text>
        {!!deleteAccountError && (
          <Text
            allowFontScaling={ALLOW_FONT_SCALLING}
            style={{ color: theme['color-danger-500'] }}
            category="p1"
          >
            {`${t('error', { value: Constants.expoConfig?.extra?.contactEmail })}`}
          </Text>
        )}
      </FormLayout>
    </ModalLayout>
  );
};

export default DeleteAccount;
