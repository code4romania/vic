import { Divider, Layout, List, StyleService, Text } from '@ui-kitten/components';
import React, { ReactNode } from 'react';
import { mapPagesToItems } from '../common/utils/helpers';
import { IPaginatedEntity } from '../common/interfaces/paginated-entity.interface';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SvgXml } from 'react-native-svg';
import SadFaceSvg from '../assets/svg/sad-face';

export const ListEmptyComponent = () => {
  const { t } = useTranslation('general');

  return (
    <View style={styles.emptyListContainer}>
      <Text category="c1">{`${t('empty_list')}`}</Text>
    </View>
  );
};

const ListErrorComponent = ({ errorMessage }: { errorMessage: string }) => {
  return (
    <Layout style={styles.listErrorContainer}>
      <SvgXml xml={SadFaceSvg} style={styles.svg} />
      <Text category="h3" style={styles.listError}>
        {errorMessage}
      </Text>
    </Layout>
  );
};

const LoadingComponent = ({
  component,
  loadingElementsCount = 'large',
}: {
  component: ReactNode;
  loadingElementsCount?: 'small' | 'large';
}) => (
  <View style={styles.loadingContainer}>
    {Array.from(Array(loadingElementsCount === 'large' ? 10 : 4).keys()).map((key) => (
      <View key={key}>{component}</View>
    ))}
  </View>
);

interface InfiniteListLayoutProps<T> {
  pages?: IPaginatedEntity<T>[];
  renderItem: any;
  isLoading?: boolean;
  errorMessage?: string;
  hasDivider?: boolean;
  refetch?: () => void;
  loadMore: () => void;
  loadingLayout?: ReactNode;
  loadingElementsCount?: 'small' | 'large';
}

const InfiniteListLayout = <T extends object>({
  pages,
  renderItem,
  loadMore,
  errorMessage,
  isLoading,
  refetch,
  hasDivider = true,
  loadingLayout,
  loadingElementsCount,
}: InfiniteListLayoutProps<T>) => {
  const onRenderDivider = () => (hasDivider ? Divider : () => <></>);

  return isLoading ? (
    <LoadingComponent component={loadingLayout} loadingElementsCount={loadingElementsCount} />
  ) : (
    <List
      data={mapPagesToItems<T>(pages || [])}
      renderItem={renderItem}
      style={styles.list}
      ItemSeparatorComponent={onRenderDivider()}
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
};

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
    flexDirection: 'column',
  },
  listErrorContainer: {
    paddingTop: '25%',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  svg: {
    marginBottom: 50,
  },
  listError: {
    marginBottom: 12,
  },
});

export default InfiniteListLayout;
