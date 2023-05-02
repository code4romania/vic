import React from 'react';
import { Text } from '@ui-kitten/components';
import PageLayout from '../layouts/PageLayout';

const NotificationsSettings = ({ navigation }: any) => {
  return (
    <PageLayout title="Setari notificari" onBackButtonPress={navigation.goBack}>
      <Text category="h1">Notifications Settings</Text>
    </PageLayout>
  );
};

export default NotificationsSettings;
