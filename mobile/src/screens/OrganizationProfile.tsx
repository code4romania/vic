import React from 'react';
import PageLayout from '../layouts/PageLayout';
import { Button, Text } from '@ui-kitten/components';

const OrganizationProfile = ({ navigation }: any) => {
  console.log('OrganizationProfile');

  const onJoinOrganizationButtonPress = () => {
    navigation.navigate('join-organization');
  };

  return (
    <PageLayout title="Profil Organizatie" onBackButtonPress={navigation.goBack}>
      <Text category="h1">OrganizationProfile</Text>
      <Button onPress={onJoinOrganizationButtonPress}>Join</Button>
    </PageLayout>
  );
};

export default OrganizationProfile;
