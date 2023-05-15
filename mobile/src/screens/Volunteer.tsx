import React from 'react';
import PageLayout from '../layouts/PageLayout';
import { Button, Text } from '@ui-kitten/components';
import NoVolunteerProfile from './NoVolunteerProfile';
import i18n from '../common/config/i18n';
import VolunteerCard from '../components/VolunteerCard';
import { StyleSheet } from 'react-native';
import { View } from 'react-native';
//SVG
import { SvgXml } from 'react-native-svg';
import volunteerUserSVG from '../assets/svg/volunteer-user';
import volunteerClockSVG from '../assets/svg/volunteer-clock';

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
        <Text>{`${i18n.t('volunteer:details')}`}</Text>
        <Button onPress={onShowDrawerPress}>SHOW DRAWER</Button>
        <VolunteerCard
          title={i18n.t('volunteer:menu_items.organization_profile.title')}
          uri="https://picsum.photos/200/300"
          onPress={onViewOrganizationButtonPress}
        />
        <VolunteerCard
          title={i18n.t('volunteer:menu_items.activity_log.title')}
          icon={<SvgXml xml={volunteerClockSVG} />}
          onPress={onViewAtivityLogsButtonPress}
          subtitle={`${i18n.t('volunteer:menu_items.activity_log.subtitle', { number: 2 })}`}
        />
        <VolunteerCard
          title={i18n.t('volunteer:menu_items.volunteer_profile.title')}
          icon={<SvgXml xml={volunteerUserSVG} />}
          onPress={onViewVolunteerProfilenButtonPress}
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
