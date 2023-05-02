import React from 'react';
import { Text } from '@ui-kitten/components';
import PageLayout from '../layouts/PageLayout';

const ChangePassword = ({ navigation }: any) => {
  return (
    <PageLayout title="Schimba parola" onBackButtonPress={navigation.goBack}>
      <Text category="h1">Change Password</Text>
    </PageLayout>
  );
};

export default ChangePassword;
