import React from 'react';
import PageLayout from '../layouts/PageLayout';
import { Button, Text } from '@ui-kitten/components';

const ActivityLogs = ({ navigation }: any) => {
  console.log('ActivityLogs');

  const onAddActivityLogButtonPress = () => {
    navigation.navigate('add-activity-log');
  };

  const onViewActivityLogButtonPress = () => {
    navigation.navigate('view-activity-log');
  };

  return (
    <PageLayout title="Ore de voluntariar" onBackButtonPress={navigation.goBack}>
      <Text category="h1">ActivityLogs</Text>
      <Button onPress={onAddActivityLogButtonPress}>Add</Button>
      <Button onPress={onViewActivityLogButtonPress}>View</Button>
    </PageLayout>
  );
};

export default ActivityLogs;