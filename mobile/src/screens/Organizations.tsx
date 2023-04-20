import React from 'react';
import PageLayout from '../layouts/PageLayout';
import { Button, Text } from '@ui-kitten/components';

const Organizations = ({ navigation }: any) => {
  console.log('Organizations');

  const onViewOrganizationProfileButtonPress = () => {
    navigation.navigate('organization-profile');
  };

  return (
    <PageLayout title="Organizations">
      <Text category="h1">Organizations</Text>
      <Button onPress={onViewOrganizationProfileButtonPress}>View Organization Profile</Button>
    </PageLayout>
  );
};

export default Organizations;
