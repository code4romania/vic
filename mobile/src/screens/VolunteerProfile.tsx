import React from 'react';
import PageLayout from '../layouts/PageLayout';
import { StyleService, Text, useStyleSheet } from '@ui-kitten/components';
import i18n from '../common/config/i18n';
import ProfileIntro from '../components/ProfileIntro';
import { ScrollView, View } from 'react-native';
import ReadOnlyElement from '../components/ReadOnlyElement';
import { formatDate } from '../common/utils/utils';
import OrganizationIdentity from '../components/OrganizationIdentity';
import { useVolunteerProfile } from '../services/volunteer/volunteer.service';
import LoadingScreen from '../components/LoadingScreen';
import { InternalErrors } from '../common/errors/internal-errors.class';
import { VOLUNTEER_PROFILE_ERRORS } from '../common/errors/entities/volunteer-profile';
import MissingEntity from './MissingEntity';
import { useTranslation } from 'react-i18next';
import { useVolunteer } from '../store/volunteer/volunteer.selector';
import { useAuth } from '../hooks/useAuth';

const VolunteerProfile = ({ navigation }: any) => {
  console.log('VolunteerProfile');
  const styles = useStyleSheet(themedStyles);

  const { t } = useTranslation('volunteer');

  const { userProfile } = useAuth();

  const { volunteer } = useVolunteer();

  const { isLoading: isLoadingProfile, error: volunteerProfileError } = useVolunteerProfile(
    userProfile?.activeOrganization?.volunteerId as string,
  );

  const onEditVolunteerProfileButtonPress = () => {
    navigation.navigate('edit-volunteer');
  };

  const onCreateVolunteerProfileButtonPress = () => {
    navigation.navigate('create-volunteer', {
      volunteerId: userProfile?.activeOrganization?.volunteerId,
    });
  };

  // check if there is an issue with the volunteer profile
  if (
    (volunteerProfileError as any)?.response?.data.code_error ===
    VOLUNTEER_PROFILE_ERRORS.VOLUNTEER_PROFILE_003
  ) {
    return (
      <PageLayout title={i18n.t('volunteer:profile')} onBackButtonPress={navigation.goBack}>
        <MissingEntity
          onActionBtnPress={onCreateVolunteerProfileButtonPress}
          heading={t('missing_profile.heading')}
          paragraph={t('missing_profile.paragraph')}
          actionBtnLabel={t('missing_profile.action_btn')}
        />
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title={i18n.t('volunteer:profile')}
      onBackButtonPress={navigation.goBack}
      onEditButtonPress={volunteer && onEditVolunteerProfileButtonPress}
    >
      {isLoadingProfile && <LoadingScreen />}
      {volunteer && userProfile?.activeOrganization && (
        <ScrollView>
          <ProfileIntro
            uri={userProfile?.activeOrganization?.logo || ''}
            name={`${volunteer?.user.lastName} ${volunteer?.user.firstName}`}
            description={`${i18n.t('volunteer:age', {
              years: volunteer.user.age,
            })}\n${i18n.t('general:sex', {
              sex_type: i18n.t(`general:${volunteer.user.sex}`),
            })}\n${volunteer.user.location?.name || ''}${i18n.t('volunteer:county', {
              name: volunteer.user.location?.county.name,
            })}`}
          />
          <View style={styles.profileContent}>
            <OrganizationIdentity
              uri={userProfile?.activeOrganization.logo || ''}
              name={userProfile?.activeOrganization.name}
            />
            <Text category="p2">{`${i18n.t('volunteer:information')}`}</Text>
            <ReadOnlyElement label={i18n.t('volunteer:email')} value={volunteer.profile.email} />
            <ReadOnlyElement label={i18n.t('general:phone')} value={volunteer.profile.phone} />
            <ReadOnlyElement label={i18n.t('general:role')} value={volunteer.profile.role?.name} />
            <ReadOnlyElement
              label={i18n.t('general:department')}
              value={volunteer.profile.department?.name}
            />
            <ReadOnlyElement
              label={i18n.t('general:branch')}
              value={volunteer.profile.branch?.name}
            />
            <ReadOnlyElement
              label={i18n.t('volunteer:active_since')}
              value={
                volunteer.profile.activeSince ? formatDate(volunteer.profile.activeSince) : '-'
              }
            />
            <ReadOnlyElement
              label={i18n.t('volunteer:created_on')}
              value={formatDate(volunteer.createdOn)}
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
