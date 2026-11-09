import React, { useMemo } from 'react';
import { ActivityIndicator, RefreshControl, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useAnouncementsInfiniteQuery } from '../services/anouncement/anouncement.service';
import { IAnouncement } from '../common/interfaces/anouncement.interface';
import { colors, fonts, radius, shadows, spacing } from '../common/theme/tokens';
import { useFocusedStatusBarStyle } from '../hooks/useFocusedStatusBarStyle';
import { EventIcon } from '../components/events/EventIcons';
import NewsItemSkeleton from '../components/skeleton/news-item.skeleton';
import { Avatar, EmptyState, Enter, PressableScale, VText } from '../components/ui';
import { StatusBarScrim } from '../components/ui/StatusBarScrim';

/**
 * VIC 2.0 Anunțuri (canvas board "Anunțuri"): announcements from the volunteer's organizations, each
 * with the answer the volunteer gave (#504) or a link to answer once.
 */
const Anouncements = ({ navigation }: any) => {
  const { t } = useTranslation('general');
  const { t: tResponse } = useTranslation('anouncement_response');
  const insets = useSafeAreaInsets();
  useFocusedStatusBarStyle('dark');

  const {
    data,
    error,
    isFetching,
    fetchNextPage,
    hasNextPage,
    refetch,
    isFetchingNextPage,
    isRefetching,
  } = useAnouncementsInfiniteQuery();

  const items = useMemo(
    () => (data?.pages ?? []).flatMap((page: any) => page.items) as IAnouncement[],
    [data],
  );

  const renderItem = ({ item, index }: { item: IAnouncement; index: number }) => (
    <Enter index={Math.min(index, 6)} style={styles.card} testID={`anouncement-${item.id}`}>
      <View style={styles.cardHead}>
        <Avatar name={item.title} uri={item.organizationLogo} size={36} />
        <VText variant="h3" style={styles.cardTitle}>
          {item.title}
        </VText>
      </View>
      <VText variant="body">{item.description}</VText>
      {item.myResponse ? (
        <View style={styles.answer}>
          <VText variant="cap">{tResponse('your_answer')}</VText>
          <VText variant="body" numberOfLines={3}>
            {item.myResponse.comment}
          </VText>
        </View>
      ) : (
        <VText
          variant="label"
          style={styles.link}
          onPress={() =>
            navigation.navigate('anouncement-response', {
              anouncementId: item.id,
              title: item.title,
            })
          }
          accessibilityRole="button"
          testID={`anouncement-respond-${item.id}`}
        >
          {tResponse('respond')}
        </VText>
      )}
    </Enter>
  );

  const renderEmpty = () => {
    if (isFetching && !isRefetching && !items.length) {
      return <NewsItemSkeleton />;
    }
    if (error) {
      return (
        <EmptyState
          title={`${t('errors.generic')}`}
          actionLabel={`${t('events:retry')}`}
          onAction={() => refetch()}
        />
      );
    }
    return <EmptyState title={`${t('home:anouncements.section.empty_list')}`} />;
  };

  return (
    <View style={styles.screen}>
      <Animated.FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={
          <View style={styles.header}>
            <PressableScale
              onPress={navigation.goBack}
              style={[styles.back, shadows.back]}
              accessibilityLabel={`${t('back')}`}
              testID="anouncements-back"
            >
              <EventIcon name="back" size={20} />
            </PressableScale>
            <Enter>
              <VText variant="largeTitle" accessibilityRole="header">
                {t('home:anouncements.section.title')}
              </VText>
            </Enter>
          </View>
        }
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={
          isFetchingNextPage ? <ActivityIndicator color={colors.navy} style={styles.more} /> : null
        }
        onEndReached={() => hasNextPage && !isFetching && fetchNextPage()}
        onEndReachedThreshold={0.4}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} />}
        contentContainerStyle={[
          styles.list,
          { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 24 },
        ]}
        showsVerticalScrollIndicator={false}
        testID="anouncements"
      />
      <StatusBarScrim />
    </View>
  );
};

export default Anouncements;

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.white },
  list: { paddingHorizontal: spacing.gutter, flexGrow: 1, gap: 12 },
  header: { paddingBottom: 8, gap: 16 },
  back: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    borderRadius: radius.card,
    backgroundColor: colors.soft,
    padding: 16,
    gap: 10,
  },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  cardTitle: { flex: 1 },
  answer: {
    borderRadius: radius.button,
    backgroundColor: colors.white,
    padding: 12,
    gap: 4,
  },
  link: { fontFamily: fonts.bold, textDecorationLine: 'underline' },
  more: { paddingVertical: 20 },
});
