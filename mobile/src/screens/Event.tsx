import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import * as Linking from 'expo-linking';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { useTranslation } from 'react-i18next';
import {
  useCancelRsvpMutation,
  useEventQuery,
  useSetRsvpEventMutation,
} from '../services/event/event.service';
import { useSwitchOrganizationMutation } from '../services/organization/organization.service';
import { InternalErrors } from '../common/errors/internal-errors.class';
import { EventVolunteerStatus } from '../common/enums/event-volunteer-status.enum';
import { EventRegistrationStatus } from '../common/enums/event-registration-status.enum';
import { mapEventType } from '../common/utils/helpers';
import { formatEventSpan, formatLongDay, formatShortDay } from '../common/utils/event-format';
import { colors, fonts, shadows, spacing } from '../common/theme/tokens';
import { useEvent } from '../store/event/event.selector';
import { useUserProfile } from '../store/profile/profile.selector';
import useStore from '../store/store';
import { useFocusedStatusBarStyle } from '../hooks/useFocusedStatusBarStyle';
import EventSkeleton from '../components/skeleton/event-skeleton';
import { Avatar, Badge, Enter, PressableScale, Sheet, VButton, VText } from '../components/ui';
import { EventIcon } from '../components/events/EventIcons';

const Fact = ({
  icon,
  title,
  subtitle,
  action,
  onAction,
  testID,
}: {
  icon: React.ComponentProps<typeof EventIcon>['name'];
  title: string;
  subtitle?: string;
  action?: string;
  onAction?: () => void;
  testID?: string;
}) => (
  <View style={styles.fact} testID={testID}>
    <EventIcon name={icon} size={24} />
    <View style={styles.factText}>
      <VText variant="h3" style={styles.factTitle}>
        {title}
      </VText>
      {(!!subtitle || !!action) && (
        <VText variant="sub">
          {subtitle}
          {!!subtitle && !!action ? ' · ' : ''}
          {!!action && (
            <VText variant="sub" color={colors.ink} style={styles.underline} onPress={onAction}>
              {action}
            </VText>
          )}
        </VText>
      )}
    </View>
  </View>
);

/**
 * VIC 2.0 event page (canvas "Evenimente" > detail): title, organizer, when, where (opens Maps),
 * places, who it is for, the volunteer's registration and the description. A bottom bar keeps
 * the date and "Particip" / "Anulează" in reach; joining shows a confirmation sheet, and #501
 * registrations that wait for the organization say so.
 */
