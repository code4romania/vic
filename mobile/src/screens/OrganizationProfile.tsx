import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedReaction,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
} from 'react-native-reanimated';
import * as Linking from 'expo-linking';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { useTranslation } from 'react-i18next';
import {
  useOrganizationQuery,
  useRejoinOrganizationMutation,
} from '../services/organization/organization.service';
import { useCancelAccessRequestMutation } from '../services/access-request/access-request.service';
import { OrganizatinVolunteerStatus } from '../common/enums/organization-volunteer-status.enum';
import { InternalErrors } from '../common/errors/internal-errors.class';
import { datePickerService } from '../common/utils/birthday';
import { colors, fonts, radius, shadows, spacing, StatusTone } from '../common/theme/tokens';
import { useOrganization } from '../store/organization/organization.selector';
import { useUserProfile } from '../store/profile/profile.selector';
import { useFocusedStatusBarStyle } from '../hooks/useFocusedStatusBarStyle';
import { MAX_FONT_SCALE } from '../common/constants/constants';
import { TAB_ROUTES } from '../routes/tab-routes';
import OrganizationSkeleton from '../components/skeleton/organization-skeleton';
import { EventCard } from '../components/events/EventCard';
import { EventIcon } from '../components/events/EventIcons';
import {
  Avatar,
  Enter,
  Group,
  ListRow,
  PressableScale,
  Sheet,
  VButton,
  VText,
} from '../components/ui';

type Banner = { tone: StatusTone; text: string };

/**
 * VIC 2.0 organization page (canvas board "Organizație"): navy header with the logo, the name and
 * how many volunteers it has, the description, contact details and open events. The bottom bar
 * follows the volunteer's status: "Am un cod" + "Vreau să ajut", a pending request that can be
 * withdrawn, a member who can see the events, or a former volunteer who can ask to rejoin.
 */
