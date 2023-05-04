import React, { useState } from 'react';
import PageLayout from '../layouts/PageLayout';
import { Button, Text } from '@ui-kitten/components';
import BottomSheet from '../components/BottomSheet';

const Events = ({ navigation }: any) => {
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  console.log('Events');

  const onViewEventButtonPress = () => {
    navigation.navigate('event');
  };

  return (
    <PageLayout title="Events">
      <Text category="h1">Events</Text>
      <Button onPress={onViewEventButtonPress}>View Event</Button>
      <Button onPress={() => setShowBottomSheet(true)}>Show bottom sheet</Button>
      {showBottomSheet && (
        <BottomSheet onDismiss={() => setShowBottomSheet(false)}>
          <Text>Orice text</Text>
        </BottomSheet>
      )}
    </PageLayout>
  );
};

export default Events;
