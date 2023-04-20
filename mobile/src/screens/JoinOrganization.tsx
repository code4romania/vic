import React from 'react';
import PageLayout from '../layouts/PageLayout';
import { Text } from '@ui-kitten/components';

const JoinOrganization = ({ navigation }: any) => {
  console.log('JoinOrganization');

  return (
    <PageLayout title="Alaturate Organizatiei" onBackButtonPress={navigation.goBack}>
      <Text category="h1">JoinOrganization</Text>
    </PageLayout>
  );
};

export default JoinOrganization;
