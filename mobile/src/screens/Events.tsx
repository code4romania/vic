import React from 'react';
import PageLayout from '../layouts/PageLayout';
import { Button, Text } from '@ui-kitten/components';

const Events = ({ navigation }: any) => {
  console.log('Events');

  const onViewEventButtonPress = () => {
    navigation.navigate('event');
  };

  return (
    <PageLayout title="Events">
      <Text category="h1">Events</Text>
      <Button onPress={onViewEventButtonPress}>View Event</Button>
    </PageLayout>
  );
};

export default Events;
