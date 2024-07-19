import React, { useEffect } from 'react';
import PageLayout from '../layouts/PageLayout';
import { StyleService, Text, useStyleSheet } from '@ui-kitten/components';
import ProfileIntro from '../components/ProfileIntro';
import { View } from 'react-native';
import ReadOnlyElement from '../components/ReadOnlyElement';
import { formatDate } from '../common/utils/utils';
import OrganizationIdentity from '../components/OrganizationIdentity';
import { useVolunteerProfile } from '../services/volunteer/volunteer.service';
import { InternalErrors } from '../common/errors/internal-errors.class';
import { VOLUNTEER_PROFILE_ERRORS } from '../common/errors/entities/volunteer-profile';
import MissingEntity from './MissingEntity';
import { useTranslation } from 'react-i18next';
import { useVolunteer } from '../store/volunteer/volunteer.selector';
import ScrollViewLayout from '../layouts/ScrollViewLayout';
import VolunteerProfileSkeleton from '../components/skeleton/volunteer-profile.skeleton';
import { Toast } from 'react-native-toast-message/lib/src/Toast';
import { useUserProfile } from '../store/profile/profile.selector';
import { ALLOW_FONT_SCALLING } from '../common/constants/constants';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const VolunteerProfile = ({ navigation }: any) => {
  const styles = useStyleSheet(themedStyles);

  const { t } = useTranslation('volunteer');
  const insets = useSafeAreaInsets();

  const { userProfile } = useUserProfile();

  const { volunteer } = useVolunteer();

  const { isLoading: isLoadingProfile, error: volunteerProfileError } = useVolunteerProfile(
    userProfile?.activeOrganization?.volunteerId as string,
  );

  useEffect(() => {
    if (
      volunteerProfileError &&
      (volunteerProfileError as any).response?.data.code_error !== 'VOLUNTEER_PROFILE_003'
    ) {
      navigation.goBack();
      Toast.show({
        text1: InternalErrors.VOLUNTEER_PROFILE_ERRORS.getError(
          (volunteerProfileError as any).response?.data.code_error,
        ),
        type: 'error',
      });
    }
  }, [volunteerProfileError, navigation]);

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
      <PageLayout
        title={t('title')}
        onBackButtonPress={navigation.goBack}
        headerStyle={{ paddingTop: insets.top + 16 }}
      >
        <MissingEntity
          onActionBtnPress={onCreateVolunteerProfileButtonPress}
          heading={t('missing_profile.heading')}
          paragraph={t('missing_profile.paragraph')}
          actionBtnLabel={t('missing_profile.action_btn')}
        />
      </PageLayout>
    );
  }

  const buildProfileDescription = (): string => {
    if (volunteer) {
      let description = `${t('age', {
        years: volunteer.user.age,
      })}\n`;

      if (volunteer.user.sex) {
        description += `${
          volunteer.user.sex
            ? t('general:sex', {
                sex_type: t(`general:${volunteer.user.sex}`),
              })
            : ''
        }\n`;
      }

      if (volunteer.user.location) {
        description += `${volunteer.user.location?.name || ''}${t('county', {
          name: volunteer.user.location?.county.name,
        })}`;
      }

      return description;
    }

    return '';
  };

  return (
    <PageLayout
      title={t('title')}
      onBackButtonPress={navigation.goBack}
      onEditButtonPress={
        volunteer && !isLoadingProfile ? onEditVolunteerProfileButtonPress : undefined
      }
      headerStyle={{ paddingTop: insets.top + 16 }}
    >
      {isLoadingProfile && <VolunteerProfileSkeleton />}
      {volunteer && userProfile?.activeOrganization && !isLoadingProfile && (
        <ScrollViewLayout>
          <ProfileIntro
            uri={userProfile?.profilePicture || ''}
            name={`${userProfile.lastName} ${userProfile.firstName}`}
            description={buildProfileDescription()}
          />
          <View style={styles.profileContent}>
            <OrganizationIdentity
              uri={userProfile?.activeOrganization.logo || ''}
              name={userProfile?.activeOrganization.name}
            />
            <Text allowFontScaling={ALLOW_FONT_SCALLING} category="p2">{`${t(
              'information',
            )}`}</Text>
            <ReadOnlyElement label={t('email')} value={volunteer.profile.email} />
            <ReadOnlyElement label={t('general:phone')} value={volunteer.user.phone} />
            <ReadOnlyElement label={t('general:role')} value={volunteer.profile.role?.name} />
            <ReadOnlyElement
              label={t('general:department')}
              value={volunteer.profile.department?.name}
            />
            <ReadOnlyElement label={t('general:branch')} value={volunteer.profile.branch?.name} />
            <ReadOnlyElement
              label={t('active_since')}
              value={
                volunteer.profile.activeSince ? formatDate(volunteer.profile.activeSince) : '-'
              }
            />
            <ReadOnlyElement label={t('created_on')} value={formatDate(volunteer.createdOn)} />
          </View>
        </ScrollViewLayout>
      )}
    </PageLayout>
  );
};

export default VolunteerProfile;

const themedStyles = StyleService.create({
  profileContent: {
    gap: 16,
  },
});
