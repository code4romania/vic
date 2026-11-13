import React, { useCallback, useRef, useState } from 'react';
import { RefreshControl, View, useWindowDimensions } from 'react-native';
import Animated, { useReducedMotion, useSharedValue } from 'react-native-reanimated';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native-unistyles';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import Toast from 'react-native-toast-message';
import { useMonthlyStatistics } from '../services/statistics/statistics.service';
import { useAnouncementsSnapshot } from '../services/anouncement/anouncement.service';
import { useEventsInfiniteQuery } from '../services/event/event.service';
import { toHours } from '../common/utils/hours';
import { useActivityLogsCounters } from '../services/activity-log/activity-log.service';
import { useActivateOrganization } from '../services/organization/organization.service';
import { getUserProfile } from '../services/user/user.api';
import { useGetUserProfileQuery } from '../services/user/user.service';
import { OrderDirection } from '../common/enums/order-direction.enum';
import { EventType } from '../common/enums/event-type.enum';
import { NewsType } from '../common/enums/news-type.enum';
import { IEventListItem } from '../common/interfaces/event-list-item.interface';
import {
  IOrganizationVolunteer,
  isCandidateVolunteer,
  isInactiveVolunteer,
} from '../common/interfaces/organization-list-item.interface';
import { InternalErrors } from '../common/errors/internal-errors.class';
import { useUserProfile } from '../store/profile/profile.selector';
import useStore from '../store/store';
import { useFocusedStatusBarStyle } from '../hooks/useFocusedStatusBarStyle';
import { TAB_ROUTES } from '../routes/tab-routes';
import { useTabBarScroll } from '../components/navigation/TabBarScroll';
import { useGlassTabBarInset } from '../components/navigation/GlassTabBar';
import { Avatar, Group, ListRow, VButton } from '../components/ui';
import { AppText } from '../design/components/Text';
import { ListRow as DesignListRow } from '../design/components/ListRow';
import { Sheet } from '../design/components/Sheet';
import { enter } from '../design/motion';
import { haptics } from '../design/haptics';
import { CheckIcon, ClockIcon, ICON_STROKE, LucideIcon, UsersIcon } from '../design/icons';
import { palette } from '../design/tokens';
import {
  BentoTile,
  CompactBar,
  EventCarousel,
  ImpactCard,
  LargeTitle,
  MonthBento,
  OrgRow,
  SectionHead,
  TodoCard,
} from './home/HomeParts';

/**
 * Acasă „Îndrăzneț” (handbook prototype, screen „Acasă”): the active organization and the news
 * bell, the greeting, your impact (the liquid hexagon with the approved hours counting up), what
 * is left to do, the events you go to next, this month in numbers and the latest announcements.
 */
