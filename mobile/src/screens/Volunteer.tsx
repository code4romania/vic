import React from 'react';
import PageLayout from '../layouts/PageLayout';
import { Button, Text } from '@ui-kitten/components';
import NoVolunteerProfile from './NoVolunteerProfile';
import i18n from '../common/config/i18n';
import VolunteerCard from '../components/VolunteerCard';
import { StyleSheet } from 'react-native';
import { View } from 'react-native';

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

  return true ? (
    <PageLayout title={i18n.t('tabs:volunteer')}>
      <View style={styles.container}>
        <Text>Volunteer</Text>
        <Button onPress={onShowDrawerPress}>SHOW DRAWER</Button>
        <Button onPress={onViewOrganizationButtonPress}>View Organization</Button>
        <Button onPress={onViewVolunteerProfilenButtonPress}>View Volunteer Profile</Button>
        <Button onPress={onViewAtivityLogsButtonPress}>View Logs</Button>
        <VolunteerCard
          title="Profil organizatie"
          uri="https://picsum.photos/200/300"
          onPress={() => console.log('volunteer card pressed')}
          subtitle="2 Documente asteapta raspuns"
        />
      </View>
    </PageLayout>
  ) : (
    <NoVolunteerProfile />
  );
};

export default Volunteer;

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
});
