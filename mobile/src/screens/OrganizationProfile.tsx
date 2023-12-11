import React, { useEffect, useMemo, useRef } from 'react';
import PageLayout from '../layouts/PageLayout';
import { Divider, Text, useTheme } from '@ui-kitten/components';
import { StyleSheet, View } from 'react-native';
import ReadOnlyElement from '../components/ReadOnlyElement';
import SectionWrapper from '../components/SectionWrapper';
import ProfileIntro from '../components/ProfileIntro';
import {
  useOrganizationQuery,
  useRejoinOrganizationMutation,
} from '../services/organization/organization.service';
import { formatDate } from '../common/utils/utils';
import ScrollViewLayout from '../layouts/ScrollViewLayout';
import EventItem from '../components/EventItem';
import { useTranslation } from 'react-i18next';
import { ButtonType } from '../common/enums/button-type.enum';
import Disclaimer from '../components/Disclaimer';
import { OrganizatinVolunteerStatus } from '../common/enums/organization-volunteer-status.enum';
import { useOrganization } from '../store/organization/organization.selector';
import { useCancelAccessRequestMutation } from '../services/access-request/access-request.service';
import Toast from 'react-native-toast-message';
import { InternalErrors } from '../common/errors/internal-errors.class';
import Paragraph from '../components/Paragraph';
import OrganizationSkeleton from '../components/skeleton/organization-skeleton';
import BottomSheet from '@gorhom/bottom-sheet';
import { renderBackdrop } from '../components/BottomSheet';
import { SvgXml } from 'react-native-svg';
import upsIcon from '../assets/svg/ups-icon';
import Button from '../components/Button';
import InlineLink from '../components/InlineLink';
import { useUserProfile } from '../store/profile/profile.selector';
import { ALLOW_FONT_SCALLING } from '../common/constants/constants';

