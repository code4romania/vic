import React from 'react';
import { Text } from '@ui-kitten/components';
import NoVolunteerProfile from './MissingEntity';
import VolunteerCard from '../components/VolunteerCard';
import { StyleSheet } from 'react-native';
import { View } from 'react-native';
//SVG
import { SvgXml } from 'react-native-svg';
import volunteerUserSVG from '../assets/svg/volunteer-user';
import volunteerClockSVG from '../assets/svg/volunteer-clock';
import volunteerDocumentSVG from '../assets/svg/doc';
import TopNavigationCard from '../components/TopNavigationCard';
import { useTranslation } from 'react-i18next';
import { useVolunteerStats } from '../services/volunteer/volunteer.service';
import { useFocusEffect } from '@react-navigation/native';
import { useUserProfile } from '../store/profile/profile.selector';
import { ALLOW_FONT_SCALLING } from '../common/constants/constants';
import { useGetUserProfileQuery } from '../services/user/user.service';
import { Screen } from '../components/Screen';

const Volunteer = ({ navigation }: any) => {
  const { t } = useTranslation('volunteer');

  const { userProfile } = useUserProfile();
  const { refetch: refetchUserProfile } = useGetUserProfileQuery();

  const {
    data: stats,
    isFetching: isLoadingStats,
    refetch,
  } = useVolunteerStats(userProfile?.activeOrganization?.volunteerId as string);

  useFocusEffect(
    React.useCallback(() => {
      refetchUserProfile();
      refetch();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  const onViewOrganizationButtonPress = () => {
    navigation.navigate('organization-profile', {
      organizationId: userProfile?.activeOrganization?.id,
    });
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

  return userProfile?.activeOrganization ? (
    <Screen
      preset="scroll"
      statusBarStyle="light"
      ScrollViewProps={{
        bounces: false,
        stickyHeaderIndices: [0],
        showsVerticalScrollIndicator: false,
      }}
    >
      <View style={styles.cardWrapper}>
        <TopNavigationCard
          title={userProfile?.activeOrganization.name}
          uri={userProfile?.activeOrganization?.logo || ''}
          onPress={onTopNavigationCardPress}
        />
      </View>
      <View style={styles.container}>
        <Text allowFontScaling={ALLOW_FONT_SCALLING}>{`${t('details')}`}</Text>
        <VolunteerCard
          title={t('menu_items.organization_profile.title')}
          uri={userProfile?.activeOrganization?.logo || ''}
          onPress={onViewOrganizationButtonPress}
        />
        <VolunteerCard
          title={t('menu_items.activity_log.title')}
          icon={<SvgXml xml={volunteerClockSVG} />}
          onPress={onViewAtivityLogsButtonPress}
          loading={isLoadingStats}
          subtitle={`${t('menu_items.activity_log.subtitle', { number: stats?.activityLogCount })}`}
        />
        <VolunteerCard
          title={t('general:documents')}
          icon={<SvgXml xml={volunteerDocumentSVG} />}
          onPress={onDocumentsButtonPress}
          loading={isLoadingStats}
          subtitle={`${t('menu_items.documents.subtitle', { number: stats?.contractCount })}`}
        />
        <VolunteerCard
          title={t('menu_items.volunteer_profile.title')}
          icon={<SvgXml xml={volunteerUserSVG} />}
          onPress={onViewVolunteerProfilenButtonPress}
          loading={isLoadingStats}
          subtitle={
            !stats?.volunteerProfileId ? `${t('menu_items.volunteer_profile.subtitle')}` : ''
          }
        />
      </View>
    </Screen>
  ) : (
    <NoVolunteerProfile
      onActionBtnPress={onAddOrganizationPress}
      heading={t('no_org_added')}
      paragraph={t('no_org_description')}
      actionBtnLabel={t('general:add', { item: t('general:organization').toLowerCase() })}
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
  },
});
