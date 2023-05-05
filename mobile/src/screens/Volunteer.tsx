import React from 'react';
import PageLayout from '../layouts/PageLayout';
import { Button, Text } from '@ui-kitten/components';

const Volunteer = ({ navigation }: any) => {
  console.log('Volunteer', navigation);

  const onShowDrawerPress = () => {
    navigation.openDrawer();
  };

  const onViewOrganizationButtonPress = () => {
    navigation.navigate('organization');
  };

  const onViewVolunteerProfilenButtonPress = () => {
    navigation.navigate('volunteer-profile');
  };

  const onViewAtivityLogsButtonPress = () => {
    navigation.navigate('activity-logs');
  };

  return (
    <PageLayout title="Volunteer">
      <Text category="h1">Volunteer</Text>
      <Button onPress={onShowDrawerPress}>SHOW DRAWER</Button>
      <Button onPress={onViewOrganizationButtonPress}>View Organization</Button>
      <Button onPress={onViewVolunteerProfilenButtonPress}>View Volunteer Profile</Button>
      <Button onPress={onViewAtivityLogsButtonPress}>View Logs</Button>
    </PageLayout>
  );
};

export default Volunteer;
