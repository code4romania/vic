import React from 'react';
import { Button, Text } from '@ui-kitten/components';
import ModalLayout from '../layouts/ModalLayout';

const ActivityLog = ({ navigation }: any) => {
  console.log('ActivityLog');

  const onEditActivityLog = () => {
    navigation.navigate('edit-activity-log');
  };

  return (
    <ModalLayout title="Activity Log" onDismiss={navigation.goBack}>
      <Text category="h1">ActivityLog</Text>
      <Button onPress={onEditActivityLog}>Edit</Button>
    </ModalLayout>
  );
};

export default ActivityLog;
