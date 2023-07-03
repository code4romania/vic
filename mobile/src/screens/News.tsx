import React from 'react';
import PageLayout from '../layouts/PageLayout';
import { VirtualizedList, View, StyleSheet } from 'react-native';
import NewsListItem from '../components/NewsListItem';
import i18n from '../common/config/i18n';

const Separator = () => <View style={styles.separator} />;

const News = ({ navigation }: any) => {
  console.log('News');

  const getItem = (data: unknown, index: number) => {
    console.log('data', data);
    return {
      id: Math.random().toString(12).substring(0),
      title: `Item ${index + 1}`,
    };
  };

  const getItemCount = (data: unknown) => {
    console.log('data', data);
    return 50;
  };

  const renderItem = ({ item }: { item: unknown }) => {
    console.log('item', item);
    return (
      <NewsListItem
        icon={''}
        title="Important! Ne vedem maine la 10!"
        subtitle="La 10:30 este plecarea, nu intarziati!"
      />
    );
  };

  return (
    <PageLayout title={i18n.t('general:news')} onBackButtonPress={navigation.goBack}>
      <VirtualizedList
        getItem={getItem}
        getItemCount={getItemCount}
        renderItem={renderItem}
        ItemSeparatorComponent={Separator}
        style={styles.virtualizedList}
      />
    </PageLayout>
  );
};

const styles = StyleSheet.create({
  separator: {
    height: 16,
  },
  virtualizedList: {
    width: '100%',
    paddingHorizontal: 16,
  },
});

export default News;
