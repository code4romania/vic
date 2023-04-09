import React from 'react';
import PageLayout from '../layouts/PageLayout';
import { Button, Text } from '@ui-kitten/components';

const Event = ({ navigation }: any) => {
  console.log('Event');

  const onJoinEventButtonPress = () => {
    navigation.navigate('join-event');
  };

  return (
    <PageLayout title="Eveniment" onBackButtonPress={navigation.goBack}>
      <Text category="h1">Event</Text>
      <Button onPress={onJoinEventButtonPress}>Join</Button>
    </PageLayout>
  );
};

export default Event;
