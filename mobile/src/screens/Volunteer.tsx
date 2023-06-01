import React from 'react';
import { Text } from '@ui-kitten/components';
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
import { useOrganizations } from '../store/organization/organizations.selector';
import { useMyOrganizationsQuery } from '../services/organization/organization.service';
import LoadingScreen from '../components/LoadingScreen';

const Volunteer = ({ navigation }: any) => {
  console.log('Volunteer');

  const { isFetching: isLoadingOrganizations } = useMyOrganizationsQuery();
  const { organizations } = useOrganizations();

  console.log('isLoadingOrganizations', isLoadingOrganizations);

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
    navigation.openDrawer();
  };

  const onAddOrganizationPress = () => {
    navigation.navigate('search');
  };

  if (isLoadingOrganizations) {
    return <LoadingScreen />;
  }

  return organizations.length > 0 ? (
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
      </View>
    </>
  ) : (
    <NoVolunteerProfile onAddOrganizationPress={onAddOrganizationPress} />
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
