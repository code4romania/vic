import React, { ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { Platform, Pressable, ScrollView, Text, useWindowDimensions, View } from 'react-native';
import * as Linking from 'expo-linking';
import Animated, { FadeIn, FadeInDown, useReducedMotion } from 'react-native-reanimated';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native-unistyles';
import Toast from 'react-native-toast-message';
import { useTranslation } from 'react-i18next';
import {
  useCancelRsvpMutation,
  useEventQuery,
  useSetRsvpEventMutation,
} from '../services/event/event.service';
import { useActivateOrganization } from '../services/organization/organization.service';
import {
  findEventOrganization,
  isProfileIncompleteError,
  rsvpErrorMessage,
} from '../common/utils/event-rsvp-error';
import { romanianNeedsDe } from '../common/utils/plural';
import { EventVolunteerStatus } from '../common/enums/event-volunteer-status.enum';
import { EventRegistrationStatus } from '../common/enums/event-registration-status.enum';
import { mapEventType } from '../common/utils/helpers';
import { formatEventSpan, formatEventWhen, formatLongDay } from '../common/utils/event-format';
import { useEvent } from '../store/event/event.selector';
import { useUserProfile } from '../store/profile/profile.selector';
import useStore from '../store/store';
import { useFocusedStatusBarStyle } from '../hooks/useFocusedStatusBarStyle';
import EventSkeleton from '../components/skeleton/event-skeleton';
import MissingEntity from './MissingEntity';
import { TAB_ROUTES } from '../routes/tab-routes';
import { Sheet, StatusBarScrim } from '../components/ui';
import { GlassSurface } from '../components/navigation/GlassTabBar';
import { DateBlock } from '../components/events/EventCard';
import ParticipantAvatars from '../components/events/ParticipantAvatars';
import { AppText, Button, HexAvatar, StatusChip, statusKind } from '../design/components';
import {
  CalendarIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  GlobeIcon,
  ICON_STROKE,
  LockIcon,
  LucideIcon,
  PinIcon,
  UsersIcon,
} from '../design/icons';
import { elevation, fontScaleCap, palette, tabBar } from '../design/tokens';
import { duration, enter, spring } from '../design/motion';
import { haptics } from '../design/haptics';

/**
 * The hero enters like the handbook's .dhero: date block, then the title 60 ms later, then the
 * chips at 110 ms (gentle spring, 16pt lift); Reduce Motion fades.
 */
const heroEnter = (delay: number, reduced: boolean) =>
  reduced
    ? FadeIn.duration(duration.reduced)
    : FadeInDown.withInitialValues({ opacity: 0, transform: [{ translateY: 16 }] })
        .springify()
        .stiffness(spring.gentle.stiffness)
        .damping(spring.gentle.damping)
        .delay(delay);

/** A fact on a white card: a yellow 44pt icon tile, a bold line and a caption. */
const InfoRow = ({
  icon: Icon,
  leading,
  title,
  caption,
  captionUnderline,
  captionFirst,
  chevron,
  trailing,
  below,
  onPress,
  accessibilityLabel,
  testID,
}: {
  icon?: LucideIcon;
  /** replaces the icon tile (the organization's hexagon) */
  leading?: ReactNode;
  title: string;
  caption?: string;
  /** the caption is the row's action ("Deschide în Hărți") */
  captionUnderline?: boolean;
  /** the caption reads first ("Organizat de" above the organization) */
  captionFirst?: boolean;
  /** a chevron at the end: the row opens a page */
  chevron?: boolean;
  /** at the end of the row (the participants' faces) */
  trailing?: ReactNode;
  /** under the caption, inside the text column (the faces at large text sizes) */
  below?: ReactNode;
  onPress?: () => void;
  accessibilityLabel?: string;
  testID?: string;
}) => {
  const content = (
    <>
      {leading ??
        (Icon ? (
          <View style={styles.iconTile}>
            <Icon size={22} color={palette.navy} strokeWidth={ICON_STROKE} />
          </View>
        ) : null)}
      <View style={[styles.infoText, captionFirst ? styles.infoTextReversed : null]}>
        <AppText variant="bodyStrong" style={styles.infoTitle}>
          {title}
        </AppText>
        {!!caption && (
          <AppText
            variant="caption"
            color={captionUnderline ? palette.ink : palette.ink2}
            style={captionUnderline ? styles.underline : styles.infoCaption}
          >
            {caption}
          </AppText>
        )}
        {below ? <View style={styles.infoBelow}>{below}</View> : null}
      </View>
      {trailing}
      {chevron && <ChevronRightIcon size={18} color={palette.navy} strokeWidth={ICON_STROKE} />}
    </>
  );
  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        style={({ pressed }) => [styles.info, pressed ? styles.infoPressed : null]}
        testID={testID}
      >
        {content}
      </Pressable>
    );
  }
  return (
    <View
      style={styles.info}
      accessible={!!accessibilityLabel}
      accessibilityLabel={accessibilityLabel}
      testID={testID}
    >
      {content}
    </View>
  );
};

