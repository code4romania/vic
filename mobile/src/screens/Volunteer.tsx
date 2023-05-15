import React from 'react';
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
import TopNavigationCard from '../components/TopNavigationCard';

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

  const onTopNavigationCardPress = () => {
    console.log('top navigation card pressed');
  };

  return true ? (
    <>
      <View style={styles.cardWrapper}>
        <TopNavigationCard
          title="Asociatia Zen"
          uri="https://picsum.photos/200/300"
          onPress={onTopNavigationCardPress}
        />
      </View>
      <View style={styles.container}>
        <Text>{`${i18n.t('volunteer:details')}`}</Text>
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
        <Button onPress={onShowDrawerPress}>SHOW DRAWER</Button>
      </View>
    </>
  ) : (
    <NoVolunteerProfile />
  );
};

export default Volunteer;

const styles = StyleSheet.create({
  container: {
    gap: 16,
    backgroundColor: 'white',
    paddingHorizontal: 16,
    flex: 1,
  },
  cardWrapper: {
    backgroundColor: 'white',
    paddingBottom: 22,
  },
});
