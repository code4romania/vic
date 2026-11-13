import React, { useMemo } from 'react';
import { ActivityIndicator, RefreshControl, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useAnouncementsInfiniteQuery } from '../services/anouncement/anouncement.service';
import { IAnouncement } from '../common/interfaces/anouncement.interface';
import { colors, fonts, radius, spacing } from '../common/theme/tokens';
import { useFocusedStatusBarStyle } from '../hooks/useFocusedStatusBarStyle';
import NewsItemSkeleton from '../components/skeleton/news-item.skeleton';
import { formatPostedAt } from '../common/utils/event-format';
import { Avatar, EmptyState, Enter, StatusBarScrim, VText } from '../components/ui';
import { BackButton } from '../components/ui/ScreenChrome';

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

  const renderItem = ({ item, index }: { item: IAnouncement; index: number }) => {
    // who posted it and when: a volunteer in several organizations tells them apart
    const organizationName = item.organization?.name;
    const postedAt = formatPostedAt(item.publishedOn || item.createdOn);
    return (
      <Enter index={Math.min(index, 6)} style={styles.card} testID={`anouncement-${item.id}`}>
        <View style={styles.cardHead}>
          <Avatar
            name={organizationName || item.title}
            uri={item.organization?.logo || item.organizationLogo}
            size={36}
            shape="rounded"
          />
          <View style={styles.cardSource}>
            {!!organizationName && (
              <VText variant="label" numberOfLines={2}>
                {organizationName}
              </VText>
            )}
            {!!postedAt && <VText variant="cap">{postedAt}</VText>}
          </View>
        </View>
        <VText variant="h3">{item.title}</VText>
        <VText variant="body">{item.description}</VText>
        {item.myResponse ? (
          <View style={styles.answer}>
            <VText variant="cap">{tResponse('your_answer')}</VText>
            <VText variant="body">{item.myResponse.comment}</VText>
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
  };

  const renderEmpty = () => {
    if (isFetching && !isRefetching && !items.length) {
      return <NewsItemSkeleton />;
    }
    if (error) {
      return (
        <EmptyState
          title={`${t('errors.generic')}`}
          error
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
            <BackButton
              onPress={navigation.goBack}
              accessibilityLabel={`${t('back')}`}
              testID="anouncements-back"
            />
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
  screen: { flex: 1, backgroundColor: colors.canvas },
  list: { paddingHorizontal: spacing.gutter, flexGrow: 1, gap: 12 },
  header: { paddingBottom: 8, gap: 16 },
  card: {
    borderRadius: radius.card,
    backgroundColor: colors.white,
    padding: 16,
    gap: 10,
  },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  cardSource: { flex: 1, minWidth: 0, gap: 2 },
  answer: {
    borderRadius: radius.button,
    backgroundColor: colors.navyTint,
    padding: 12,
    gap: 4,
  },
  link: { fontFamily: fonts.bold, textDecorationLine: 'underline' },
  more: { paddingVertical: 20 },
});
