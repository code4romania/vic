import React from 'react';
import PageLayout from '../layouts/PageLayout';
import { Divider, Text } from '@ui-kitten/components';
import { StyleSheet, View } from 'react-native';
import ReadOnlyElement from '../components/ReadOnlyElement';
import SectionWrapper from '../components/SectionWrapper';
import ProfileIntro from '../components/ProfileIntro';
import {
  useLeaveOrganizationMutation,
  useOrganizationQuery,
  useRejoinOrganizationMutation,
} from '../services/organization/organization.service';
import LoadingScreen from '../components/LoadingScreen';
import { JSONStringifyError, formatDate } from '../common/utils/utils';
import ScrollViewLayout from '../layouts/ScrollViewLayout';
import EventItem from '../components/EventItem';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { ButtonType } from '../common/enums/button-type.enum';
import Disclaimer from '../components/Disclaimer';
import { OrganizatinVolunteerStatus } from '../common/enums/organization-volunteer-status.enum';
import { useOrganization } from '../store/organization/organization.selector';
import { useCancelAccessRequestMutation } from '../services/access-request/access-request.service';
import Toast from 'react-native-toast-message';
import { InternalErrors } from '../common/errors/internal-errors.class';
import useStore from '../store/store';
import Paragraph from '../components/Paragraph';

const OrganizationProfile = ({ navigation, route }: any) => {
  console.log('OrganizationProfile');
  const { t } = useTranslation('organization_profile');

  const { userProfile } = useAuth();
  const { open: openBottomSheet } = useStore();

  const { isFetching: isFetchingOrganization, error: getOrganizationError } = useOrganizationQuery(
    route.params.organizationId,
  );

  const { isLoading: isCancelingAccessRequest, mutate: cancelAccessRequest } =
    useCancelAccessRequestMutation();

  const { isLoading: isLeavingOrganization, mutate: leaveOrganization } =
    useLeaveOrganizationMutation();

  const { isLoading: isRejoiningOrganization, mutate: rejoinOrganization } =
    useRejoinOrganizationMutation();

  const { organization } = useOrganization();

  const onJoinOrganizationButtonPress = () => {
    if (!userProfile?.userPersonalData) {
      // 1. if the user doesn't have the identity data filled in show modal
      openBottomSheet();
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
      openBottomSheet();
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
    navigation.navigate('identity-data', { shouldGoBack: true });
  };

  const onCancelAccessRequest = () => {
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

  const onLeaveOrganizationConfirm = () => {
    if (organization) {
      leaveOrganization(
        { volunteerId: organization.volunteer.id },
        {
          onError: (error: any) => {
            Toast.show({
              type: 'error',
              text1: `${InternalErrors.VOLUNTEER_PROFILE_ERRORS.getError(
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
              text1: `${InternalErrors.VOLUNTEER_PROFILE_ERRORS.getError(
                error.response?.data.code_error,
              )}`,
            });
          },
        },
      );
    }
  };

  const isLoading = () => {
    return (
      isCancelingAccessRequest ||
      isFetchingOrganization ||
      isLeavingOrganization ||
      isRejoiningOrganization
    );
  };

  const renderIdentityDataMissingBottomSheetConfig = () => ({
    iconType: 'warning' as any,
    heading: t('modal.identity_data_missing.heading'),
    paragraph: <Paragraph>{`${t('modal.identity_data_missing.paragraph')}`}</Paragraph>,
    primaryAction: {
      label: t('modal.identity_data_missing.action_label'),
      onPress: onGoToIdentityDataScreen,
    },
    secondaryAction: {
      label: t('general:back'),
    },
  });

  const renderCanceAccessRequestConfirmationBottomSheetConfig = () => ({
    heading: t('modal.confirm_cancel_request.heading'),
    paragraph: <Paragraph>{`${t('modal.confirm_cancel_request.paragraph')}`}</Paragraph>,
    primaryAction: {
      status: 'danger' as any,
      label: t('modal.confirm_cancel_request.action_label'),
      onPress: onCancelAccessRequest,
    },
    secondaryAction: {
      label: t('general:back'),
    },
  });

  const renderLeaveOrganizationConfirmationBottomSheetConfig = () => ({
    heading: t('modal.confirm_leave_organization.heading'),
    paragraph: <Paragraph>{`${t('modal.confirm_leave_organization.paragraph')}`}</Paragraph>,
    primaryAction: {
      status: 'danger' as any,
      label: t('modal.confirm_leave_organization.action_label'),
      onPress: onLeaveOrganizationConfirm,
    },
    secondaryAction: {
      label: t('general:back'),
    },
  });

  const renderActionOptions = () => {
    let options: any = {
      primaryActionLabel: t('join'),
      onPrimaryActionButtonClick: onJoinOrganizationButtonPress,
      secondaryActionLabel: `${t('code')}`,
      onSecondaryActionButtonClick: onJoinOrganizationByAccessCodeButtonPress,
    };

    switch (organization?.organizationVolunteerStatus) {
      case OrganizatinVolunteerStatus.ACCESS_REQUEST_PENDING:
        options = {
          primaryActionLabel: t('cancel_request'),
          onPrimaryActionButtonClick: openBottomSheet,
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

  const renderBottomSheetOptions = () => {
    if (
      organization?.organizationVolunteerStatus ===
      OrganizatinVolunteerStatus.ACCESS_REQUEST_PENDING
    ) {
      return renderCanceAccessRequestConfirmationBottomSheetConfig();
    }

    if (organization?.organizationVolunteerStatus === OrganizatinVolunteerStatus.ACTIVE_VOLUNTEER) {
      return renderLeaveOrganizationConfirmationBottomSheetConfig();
    }

    return renderIdentityDataMissingBottomSheetConfig();
  };

  const onEventPress = (eventId: string) => {
    navigation.navigate('event', { eventId });
  };

  const onLeaveOrganization = () => {
    navigation.navigate('leave-organization');
  };

  return (
    <PageLayout
      title={t('title')}
      onBackButtonPress={navigation.goBack}
      actionsOptions={{
        ...renderActionOptions(),
        loading: isLoading(),
      }}
      bottomSheetOptions={renderBottomSheetOptions()}
    >
      {isFetchingOrganization && <LoadingScreen />}
      {!!getOrganizationError && !isFetchingOrganization && (
        <Text>{JSONStringifyError(getOrganizationError as any)}</Text>
      )}
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
                    <Text category="p1">{`${t('no_events')}`}</Text>
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
  );
};

export default OrganizationProfile;

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
});
