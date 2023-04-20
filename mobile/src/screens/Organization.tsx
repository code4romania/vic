import React from 'react';
import PageLayout from '../layouts/PageLayout';
import { Button, Text } from '@ui-kitten/components';

const Organization = ({ navigation }: any) => {
  console.log('Organization');

  const onLeaveOrganizationPress = () => {
    navigation.navigate('leave-organization');
  };

  return (
    <PageLayout title="Organization" onBackButtonPress={navigation.goBack}>
      <Text category="h1">Organization</Text>
      <Button onPress={onLeaveOrganizationPress}>Leave Organization</Button>
    </PageLayout>
  );
};

export default Organization;
