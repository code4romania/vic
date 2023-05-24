import { Divider, List, StyleService, Text, Spinner } from '@ui-kitten/components';
import React from 'react';
import { mapPagesToItems } from '../common/utils/helpers';
import { IPaginatedEntity } from '../common/interfaces/paginated-entity.interface';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

const ListEmptyComponent = () => {
  const { t } = useTranslation('general');

  return (
    <View style={styles.emptyListContainer}>
      <Text category="c1">{`${t('empty_list')}`}</Text>
    </View>
  );
};

const ListErrorComponent = ({ errorMessage }: { errorMessage: string }) => {
  return (
    <View style={styles.emptyListContainer}>
      <Text category="c1">{errorMessage}</Text>
    </View>
  );
};

const LoadingComponent = () => (
  <View style={styles.loadingContainer}>
    <Spinner />
  </View>
);

interface InfiniteListLayoutProps<T> {
  pages?: IPaginatedEntity<T>[];
  renderItem: any;
  isLoading?: boolean;
  errorMessage?: string;
  refetch?: () => void;
  loadMore: () => void;
}

const InfiniteListLayout = <T extends object>({
  pages,
  renderItem,
  loadMore,
  errorMessage,
  isLoading,
  refetch,
}: InfiniteListLayoutProps<T>) =>
  isLoading ? (
    <LoadingComponent />
  ) : (
    <List
      data={mapPagesToItems<T>(pages || [])}
      renderItem={renderItem}
      style={styles.list}
      ItemSeparatorComponent={Divider}
      onEndReached={loadMore}
      onEndReachedThreshold={0.1}
      showsVerticalScrollIndicator={false}
      refreshing={isLoading}
      onRefresh={refetch}
      ListEmptyComponent={!errorMessage ? ListEmptyComponent : <></>}
      ListFooterComponent={
        errorMessage ? <ListErrorComponent errorMessage={errorMessage} /> : <></>
      }
    />
  );

const styles = StyleService.create({
  list: {
    backgroundColor: '$text-control-color',
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 150,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default InfiniteListLayout;
