import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, RefreshControl, StyleSheet, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useContractHistoryInfiniteQuery } from '../services/contract/contract.service';
import { colors, shadows, spacing } from '../common/theme/tokens';
import { useUserProfile } from '../store/profile/profile.selector';
import { useFocusedStatusBarStyle } from '../hooks/useFocusedStatusBarStyle';
import { MAX_FONT_SCALE } from '../common/constants/constants';
import { isTabRoute } from '../routes/tab-routes';
import { useTabBarScroll } from '../components/navigation/TabBarScroll';
import { useGlassTabBarInset } from '../components/navigation/GlassTabBar';
import { EventIcon } from '../components/events/EventIcons';
import { DocumentRow } from '../components/documents/DocumentRow';
import { useDownloadContract } from '../components/documents/useDownloadContract';
import DocumentSkeletonList from '../components/skeleton/documents-skeleton-list';
import {
  EmptyState,
  Enter,
  groupedItem,
  PressableScale,
  StatusBarScrim,
  VText,
} from '../components/ui';

/**
 * VIC 2.0 Documente (canvas board "Documente"): the contracts the organization uploaded for the
 * volunteer (#486), with their status (#488). Each one downloads as a file.
 */
const Documents = ({ navigation, route }: any) => {
  const { t } = useTranslation('documents');
  const insets = useSafeAreaInsets();
  const bottomInset = useGlassTabBarInset();
  useFocusedStatusBarStyle('dark');
  const scrollY = useSharedValue(0);
  const onScroll = useTabBarScroll(scrollY);
  const [measuredHeaderHeight, setMeasuredHeaderHeight] = useState(0);
  const { userProfile } = useUserProfile();
  const organization = userProfile?.activeOrganization;
  const volunteerId: string | undefined = route.params?.volunteerId || organization?.volunteerId;
  const { downloadingId, download } = useDownloadContract();

  // Before layout: safe area + top padding + back button + title margins/line + subtitle + bottom.
  const headerHeight =
    measuredHeaderHeight ||
    insets.top + 12 + (isTabRoute(route) ? 16 + 38 : 40) + 4 + (organization ? 20 : 0) + 6;
  const headerShadow = useAnimatedStyle(() => ({
    shadowOpacity: interpolate(scrollY.value, [0, 12], [0, 0.06], Extrapolation.CLAMP),
  }));

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
      return <DocumentSkeletonList />;
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

  return (
    <View style={styles.screen} testID="documents">
      <Animated.FlatList
        data={items}
        keyExtractor={(item) => item.id}
        extraData={downloadingId}
        renderItem={({ item, index }) => (
          <View style={groupedItem(index, items.length)}>
            <DocumentRow
              contract={item}
              onPress={download}
              busy={downloadingId === item.id}
              divider={index < items.length - 1}
            />
          </View>
        )}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={
          history.hasNextPage && history.isFetchingNextPage ? (
            <View style={styles.more}>
              <ActivityIndicator size="small" color={colors.navy} testID="documents-loading-more" />
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
            progressViewOffset={headerHeight}
          />
        }
        contentContainerStyle={[
          styles.content,
          // Header includes 6pt bottom padding; 6 + 18 keeps the old 24pt gap above the first row.
          // Empty, error and loading states sit right under the subtitle, as before.
          { paddingTop: headerHeight + (items.length ? 18 : 0), paddingBottom: bottomInset },
        ]}
        showsVerticalScrollIndicator={false}
        testID="documents-list"
      />
      <Animated.View
        testID="documents-header"
        style={[styles.header, { paddingTop: insets.top + 12 }, headerShadow]}
        onLayout={(e) => setMeasuredHeaderHeight(e.nativeEvent.layout.height)}
      >
        {/* Opened from the volunteer page: the back button joins the title row and the title
            drops to h2, as on Organizații and Ore. As a tab: large title, no back button. */}
        <Enter style={styles.titleRow}>
          {!isTabRoute(route) && (
            <PressableScale
              onPress={navigation.goBack}
              style={[styles.back, shadows.back]}
              accessibilityLabel={`${t('general:back')}`}
              testID="documents-back"
            >
              <EventIcon name="back" size={20} />
            </PressableScale>
          )}
          <VText
            variant={isTabRoute(route) ? 'largeTitle' : 'h2'}
            accessibilityRole="header"
            numberOfLines={isTabRoute(route) ? undefined : 1}
            maxFontSizeMultiplier={isTabRoute(route) ? undefined : MAX_FONT_SCALE.title}
            style={isTabRoute(route) ? styles.title : styles.compactTitle}
          >
            {t('general:documents')}
          </VText>
        </Enter>
        {!!organization && (
          <Enter index={1}>
            {/* with the back button, start under the title text, not under the button */}
            <VText variant="sub" style={!isTabRoute(route) && styles.subtitleAfterBack}>
              {t('activity_logs:at', { name: organization.name })}
            </VText>
          </Enter>
        )}
      </Animated.View>
      <StatusBarScrim />
    </View>
  );
};

export default Documents;

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  content: { paddingHorizontal: spacing.gutter, flexGrow: 1 },
  back: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  title: { flex: 1, marginTop: 16, marginBottom: 4 },
  compactTitle: { flex: 1, marginBottom: 4 },
  // back button (40) + titleRow gap (12)
  subtitleAfterBack: { marginLeft: 52 },
  header: {
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
  more: { paddingVertical: 20, alignItems: 'center', justifyContent: 'center' },
});
