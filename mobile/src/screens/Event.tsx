import React, { useEffect, useMemo, useRef } from 'react';
import PageLayout from '../layouts/PageLayout';
import { Icon, Text, useTheme } from '@ui-kitten/components';
import { StyleSheet } from 'react-native';
import FormLayout from '../layouts/FormLayout';
import OrganizationIdentity from '../components/OrganizationIdentity';
import ReadOnlyElement from '../components/ReadOnlyElement';
import TaskPill from '../components/TaskPill';
import { View } from 'react-native';
import {
  useCancelRsvpMutation,
  useEventQuery,
  useSetRsvpEventMutation,
} from '../services/event/event.service';
import { mapEventType } from '../common/utils/helpers';
import Toast from 'react-native-toast-message';
import { InternalErrors } from '../common/errors/internal-errors.class';
import { useTranslation } from 'react-i18next';
import { EventVolunteerStatus } from '../common/enums/event-volunteer-status.enum';
import { ButtonType } from '../common/enums/button-type.enum';
import { useEvent } from '../store/event/event.selector';
import useStore from '../store/store';
import { AttendanceType } from '../common/enums/attendance-type.enum';
import EventSkeleton from '../components/skeleton/event-skeleton';
import ImageWithPreload from '../components/ImageWithPreload';
import { ALLOW_FONT_SCALLING } from '../common/constants/constants';
import { formatEventDate } from '../common/utils/event.helper';
import { usePaddingTop } from '../hooks/usePaddingTop';
import { useUserProfile } from '../store/profile/profile.selector';
import BottomSheet from '@gorhom/bottom-sheet';
import { renderBackdrop } from '../components/BottomSheet';
import { useReducedMotion } from 'react-native-reanimated';
import { SvgXml } from 'react-native-svg';
import upsIcon from '../assets/svg/ups-icon';
import Paragraph from '../components/Paragraph';
import Button from '../components/Button';
import InlineLink from '../components/InlineLink';
import { useSwitchOrganizationMutation } from '../services/organization/organization.service';

