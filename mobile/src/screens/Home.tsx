import React, { useCallback } from 'react';
import { Pressable, RefreshControl, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useMonthlyStatistics } from '../services/statistics/statistics.service';
import { useAnouncementsSnapshot } from '../services/anouncement/anouncement.service';
import { useEventsInfiniteQuery } from '../services/event/event.service';
import { getUserProfile } from '../services/user/user.api';
import { useGetUserProfileQuery } from '../services/user/user.service';
import { OrderDirection } from '../common/enums/order-direction.enum';
import { EventType } from '../common/enums/event-type.enum';
import { NewsType } from '../common/enums/news-type.enum';
import { IEventListItem } from '../common/interfaces/event-list-item.interface';
import { colors, radius, shadows, spacing } from '../common/theme/tokens';
import { useUserProfile } from '../store/profile/profile.selector';
import useStore from '../store/store';
import { useFocusedStatusBarStyle } from '../hooks/useFocusedStatusBarStyle';
import { TAB_ROUTES } from '../routes/tab-routes';
import { useTabBarScroll } from '../components/navigation/TabBarScroll';
import { useGlassTabBarInset } from '../components/navigation/GlassTabBar';
import { EventCard } from '../components/events/EventCard';
import { EventIcon, EventIconName } from '../components/events/EventIcons';
import { isInactiveVolunteer } from '../common/interfaces/organization-list-item.interface';
import {
  Avatar,
  Enter,
  Group,
  ListRow,
  PressableScale,
  StatusBarScrim,
  VButton,
  VText,
} from '../components/ui';

const BellIcon = ({ color = colors.ink }: { color?: string }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path
      d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.94 1.94 0 0 0 3.4 0"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// "Luna asta" tiles: one solid navy tile, the others white with a strong colored figure
// (Andrew, 9 Nov: more color, but no pastel blocks)
// White cards with navy figures: yellow stays on the primary action only (Andrew, 9 Nov).
const TILE = { bg: colors.white, fg: colors.navy, label: colors.muted };
const TILE_TONE: Record<string, { bg: string; fg: string; label: string }> = {
  events: TILE,
  hours: TILE,
  documents: TILE,
  organizations: TILE,
};

const SectionHead = ({
  title,
  action,
  onAction,
  testID,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
  testID?: string;
}) => (
  <View style={styles.sectionHead}>
    <VText variant="h2">{title}</VText>
    {!!action && (
      // 44pt touch target around the short link
      <Pressable
        onPress={onAction}
        accessibilityRole="button"
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 8 }}
        style={styles.linkTouch}
        testID={testID}
      >
        <VText variant="label" style={styles.link}>
          {action}
        </VText>
      </Pressable>
    )}
  </View>
);

const TodoIcon = ({ name, tone }: { name: EventIconName; tone: 'wait' | 'accent' | 'neutral' }) => (
  <View style={[styles.todoIcon, { backgroundColor: colors.status[tone].bg }]}>
    <EventIcon name={name} size={20} color={colors.status[tone].fg} />
  </View>
);

/**
 * VIC 2.0 Acasă (canvas board "Acasă"): greeting, the events you go to next, what is left to do
 * (contracts to sign, an incomplete volunteer profile, hours to send), this month in numbers and the
 * latest announcements.
 */