const OrganizationProfile = ({ navigation, route }: any) => {
  const { t } = useTranslation('organization_profile');
  // theme
  const theme = useTheme();
  // user profile context
  const { userProfile } = useUserProfile();

  const { organization } = useOrganization();

  // bottom sheet ref
  const bottomSheetRef = useRef<BottomSheet>(null);
  // bottom sheet snap points
  const snapPoints = useMemo(
    () =>
      organization?.organizationVolunteerStatus ===
      OrganizatinVolunteerStatus.ACCESS_REQUEST_PENDING
        ? ['1%', 300]
        : ['1%', 420],
    [organization],
  );

  const { isFetching: isFetchingOrganization, error: getOrganizationError } = useOrganizationQuery(
    route.params.organizationId,
  );

  const { isLoading: isCancelingAccessRequest, mutate: cancelAccessRequest } =
    useCancelAccessRequestMutation();

  const { isLoading: isRejoiningOrganization, mutate: rejoinOrganization } =
    useRejoinOrganizationMutation();

  useEffect(() => {
    if (getOrganizationError) {
      // useToa
      Toast.show({
        type: 'error',
        text1: `${InternalErrors.ORGANIZATION_ERRORS.getError(
          (getOrganizationError as any).response?.data.code_error,
        )}`,
      });
      navigation.goBack();
    }
  }, [getOrganizationError, navigation]);

  const onJoinOrganizationButtonPress = () => {
    if (!userProfile?.userPersonalData) {
      // 1. if the user doesn't have the identity data filled in show modal
      bottomSheetRef.current?.expand();
      return;
    }

    // 2. otherwise go to join organization
    navigation.navigate('join-organization', {
      organizationId: organization?.id,
      logo: organization?.logo,
      name: organization?.name,
    });
  };

  const onJoinOrganizationByAccessCodeButtonPress = () => {
    if (!userProfile?.userPersonalData) {
      // 1. if the user doesn't have the identity data filled in show modal
      bottomSheetRef.current?.expand();
      return;
    }

    // 2. otherwise go to join organization
    navigation.navigate('join-by-access-code', {
      organizationId: organization?.id,
      logo: organization?.logo,
      name: organization?.name,
    });
  };

  const onGoToIdentityDataScreen = () => {
    onCloseBottomSheet();
    navigation.navigate('identity-data', { shouldGoBack: true });
  };

  const onCancelAccessRequest = () => {
    onCloseBottomSheet();
    if (organization) {
      cancelAccessRequest(
        { organizationId: organization.id },
        {
          onError: (error: any) => {
            Toast.show({
              type: 'error',
              text1: `${InternalErrors.ACCESS_CODE_ERRORS.getError(
                error.response?.data.code_error,
              )}`,
            });
          },
        },
      );
    }
  };

  const onRejoinOrganization = () => {
    if (organization) {
      rejoinOrganization(
        { volunteerId: organization.volunteer.id },
        {
          onError: (error: any) => {
            Toast.show({
              type: 'error',
              text1: `${InternalErrors.ORGANIZATION_ERRORS.getError(
                error.response?.data.code_error,
              )}`,
            });
          },
        },
      );
    }
  };

  const isLoading = () => {
    return isCancelingAccessRequest || isFetchingOrganization || isRejoiningOrganization;
  };

  const renderActionOptions = () => {
    let options: any = {
      primaryActionLabel: t('join'),
      onPrimaryActionButtonClick: onJoinOrganizationButtonPress,
      secondaryActionLink: `${t('code')}`,
      onSecondaryActionButtonClick: onJoinOrganizationByAccessCodeButtonPress,
      secondaryLinkColor: true,
    };

    switch (organization?.organizationVolunteerStatus) {
      case OrganizatinVolunteerStatus.ACCESS_REQUEST_PENDING:
        options = {
          primaryActionLabel: t('cancel_request'),
          onPrimaryActionButtonClick: () => bottomSheetRef.current?.expand(),
          primaryBtnType: ButtonType.DANGER,
        };
        break;
      case OrganizatinVolunteerStatus.ACTIVE_VOLUNTEER:
        options = {
          primaryActionLabel: t('leave'),
          onPrimaryActionButtonClick: onLeaveOrganization,
          primaryBtnType: ButtonType.DANGER,
        };
        break;
      case OrganizatinVolunteerStatus.ARCHIVED_VOLUNTEER:
        options = {
          primaryActionLabel: t('rejoin'),
          onPrimaryActionButtonClick: onRejoinOrganization,
          primaryBtnType: ButtonType.PRIMARY,
        };
        break;
    }

    return options;
  };

  const onEventPress = (eventId: string) => {
    navigation.navigate('event', { eventId });
  };

  const onLeaveOrganization = () => {
    navigation.navigate('leave-organization');
  };

  const onCloseBottomSheet = () => {
    bottomSheetRef.current?.close();
  };

  return (
    <>
      <PageLayout
        title={t('title')}
        onBackButtonPress={navigation.goBack}
        actionsOptions={{
          ...renderActionOptions(),
          loading: isLoading(),
        }}
      >
        {isFetchingOrganization && <OrganizationSkeleton />}
        {!isFetchingOrganization && organization && (
          <>
            {organization?.organizationVolunteerStatus ===
              OrganizatinVolunteerStatus.ACTIVE_VOLUNTEER && (
              <Disclaimer
                text={t('disclaimer.joined_from', {
                  date: formatDate(new Date(organization.volunteer.createdOn)),
                })}
                color="green"
              />
            )}
            {organization?.organizationVolunteerStatus ===
              OrganizatinVolunteerStatus.ACCESS_REQUEST_PENDING && (
              <Disclaimer text={t('disclaimer.access_request_pending')} color="yellow" />
            )}
            {organization?.organizationVolunteerStatus ===
              OrganizatinVolunteerStatus.ARCHIVED_VOLUNTEER && (
              <Disclaimer text={t('disclaimer.volunteer_archived')} color="yellow" />
            )}
            {organization?.organizationVolunteerStatus ===
              OrganizatinVolunteerStatus.BLOCKED_VOLUNTEER && (
              <Disclaimer text={t('disclaimer.volunteer_blocked')} color="danger" />
            )}

            <ScrollViewLayout>
              <ProfileIntro
                uri={organization.logo}
                name={organization.name}
                description={`${organization.numberOfVolunteers} ${t(
                  'general:volunteers',
                ).toLowerCase()}`}
              />
              <View style={styles.container}>
                <ReadOnlyElement label={t('description')} value={organization.description} />
                <ReadOnlyElement label={t('email')} value={organization.email} />
                <ReadOnlyElement label={t('phone')} value={organization.phone} />
                <ReadOnlyElement label={t('address')} value={organization.address} />
                <ReadOnlyElement label={t('area')} value={organization.activityArea} />
              </View>
              <SectionWrapper title={t('events')}>
                <ScrollViewLayout>
                  <View>
                    {!organization.events || organization.events.length === 0 ? (
                      <Text allowFontScaling={ALLOW_FONT_SCALLING} category="p1">{`${t(
                        'no_events',
                      )}`}</Text>
                    ) : (
                      organization.events.map((event) => (
                        <View key={event.id}>
                          <EventItem event={event} onPress={onEventPress} />
                          <Divider />
                        </View>
                      ))
                    )}
                  </View>
                </ScrollViewLayout>
              </SectionWrapper>
            </ScrollViewLayout>
          </>
        )}
      </PageLayout>
      <BottomSheet
        backdropComponent={renderBackdrop}
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
      >
        <View style={styles.bottomSheetContainer}>
          {organization?.organizationVolunteerStatus ===
            OrganizatinVolunteerStatus.ACCESS_REQUEST_PENDING && (
            <>
              <View style={styles.textContainer}>
                <Text allowFontScaling={ALLOW_FONT_SCALLING} category="h1">{`${t(
                  'modal.confirm_cancel_request.heading',
                )}`}</Text>
                <Paragraph style={styles.bottomSheetParagraph}>{`${t(
                  'modal.confirm_cancel_request.paragraph',
                )}`}</Paragraph>
              </View>
              <View style={styles.buttonsContainer}>
                <Button
                  label={t('modal.confirm_cancel_request.action_label')}
                  status={'danger'}
                  onPress={onCancelAccessRequest}
                />
                <InlineLink
                  style={{ color: theme['cool-gray-700'] }}
                  label={t('general:back')}
                  onPress={onCloseBottomSheet}
                />
              </View>
            </>
          )}
          {organization?.organizationVolunteerStatus !==
            OrganizatinVolunteerStatus.ACCESS_REQUEST_PENDING &&
            organization?.organizationVolunteerStatus !==
              OrganizatinVolunteerStatus.ACTIVE_VOLUNTEER && (
              <>
                <SvgXml xml={upsIcon} height={100} width={100} />
                <View style={styles.textContainer}>
                  <Text allowFontScaling={ALLOW_FONT_SCALLING} category="h1">{`${t(
                    'modal.identity_data_missing.heading',
                  )}`}</Text>
                  <Paragraph style={styles.bottomSheetParagraph}>{`${t(
                    'modal.identity_data_missing.paragraph',
                  )}`}</Paragraph>
                </View>
                <View style={styles.buttonsContainer}>
                  <Button
                    label={t('modal.identity_data_missing.action_label')}
                    status={'primary'}
                    onPress={onGoToIdentityDataScreen}
                  />
                  <InlineLink
                    label={t('general:back')}
                    style={{ color: theme['cool-gray-700'] }}
                    onPress={onCloseBottomSheet}
                  />
                </View>
              </>
            )}
        </View>
      </BottomSheet>
    </>
  );
};

export default OrganizationProfile;

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  bottomSheetContainer: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 24,
    gap: 24,
  },
  textContainer: {
    gap: 4,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  bottomSheetParagraph: {
    textAlign: 'center',
  },
  buttonsContainer: {
    gap: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
