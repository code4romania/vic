import React from 'react';
import { Text } from '@ui-kitten/components';
import NoVolunteerProfile from './MissingEntity';
import i18n from '../common/config/i18n';
import VolunteerCard from '../components/VolunteerCard';
import { StyleSheet } from 'react-native';
import { View } from 'react-native';
//SVG
import { SvgXml } from 'react-native-svg';
import volunteerUserSVG from '../assets/svg/volunteer-user';
import volunteerClockSVG from '../assets/svg/volunteer-clock';
import volunteerDocumentSVG from '../assets/svg/doc';
import TopNavigationCard from '../components/TopNavigationCard';
import { useActiveOrganization } from '../store/organization/active-organization.selector';

const Volunteer = ({ navigation }: any) => {
  console.log('Volunteer');

  const { activeOrganization } = useActiveOrganization();

  const onViewOrganizationButtonPress = () => {
    navigation.navigate('organization-profile', { organizationId: activeOrganization?.id });
  };

  const onViewVolunteerProfilenButtonPress = () => {
    navigation.navigate('volunteer-profile');
  };

  const onViewAtivityLogsButtonPress = () => {
    navigation.navigate('activity-logs');
  };

  const onDocumentsButtonPress = () => {
    navigation.navigate('documents');
  };

  const onTopNavigationCardPress = () => {
    navigation.openDrawer();
  };

  const onAddOrganizationPress = () => {
    navigation.navigate('search');
  };

  return activeOrganization ? (
    <>
      <View style={styles.cardWrapper}>
        <TopNavigationCard
          title={activeOrganization.name}
          uri={activeOrganization?.logo || ''}
          onPress={onTopNavigationCardPress}
        />
      </View>
      <View style={styles.container}>
        <Text>{`${i18n.t('volunteer:details')}`}</Text>
        <VolunteerCard
          title={i18n.t('volunteer:menu_items.organization_profile.title')}
          uri={activeOrganization?.logo || ''}
          onPress={onViewOrganizationButtonPress}
        />
        <VolunteerCard
          title={i18n.t('volunteer:menu_items.activity_log.title')}
          icon={<SvgXml xml={volunteerClockSVG} />}
          onPress={onViewAtivityLogsButtonPress}
          subtitle={`${i18n.t('volunteer:menu_items.activity_log.subtitle', { number: 2 })}`}
        />
        <VolunteerCard
          title={i18n.t('general:documents')}
          icon={<SvgXml xml={volunteerDocumentSVG} />}
          onPress={onDocumentsButtonPress}
        />
        <VolunteerCard
          title={i18n.t('volunteer:menu_items.volunteer_profile.title')}
          icon={<SvgXml xml={volunteerUserSVG} />}
          onPress={onViewVolunteerProfilenButtonPress}
        />
      </View>
    </>
  ) : (
    <NoVolunteerProfile
      onActionBtnPress={onAddOrganizationPress}
      heading={i18n.t('volunteer:no_org_added')}
      paragraph={i18n.t('volunteer:no_org_description')}
      actionBtnLabel={i18n.t('general:add', { item: i18n.t('general:organization').toLowerCase() })}
    />
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
