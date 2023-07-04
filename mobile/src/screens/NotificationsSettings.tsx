import React from 'react';
import { Text } from '@ui-kitten/components';
import PageLayout from '../layouts/PageLayout';
import { useTranslation } from 'react-i18next';

const NotificationsSettings = ({ navigation }: any) => {
  const { t } = useTranslation('settings');

  return (
    <PageLayout title={t('notification')} onBackButtonPress={navigation.goBack}>
      <Text category="h1">Notifications Settings</Text>
    </PageLayout>
  );
};

export default NotificationsSettings;
