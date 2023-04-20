import React from 'react';
import PageLayout from '../layouts/PageLayout';
import { Text } from '@ui-kitten/components';

const News = ({ navigation }: any) => {
  console.log('News');

  return (
    <PageLayout title="News" onBackButtonPress={navigation.goBack}>
      <Text category="h1">News</Text>
    </PageLayout>
  );
};

export default News;
