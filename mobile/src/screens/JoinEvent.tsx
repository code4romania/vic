import React from 'react';
import PageLayout from '../layouts/PageLayout';
import { Text } from '@ui-kitten/components';

const JoinEvent = ({ navigation }: any) => {
  console.log('JoinEvent');

  return (
    <PageLayout title="Alaturate Evenimentului" onBackButtonPress={navigation.goBack}>
      <Text category="h1">JoinEvent</Text>
    </PageLayout>
  );
};

export default JoinEvent;