const Home = ({ navigation }: any) => {
  const { t } = useTranslation('home');
  const insets = useSafeAreaInsets();
  const bottomInset = useGlassTabBarInset();
  useFocusedStatusBarStyle('light');
  const onScroll = useTabBarScroll();

  const { userProfile } = useUserProfile();
  const { setUserProfile } = useStore();
  const { refetch: refetchProfile } = useGetUserProfileQuery();
  const organization = userProfile?.activeOrganization;

  const statistics = useMonthlyStatistics();
  const anouncements = useAnouncementsSnapshot();
  const upcoming = useEventsInfiniteQuery(OrderDirection.ASC, '', EventType.GOING);

  const { refetch: refetchStatistics } = statistics;
  const { refetch: refetchAnouncements } = anouncements;
  const { refetch: refetchUpcoming } = upcoming;

  useFocusEffect(
    useCallback(() => {
      refetchStatistics();
      refetchAnouncements();
      refetchUpcoming();
      refetchProfile();
    }, [refetchStatistics, refetchAnouncements, refetchUpcoming, refetchProfile]),
  );

  const onRefresh = async () => {
    refetchStatistics();
    refetchAnouncements();
    refetchUpcoming();
    try {
      setUserProfile(await getUserProfile());
    } catch {
      // the profile stays as it was
    }
  };

  const nextEvents = (
    (upcoming.data?.pages ?? []).flatMap((page) => page.items) as IEventListItem[]
  )
    .filter((event) => !event.endDate || new Date(event.endDate) >= new Date())
    .slice(0, 2);
  const inactive = isInactiveVolunteer(organization);
  const profileMissing = !!organization && !inactive && !organization.volunteerProfileId;
  const stats = statistics.data;

  const todos = [
    profileMissing && {
      key: 'profile',
      icon: 'people' as EventIconName,
      tone: 'wait' as const,
      title: `${t('todo.profile.title')}`,
      subtitle: `${t('todo.profile.subtitle')}`,
      onPress: () => navigation.navigate('volunteer-profile'),
    },
    !!organization &&
      !inactive &&
      !profileMissing && {
        key: 'hours',
        icon: 'check' as EventIconName,
        tone: 'neutral' as const,
        title: `${t('todo.hours.title')}`,
        subtitle: `${t('todo.hours.subtitle', { name: organization.name })}`,
        onPress: () => navigation.navigate('add-activity-log'),
      },
  ].filter(Boolean) as {
    key: string;
    icon: EventIconName;
    tone: 'wait' | 'accent' | 'neutral';
    title: string;
    subtitle?: string;
    onPress: () => void;
  }[];

  const tiles = [
    {
      key: 'events',
      value: stats?.numberOfUpcomingEvents,
      label: t('statistics.events.short'),
      onPress: () => navigation.navigate(TAB_ROUTES.EVENTS),
    },
    ...(organization
      ? [
          {
            key: 'hours',
            value: stats?.numberOfActivityLogUpdates,
            label: t('statistics.hours.short'),
            onPress: () => navigation.navigate('news', { type: NewsType.LOGGED_HOURS }),
          },
          {
            key: 'documents',
            value: stats?.numberOfDocumentUpdates,
            label: t('statistics.documents.short'),
            onPress: () => navigation.navigate('news', { type: NewsType.CONTRACTS }),
          },
        ]
      : []),
    {
      key: 'organizations',
      value: stats?.numberOfOrganizationUpdates,
      label: t('statistics.organizations.short'),
      onPress: () => navigation.navigate('news', { type: NewsType.ORGANIZATIONS }),
    },
  ];

  return (
    <View style={styles.screen}>
      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={statistics.isRefetching || anouncements.isRefetching}
            onRefresh={onRefresh}
            tintColor={colors.white}
          />
        }
        contentContainerStyle={{ paddingBottom: bottomInset }}
        showsVerticalScrollIndicator={false}
        testID="home"
      >
        <View style={[styles.hero, { paddingTop: insets.top + 12 }]}>
          {/* navy behind the pull-to-refresh bounce */}
          <View style={styles.heroBounce} />
          <View style={styles.topRow}>
            <PressableScale
              onPress={() => navigation.navigate(TAB_ROUTES.PROFILE)}
              accessibilityLabel={`${t('settings:profile')}`}
              style={styles.avatarRing}
              testID="home-avatar"
            >
              <Avatar
                name={
                  [userProfile?.firstName, userProfile?.lastName].filter(Boolean).join(' ') || '?'
                }
                uri={userProfile?.profilePicture}
                size={40}
              />
            </PressableScale>
            <PressableScale
              onPress={() => navigation.navigate('news', { type: NewsType.LOGGED_HOURS })}
              style={styles.bell}
              accessibilityLabel={`${t('news')}`}
              testID="home-news"
            >
              <BellIcon color={colors.white} />
            </PressableScale>
          </View>

          <Enter>
            <VText
              variant="largeTitle"
              color={colors.white}
              accessibilityRole="header"
              style={styles.title}
            >
              {t('hello', { name: userProfile?.firstName || '' })}
            </VText>
            {!!organization?.name && (
              <VText variant="sub" color="rgba(255,255,255,0.75)" numberOfLines={1}>
                {organization.name}
              </VText>
            )}
          </Enter>
        </View>

        <View style={styles.content}>
          {inactive && (
            <Enter index={1} style={[styles.join, shadows.card]} testID="home-inactive">
              <VText variant="sub">{t('organization_profile:disclaimer.volunteer_inactive')}</VText>
            </Enter>
          )}

          {!organization && (
            <Enter index={1} style={[styles.join, shadows.card]}>
              <VText variant="h3">{t('no_ngo_title')}</VText>
              <VText variant="sub">{t('no_ngo_paragraph')}</VText>
              <VButton
                label={`${t('join_ngo_short')}`}
                onPress={() => navigation.navigate('search')}
                testID="home-join"
              />
            </Enter>
          )}

          {nextEvents.length > 0 && (
            <Enter index={1} style={styles.section}>
              <SectionHead
                title={`${t('next.title')}`}
                action={`${t('see_all')}`}
                onAction={() =>
                  navigation.navigate(TAB_ROUTES.EVENTS, { eventFilter: EventType.GOING })
                }
                testID="home-next-all"
              />
              <Group>
                {nextEvents.map((event, index) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onPress={(eventId) => navigation.navigate('event', { eventId })}
                    divider={index < nextEvents.length - 1}
                  />
                ))}
              </Group>
            </Enter>
          )}

          {todos.length > 0 && (
            <Enter index={2} style={styles.section} testID="home-todo">
              <SectionHead title={`${t('todo.title')}`} />
              <Group>
                {todos.map((todo, index) => (
                  <ListRow
                    key={todo.key}
                    leading={<TodoIcon name={todo.icon} tone={todo.tone} />}
                    title={todo.title}
                    subtitle={todo.subtitle}
                    onPress={todo.onPress}
                    divider={index < todos.length - 1}
                    testID={`home-todo-${todo.key}`}
                  />
                ))}
              </Group>
            </Enter>
          )}

          <Enter index={3} style={styles.section}>
            <SectionHead title={`${t('general:current_month')}`} />
            <View style={styles.tiles}>
              {tiles.map((tile) => (
                <PressableScale
                  key={tile.key}
                  onPress={tile.onPress}
                  style={[styles.tile, shadows.card, { backgroundColor: TILE_TONE[tile.key].bg }]}
                  accessibilityLabel={`${tile.value ?? 0} ${tile.label}`}
                  testID={`home-stat-${tile.key}`}
                >
                  <VText style={[styles.tileValue, { color: TILE_TONE[tile.key].fg }]}>
                    {`${tile.value ?? '–'}`}
                  </VText>
                  <VText variant="cap" color={TILE_TONE[tile.key].label}>
                    {tile.label}
                  </VText>
                </PressableScale>
              ))}
            </View>
          </Enter>

          {!!organization && (
            <Enter index={4} style={styles.section}>
              <SectionHead
                title={`${t('anouncements.section.title')}`}
                action={`${t('see_all')}`}
                onAction={() => navigation.navigate('announcements')}
                testID="home-anouncements-all"
              />
              {anouncements.error ? (
                <VText variant="sub">{t('general:error.load_entries')}</VText>
              ) : !anouncements.data?.items?.length ? (
                <VText variant="sub">{t('anouncements.section.empty_list')}</VText>
              ) : (
                <Group>
                  {anouncements.data.items.map((item, index, all) => (
                    <ListRow
                      key={item.id}
                      leading={
                        <Avatar
                          name={item.organization?.name || item.title}
                          uri={item.organization?.logo || item.organizationLogo}
                          size={40}
                          shape="rounded"
                        />
                      }
                      title={item.title}
                      subtitle={[item.organization?.name, item.description]
                        .filter(Boolean)
                        .join(' · ')}
                      titleLines={2}
                      subtitleLines={2}
                      onPress={() => navigation.navigate('announcements')}
                      divider={index < all.length - 1}
                      testID={`home-anouncement-${item.id}`}
                    />
                  ))}
                </Group>
              )}
            </Enter>
          )}
        </View>
      </Animated.ScrollView>
      <StatusBarScrim color={colors.navy} />
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  hero: {
    backgroundColor: colors.navy,
    paddingHorizontal: spacing.gutter,
    paddingBottom: 28,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  heroBounce: {
    position: 'absolute',
    top: -800,
    left: 0,
    right: 0,
    height: 800,
    backgroundColor: colors.navy,
  },
  content: { paddingHorizontal: spacing.gutter },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  avatarRing: { borderRadius: 22, borderWidth: 2, borderColor: 'rgba(255,255,255,0.9)' },
  bell: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { marginTop: 16 },
  join: {
    marginTop: 18,
    gap: 8,
    padding: 16,
    borderRadius: radius.card,
    backgroundColor: colors.white,
  },
  section: { marginTop: 28, gap: 10 },
  sectionHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  link: { textDecorationLine: 'underline' },
  linkTouch: { minHeight: 44, justifyContent: 'center' },
  todoIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.button,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tiles: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tile: {
    flexGrow: 1,
    flexBasis: '45%',
    borderRadius: radius.card,
    backgroundColor: colors.soft,
    paddingVertical: 14,
    paddingHorizontal: 14,
    gap: 2,
  },
  tileValue: { fontFamily: 'titillium-bold', fontSize: 24, lineHeight: 30, color: colors.ink },
});
