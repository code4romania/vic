import React from 'react';
import { Text } from '@ui-kitten/components';
import PageLayout from '../layouts/PageLayout';
import i18n from '../common/config/i18n';

const NotificationsSettings = ({ navigation }: any) => {
  return (
    <PageLayout title={i18n.t('settings:notification')} onBackButtonPress={navigation.goBack}>
      <Text category="h1">Notifications Settings</Text>
    </PageLayout>
  );
};

export default NotificationsSettings;