/**
 * Event page „Îndrăzneț”: a navy hero flush to the top (glass back button, the big date block,
 * the title and chips entering one after the other), the facts on white cards (organizer, when,
 * where (opens Maps), places, who it is for), the description, and a floating glass bar with the
 * volunteer's status and "Particip" / "Retrage răspuns". Joining shows a confirmation sheet, and
 * #501 registrations that wait for the organization say so.
 */
const Event = ({ navigation, route }: any) => {
  const { t } = useTranslation('event');
  // Romanian: "1 loc", "5 locuri", but "20 de locuri"
  const capacityLabel = (places: number) => {
    if (places === 1) {
      return t('capacity_place');
    }
    return t(romanianNeedsDe(places) ? 'capacity_places_de' : 'capacity_places', { places });
  };
  const insets = useSafeAreaInsets();
  const reduced = useReducedMotion();
  // at large text sizes the action bar stacks: status above, buttons below (nothing is cut)
  const { fontScale } = useWindowDimensions();
  const stackedBar = fontScale >= 1.25;
  // light text over the navy hero
  useFocusedStatusBarStyle('light');
  const { userProfile } = useUserProfile();
  const { eventId } = route.params;
  const { event: storedEvent } = useEvent();
  // the store keeps the last event opened: never show another event while this one loads
  const event = storedEvent?.id === eventId ? storedEvent : undefined;
  const { declineEvent, canceRsvp, joinEvent } = useStore();
  const { activate } = useActivateOrganization();
  const confirmRef = useRef<BottomSheetModal>(null);
  const profileRef = useRef<BottomSheetModal>(null);
  const [justJoined, setJustJoined] = useState(false);

  // the event's organization among the user's organizations
  const currentEventOrganization = useMemo(
    () => findEventOrganization(userProfile?.myOrganizations, event),
    [userProfile, event],
  );

  const {
    isFetching: isLoadingEvent,
    error: getEventError,
    refetch: refetchEvent,
  } = useEventQuery(eventId);
  const { mutate: setRsvpEvent, isLoading: isResponding } = useSetRsvpEventMutation();
  const { mutate: cancelRsvp, isLoading: isCancelingRsvp } = useCancelRsvpMutation();

  // deleted (or no longer visible): this can be the first screen, opened from a push
  const eventGone = [403, 404].includes((getEventError as any)?.response?.status);

  // after "Particip": the confirmation sheet once the registration status is known (#501)
  useEffect(() => {
    if (justJoined && !isLoadingEvent && event?.volunteerStatus === EventVolunteerStatus.JOINED) {
      setJustJoined(false);
      haptics.success();
      confirmRef.current?.present();
    }
  }, [justJoined, isLoadingEvent, event?.volunteerStatus]);

  const showRsvpError = (error: any) => {
    haptics.error();
    Toast.show({ type: 'error', text1: rsvpErrorMessage(error) });
  };

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
          if (isProfileIncompleteError(error) && currentEventOrganization) {
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

  const onCompleteProfile = async () => {
    profileRef.current?.dismiss();
    if (!currentEventOrganization) {
      return;
    }
    try {
      // the volunteer profile belongs to the active organization: switch first, then open it
      await activate(currentEventOrganization);
    } catch (error) {
      showRsvpError(error);
      return;
    }
    navigation.navigate('volunteer-profile');
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

  // the faces' spoken label: „18 persoane participă” (no exclamation, no names)
  const participantsLabel = (n: number) => {
    if (n === 1) {
      return `${t('participants_label_one')}`;
    }
    return `${t(romanianNeedsDe(n) ? 'participants_label_of' : 'participants_label', { n })}`;
  };

  const attendees = () => {
    const n = event?.numberOfPersonsGoingToEvent;
    if (n === undefined || n === null) {
      return '';
    }
    if (n === 1) {
      return `${t('attending_one')}`;
    }
    return `${t(romanianNeedsDe(n) ? 'attending_of' : 'attending', { numberOfVolunteer: n })}`;
  };

  const joined = event?.volunteerStatus === EventVolunteerStatus.JOINED;
  const responded = event?.volunteerStatus !== EventVolunteerStatus.NO_RESPONSE;
  const finished = event?.displayStatus === 'finished';
  const registration = event?.registrationStatus;
  const busy = isLoadingEvent || isResponding || isCancelingRsvp;

  // the bar floats where the tab bar sits on the tab screens
  const barBottom = insets.bottom > 0 ? tabBar.bottom : 16;
  // the bar's own height (it grows with Dynamic Type and stacks at large sizes)
  const [barHeight, setBarHeight] = useState(64);
  const barSpace = event && !finished ? barBottom + barHeight + 24 : insets.bottom + 24;

  if (!event && !isLoadingEvent && getEventError) {
    return eventGone ? (
      <MissingEntity
        heading={`${t('not_found.title')}`}
        paragraph={`${t('not_found.description')}`}
        actionBtnLabel={`${t('not_found.action')}`}
        onActionBtnPress={() => navigation.navigate(TAB_ROUTES.EVENTS)}
        onBackButtonPress={navigation.canGoBack() ? navigation.goBack : undefined}
      />
    ) : (
      <MissingEntity
        kind="error"
        heading={`${t('general:error.load_entries')}`}
        paragraph=""
        actionBtnLabel={`${t('events:retry')}`}
        onActionBtnPress={() => refetchEvent()}
        onBackButtonPress={navigation.canGoBack() ? navigation.goBack : undefined}
      />
    );
  }

  // beside the facts there is room for three faces; under them (large text), for all five
  const participantFaces = event?.participants?.total ? (
    <ParticipantAvatars
      participants={event.participants}
      max={stackedBar ? 5 : 3}
      accessibilityLabel={participantsLabel(event.participants.total)}
    />
  ) : null;

  const barStatus = !responded
    ? event?.isPublic
      ? t('bar.open')
      : t('bar.members')
    : joined
      ? registration
        ? t(`registration.${registration}`)
        : t('bar.going')
      : t('bar.not_going');

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: barSpace }}
        showsVerticalScrollIndicator={false}
        testID="event-scroll"
      >
        <View style={[styles.hero, { paddingTop: insets.top + 8 }]}>
          <Pressable
            onPress={navigation.goBack}
            accessibilityRole="button"
            accessibilityLabel={`${t('general:back')}`}
            hitSlop={4}
            style={({ pressed }) => [styles.back, pressed ? styles.backPressed : null]}
            testID="event-back"
          >
            <ChevronLeftIcon size={22} color={palette.white} strokeWidth={ICON_STROKE + 0.4} />
          </Pressable>
          {event && (
            <>
              <View style={styles.heroRow}>
                <Animated.View entering={heroEnter(0, reduced)}>
                  <DateBlock date={event.startDate} tone="yellow" size="hero" />
                </Animated.View>
                <Animated.View entering={heroEnter(60, reduced)} style={styles.heroTitle}>
                  <Text
                    accessibilityRole="header"
                    maxFontSizeMultiplier={fontScaleCap.display}
                    style={styles.title}
                  >
                    {event.name}
                  </Text>
                </Animated.View>
              </View>
              <Animated.View entering={heroEnter(110, reduced)} style={styles.heroChips}>
                {event.isPublic ? (
                  <StatusChip
                    kind="glass"
                    label={`${t('type.public')}`}
                    icon={<GlobeIcon size={14} color={palette.white} />}
                  />
                ) : (
                  <StatusChip
                    kind="glass"
                    label={`${t('bar.members')}`}
                    icon={<LockIcon size={14} color={palette.white} />}
                  />
                )}
                {finished && <StatusChip kind="exp" label={`${t('events:card.finished')}`} />}
                {!finished && joined && registration && (
                  <StatusChip
                    kind={statusKind(registration)}
                    label={`${t(`registration.${registration}`)}`}
                  />
                )}
                {!finished && joined && !registration && (
                  <StatusChip kind="ok" label={`${t('events:card.going')}`} />
                )}
              </Animated.View>
              {joined &&
                registration === EventRegistrationStatus.REJECTED &&
                !!event.rejectionReason && (
                  <Animated.View entering={heroEnter(150, reduced)}>
                    <AppText variant="caption" color="rgba(255,255,255,0.8)" style={styles.reason}>
                      {t('registration.reason', { reason: event.rejectionReason })}
                    </AppText>
                  </Animated.View>
                )}
            </>
          )}
        </View>

        {isLoadingEvent && !event && (
          <View style={styles.skeleton}>
            <EventSkeleton />
          </View>
        )}

        {event && (
          <View style={styles.cards}>
            <Animated.View entering={enter(3, reduced)} style={styles.card}>
              <InfoRow
                leading={<HexAvatar name={event.organizationName || ''} />}
                title={event.organizationName || ''}
                caption={`${t('organized_by_caption')}`}
                captionFirst
                chevron={!!event.organizationId}
                onPress={
                  event.organizationId
                    ? () =>
                        navigation.navigate('organization-profile', {
                          organizationId: event.organizationId,
                        })
                    : undefined
                }
                accessibilityLabel={`${t('organized_by', { name: event.organizationName })}`}
                testID="event-organizer"
              />
            </Animated.View>

            <Animated.View entering={enter(4, reduced)} style={styles.card}>
              <InfoRow
                icon={CalendarIcon}
                title={formatLongDay(event.startDate)}
                caption={formatEventSpan(event.startDate, event.endDate)}
                testID="event-when"
              />
              {!!event.location && (
                <>
                  <View style={styles.line} />
                  <InfoRow
                    icon={PinIcon}
                    title={event.location}
                    caption={`${t('open_in_maps')}`}
                    captionUnderline
                    onPress={openInMaps}
                    accessibilityLabel={`${event.location}, ${t('open_in_maps')}`}
                    testID="event-where"
                  />
                </>
              )}
              <View style={styles.line} />
              <InfoRow
                icon={UsersIcon}
                title={
                  event.capacity ? `${capacityLabel(event.capacity)}` : `${t('capacity_unlimited')}`
                }
                caption={attendees() || `${t('capacity')}`}
                // large text: the faces go under the caption so the title and caption keep the width
                trailing={stackedBar ? undefined : participantFaces}
                below={stackedBar ? participantFaces : undefined}
                testID="event-capacity"
              />
              {!event.isPublic && (
                <>
                  <View style={styles.line} />
                  <InfoRow icon={LockIcon} title={mapEventType(event)} caption={`${t('target')}`} />
                </>
              )}
            </Animated.View>

            {!!event.description && (
              <Animated.View entering={enter(5, reduced)} style={[styles.card, styles.about]}>
                <AppText variant="title" accessibilityRole="header" style={styles.aboutTitle}>
                  {t('about')}
                </AppText>
                <AppText variant="body" color={palette.ink2}>
                  {event.description}
                </AppText>
              </Animated.View>
            )}
          </View>
        )}
      </ScrollView>
      {/* the content scrolls under the clock otherwise; navy, like the hero it continues */}
      <StatusBarScrim color={palette.navy} />

      {event && !finished && (
        <Animated.View
          entering={enter(4, reduced)}
          style={[styles.bar, stackedBar ? styles.barStacked : null, { bottom: barBottom }]}
          onLayout={(e) => setBarHeight(Math.round(e.nativeEvent.layout.height))}
          testID="event-bar"
        >
          <GlassSurface radius={30} />
          <View style={[styles.barText, stackedBar ? styles.barTextStacked : null]}>
            <AppText variant="headline" numberOfLines={2} style={styles.barStatus}>
              {barStatus}
            </AppText>
            <AppText variant="caption" color={palette.ink2} numberOfLines={2} style={styles.barSub}>
              {formatEventWhen(event.startDate, event.endDate)}
            </AppText>
          </View>
          {responded ? (
            <Button
              variant="outline"
              size="M"
              label={`${t('rsvp.cancel')}`}
              onPress={onCancelRsvp}
              loading={busy}
              testID="event-cancel"
            />
          ) : (
            <View style={styles.barActions}>
              <Pressable
                onPress={() => onRsvp(false)}
                hitSlop={12}
                disabled={busy}
                accessibilityRole="button"
                testID="event-not-going"
              >
                <AppText variant="bodyStrong" style={styles.underline}>
                  {t('rsvp.not_going')}
                </AppText>
              </Pressable>
              <Button
                size="M"
                label={`${t('rsvp.going')}`}
                onPress={() => onRsvp(true)}
                loading={busy}
                testID="event-going"
              />
            </View>
          )}
        </Animated.View>
      )}

      <Sheet ref={confirmRef} testID="event-confirm">
        <View style={styles.confirmIcon}>
          <CheckIcon size={30} color={palette.white} strokeWidth={3} />
        </View>
        <AppText variant="title" style={styles.confirmTitle}>
          {registration === EventRegistrationStatus.PENDING
            ? t('confirm.pending_title')
            : t('confirm.title')}
        </AppText>
        <AppText variant="body" color={palette.ink2}>
          {registration === EventRegistrationStatus.PENDING
            ? t('confirm.pending_description')
            : t('confirm.description')}
        </AppText>
        <Button
          variant="secondary"
          full
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
        <Button
          full
          label={`${t('error_modal.action_btn_label')}`}
          onPress={onCompleteProfile}
          testID="event-complete-profile"
        />
        <Button
          variant="outline"
          full
          label={`${t('general:back')}`}
          onPress={() => profileRef.current?.dismiss()}
        />
      </Sheet>
    </View>
  );
};