const Event = ({ navigation, route }: any) => {
  const { t } = useTranslation('event');

  const theme = useTheme();
  const paddingTop = usePaddingTop();
  const { userProfile } = useUserProfile();
  const { eventId } = route.params;
  const { event } = useEvent();
  // get the current event's organization from the list of the user's organizations
  const currentEventOrganization = useMemo(
    () =>
      userProfile?.myOrganizations.find(
        //TODO: use the organization 'id' instead of 'name' when the backend returns it
        (organization) => organization.name === event?.organizationName,
      ),
    [userProfile, event],
  );
  const { setActiveOrganization } = useStore();
  const { mutate: switchOrganization } = useSwitchOrganizationMutation();

  // bottom sheet ref
  const bottomSheetRef = useRef<BottomSheet>(null);
  // bottom sheet snap points
  const snapPoints = useMemo(() => [1, 410], []);
  const reducedMotion = useReducedMotion();

  const { declineEvent, canceRsvp, joinEvent } = useStore();

  const { isFetching: isLoadingEvent, error: getEventError } = useEventQuery(eventId);

  const { mutate: setRsvpEvent, isLoading: isResponding } = useSetRsvpEventMutation();

  const { mutate: canceRsvpResponse, isLoading: isCancelingRsvp } = useCancelRsvpMutation();

  useEffect(() => {
    // if the event request failed go back and show toast
    if (getEventError) {
      navigation.goBack();
      Toast.show({
        type: 'error',
        text1: `${InternalErrors.EVENT_ERRORS.getError(
          (getEventError as any).response?.data.code_error,
        )}`,
      });
    }
  }, [getEventError, navigation]);

  const onRsvpReponsePress = (going: boolean) => {
    if (going && event?.attendanceType === AttendanceType.MENTION) {
      navigation.navigate('join-event', { eventId });
    } else {
      setRsvpEvent(
        {
          eventId,
          rsvp: {
            going,
          },
        },
        {
          onSuccess: going ? joinEvent : declineEvent,
          onError: (error: any) => {
            //if we don't have a volunteerProfileId for this organization -> open error bottom sheet that will redirect the user to the volunteer profile page
            if (userProfile && event) {
              if (!currentEventOrganization?.volunteerProfileId) {
                return bottomSheetRef.current?.expand();
              }
            }
            Toast.show({
              type: 'error',
              text1: `${InternalErrors.EVENT_ERRORS.getError(error.response?.data.code_error)}`,
            });
          },
        },
      );
    }
  };

  const onCancelRsvpResponse = () => {
    canceRsvpResponse(
      { eventId },
      {
        onSuccess: canceRsvp,
        onError: (error: any) =>
          Toast.show({
            type: 'error',
            text1: `${InternalErrors.EVENT_ERRORS.getError(error.response?.data.code_error)}`,
          }),
      },
    );
  };

  const mapNumberOfPersonsToHelper = () => {
    if (!event?.numberOfPersonsGoingToEvent && event?.numberOfPersonsGoingToEvent !== 0) {
      return '';
    } else if (event.numberOfPersonsGoingToEvent === 1) {
      return t('attending_one');
    } else if (event.numberOfPersonsGoingToEvent < 20) {
      return t('attending', { numberOfVolunteer: event.numberOfPersonsGoingToEvent });
    } else {
      return t('attending_of', { numberOfVolunteer: event.numberOfPersonsGoingToEvent });
    }
  };

  const onRedirectToVolunteerProfile = () => {
    //check if the organization for the current event is the active organization for the user
    if (userProfile && currentEventOrganization) {
      if (userProfile.activeOrganization?.id === currentEventOrganization.id) {
        //redirect to volunteer profile
        onCloseBottomSheet();
        navigation.navigate('volunteer-profile');
      } else {
        //switch the active organization for the user to the current event's organization and redirect to volunteer-profile
        onCloseBottomSheet();
        setActiveOrganization(currentEventOrganization!);
        switchOrganization({
          organizationId: currentEventOrganization.id,
        });
        navigation.navigate('volunteer-profile');
      }
    }
  };

  const onCloseBottomSheet = () => {
    bottomSheetRef.current?.close();
  };

  return (
    <>
      <PageLayout
        title={t('details')}
        headerStyle={{ paddingTop }}
        onBackButtonPress={navigation.goBack}
        actionsOptions={{
          loading: isLoadingEvent || isResponding || isCancelingRsvp,
          primaryActionLabel:
            event?.volunteerStatus !== EventVolunteerStatus.NO_RESPONSE
              ? `${t('rsvp.cancel')}`
              : `${t('rsvp.going')}`,
          onPrimaryActionButtonClick:
            event?.volunteerStatus !== EventVolunteerStatus.NO_RESPONSE
              ? onCancelRsvpResponse
              : onRsvpReponsePress.bind(null, true),
          primaryBtnType:
            event?.volunteerStatus !== EventVolunteerStatus.NO_RESPONSE
              ? ButtonType.DANGER
              : ButtonType.PRIMARY,
          ...(event?.volunteerStatus === EventVolunteerStatus.NO_RESPONSE && !isResponding
            ? {
                secondaryActionLink: `${t('rsvp.not_going')}`,
                onSecondaryActionButtonClick: onRsvpReponsePress.bind(null, false),
              }
            : {}),
          helperText: mapNumberOfPersonsToHelper(),
        }}
      >
        {isLoadingEvent && <EventSkeleton />}
        {event && !isLoadingEvent && (
          <FormLayout>
            {event.poster ? (
              <ImageWithPreload source={event.poster} styles={styles.image} />
            ) : (
              <View style={{ ...styles.image, backgroundColor: theme['cool-gray-100'] }}>
                <Icon
                  name="calendar"
                  style={{ ...styles.imagePlaceholder, color: theme['cool-gray-500'] }}
                />
              </View>
            )}
            <OrganizationIdentity
              uri={event.organizationLogo || ''}
              name={event.organizationName || ''}
            />
            <ReadOnlyElement
              label={t('date')}
              value={formatEventDate(event.startDate, event.endDate)}
            />
            <ReadOnlyElement label={t('name')} value={event.name} />
            <ReadOnlyElement label={t('target')} value={mapEventType(event)} />
            <ReadOnlyElement label={t('location')} value={event.location} />
            <ReadOnlyElement label={t('description')} value={event.description} />
            <View style={styles.container}>
              <Text allowFontScaling={ALLOW_FONT_SCALLING} category="c1" appearance="hint">{`${t(
                'tasks',
              )}`}</Text>
              <View style={styles.taskContainer}>
                {event.tasks.map((task) => (
                  <TaskPill key={task.id} label={task.name} />
                ))}
              </View>
            </View>
          </FormLayout>
        )}
      </PageLayout>
      {/* error bottom sheet -> displayed when the user tries to attend the event but doesn't have a volunteer profile for the event's organization */}
      <BottomSheet
        backdropComponent={renderBackdrop}
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        animateOnMount={reducedMotion ? false : true}
      >
        <View style={styles.bottomSheetContainer}>
          <SvgXml xml={upsIcon} height={100} width={100} />
          <View style={styles.textContainer}>
            <Text allowFontScaling={ALLOW_FONT_SCALLING} category="h1">
              {`${t('error_modal.title')}`}
            </Text>
            <Paragraph style={styles.bottomSheetParagraph}>
              {`${t('error_modal.description')}`}
            </Paragraph>
          </View>
          <View style={styles.buttonsContainer}>
            <Button
              label={`${t('error_modal.action_btn_label')}`}
              status={'primary'}
              onPress={onRedirectToVolunteerProfile}
            />
            <InlineLink
              label={t('general:back')}
              style={{ color: theme['cool-gray-700'] }}
              onPress={onCloseBottomSheet}
            />
          </View>
        </View>
      </BottomSheet>
    </>
  );
};

export default Event;

const styles = StyleSheet.create({
  image: {
    borderRadius: 16,
    width: '100%',
    aspectRatio: '16/9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    gap: 4,
  },
  taskContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  imagePlaceholder: { width: 48, height: 48 },
  bottomSheetContainer: {
    flex: 1,
    alignItems: 'center',
    gap: 24,
    paddingVertical: 24,
    paddingHorizontal: 20,
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
