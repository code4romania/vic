import React, { useEffect } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Toast } from 'react-native-toast-message/lib/src/Toast';
import PageLayout from '../layouts/PageLayout';
import ProfileIntro from '../components/ProfileIntro';
import { formatDate } from '../common/utils/utils';
import OrganizationIdentity from '../components/OrganizationIdentity';
import { useVolunteerProfile } from '../services/volunteer/volunteer.service';
import { InternalErrors } from '../common/errors/internal-errors.class';
import { VOLUNTEER_PROFILE_ERRORS } from '../common/errors/entities/volunteer-profile';
import MissingEntity from './MissingEntity';
import { useVolunteer } from '../store/volunteer/volunteer.selector';
import VolunteerProfileSkeleton from '../components/skeleton/volunteer-profile.skeleton';
import { useUserProfile } from '../store/profile/profile.selector';
import { usePaddingTop } from '../hooks/usePaddingTop';
import { colors, spacing } from '../common/theme/tokens';
import { Group, VText } from '../components/ui';

const EMPTY = '–';

/** One read-only line of the volunteer info: the label small and gray, the value under it. */
const InfoRow = ({
  label,
  value,
  last,
  testID,
}: {
  label: string;
  value?: string | null;
  last?: boolean;
  testID?: string;
}) => (
  <View style={[styles.row, !last && styles.divider]} accessible testID={testID}>
    <VText variant="cap">{label}</VText>
    <VText variant="body">{value?.trim() ? value : EMPTY}</VText>
  </View>
);

/**
 * VIC 2.0 volunteer profile at the active organization: the person (photo, name, age, city) with
 * the organization, then what the organization knows about the volunteer, on the gray canvas.
 */
const VolunteerProfile = ({ navigation }: any) => {
  const { t } = useTranslation('volunteer');
  const paddingTop = usePaddingTop();

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
      <MissingEntity
        onBackButtonPress={navigation.goBack}
        onActionBtnPress={onCreateVolunteerProfileButtonPress}
        heading={t('missing_profile.heading')}
        paragraph={t('missing_profile.paragraph')}
        actionBtnLabel={t('missing_profile.action_btn')}
      />
    );
  }

  // age (only with a birthday: the API sends 0 without one) · sex · "Oraș, jud. Județ"
  const buildProfileDescription = (): string => {
    if (!volunteer) {
      return '';
    }
    const { age, sex, location } = volunteer.user;
    const parts: string[] = [];
    if (userProfile?.birthday || age > 0) {
      parts.push(`${t('age', { years: age })}`);
    }
    if (sex) {
      parts.push(`${t('general:sex', { sex_type: t(`general:${sex}`) })}`);
    }
    if (location?.name) {
      parts.push(
        `${location.name}${
          location.county?.name ? `${t('county', { name: location.county.name })}` : ''
        }`,
      );
    }
    return parts.join(' · ');
  };

  return (
    <PageLayout
      title={t('title')}
      onBackButtonPress={navigation.goBack}
      onEditButtonPress={
        volunteer && !isLoadingProfile ? onEditVolunteerProfileButtonPress : undefined
      }
      headerStyle={{ paddingTop, backgroundColor: colors.canvas }}
    >
      <View style={styles.canvas}>
        {isLoadingProfile && (
          <View style={styles.content}>
            <VolunteerProfileSkeleton />
          </View>
        )}
        {volunteer && userProfile?.activeOrganization && !isLoadingProfile && (
          <ScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
            testID="volunteer-profile-details"
          >
            <ProfileIntro
              uri={userProfile.profilePicture}
              name={`${userProfile.firstName} ${userProfile.lastName}`}
              description={buildProfileDescription()}
              testID="volunteer-profile-person"
            >
              <View style={styles.organization}>
                <OrganizationIdentity
                  uri={userProfile.activeOrganization.logo || ''}
                  name={userProfile.activeOrganization.name}
                />
              </View>
            </ProfileIntro>

            <View style={styles.section}>
              <VText variant="label" color={colors.muted} style={styles.sectionTitle}>
                {`${t('information')}`}
              </VText>
              <Group>
                <InfoRow label={t('email')} value={volunteer.profile?.email} />
                <InfoRow label={t('general:phone')} value={volunteer.user.phone} />
                <InfoRow label={t('general:role')} value={volunteer.profile?.role?.name} />
                <InfoRow
                  label={t('general:department')}
                  value={volunteer.profile?.department?.name}
                />
                <InfoRow label={t('general:branch')} value={volunteer.profile?.branch?.name} />
                <InfoRow
                  label={t('active_since')}
                  value={
                    volunteer.profile?.activeSince
                      ? formatDate(volunteer.profile.activeSince)
                      : null
                  }
                />
                <InfoRow
                  label={t('created_on')}
                  value={volunteer.createdOn ? formatDate(volunteer.createdOn) : null}
                  last
                />
              </Group>
            </View>
          </ScrollView>
        )}
      </View>
    </PageLayout>
  );
};

export default VolunteerProfile;

const styles = StyleSheet.create({
  // PageLayout pads its content by 16 on white: the gray canvas fills it edge to edge, with the
  // 20pt page margins
  canvas: {
    flex: 1,
    marginHorizontal: -spacing.l,
    marginVertical: -spacing.s,
    backgroundColor: colors.canvas,
  },
  content: {
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.s,
    paddingBottom: spacing.xxl,
    gap: spacing.xl,
  },
  organization: {
    paddingTop: spacing.l,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.line,
  },
  section: { gap: spacing.s },
  sectionTitle: { paddingHorizontal: spacing.xs },
  row: { gap: 2, paddingVertical: spacing.m, minHeight: 44, justifyContent: 'center' },
  divider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line },
});
