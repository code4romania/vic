import React from 'react';
import { Text } from '@ui-kitten/components';
import ModalLayout from '../layouts/ModalLayout';

const AddActivityLog = ({ navigation }: any) => {
  console.log('AddActivityLog');

  return (
    <ModalLayout title="Add Log" onDismiss={navigation.goBack}>
      <Text category="h1">AddActivityLog</Text>
    </ModalLayout>
  );
};

export default AddActivityLog;
