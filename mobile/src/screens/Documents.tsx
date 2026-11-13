import React, { useCallback, useMemo } from 'react';
import { ActivityIndicator, RefreshControl, View } from 'react-native';
import Animated, { useReducedMotion, useSharedValue } from 'react-native-reanimated';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native-unistyles';
import { useContractHistoryInfiniteQuery } from '../services/contract/contract.service';
import { useUserProfile } from '../store/profile/profile.selector';
import { useFocusedStatusBarStyle } from '../hooks/useFocusedStatusBarStyle';
import { isTabRoute } from '../routes/tab-routes';
import { useTabBarScroll } from '../components/navigation/TabBarScroll';
import { useGlassTabBarInset } from '../components/navigation/GlassTabBar';
import {
  DocumentRow,
  FeaturedContract,
  pickExpiringSoon,
} from '../components/documents/DocumentRow';
import { useDownloadContract } from '../components/documents/useDownloadContract';
import { BackButton, CompactTitleBar } from '../components/ui/ScreenChrome';
import { EmptyState } from '../components/ui';
import { AppText } from '../design/components/Text';
import { enter } from '../design/motion';
import { palette } from '../design/tokens';

/** Three white cards in the shape of contract rows while the first page loads. */
const DocumentsSkeleton = () => (
  <View style={styles.skeleton} testID="documents-loading">
    {[0, 1, 2].map((key) => (
      <View key={key} style={styles.skeletonRow}>
        <View style={[styles.skeletonLine, styles.skeletonTitle]} />
        <View style={[styles.skeletonLine, styles.skeletonPeriod]} />
        <View style={styles.skeletonBar} />
      </View>
    ))}
  </View>
);

/**
 * Documente „Îndrăzneț” (handbook prototype "Documente"): „Contractele tale” as a large title that
 * scrolls away under a compact glass bar; the contract that expires soonest as an orange card with
 * the days left; the others as white rows with a status chip and a validity bar. Contracts load in
 * pages of 15 (#486, #488) and each one downloads as a file.
 */
