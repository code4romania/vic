import React from 'react';
import PageLayout from '../layouts/PageLayout';
import { Button, Text } from '@ui-kitten/components';
import i18n from '../common/config/i18n';

const Volunteer = ({ navigation }: any) => {
  console.log('Volunteer', navigation);

  const onViewOrganizationButtonPress = () => {
    // navigation.navigate('organization');
    navigation.openDrawer();
  };

  const onViewVolunteerProfilenButtonPress = () => {
    navigation.navigate('volunteer-profile');
  };

  const onViewAtivityLogsButtonPress = () => {
    navigation.navigate('activity-logs');
  };

  return (
    <PageLayout title={i18n.t('tabs:volunteer')}>
      <Text category="h1">Volunteer</Text>
      <Button onPress={onViewOrganizationButtonPress}>View Organization</Button>
      <Button onPress={onViewVolunteerProfilenButtonPress}>View Volunteer Profile</Button>
      <Button onPress={onViewAtivityLogsButtonPress}>View Logs</Button>
    </PageLayout>
  );
};

export default Volunteer;
