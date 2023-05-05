import React from 'react';
import PageLayout from '../layouts/PageLayout';
import { Button, Text } from '@ui-kitten/components';
import i18n from '../common/config/i18n';

const VolunteerProfile = ({ navigation }: any) => {
  console.log('VolunteerProfile', navigation);

  const onEditVolunteerProfileButtonPress = () => {
    navigation.navigate('edit-volunteer');
  };

  return (
    <PageLayout title={i18n.t('volunteer:profile')} onBackButtonPress={navigation.goBack}>
      <Text category="h1">Volunteer Profile</Text>
      <Button onPress={onEditVolunteerProfileButtonPress}>Edit Profile</Button>
    </PageLayout>
  );
};

export default VolunteerProfile;