const Home = ({ navigation }: any) => {
  const { t } = useTranslation('home');
  const insets = useSafeAreaInsets();
  const reduced = useReducedMotion();
  // iOS changes the text size of mounted text but keeps the old layout until the app restarts
  // (#640, iPhone 8 on iOS 16, release build), so the content is mounted again when it changes.
  const { fontScale } = useWindowDimensions();
  const bottomInset = useGlassTabBarInset();
  useFocusedStatusBarStyle('dark');
  const scrollY = useSharedValue(0);
  const onScroll = useTabBarScroll(scrollY);
  const orgSheet = useRef<BottomSheetModal>(null);
  // each focus refills the hexagon and counts the hours again
  const [focusCount, setFocusCount] = useState(0);

  const { userProfile } = useUserProfile();
  const { setUserProfile } = useStore();
  const { refetch: refetchProfile } = useGetUserProfileQuery();
  const organization = userProfile?.activeOrganization;
  const { activate } = useActivateOrganization();

  const statistics = useMonthlyStatistics();
  const anouncements = useAnouncementsSnapshot();
  const upcoming = useEventsInfiniteQuery(OrderDirection.ASC, '', EventType.GOING);
  const counters = useActivityLogsCounters(organization?.volunteerId);

  const { refetch: refetchStatistics } = statistics;
  const { refetch: refetchAnouncements } = anouncements;
  const { refetch: refetchUpcoming } = upcoming;
  const { refetch: refetchCounters } = counters;

  useFocusEffect(
    useCallback(() => {
      setFocusCount((count) => count + 1);
      refetchStatistics();
      refetchAnouncements();
      refetchUpcoming();
      refetchProfile();
      refetchCounters();
    }, [refetchStatistics, refetchAnouncements, refetchUpcoming, refetchProfile, refetchCounters]),
  );

  const onRefresh = async () => {
    refetchStatistics();
    refetchAnouncements();
    refetchUpcoming();
    refetchCounters();
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
    .slice(0, 5);
  const inactive = isInactiveVolunteer(organization);
  const profileMissing = !!organization && !inactive && !organization.volunteerProfileId;
  const stats = statistics.data;
  const hours = counters.data;

  // organizations you can switch to from the row (a Candidate only sees the organization's page)
  const switchable = (userProfile?.myOrganizations ?? []).filter(
    (item) => !isCandidateVolunteer(item),
  );

  const onSwitch = async (target: IOrganizationVolunteer) => {
    orgSheet.current?.dismiss();
    if (target.id === organization?.id) {
      return;
    }
    haptics.selection();
    try {
      // the backend must have the new active organization before its data loads
      await activate(target);
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: `${InternalErrors.ORGANIZATION_ERRORS.getError(error?.response?.data?.code_error)}`,
      });
    }
  };

  const todos = [
    profileMissing && {
      key: 'profile',
      icon: UsersIcon,
      title: `${t('todo.profile.title')}`,
      subtitle: `${t('todo.profile.subtitle')}`,
      onPress: () => navigation.navigate('volunteer-profile'),
    },
    !!organization &&
      !inactive &&
      !profileMissing && {
        key: 'hours',
        icon: ClockIcon,
        title: `${t('todo.hours.title')}`,
        subtitle: `${t('todo.hours.subtitle', { name: organization.name })}`,
        onPress: () => navigation.navigate('add-activity-log'),
      },
  ].filter(Boolean) as {
    key: string;
    icon: LucideIcon;
    title: string;
    subtitle?: string;
    onPress: () => void;
  }[];

  const tiles: BentoTile[] = [
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

  // staggered entrance: one step per block, in screen order (enter() caps it at 8)
  let step = 0;
  const entering = () => enter(step++, reduced);

  return (
    <View style={styles.screen}>
      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={statistics.isRefetching || anouncements.isRefetching}
            onRefresh={onRefresh}
            tintColor={palette.navy}
            progressViewOffset={insets.top}
          />
        }
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 6, paddingBottom: bottomInset },
        ]}
        showsVerticalScrollIndicator={false}
        testID="home"
      >
        <React.Fragment key={fontScale}>
          <Animated.View entering={entering()}>
            <OrgRow
              name={organization?.name}
              onSwitch={switchable.length > 1 ? () => orgSheet.current?.present() : undefined}
              onNews={() => navigation.navigate('news', { type: NewsType.LOGGED_HOURS })}
            />
          </Animated.View>

          <Animated.View entering={entering()}>
            <LargeTitle
              title={`${t('hello', { name: userProfile?.firstName || '' })}`}
              scrollY={scrollY}
            />
          </Animated.View>

          {!!organization && !inactive && (
            <Animated.View entering={entering()}>
              <ImpactCard
                approved={toHours(hours?.approved)}
                pending={toHours(hours?.pending)}
                rejected={toHours(hours?.rejected)}
                replay={focusCount}
                onPress={() => navigation.navigate(TAB_ROUTES.HOURS)}
              />
            </Animated.View>
          )}

          {inactive && (
            <Animated.View entering={entering()} style={styles.notice} testID="home-inactive">
              <AppText color={palette.ink2}>
                {t('organization_profile:disclaimer.volunteer_inactive')}
              </AppText>
            </Animated.View>
          )}

          {!organization && (
            <Animated.View entering={entering()} style={styles.notice}>
              <AppText variant="headline">{t('no_ngo_title')}</AppText>
              <AppText color={palette.ink2}>{t('no_ngo_paragraph')}</AppText>
              <VButton
                label={`${t('join_ngo_short')}`}
                onPress={() => navigation.navigate('search')}
                testID="home-join"
              />
            </Animated.View>
          )}

          {todos.length > 0 && (
            <Animated.View entering={entering()} testID="home-todo">
              {todos.map((todo) => (
                <TodoCard
                  key={todo.key}
                  icon={todo.icon}
                  title={todo.title}
                  subtitle={todo.subtitle}
                  onPress={todo.onPress}
                  testID={`home-todo-${todo.key}`}
                />
              ))}
            </Animated.View>
          )}

          {nextEvents.length > 0 && (
            <Animated.View entering={entering()}>
              <SectionHead
                title={`${t('next.title')}`}
                action={`${t('see_all')}`}
                onAction={() =>
                  navigation.navigate(TAB_ROUTES.EVENTS, { eventFilter: EventType.GOING })
                }
                testID="home-next-all"
              />
              <EventCarousel
                events={nextEvents}
                onPress={(eventId) => navigation.navigate('event', { eventId })}
              />
            </Animated.View>
          )}

          <Animated.View entering={entering()}>
            <SectionHead title={`${t('general:current_month')}`} />
            <MonthBento tiles={tiles} />
          </Animated.View>

          {!!organization && (
            <Animated.View entering={entering()}>
              <SectionHead
                title={`${t('anouncements.section.title')}`}
                action={`${t('see_all')}`}
                onAction={() => navigation.navigate('announcements')}
                testID="home-anouncements-all"
              />
              {anouncements.error ? (
                <AppText color={palette.ink2}>{t('general:error.load_entries')}</AppText>
              ) : !anouncements.data?.items?.length ? (
                <AppText color={palette.ink2}>{t('anouncements.section.empty_list')}</AppText>
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
            </Animated.View>
          )}
        </React.Fragment>
      </Animated.ScrollView>

      <CompactBar title={`${t('tabs:home')}`} scrollY={scrollY} />

      {switchable.length > 1 && (
        <Sheet ref={orgSheet} title={`${t('org.sheet_title')}`} testID="home-org-sheet">
          {switchable.map((item) => {
            const active = item.id === organization?.id;
            return (
              <DesignListRow
                key={item.id}
                avatar={{ name: item.name }}
                title={item.name}
                subtitle={active ? `${t('org.active')}` : undefined}
                trailing={
                  active ? (
                    <CheckIcon size={20} color={palette.navy} strokeWidth={ICON_STROKE} />
                  ) : null
                }
                onPress={() => onSwitch(item)}
                accessibilityLabel={active ? `${item.name}, ${t('org.active')}` : item.name}
                testID={`home-org-${item.id}`}
              />
            );
          })}
        </Sheet>
      )}
    </View>
  );
};

export default Home;

const styles = StyleSheet.create((theme) => ({
  screen: { flex: 1, backgroundColor: theme.colors.background },
  content: { paddingHorizontal: theme.space.gutter },
  notice: {
    marginTop: theme.space.s,
    gap: 8,
    padding: 16,
    borderRadius: theme.radius.card,
    backgroundColor: theme.colors.surface,
  },
}));
