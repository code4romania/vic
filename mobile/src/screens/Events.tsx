import React from 'react';
import PageLayout from '../layouts/PageLayout';
import { Button, Text } from '@ui-kitten/components';
import i18n from '../common/config/i18n';

const Events = ({ navigation }: any) => {
  console.log('Events');

  const onViewEventButtonPress = () => {
    navigation.navigate('event');
  };

  return (
    <PageLayout title={i18n.t('tabs:events')}>
      <Text category="h1">Events</Text>
      <Button onPress={onViewEventButtonPress}>View Event</Button>
    </PageLayout>
  );
};

export default Events;
