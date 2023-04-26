import React from 'react';
import { Text } from '@ui-kitten/components';
import ModalLayout from '../layouts/ModalLayout';

const LeaveOrganization = ({ navigation }: any) => {
  console.log('LeaveOrganization');

  return (
    <ModalLayout title="Leave Organization" onDismiss={navigation.goBack}>
      <Text category="h1">Leave Organization</Text>
    </ModalLayout>
  );
};

export default LeaveOrganization;
