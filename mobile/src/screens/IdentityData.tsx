import React from 'react';
import { Text } from '@ui-kitten/components';
import PageLayout from '../layouts/PageLayout';

const IdentityData = ({ navigation }: any) => {
  return (
    <PageLayout title="Date identitate" onBackButtonPress={navigation.goBack}>
      <Text category="h1">Identity Data</Text>
    </PageLayout>
  );
};

export default IdentityData;
