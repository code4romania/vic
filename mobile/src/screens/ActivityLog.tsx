import React from 'react';
import { Button, Text } from '@ui-kitten/components';
import ModalLayout from '../layouts/ModalLayout';
import i18n from '../common/config/i18n';

const ActivityLog = ({ navigation }: any) => {
  console.log('ActivityLog');

  const onEditActivityLog = () => {
    navigation.navigate('edit-activity-log');
  };

  return (
    <ModalLayout title={i18n.t('activity_log:log')} onDismiss={navigation.goBack}>
      <Text category="h1">ActivityLog</Text>
      <Button onPress={onEditActivityLog}>Edit</Button>
    </ModalLayout>
  );
};

export default ActivityLog;
