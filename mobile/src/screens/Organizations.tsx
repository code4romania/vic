import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { OrderDirection } from '../common/enums/order-direction.enum';
import { IOrganizationListItemWithNumberOfVolunteers } from '../common/interfaces/organization-list-item.interface';
import { MAX_FONT_SCALE } from '../common/constants/constants';
import { colors, fonts, spacing } from '../common/theme/tokens';
import { useOrganizationsInfiniteQuery } from '../services/organization/organization.service';
import { useOrganization } from '../store/organization/organization.selector';
import { useUserProfile } from '../store/profile/profile.selector';
import { useFocusedStatusBarStyle } from '../hooks/useFocusedStatusBarStyle';
import useMyOrganizations from '../hooks/useMyOrganizations';
import { useTabBarScroll } from '../components/navigation/TabBarScroll';
import { useGlassTabBarInset } from '../components/navigation/GlassTabBar';
import { EventIcon } from '../components/events/EventIcons';
import {
  Avatar,
  Chevron,
  EmptyState,
  Enter,
  groupedItem,
  PressableScale,
  StatusBarScrim,
  VText,
} from '../components/ui';
import { BackButton } from '../components/ui/ScreenChrome';
import { StatusChip } from '../design/components';
import OrganizationSkeleton from '../components/skeleton/organization-skeleton';

const SEARCH_DEBOUNCE_MS = 300;

/**
 * VIC 2.0 Organizații (canvas board "Organizații"): pinned title, a search that filters as you
 * type, and rows with the logo, the number of volunteers and "Membru" for your organizations.
 */
