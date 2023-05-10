import React from 'react';
import PageLayout from '../layouts/PageLayout';
import { Button, Text } from '@ui-kitten/components';
import NoVolunteerProfile from './NoVolunteerProfile';
import i18n from '../common/config/i18n';

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

  return false ? (
    <PageLayout title={i18n.t('tabs:volunteer')}>
      <Text category="h1">Volunteer</Text>
      <Button onPress={onShowDrawerPress}>SHOW DRAWER</Button>
      <Button onPress={onViewOrganizationButtonPress}>View Organization</Button>
      <Button onPress={onViewVolunteerProfilenButtonPress}>View Volunteer Profile</Button>
      <Button onPress={onViewAtivityLogsButtonPress}>View Logs</Button>
    </PageLayout>
  ) : (
    <NoVolunteerProfile />
  );
};

export default Volunteer;