export default Event;

const styles = StyleSheet.create((theme) => ({
  screen: { flex: 1, backgroundColor: theme.colors.paper },
  hero: {
    backgroundColor: theme.colors.navy,
    paddingHorizontal: theme.space.gutter,
    paddingBottom: 22,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  back: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backPressed: { backgroundColor: 'rgba(255,255,255,0.24)' },
  heroRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 14, marginTop: 18 },
  heroTitle: { flex: 1, minWidth: 0 },
  // handbook: Bricolage 38, line-height .96, -0.035em
  title: {
    fontFamily: theme.fontFamily.display,
    fontSize: 38,
    lineHeight: 37,
    letterSpacing: -1.33,
    color: theme.colors.white,
    includeFontPadding: false,
  },
  heroChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 14 },
  reason: { marginTop: 8 },
  skeleton: { paddingHorizontal: theme.space.gutter, paddingTop: 16 },
  cards: { paddingHorizontal: theme.space.gutter, paddingTop: 14, gap: 10 },
  card: { backgroundColor: theme.colors.card, borderRadius: theme.radius.card, overflow: 'hidden' },
  // handbook: a full-width 1px line between the facts of a card
  line: { height: 1, backgroundColor: theme.colors.line },
  info: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, minHeight: 72 },
  infoPressed: { backgroundColor: theme.colors.paper },
  iconTile: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: theme.colors.yellow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoText: { flex: 1, minWidth: 0, gap: 1 },
  infoTextReversed: { flexDirection: 'column-reverse' },
  infoBelow: { marginTop: 8, alignSelf: 'flex-start' },
  infoTitle: { fontFamily: theme.fontFamily.textHeavy, fontSize: 15.5, lineHeight: 21 },
  infoCaption: { fontFamily: theme.fontFamily.text },
  underline: { textDecorationLine: 'underline', fontFamily: theme.fontFamily.textBold },
  about: { padding: 16, gap: 6 },
  aboutTitle: { fontSize: 20, lineHeight: 24 },
  bar: {
    position: 'absolute',
    left: 12,
    right: 12,
    borderRadius: 30,
    paddingVertical: 10,
    paddingLeft: 18,
    paddingRight: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    ...elevation.float,
  },
  barStacked: { flexDirection: 'column', alignItems: 'stretch', paddingRight: 18, paddingTop: 14 },
  barText: { flex: 1, minWidth: 0 },
  barTextStacked: { flex: 0 },
  barStatus: { fontSize: 15 },
  // handbook .dbar .ss: 12.5 / 600
  barSub: { fontSize: 12.5, lineHeight: 17 },
  barActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 14,
  },
  confirmIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.green,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  confirmTitle: { fontSize: 26, lineHeight: 30 },
}));
