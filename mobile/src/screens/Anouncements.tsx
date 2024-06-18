import React from 'react';
import PageLayout from '../layouts/PageLayout';
import NewsListItem from '../components/NewsListItem';
import InfiniteListLayout from '../layouts/InfiniteListLayout';
import { IAnouncement } from '../common/interfaces/anouncement.interface';
import { useAnouncementsInfiniteQuery } from '../services/anouncement/anouncement.service';
import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import NewsItemSkeleton from '../components/skeleton/news-item.skeleton';

const Anouncements = ({ navigation }: any) => {
  const { t } = useTranslation('general');

  const {
    data: anouncements,
    error: getAnouncementsError,
    isFetching: isFetchingAnouncements,
    fetchNextPage,
    hasNextPage,
    refetch: reloadAnouncements,
    isFetchingNextPage,
  } = useAnouncementsInfiniteQuery();

  const onLoadMore = () => {
    if (!isFetchingAnouncements && hasNextPage) {
      fetchNextPage();
    }
  };

  const onRenderAnouncementListItem = ({ item }: { item: IAnouncement }) => (
    <View style={styles.listItemContainer}>
      <NewsListItem
        expandable
        icon={item.organizationLogo}
        title={item.title}
        subtitle={item.description}
      />
    </View>
  );

  return (
    <PageLayout title={t('news')} onBackButtonPress={navigation.goBack}>
      <InfiniteListLayout<IAnouncement>
        pages={anouncements?.pages}
        renderItem={onRenderAnouncementListItem}
        loadMore={onLoadMore}
        isLoading={isFetchingAnouncements && !isFetchingNextPage}
        refetch={reloadAnouncements}
        loadingLayout={<NewsItemSkeleton />}
        hasDivider={false}
        errorMessage={getAnouncementsError ? `${t('errors.generic')}` : ''}
      />
    </PageLayout>
  );
};

export default Anouncements;

const styles = StyleSheet.create({
  listItemContainer: {
    paddingBottom: 16,
    paddingHorizontal: 2,
  },
});