const OrganizationProfile = ({ navigation, route }: any) => {
  const { t } = useTranslation('organization_profile');
  const insets = useSafeAreaInsets();
  useFocusedStatusBarStyle('light');
  const { userProfile } = useUserProfile();
  const { organization } = useOrganization();
  const heroHeight = insets.top + 160;
  const barHeight = insets.top + 56;
  const scrollY = useSharedValue(0);
  const titleBottom = useSharedValue(0);
  const titleHeight = useSharedValue(0);
  const [compactAccessible, setCompactAccessible] = useState(false);
  const onScroll = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });
  const compactOpacity = useDerivedValue(() =>
    // Fade from the title's top reaching the bar bottom to its bottom passing under it.
    // Scroll range: [titleBottom - barHeight - titleHeight, titleBottom - barHeight].
    titleHeight.value > 0
      ? interpolate(
          scrollY.value,
          [titleBottom.value - barHeight - titleHeight.value, titleBottom.value - barHeight],
          [0, 1],
          Extrapolation.CLAMP,
        )
      : 0,
  );
  const compactStyle = useAnimatedStyle(() => ({ opacity: compactOpacity.value }));
  useAnimatedReaction(
    () => compactOpacity.value > 0.5,
    (visible, previous) => {
      if (visible !== previous) {
        runOnJS(setCompactAccessible)(visible);
      }
    },
  );
  const barStyle = useAnimatedStyle(() => {
    const threshold = heroHeight - barHeight;
    const progress = interpolate(
      scrollY.value,
      [threshold, threshold + 16],
      [0, 1],
      Extrapolation.CLAMP,
    );
    return {
      borderBottomLeftRadius: radius.sheet * progress,
      borderBottomRightRadius: radius.sheet * progress,
      shadowOpacity: Number(shadows.card.shadowOpacity ?? 0) * progress,
      elevation: (shadows.card.elevation ?? 0) * progress,
    };
  });
  const birthdaySheet = useRef<BottomSheetModal>(null);
  const cancelSheet = useRef<BottomSheetModal>(null);

  const { isFetching: isFetchingOrganization, error: getOrganizationError } = useOrganizationQuery(
    route.params.organizationId,
  );
  const { isLoading: isCancelingAccessRequest, mutate: cancelAccessRequest } =
    useCancelAccessRequestMutation();
  const { isLoading: isRejoiningOrganization, mutate: rejoinOrganization } =
    useRejoinOrganizationMutation();

  useEffect(() => {
    if (getOrganizationError) {
      Toast.show({
        type: 'error',
        text1: `${InternalErrors.ORGANIZATION_ERRORS.getError(
          (getOrganizationError as any).response?.data.code_error,
        )}`,
      });
      navigation.goBack();
    }
  }, [getOrganizationError, navigation]);

  const status = organization?.organizationVolunteerStatus;
  const loaded = !!organization && organization.id === route.params.organizationId;
  const busy = isFetchingOrganization || isCancelingAccessRequest || isRejoiningOrganization;

  // a volunteer needs a date of birth to join (VIC 2.0, no ID card data)
  const goJoin = (screen: 'join-organization' | 'join-by-access-code') => {
    if (!userProfile?.birthday) {
      birthdaySheet.current?.present();
      return;
    }
    navigation.navigate(screen, {
      organizationId: organization?.id,
      logo: organization?.logo,
      name: organization?.name,
    });
  };

  const onCancelAccessRequest = () => {
    cancelSheet.current?.dismiss();
    if (organization) {
      cancelAccessRequest(
        { organizationId: organization.id },
        {
          onError: (error: any) =>
            Toast.show({
              type: 'error',
              text1: `${InternalErrors.ACCESS_CODE_ERRORS.getError(
                error.response?.data.code_error,
              )}`,
            }),
        },
      );
    }
  };

  const onRejoin = () => {
    if (organization) {
      rejoinOrganization(
        { volunteerId: organization.volunteer.id },
        {
          onSuccess: () => Toast.show({ type: 'success', text1: `${t('rejoin_requested')}` }),
          onError: (error: any) =>
            Toast.show({
              type: 'error',
              text1: `${InternalErrors.ORGANIZATION_ERRORS.getError(
                error.response?.data.code_error,
              )}`,
            }),
        },
      );
    }
  };

  const banner = (): Banner | null => {
    switch (status) {
      case OrganizatinVolunteerStatus.ACCESS_REQUEST_PENDING:
        return { tone: 'wait', text: `${t('disclaimer.access_request_pending')}` };
      case OrganizatinVolunteerStatus.ARCHIVED_VOLUNTEER:
        return { tone: 'wait', text: `${t('disclaimer.volunteer_archived')}` };
      case OrganizatinVolunteerStatus.INACTIVE_VOLUNTEER:
        return { tone: 'wait', text: `${t('disclaimer.volunteer_inactive')}` };
      case OrganizatinVolunteerStatus.CANDIDATE_VOLUNTEER:
        return { tone: 'wait', text: `${t('disclaimer.volunteer_candidate')}` };
      case OrganizatinVolunteerStatus.BLOCKED_VOLUNTEER:
        return { tone: 'no', text: `${t('disclaimer.volunteer_blocked')}` };
      default:
        return null;
    }
  };

  const renderBar = () => {
    if (!organization) {
      return null;
    }
    switch (status) {
      case OrganizatinVolunteerStatus.ACCESS_REQUEST_PENDING:
        return (
          <>
            <View style={styles.barText}>
              <VText variant="h3" style={styles.barTitle}>
                {t('bar.pending')}
              </VText>
              <VText variant="cap">{t('bar.pending_hint')}</VText>
            </View>
            <VButton
              variant="outline"
              label={`${t('bar.withdraw')}`}
              onPress={() => cancelSheet.current?.present()}
              loading={busy}
              testID="organization-withdraw"
            />
          </>
        );
      case OrganizatinVolunteerStatus.ACTIVE_VOLUNTEER:
        return (
          <>
            {/* two lines like the pending state: status on top, since when underneath */}
            <View style={styles.barText} testID="organization-member">
              <VText variant="h3" style={styles.barTitle} color={colors.status.ok.fg}>
                {t('bar.member')}
              </VText>
              <VText variant="cap">
                {t('bar.member_since', {
                  date: datePickerService('ro').format(
                    new Date(organization.volunteer.createdOn),
                    'DD.MM.YYYY',
                  ),
                })}
              </VText>
            </View>
            <VButton
              variant="navy"
              label={`${t('bar.see_events')}`}
              onPress={() =>
                navigation.navigate(TAB_ROUTES.EVENTS, { organizationId: organization.id })
              }
              testID="organization-events"
            />
          </>
        );
      case OrganizatinVolunteerStatus.ARCHIVED_VOLUNTEER:
        return (
          <VButton
            label={`${t('rejoin')}`}
            onPress={onRejoin}
            loading={busy}
            style={styles.fill}
            testID="organization-rejoin"
          />
        );
      case OrganizatinVolunteerStatus.INACTIVE_VOLUNTEER:
      case OrganizatinVolunteerStatus.BLOCKED_VOLUNTEER:
      case OrganizatinVolunteerStatus.CANDIDATE_VOLUNTEER:
        // they can only look at the organization
        return null;
      default:
        return (
          <>
            <VText
              variant="label"
              style={[styles.barText, styles.link]}
              onPress={() => goJoin('join-by-access-code')}
              accessibilityRole="button"
              testID="organization-code"
            >
              {t('bar.have_code')}
            </VText>
            <VButton
              label={`${t('bar.join')}`}
              onPress={() => goJoin('join-organization')}
              loading={busy}
              testID="organization-join"
            />
          </>
        );
    }
  };

  const bar = loaded ? renderBar() : null;
  const statusBanner = loaded ? banner() : null;

  return (
    <View style={styles.screen}>
      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingBottom: insets.bottom + (bar ? 120 : 40) }}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.hero, { height: heroHeight }]}>
          {loaded && (
            <View style={[styles.logo, shadows.card]}>
              <Avatar name={organization.name} uri={organization.logo} size={80} shape="rounded" />
            </View>
          )}
        </View>

        {!loaded && isFetchingOrganization && (
          <View style={styles.body}>
            <OrganizationSkeleton />
          </View>
        )}

        {loaded && (
          <View style={styles.body}>
            <Enter style={styles.gap6}>
              <VText
                variant="largeTitle"
                style={styles.name}
                accessibilityRole="header"
                onLayout={(event) => {
                  const { y, height } = event.nativeEvent.layout;
                  // Enter is the body's first child, starting at its top padding.
                  titleBottom.value = heroHeight + styles.body.paddingTop + y + height;
                  titleHeight.value = height;
                }}
              >
                {organization.name}
              </VText>
              <VText variant="sub">
                {t('volunteers', { count: organization.numberOfVolunteers })}
              </VText>
            </Enter>

            {statusBanner && (
              <Enter
                index={1}
                style={[styles.banner, { backgroundColor: colors.status[statusBanner.tone].bg }]}
              >
                <VText variant="label" color={colors.status[statusBanner.tone].fg}>
                  {statusBanner.text}
                </VText>
              </Enter>
            )}

            {!!organization.description && (
              <Enter index={1} style={styles.section}>
                <VText variant="h2">{t('about')}</VText>
                <VText variant="body" style={styles.paragraph}>
                  {organization.description}
                </VText>
              </Enter>
            )}

            <Enter index={2} style={styles.section}>
              <Group>
                {!!organization.address && (
                  <ListRow
                    leading={<EventIcon name="pin" />}
                    title={organization.address}
                    onPress={() =>
                      Linking.openURL(
                        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                          organization.address as string,
                        )}`,
                      ).catch(() => undefined)
                    }
                  />
                )}
                {!!organization.website && (
                  <ListRow
                    leading={<EventIcon name="open" />}
                    title={organization.website.replace(/^https?:\/\//, '')}
                    onPress={() =>
                      Linking.openURL(
                        /^https?:\/\//.test(organization.website as string)
                          ? (organization.website as string)
                          : `https://${organization.website}`,
                      ).catch(() => undefined)
                    }
                  />
                )}
                {!!organization.email && (
                  <ListRow
                    leading={<EventIcon name="mail" />}
                    title={organization.email}
                    subtitle={`${t('email')}`}
                    onPress={() =>
                      Linking.openURL(`mailto:${organization.email}`).catch(() => undefined)
                    }
                  />
                )}
                {!!organization.phone && (
                  <ListRow
                    leading={<EventIcon name="phone" />}
                    title={organization.phone}
                    subtitle={`${t('phone')}`}
                    onPress={() =>
                      Linking.openURL(`tel:${organization.phone}`).catch(() => undefined)
                    }
                    divider={false}
                  />
                )}
              </Group>
            </Enter>

            <Enter index={3} style={styles.section}>
              <VText variant="h2">{t('events')}</VText>
              {!organization.events?.length ? (
                <VText variant="sub">{t('no_events')}</VText>
              ) : (
                <Group>
                  {organization.events.map((event, index, all) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      onPress={(eventId) => navigation.navigate('event', { eventId })}
                      divider={index < all.length - 1}
                    />
                  ))}
                </Group>
              )}
            </Enter>

            {status === OrganizatinVolunteerStatus.ACTIVE_VOLUNTEER && (
              <Enter index={4}>
                <ListRow
                  title={`${t('leave')}`}
                  destructive
                  divider={false}
                  onPress={() =>
                    organization &&
                    navigation.navigate('leave-organization', {
                      volunteerId: organization.volunteer.id,
                      name: organization.name,
                      logo: organization.logo,
                    })
                  }
                  testID="organization-leave"
                />
              </Enter>
            )}
          </View>
        )}
      </Animated.ScrollView>
      <Animated.View
        testID="organization-bar-top"
        pointerEvents="box-none"
        style={[
          styles.pinnedBar,
          shadows.card,
          styles.barBorder,
          { height: barHeight, paddingTop: insets.top },
          barStyle,
        ]}
      >
        <View style={styles.topRow} pointerEvents="box-none">
          <PressableScale
            onPress={navigation.goBack}
            accessibilityLabel={`${t('general:back')}`}
            style={[styles.back, shadows.back]}
            testID="organization-back"
          >
            <EventIcon name="back" size={20} />
          </PressableScale>
          {loaded && (
            <Animated.View
              pointerEvents="none"
              accessibilityElementsHidden={!compactAccessible}
              importantForAccessibility={compactAccessible ? 'auto' : 'no-hide-descendants'}
              style={[styles.compactOrganization, compactStyle]}
            >
              <Avatar name={organization.name} uri={organization.logo} size={32} shape="rounded" />
              <VText
                color={colors.white}
                style={styles.compactName}
                numberOfLines={1}
                maxFontSizeMultiplier={MAX_FONT_SCALE.title}
              >
                {organization.name}
              </VText>
            </Animated.View>
          )}
        </View>
      </Animated.View>

      {bar && (
        <View
          style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 16) + 8 }]}
          testID="organization-bar"
        >
          {bar}
        </View>
      )}

      <Sheet
        ref={birthdaySheet}
        title={`${t('modal.birthday_missing.heading')}`}
        subtitle={`${t('modal.birthday_missing.paragraph')}`}
        testID="organization-birthday-sheet"
      >
        <VButton
          label={`${t('modal.birthday_missing.action_label')}`}
          onPress={() => {
            birthdaySheet.current?.dismiss();
            navigation.navigate('account-data');
          }}
        />
        <VButton
          variant="soft"
          label={`${t('general:back')}`}
          onPress={() => birthdaySheet.current?.dismiss()}
        />
      </Sheet>

      <Sheet
        ref={cancelSheet}
        title={`${t('modal.confirm_cancel_request.heading')}`}
        subtitle={`${t('modal.confirm_cancel_request.paragraph')}`}
        testID="organization-cancel-sheet"
      >
        <VButton
          variant="danger"
          label={`${t('modal.confirm_cancel_request.action_label')}`}
          onPress={onCancelAccessRequest}
          testID="organization-cancel-confirm"
        />
        <VButton
          variant="soft"
          label={`${t('general:back')}`}
          onPress={() => cancelSheet.current?.dismiss()}
        />
      </Sheet>
    </View>
  );
};

