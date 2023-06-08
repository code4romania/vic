import React, { useEffect } from 'react';
import PageLayout from '../layouts/PageLayout';
import { Text } from '@ui-kitten/components';
import i18n from '../common/config/i18n';
import { Image, StyleSheet } from 'react-native';
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
import LoadingScreen from '../components/LoadingScreen';
import Toast from 'react-native-toast-message';
import { InternalErrors } from '../common/errors/internal-errors.class';
import { useTranslation } from 'react-i18next';
import { EventVolunteerStatus } from '../common/enums/event-volunteer-status.enum';
import { ButtonType } from '../common/enums/button-type.enum';
import { useEvent } from '../store/event/event.selector';
import useStore from '../store/store';

const Event = ({ navigation, route }: any) => {
  console.log('Event');
  const { t } = useTranslation('event');

  const { eventId } = route.params;

  const { event } = useEvent();

  const { declineEvent, canceRsvp } = useStore();

  const { isLoading: isLoadingEvent, error } = useEventQuery(eventId);

  const { mutate: setRsvpEvent, isLoading: isNotAttendingLoading } = useSetRsvpEventMutation();

  const { mutate: canceRsvpResponse, isLoading: isCancelingRsvp } = useCancelRsvpMutation();

  useEffect(() => {
    // if the event request failed go back and show toast
    if (error) {
      navigation.goBack();
      Toast.show({
        type: 'error',
        text1: `${InternalErrors.EVENT_ERRORS.getError((error as any).response?.data.code_error)}`,
      });
    }
  }, [error, navigation]);

  const onJoinEventButtonPress = () => {
    navigation.navigate('join-event', { eventId });
  };

  const onNotAttendBtnPress = () => {
    setRsvpEvent(
      {
        eventId,
        rsvp: {
          going: false,
        },
      },
      { onSuccess: declineEvent },
    );
  };

  const onCancelRsvpResponse = () => {
    canceRsvpResponse({ eventId }, { onSuccess: canceRsvp });
  };

  return (
    <PageLayout
      title={i18n.t('event:details')}
      onBackButtonPress={navigation.goBack}
      actionsOptions={{
        loading: isLoadingEvent || isNotAttendingLoading || isCancelingRsvp,
        primaryActionLabel:
          event?.volunteerStatus !== EventVolunteerStatus.NO_RESPONSE
            ? `${t('rsvp.cancel')}`
            : `${t('rsvp.going')}`,
        onPrimaryActionButtonClick:
          event?.volunteerStatus !== EventVolunteerStatus.NO_RESPONSE
            ? onCancelRsvpResponse
            : onJoinEventButtonPress,
        primaryBtnType:
          event?.volunteerStatus !== EventVolunteerStatus.NO_RESPONSE
            ? ButtonType.DANGER
            : ButtonType.PRIMARY,
        ...(event?.volunteerStatus === EventVolunteerStatus.NO_RESPONSE
          ? {
              secondaryActionLabel: `${t('rsvp.not_going')}`,
              onSecondaryActionButtonClick: onNotAttendBtnPress,
            }
          : {}),
        helperText: `${t('attending', { numberOfVolunteer: event?.numberOfPersonsGoingToEvent })}`,
      }}
    >
      {isLoadingEvent && <LoadingScreen />}
      {event && (
        <FormLayout>
          <Image source={{ uri: event.image }} style={styles.image} resizeMode="cover" />
          <OrganizationIdentity
            uri={event.organizationLogo || ''}
            name={event.organizationName || ''}
          />
          <ReadOnlyElement label={i18n.t('event:date')} value={event.eventInterval} />
          <ReadOnlyElement label={i18n.t('event:name')} value={event.name} />
          <ReadOnlyElement label={i18n.t('event:target')} value={mapEventType(event)} />
          <ReadOnlyElement label={i18n.t('event:location')} value={event.location} />
          <ReadOnlyElement label={i18n.t('event:description')} value={event.description} />
          <View style={styles.container}>
            <Text category="c1" appearance="hint">{`${i18n.t('event:tasks')}`}</Text>
            <View style={styles.taskContainer}>
              {event.tasks.map((task) => (
                <TaskPill key={task.id} label={task.name} />
              ))}
            </View>
          </View>
        </FormLayout>
      )}
    </PageLayout>
  );
};

export default Event;

const styles = StyleSheet.create({
  image: {
    borderRadius: 16,
    width: '100%',
    aspectRatio: '16/9',
  },
  container: {
    gap: 4,
  },
  taskContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
});
