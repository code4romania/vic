import React, { useCallback, useMemo } from 'react';
import { ActivityIndicator, RefreshControl, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { IContractListItem } from '../../common/interfaces/contract-list-item.interface';
import { colors, shadows, spacing } from '../../common/theme/tokens';
import { useFocusedStatusBarStyle } from '../../hooks/useFocusedStatusBarStyle';
import { EventIcon } from '../events/EventIcons';
import DocumentSkeletonList from '../skeleton/documents-skeleton-list';
import { EmptyState, Enter, PressableScale, StatusBarScrim, VText } from '../ui';
import { DocumentRow } from './DocumentRow';
import { useDownloadContract } from './useDownloadContract';

export interface ContractsListPageProps {
  navigation: any;
  title: string;
  query: {
    data?: { pages: { items: IContractListItem[] }[] };
    error: unknown;
    isFetching: boolean;
    isFetchingNextPage: boolean;
    hasNextPage?: boolean;
    fetchNextPage: () => unknown;
    refetch: () => unknown;
  };
  testID?: string;
}

/** "Vezi toate" from Documente: every contract of the active organization (#486). */
export const ContractsListPage = ({ navigation, title, query, testID }: ContractsListPageProps) => {
  const { t } = useTranslation('documents');
  const insets = useSafeAreaInsets();
  useFocusedStatusBarStyle('dark');
  const { downloadingId, download } = useDownloadContract();
  const { data, error, isFetching, isFetchingNextPage, hasNextPage, fetchNextPage, refetch } =
    query;

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  const items = useMemo(() => (data?.pages ?? []).flatMap((page) => page.items), [data]);

  const onPress = download;

  const renderEmpty = () => {
    if (isFetching && !items.length) {
      return <DocumentSkeletonList />;
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
    return <EmptyState title={`${t('empty.title')}`} description={`${t('empty.description')}`} />;
  };

  return (
    <View style={styles.screen}>
      <Animated.FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <Enter index={Math.min(index, 6)}>
            <DocumentRow contract={item} onPress={onPress} busy={downloadingId === item.id} />
          </Enter>
        )}
        ListHeaderComponent={
          <View style={styles.header}>
            <PressableScale
              onPress={navigation.goBack}
              style={[styles.back, shadows.back]}
              accessibilityLabel={`${t('general:back')}`}
              testID="contracts-back"
            >
              <EventIcon name="back" size={20} />
            </PressableScale>
            <Enter>
              <VText variant="largeTitle" accessibilityRole="header" style={styles.title}>
                {title}
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
        refreshControl={
          <RefreshControl refreshing={isFetching && !!items.length} onRefresh={() => refetch()} />
        }
        contentContainerStyle={[
          styles.list,
          { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 24 },
        ]}
        showsVerticalScrollIndicator={false}
        testID={testID}
      />
      <StatusBarScrim color={colors.white} />
    </View>
  );
};

export default ContractsListPage;

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.white },
  list: { paddingHorizontal: spacing.gutter, flexGrow: 1 },
  header: { paddingBottom: 8 },
  back: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { marginTop: 16 },
  more: { paddingVertical: 20 },
});