const Event = ({ navigation, route }: any) => {
  const { t } = useTranslation('event');
  // Romanian: "1 loc", "5 locuri", but "20 de locuri"
  const capacityLabel = (places: number) => {
    if (places === 1) {
      return t('capacity_place');
    }
    const rest = places % 100;
    return t(rest === 0 || rest >= 20 ? 'capacity_places_de' : 'capacity_places', { places });
  };
  const insets = useSafeAreaInsets();
  useFocusedStatusBarStyle('dark');
  const { userProfile } = useUserProfile();
  const { eventId } = route.params;
  const { event } = useEvent();
  const { setActiveOrganization, declineEvent, canceRsvp, joinEvent } = useStore();
  const { mutate: switchOrganization } = useSwitchOrganizationMutation();
  const confirmRef = useRef<BottomSheetModal>(null);
  const profileRef = useRef<BottomSheetModal>(null);
  const [justJoined, setJustJoined] = useState(false);

  // the event's organization among the user's organizations
  const currentEventOrganization = useMemo(
    () =>
      userProfile?.myOrganizations.find(
        //TODO: use the organization 'id' instead of 'name' when the backend returns it
        (organization) => organization.name === event?.organizationName,
      ),
    [userProfile, event],
  );

  const {
    isFetching: isLoadingEvent,
    error: getEventError,
    refetch: refetchEvent,
  } = useEventQuery(eventId);
  const { mutate: setRsvpEvent, isLoading: isResponding } = useSetRsvpEventMutation();
  const { mutate: cancelRsvp, isLoading: isCancelingRsvp } = useCancelRsvpMutation();

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

  // after "Particip": the confirmation sheet once the registration status is known (#501)
  useEffect(() => {
    if (justJoined && !isLoadingEvent && event?.volunteerStatus === EventVolunteerStatus.JOINED) {
      setJustJoined(false);
      confirmRef.current?.present();
    }
  }, [justJoined, isLoadingEvent, event?.volunteerStatus]);

  const showRsvpError = (error: any) =>
    Toast.show({
      type: 'error',
      text1: `${InternalErrors.EVENT_ERRORS.getError(error?.response?.data?.code_error)}`,
    });

  // VIC 2.0 (#492): every event uses a simple registration (no mention)
  const onRsvp = (going: boolean) => {
    setRsvpEvent(
      { eventId, rsvp: { going } },
      {
        onSuccess: () => {
          if (going) {
            joinEvent();
            setJustJoined(true);
            // #501: get the registration's status (approved right away or waiting for the NGO)
            refetchEvent();
          } else {
            declineEvent();
          }
        },
        onError: (error: any) => {
          // no volunteer profile for this organization yet: offer to complete it
          if (userProfile && event && !currentEventOrganization?.volunteerProfileId) {
            profileRef.current?.present();
            return;
          }
          showRsvpError(error);
        },
      },
    );
  };

  const onCancelRsvp = () => {
    cancelRsvp({ eventId }, { onSuccess: canceRsvp, onError: showRsvpError });
  };

  const onCompleteProfile = () => {
    profileRef.current?.dismiss();
    if (userProfile && currentEventOrganization) {
      if (userProfile.activeOrganization?.id !== currentEventOrganization.id) {
        setActiveOrganization(currentEventOrganization);
        switchOrganization({ organizationId: currentEventOrganization.id });
      }
      navigation.navigate('volunteer-profile');
    }
  };

  const openInMaps = () => {
    if (!event?.location) {
      return;
    }
    const query = encodeURIComponent(event.location);
    const url = Platform.OS === 'ios' ? `maps://?q=${query}` : `geo:0,0?q=${query}`;
    Linking.openURL(url).catch(() =>
      Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`),
    );
  };

  const attendees = () => {
    const n = event?.numberOfPersonsGoingToEvent;
    if (n === undefined || n === null) {
      return '';
    }
    if (n === 1) {
      return `${t('attending_one')}`;
    }
    return `${t(n < 20 ? 'attending' : 'attending_of', { numberOfVolunteer: n })}`;
  };

  const joined = event?.volunteerStatus === EventVolunteerStatus.JOINED;
  const responded = event?.volunteerStatus !== EventVolunteerStatus.NO_RESPONSE;
  const finished = event?.displayStatus === 'finished';
  const registration = event?.registrationStatus;
  const registrationTone =
    registration === EventRegistrationStatus.APPROVED
      ? 'ok'
      : registration === EventRegistrationStatus.REJECTED
        ? 'no'
        : 'wait';
  const busy = isLoadingEvent || isResponding || isCancelingRsvp;

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 64, paddingBottom: insets.bottom + 120 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {isLoadingEvent && !event && <EventSkeleton />}
        {event && (
          <>
            <Enter>
              <VText variant="largeTitle" style={styles.title} accessibilityRole="header">
                {event.name}
              </VText>
              <VText variant="sub" style={styles.subtitle}>
                {[mapEventType(event), attendees()].filter(Boolean).join(' · ')}
              </VText>
            </Enter>

            {joined && registration && (
              <Enter index={1} style={styles.registration}>
                <Badge label={`${t(`registration.${registration}`)}`} tone={registrationTone} />
                {registration === EventRegistrationStatus.REJECTED && !!event.rejectionReason && (
                  <VText variant="sub">
                    {t('registration.reason', { reason: event.rejectionReason })}
                  </VText>
                )}
              </Enter>
            )}

            <Enter index={1} style={[styles.organizer, styles.hair]}>
              <Avatar
                name={event.organizationName || ''}
                uri={event.organizationLogo}
                size={48}
                shape="rounded"
              />
              <View style={styles.factText}>
                <VText variant="h3" style={styles.factTitle}>
                  {t('organized_by', { name: event.organizationName })}
                </VText>
              </View>
            </Enter>

            <Enter index={2}>
              <View style={styles.hair}>
                <Fact
                  icon="calendar"
                  title={formatLongDay(event.startDate)}
                  subtitle={formatEventSpan(event.startDate, event.endDate)}
                  testID="event-when"
                />
              </View>
              {!!event.location && (
                <View style={styles.hair}>
                  <Fact
                    icon="pin"
                    title={event.location}
                    action={`${t('open_in_maps')}`}
                    onAction={openInMaps}
                  />
                </View>
              )}
              <View style={styles.hair}>
                <Fact
                  icon="people"
                  title={
                    event.capacity
                      ? `${capacityLabel(event.capacity)}`
                      : `${t('capacity_unlimited')}`
                  }
                  subtitle={`${t('capacity')}`}
                />
              </View>
              {!event.isPublic && (
                <View style={styles.hair}>
                  <Fact icon="target" title={mapEventType(event)} subtitle={`${t('target')}`} />
                </View>
              )}
            </Enter>

            {!!event.description && (
              <Enter index={3} style={styles.about}>
                <VText variant="h2">{t('about')}</VText>
                <VText variant="body" style={styles.description}>
                  {event.description}
                </VText>
              </Enter>
            )}
          </>
        )}
      </ScrollView>

      <PressableScale
        onPress={navigation.goBack}
        accessibilityLabel={`${t('general:back')}`}
        style={[styles.back, shadows.back, { top: insets.top + 12 }]}
        testID="event-back"
      >
        <EventIcon name="back" size={20} />
      </PressableScale>

      {event && !finished && (
        <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 16) + 8 }]}>
          <View style={styles.barText}>
            <VText variant="h3" style={styles.factTitle}>
              {formatShortDay(event.startDate)}
            </VText>
            <VText variant="cap" numberOfLines={1}>
              {joined && registration ? `${t(`registration.${registration}`)}` : attendees()}
            </VText>
          </View>
          {responded ? (
            <VButton
              variant="outline"
              label={`${t('rsvp.cancel')}`}
              onPress={onCancelRsvp}
              loading={busy}
              testID="event-cancel"
            />
          ) : (
            <View style={styles.barActions}>
              <Pressable
                onPress={() => onRsvp(false)}
                hitSlop={8}
                disabled={busy}
                testID="event-not-going"
              >
                <VText variant="label" style={styles.underline}>
                  {t('rsvp.not_going')}
                </VText>
              </Pressable>
              <VButton
                label={`${t('rsvp.going')}`}
                onPress={() => onRsvp(true)}
                loading={busy}
                style={styles.going}
                testID="event-going"
              />
            </View>
          )}
        </View>
      )}

      <Sheet ref={confirmRef} testID="event-confirm">
        <View style={styles.confirmIcon}>
          <EventIcon name="check" size={30} color={colors.status.ok.fg} strokeWidth={2.6} />
        </View>
        <VText variant="largeTitle" style={styles.confirmTitle}>
          {registration === EventRegistrationStatus.PENDING
            ? t('confirm.pending_title')
            : t('confirm.title')}
        </VText>
        <VText variant="sub">
          {registration === EventRegistrationStatus.PENDING
            ? t('confirm.pending_description')
            : t('confirm.description')}
        </VText>
        <VButton
          variant="soft"
          label={`${t('confirm.done')}`}
          onPress={() => confirmRef.current?.dismiss()}
        />
      </Sheet>

      <Sheet
        ref={profileRef}
        title={`${t('error_modal.title')}`}
        subtitle={`${t('error_modal.description')}`}
        testID="event-profile-missing"
      >
        <VButton label={`${t('error_modal.action_btn_label')}`} onPress={onCompleteProfile} />
        <VButton
          variant="soft"
          label={`${t('general:back')}`}
          onPress={() => profileRef.current?.dismiss()}
        />
      </Sheet>
    </View>
  );
};

export default Event;

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.white },
  content: { paddingHorizontal: spacing.gutter },
  back: {
    position: 'absolute',
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 28, lineHeight: 34 },
  subtitle: { marginTop: 6 },
  registration: { marginTop: 14, gap: 6 },
  organizer: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 20 },
  hair: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line },
  fact: { flexDirection: 'row', alignItems: 'flex-start', gap: 14, paddingVertical: 18 },
  factText: { flex: 1, gap: 2 },
  factTitle: { fontSize: 15 },
  underline: { textDecorationLine: 'underline', fontFamily: fonts.bold },
  about: { paddingVertical: 20, gap: 10 },
  description: { lineHeight: 23 },
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.line,
    paddingTop: 12,
    paddingHorizontal: spacing.gutter,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  barText: { flex: 1 },
  barActions: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  going: { paddingHorizontal: 28 },
  confirmIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.status.ok.bg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  confirmTitle: { fontSize: 26 },
});
