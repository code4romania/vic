import React from 'react';
import { Text } from '@ui-kitten/components';
import ModalLayout from '../layouts/ModalLayout';
import i18n from '../common/config/i18n';

const EditVolunteer = ({ navigation }: any) => {
  console.log('EditVolunteer');

  return (
    <ModalLayout
      title={i18n.t('general:edit', { item: i18n.t('tabs:volunteer').toLowerCase() })}
      onDismiss={navigation.goBack}
    >
      <Text category="h1">Editeaza Voluntar</Text>
    </ModalLayout>
  );
};

export default EditVolunteer;
