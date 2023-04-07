import React from 'react';
import PageLayout from '../layouts/PageLayout';
import { Button, Text } from '@ui-kitten/components';

const VolunteerProfile = ({ navigation }: any) => {
  console.log('VolunteerProfile');

  const onEditVolunteerProfileButtonPress = () => {
    navigation.navigate('edit-volunteer');
  };

  return (
    <PageLayout title="Volunteer Profile" onBackButtonPress={navigation.goBack}>
      <Text category="h1">Volunteer Profile</Text>
      <Button onPress={onEditVolunteerProfileButtonPress}>Edit Profile</Button>
    </PageLayout>
  );
};

export default VolunteerProfile;
