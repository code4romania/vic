import React from 'react';
import PageLayout from '../layouts/PageLayout';
import { Button, Text } from '@ui-kitten/components';
import i18n from '../common/config/i18n';

const Event = ({ navigation }: any) => {
  console.log('Event');

  const onJoinEventButtonPress = () => {
    navigation.navigate('join-event');
  };

  return (
    <PageLayout title={i18n.t('event:details')} onBackButtonPress={navigation.goBack}>
      <Text category="h1">Event</Text>
      <Button onPress={onJoinEventButtonPress}>Join</Button>
    </PageLayout>
  );
};

export default Event;
