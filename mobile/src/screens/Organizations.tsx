import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { OrderDirection } from '../common/enums/order-direction.enum';
import { IOrganizationListItemWithNumberOfVolunteers } from '../common/interfaces/organization-list-item.interface';
import { ALLOW_FONT_SCALLING } from '../common/constants/constants';
import { colors, fonts, shadows, spacing } from '../common/theme/tokens';
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
  Badge,
  Chevron,
  EmptyState,
  Enter,
  groupedItem,
  PressableScale,
  StatusBarScrim,
  VText,
} from '../components/ui';
import OrganizationSkeleton from '../components/skeleton/organization-skeleton';

const SEARCH_DEBOUNCE_MS = 300;

/**
 * VIC 2.0 Organizații (canvas board "Organizații"): large title, a search that filters as you
 * type, and rows with the logo, the number of volunteers and "Membru" for your organizations.
 */
const Organizations = ({ navigation }: any) => {
  const { t } = useTranslation('organizations');
  const insets = useSafeAreaInsets();
  const bottomInset = useGlassTabBarInset();
  useFocusedStatusBarStyle('dark');
  const onScroll = useTabBarScroll();

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
          <VText variant="h3" numberOfLines={1}>
            {item.name}
          </VText>
          <VText variant="cap">
            {t('organization_profile:volunteers', { number: item.numberOfVolunteers })}
          </VText>
        </View>
        {memberOf.has(item.id) && <Badge label={`${t('member')}`} tone="neutral" />}
        <Chevron />
      </PressableScale>
    </Enter>
  );

  const header = (
    <View style={styles.header}>
      <View style={styles.topRow}>
        {navigation.canGoBack() ? (
          <PressableScale
            onPress={navigation.goBack}
            style={[styles.back, shadows.back]}
            accessibilityLabel={`${t('general:back')}`}
            testID="organizations-back"
          >
            <EventIcon name="back" size={20} />
          </PressableScale>
        ) : (
          <View />
        )}
        {total !== undefined && <VText variant="cap">{t('count', { n: total })}</VText>}
      </View>
      <Enter>
        <VText variant="largeTitle" accessibilityRole="header" style={styles.title}>
          {t('heading')}
        </VText>
      </Enter>
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
          allowFontScaling={ALLOW_FONT_SCALLING}
          returnKeyType="search"
          autoCorrect={false}
          accessibilityLabel={`${t('search.placeholder')}`}
          style={styles.searchInput}
          testID="organizations-search"
        />
        {!!query && (
          <Pressable
            onPress={() => setQuery('')}
            hitSlop={8}
            style={styles.clear}
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
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={reload} />}
        contentContainerStyle={[
          styles.list,
          { paddingTop: insets.top + 12, paddingBottom: bottomInset },
        ]}
        showsVerticalScrollIndicator={false}
        testID="organizations-list"
      />
      <StatusBarScrim />
    </View>
  );
};

export default Organizations;

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  list: { paddingHorizontal: spacing.gutter, flexGrow: 1 },
  header: { paddingBottom: 6 },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 40,
  },
  back: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { marginTop: 16 },
  subtitle: { marginTop: 4, marginBottom: 16 },
  search: {
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.soft,
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