const Organizations = ({ navigation }: any) => {
  const { t } = useTranslation('organizations');
  const insets = useSafeAreaInsets();
  const bottomInset = useGlassTabBarInset();
  useFocusedStatusBarStyle('dark');
  const scrollY = useSharedValue(0);
  const onScroll = useTabBarScroll(scrollY);
  const [measuredHeaderHeight, setMeasuredHeaderHeight] = useState(0);
  const headerHeight = measuredHeaderHeight || insets.top + 12 + 44 + 6;
  const headerShadow = useAnimatedStyle(() => ({
    shadowOpacity: interpolate(scrollY.value, [0, 12], [0, 0.06], Extrapolation.CLAMP),
  }));

  const [query, setQuery] = useState('');
  const [search, setSearch] = useState('');
  const { organization } = useOrganization();
  const { userProfile } = useUserProfile();
  const myOrganizations = useMyOrganizations();
  const memberOf = useMemo(() => new Set(myOrganizations.map((org) => org.id)), [myOrganizations]);

  useEffect(() => {
    const timer = setTimeout(() => setSearch(query.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [query]);

  const {
    data,
    error,
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    refetch,
    isRefetching,
  } = useOrganizationsInfiniteQuery(OrderDirection.ASC, search);

  // joining or leaving changes the "Membru" badges
  const reload = useCallback(() => {
    refetch();
  }, [refetch]);
  useEffect(() => {
    reload();
  }, [organization, userProfile, reload]);

  const items = useMemo(
    () =>
      (data?.pages ?? []).flatMap(
        (page) => page.items,
      ) as IOrganizationListItemWithNumberOfVolunteers[],
    [data],
  );
  const total = data?.pages?.[0]?.meta?.totalItems;

  const renderItem = ({
    item,
    index,
  }: {
    item: IOrganizationListItemWithNumberOfVolunteers;
    index: number;
  }) => (
    <Enter index={index} style={groupedItem(index, items.length)}>
      <PressableScale
        onPress={() => navigation.navigate('organization-profile', { organizationId: item.id })}
        pressedScale={0.985}
        style={styles.row}
        accessibilityLabel={item.name}
        testID={`organization-row-${item.id}`}
      >
        <Avatar name={item.name} uri={item.logo} size={56} shape="rounded" />
        <View style={styles.rowText}>
          <VText variant="h3">{item.name}</VText>
          {/* the "Membru" badge goes under the name so it doesn't cut it on small screens */}
          <View style={styles.meta}>
            <VText variant="cap">
              {t('organization_profile:volunteers', { count: item.numberOfVolunteers })}
            </VText>
            {memberOf.has(item.id) && <StatusChip label={`${t('member')}`} kind="act" />}
          </View>
        </View>
        <Chevron />
      </PressableScale>
    </Enter>
  );

  const header = (
    <View style={styles.header}>
      <Enter index={1}>
        <VText variant="sub" style={styles.subtitle}>
          {t('subtitle')}
        </VText>
      </Enter>
      <Enter index={2} style={styles.search}>
        <EventIcon name="search" size={18} color={colors.muted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={`${t('search.placeholder')}`}
          placeholderTextColor={colors.muted}
          allowFontScaling
          maxFontSizeMultiplier={MAX_FONT_SCALE.text}
          returnKeyType="search"
          autoCorrect={false}
          accessibilityLabel={`${t('search.placeholder')}`}
          style={styles.searchInput}
          testID="organizations-search"
        />
        {!!query && (
          <Pressable
            onPress={() => setQuery('')}
            // 24pt circle, 44pt to the finger
            hitSlop={10}
            style={styles.clear}
            accessibilityRole="button"
            accessibilityLabel={`${t('search.clear')}`}
            testID="organizations-search-clear"
          >
            <EventIcon name="close" size={12} color={colors.white} strokeWidth={3} />
          </Pressable>
        )}
      </Enter>
    </View>
  );

  const renderEmpty = () => {
    if (isFetching && !isRefetching && !items.length) {
      return <OrganizationSkeleton />;
    }
    if (error) {
      return (
        <EmptyState
          title={`${t('errors.generic')}`}
          error
          actionLabel={`${t('events:retry')}`}
          onAction={reload}
        />
      );
    }
    return (
      <EmptyState
        title={`${t('empty.title')}`}
        description={`${t('empty.description')}`}
        testID="organizations-empty"
      />
    );
  };

  return (
    <View style={styles.screen}>
      <Animated.FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={header}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={
          isFetchingNextPage ? <ActivityIndicator color={colors.navy} style={styles.more} /> : null
        }
        onScroll={onScroll}
        scrollEventThrottle={16}
        onEndReached={() => hasNextPage && !isFetching && fetchNextPage()}
        onEndReachedThreshold={0.4}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={reload}
            progressViewOffset={headerHeight}
          />
        }
        contentContainerStyle={[
          styles.list,
          { paddingTop: headerHeight + 8, paddingBottom: bottomInset },
        ]}
        showsVerticalScrollIndicator={false}
        testID="organizations-list"
      />
      <Animated.View
        testID="organizations-header"
        style={[styles.pinnedHeader, { paddingTop: insets.top + 12 }, headerShadow]}
        onLayout={(e) => setMeasuredHeaderHeight(e.nativeEvent.layout.height)}
      >
        <View style={styles.topRow}>
          {navigation.canGoBack() && (
            <BackButton
              onPress={navigation.goBack}
              accessibilityLabel={`${t('general:back')}`}
              testID="organizations-back"
            />
          )}
          <VText
            variant="h2"
            accessibilityRole="header"
            maxFontSizeMultiplier={MAX_FONT_SCALE.title}
            style={styles.heading}
          >
            {t('heading')}
          </VText>
          {total !== undefined && <VText variant="cap">{t('count', { n: total })}</VText>}
        </View>
      </Animated.View>
      <StatusBarScrim />
    </View>
  );
};

export default Organizations;

const styles = StyleSheet.create({
  meta: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  screen: { flex: 1, backgroundColor: colors.canvas },
  list: { paddingHorizontal: spacing.gutter, flexGrow: 1 },
  header: { paddingBottom: 6 },
  pinnedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 4,
    backgroundColor: colors.canvas,
    paddingHorizontal: spacing.gutter,
    paddingBottom: 6,
    shadowColor: '#000',
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 6 },
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 44,
  },
  heading: { flex: 1 },
  subtitle: { marginBottom: 16 },
  // a white field on paper (handbook .field), radius 18
  search: {
    height: 52,
    borderRadius: 18,
    backgroundColor: colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
  },
  searchInput: { flex: 1, fontFamily: fonts.regular, fontSize: 15, color: colors.ink, padding: 0 },
  clear: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.grab,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  rowText: { flex: 1, gap: 2, minWidth: 0 },
  more: { paddingVertical: 20 },
});
