import React from 'react';
import { Text } from '@ui-kitten/components';
import PageLayout from '../layouts/PageLayout';

const AccountData = ({ navigation }: any) => {
  return (
    <PageLayout title="Date cont" onBackButtonPress={navigation.goBack}>
      <Text category="h1">Account Data</Text>
    </PageLayout>
  );
};

export default AccountData;