export default OrganizationProfile;

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  hero: { backgroundColor: colors.navy },
  logo: {
    position: 'absolute',
    left: spacing.gutter,
    bottom: -32,
    borderRadius: 24,
    backgroundColor: colors.white,
    padding: 0,
  },
  body: { paddingHorizontal: spacing.gutter, paddingTop: 48, gap: 20 },
  gap6: { gap: 6 },
  name: { fontSize: 28, lineHeight: 34 },
  banner: { borderRadius: radius.button, padding: 14 },
  section: { gap: 10 },
  paragraph: { lineHeight: 23 },
  pinnedBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: colors.navy,
  },
  barBorder: { borderWidth: 0 },
  topRow: { height: 56, flexDirection: 'row', alignItems: 'center', paddingLeft: 16, gap: 12 },
  compactOrganization: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingRight: spacing.gutter,
  },
  compactName: { fontFamily: fonts.title, fontSize: 17, flexShrink: 1 },
  back: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    // solid: the events list must not show through the bar
    backgroundColor: colors.white,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.line,
    paddingTop: 12,
    paddingHorizontal: spacing.gutter,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  barText: { flex: 1 },
  barTitle: { fontSize: 15 },
  link: { fontFamily: fonts.bold, textDecorationLine: 'underline' },
  fill: { flex: 1 },
});
