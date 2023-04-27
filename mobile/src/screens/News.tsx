import React from 'react';
import PageLayout from '../layouts/PageLayout';
import { VirtualizedList, View, StyleSheet } from 'react-native';
import NewsListItem from '../components/NewsListItem';
import { SvgXml } from 'react-native-svg';
import LogoSvg from '../assets/svg/logo.js';

const Separator = () => <View style={styles.separator} />;

const News = ({ navigation }: any) => {
  console.log('News');

  const getItem = (data, index) => {
    return {
      id: Math.random().toString(12).substring(0),
      title: `Item ${index + 1}`,
    };
  };

  const getItemCount = (data: unknown) => {
    return 50;
  };

  const renderItem = ({ item }) => (
    <NewsListItem
      icon={<SvgXml xml={LogoSvg} width={24} height={24} />}
      title="Important! Ne vedem maine la 10!"
      subtitle="La 10:30 este plecarea, nu intarziati!"
    />
  );

  return (
    <PageLayout title="News" onBackButtonPress={navigation.goBack}>
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