const Documents = ({ navigation, route }: any) => {
  const { t } = useTranslation('documents');
  const insets = useSafeAreaInsets();
  const bottomInset = useGlassTabBarInset();
  const reduced = useReducedMotion();
  useFocusedStatusBarStyle('dark');
  const scrollY = useSharedValue(0);
  const onScroll = useTabBarScroll(scrollY);
  const { userProfile } = useUserProfile();
  const organization = userProfile?.activeOrganization;
  const volunteerId: string | undefined = route.params?.volunteerId || organization?.volunteerId;
  const { downloadingId, download } = useDownloadContract();
  const isTab = isTabRoute(route);

  const history = useContractHistoryInfiniteQuery(volunteerId);
  const { reloadFirstPage: reloadHistory } = history;

  const reload = useCallback(() => {
    reloadHistory();
  }, [reloadHistory]);

  useFocusEffect(reload);

  const items = useMemo(
    () => (history.data?.pages ?? []).flatMap((page) => page.items),
    [history.data],
  );
  const featured = useMemo(() => pickExpiringSoon(items), [items]);
  const rows = useMemo(
    () => (featured ? items.filter((item) => item.id !== featured.id) : items),
    [items, featured],
  );
  const isLoading = history.isFetching && !history.data;

  const renderEmpty = () => {
    if (!volunteerId) {
      return (
        <EmptyState
          title={`${t('volunteer:no_org_added')}`}
          description={`${t('volunteer:no_org_description')}`}
          actionLabel={`${t('volunteer:join_organization')}`}
          onAction={() => navigation.navigate('search')}
          testID="documents-no-organization"
        />
      );
    }
    if (isLoading) {
      return <DocumentsSkeleton />;
    }
    return (
      <EmptyState
        title={`${history.error ? t('errors.generic') : t('empty.title')}`}
        error={!!history.error}
        description={history.error ? undefined : `${t('empty.description')}`}
        actionLabel={history.error ? `${t('events:retry')}` : undefined}
        onAction={history.error ? reload : undefined}
        testID="documents-empty"
      />
    );
  };

  const header = (
    <>
      <Animated.View
        entering={enter(0, reduced)}
        // handbook .scroll pads 58 (status bar 54 + 4), the title adds 14: safe area + 18
        style={[styles.header, { paddingTop: insets.top + (isTab ? 4 : 12) }]}
        testID="documents-header"
      >
        {/* Opened from the volunteer page: a back button above the title. As a tab: none. */}
        {!isTab && (
          <BackButton onPress={navigation.goBack} testID="documents-back" style={styles.back} />
        )}
        {/* Two lines like the handbook („Contractele<br>tale”): break before the last word. */}
        <AppText
          variant="largeTitle"
          accessibilityRole="header"
          accessibilityLabel={`${t('title_large')}`}
          style={styles.title}
        >
          {`${t('title_large')}`.replace(/ (?=\S+$)/, '\n')}
        </AppText>
        {!!organization && (
          <AppText variant="overline" color={palette.ink2} numberOfLines={2}>
            {t('activity_logs:at', { name: organization.name })}
          </AppText>
        )}
      </Animated.View>
      {featured && (
        <Animated.View entering={enter(1, reduced)} style={styles.featured}>
          <FeaturedContract
            contract={featured}
            onPress={download}
            busy={downloadingId === featured.id}
          />
        </Animated.View>
      )}
    </>
  );

  return (
    <View style={styles.screen} testID="documents">
      <Animated.FlatList
        data={rows}
        keyExtractor={(item) => item.id}
        extraData={downloadingId}
        ListHeaderComponent={header}
        renderItem={({ item, index }) => (
          <Animated.View entering={enter(index + 2, reduced)} style={styles.item}>
            <DocumentRow contract={item} onPress={download} busy={downloadingId === item.id} />
          </Animated.View>
        )}
        ListEmptyComponent={items.length ? null : renderEmpty}
        ListFooterComponent={
          history.hasNextPage && history.isFetchingNextPage ? (
            <View style={styles.more}>
              <ActivityIndicator
                size="small"
                color={palette.navy}
                testID="documents-loading-more"
              />
            </View>
          ) : null
        }
        onEndReached={() => {
          if (history.hasNextPage && !history.isFetchingNextPage && !history.isFetching) {
            history.fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.5}
        onScroll={onScroll}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={!isLoading && history.isRefetching && !history.isFetchingNextPage}
            onRefresh={reload}
            progressViewOffset={insets.top}
          />
        }
        contentContainerStyle={[styles.content, { paddingBottom: bottomInset }]}
        showsVerticalScrollIndicator={false}
        testID="documents-list"
      />
      <CompactTitleBar
        title={`${t('general:documents')}`}
        scrollY={scrollY}
        testID="documents-compact-bar"
      />
    </View>
  );
};

export default Documents;

const styles = StyleSheet.create((theme) => ({
  screen: { flex: 1, backgroundColor: theme.colors.background },
  content: { paddingHorizontal: theme.space.gutter, flexGrow: 1 },
  // handbook .lt margin 14 0 16 before the orange card
  header: { paddingBottom: 16, gap: 4 },
  back: { marginBottom: theme.space.m },
  // handbook .lt: Bricolage 44, line height .96 (42), 14pt above; no font padding on Android
  title: { lineHeight: 42, marginTop: 14, includeFontPadding: false },
  featured: { marginBottom: theme.space.s },
  item: { marginBottom: theme.space.s },
  more: { paddingVertical: 20, alignItems: 'center', justifyContent: 'center' },
  skeleton: { gap: theme.space.s },
  skeletonRow: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.row,
    padding: theme.space.l,
    gap: theme.space.xs,
  },
  skeletonLine: { height: 12, borderRadius: 6, backgroundColor: theme.colors.paper },
  skeletonTitle: { width: '55%', height: 16 },
  skeletonPeriod: { width: '70%' },
  skeletonBar: {
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.paper,
    marginTop: theme.space.xs,
  },
}));
