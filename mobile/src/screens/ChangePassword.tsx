import React from 'react';
import { Text } from '@ui-kitten/components';
import PageLayout from '../layouts/PageLayout';
import { useTranslation } from 'react-i18next';

const ChangePassword = ({ navigation }: any) => {
  const { t } = useTranslation('settings');

  return (
    <PageLayout title={t('password')} onBackButtonPress={navigation.goBack}>
      <Text category="h1">Change Password</Text>
    </PageLayout>
  );
};

export default ChangePassword;
