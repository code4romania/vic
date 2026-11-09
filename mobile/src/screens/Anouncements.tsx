import React from 'react';
import PageLayout from '../layouts/PageLayout';
import NewsListItem from '../components/NewsListItem';
import InfiniteListLayout from '../layouts/InfiniteListLayout';
import { IAnouncement } from '../common/interfaces/anouncement.interface';
import { useAnouncementsInfiniteQuery } from '../services/anouncement/anouncement.service';
import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import NewsItemSkeleton from '../components/skeleton/news-item.skeleton';
import { usePaddingTop } from '../hooks/usePaddingTop';
import { Text } from '@ui-kitten/components';
import InlineLink from '../components/InlineLink';
import { ALLOW_FONT_SCALLING } from '../common/constants/constants';

const Anouncements = ({ navigation }: any) => {
  const { t } = useTranslation('general');
  const { t: tResponse } = useTranslation('anouncement_response');
  const paddingTop = usePaddingTop();

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
      {/* #504: answer once; then the answer is shown */}
      <View style={styles.response}>
        {item.myResponse ? (
          <Text
            allowFontScaling={ALLOW_FONT_SCALLING}
            category="c1"
            appearance="hint"
            numberOfLines={2}
          >
            {`${tResponse('responded', { comment: item.myResponse.comment })}`}
          </Text>
        ) : (
          <InlineLink
            label={tResponse('respond')}
            onPress={() =>
              navigation.navigate('anouncement-response', {
                anouncementId: item.id,
                title: item.title,
              })
            }
          />
        )}
      </View>
    </View>
  );

  return (
    <PageLayout
      title={t('news')}
      onBackButtonPress={navigation.goBack}
      headerStyle={{ paddingTop }}
    >
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
  response: {
    paddingTop: 8,
    paddingHorizontal: 16,
  },
});
