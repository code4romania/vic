import React from 'react';
import { Text } from '@ui-kitten/components';
import ModalLayout from '../layouts/ModalLayout';

const EditActivityLog = ({ navigation }: any) => {
  console.log('EditActivityLog');

  return (
    <ModalLayout title="Edit Log" onDismiss={navigation.goBack}>
      <Text category="h1">EditActivityLog</Text>
    </ModalLayout>
  );
};

export default EditActivityLog;
