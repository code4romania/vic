import React from 'react';
import PageLayout from '../layouts/PageLayout';
import NewsListItem from '../components/NewsListItem';
import i18n from '../common/config/i18n';
import InfiniteListLayout from '../layouts/InfiniteListLayout';
import { IAnouncement } from '../common/interfaces/anouncement.interface';
import { useAnouncementsInfiniteQuery } from '../services/anouncement/anouncement.service';
import { JSONStringifyError } from '../common/utils/utils';
import { View, StyleSheet } from 'react-native';

const Anouncements = ({ navigation }: any) => {
  console.log('Anouncements');

  const {
    data: anouncements,
    error: getAnouncementsError,
    isFetching: isFetchingAnouncements,
    fetchNextPage,
    hasNextPage,
    refetch: reloadAnouncements,
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
    <PageLayout title={i18n.t('general:news')} onBackButtonPress={navigation.goBack}>
      <InfiniteListLayout<IAnouncement>
        pages={anouncements?.pages}
        renderItem={onRenderAnouncementListItem}
        loadMore={onLoadMore}
        isLoading={isFetchingAnouncements}
        refetch={reloadAnouncements}
        hasDivider={false}
        errorMessage={
          getAnouncementsError
            ? `${JSONStringifyError(getAnouncementsError as Error)}`
            : // : `${t('errors.generic')}`
              ''
        }
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
