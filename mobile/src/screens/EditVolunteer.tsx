import React from 'react';
import { Text } from '@ui-kitten/components';
import ModalLayout from '../layouts/ModalLayout';

const EditVolunteer = ({ navigation }: any) => {
  console.log('EditVolunteer');

  return (
    <ModalLayout title="Editeaza Voluntar" onDismiss={navigation.goBack}>
      <Text category="h1">Editeaza Voluntar</Text>
    </ModalLayout>
  );
};

export default EditVolunteer;
