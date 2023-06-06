import React from 'react';
import PageLayout from '../layouts/PageLayout';
import { StyleService, Text, useStyleSheet } from '@ui-kitten/components';
import i18n from '../common/config/i18n';
import ProfileIntro from '../components/ProfileIntro';
import { ScrollView, View } from 'react-native';
import ReadOnlyElement from '../components/ReadOnlyElement';
import { calculateAge, formatDate } from '../common/utils/utils';
import OrganizationIdentity from '../components/OrganizationIdentity';
import { useVolunteerProfile } from '../services/volunteer/volunteer.service';
import { useActiveOrganization } from '../store/organization/active-organization.selector';
import LoadingScreen from '../components/LoadingScreen';
import { InternalErrors } from '../common/errors/internal-errors.class';

const VolunteerProfile = ({ navigation }: any) => {
  console.log('VolunteerProfile');
  const styles = useStyleSheet(themedStyles);

  const { activeOrganization } = useActiveOrganization();

  const {
    isLoading: isLoadingProfile,
    data: volunteerProfile,
    error: volunteerProfileError,
  } = useVolunteerProfile(activeOrganization?.id as string);

  const onEditVolunteerProfileButtonPress = () => {
    navigation.navigate('edit-volunteer');
  };

  return (
    <PageLayout
      title={i18n.t('volunteer:profile')}
      onBackButtonPress={navigation.goBack}
      onEditButtonPress={onEditVolunteerProfileButtonPress}
    >
      {isLoadingProfile && <LoadingScreen />}
      {volunteerProfile && activeOrganization && (
        <ScrollView>
          <ProfileIntro
            uri={activeOrganization?.logo || ''}
            name={volunteerProfile?.user.name}
            description={`${i18n.t('volunteer:age', {
              years: calculateAge(volunteerProfile.user.birthday),
            })}\n${i18n.t('general:sex', {
              sex_type: i18n.t(`general:${volunteerProfile.user.sex}`),
            })}\n${volunteerProfile.user.location?.name || ''}${i18n.t('volunteer:county', {
              name: volunteerProfile.user.location?.county.name,
            })}`}
          />
          <View style={styles.profileContent}>
            <OrganizationIdentity
              uri={activeOrganization.logo || ''}
              name={activeOrganization.name}
            />
            <Text category="p2">{`${i18n.t('volunteer:information')}`}</Text>
            <ReadOnlyElement
              label={i18n.t('volunteer:email')}
              value={volunteerProfile.profile.email}
            />
            <ReadOnlyElement
              label={i18n.t('general:phone')}
              value={volunteerProfile.profile.phone}
            />
            <ReadOnlyElement
              label={i18n.t('general:role')}
              value={volunteerProfile.profile.role?.name}
            />
            <ReadOnlyElement
              label={i18n.t('general:department')}
              value={volunteerProfile.profile.department?.name}
            />
            <ReadOnlyElement
              label={i18n.t('general:branch')}
              value={volunteerProfile.profile.branch?.name}
            />
            <ReadOnlyElement
              label={i18n.t('volunteer:active_since')}
              value={
                volunteerProfile.profile.activeSince
                  ? formatDate(volunteerProfile.profile.activeSince)
                  : '-'
              }
            />
            <ReadOnlyElement
              label={i18n.t('volunteer:created_on')}
              value={formatDate(volunteerProfile.createdOn)}
            />
          </View>
        </ScrollView>
      )}
      {!!volunteerProfileError && (
        <Text category="c1">
          {InternalErrors.VOLUNTEER_PROFILE_ERRORS.getError(
            (volunteerProfileError as any).response?.data.code_error,
          )}
        </Text>
      )}
    </PageLayout>
  );
};

export default VolunteerProfile;

const themedStyles = StyleService.create({
  profileContent: {
    marginTop: 32,
    gap: 16,
  },
});
