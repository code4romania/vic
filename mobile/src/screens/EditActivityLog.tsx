import React from 'react';
import { Text } from '@ui-kitten/components';
import ModalLayout from '../layouts/ModalLayout';
import i18n from '../common/config/i18n';

const EditActivityLog = ({ navigation }: any) => {
  console.log('EditActivityLog');

  return (
    <ModalLayout title={i18n.t('general:edit', { item: '' })} onDismiss={navigation.goBack}>
      <Text category="h1">EditActivityLog</Text>
    </ModalLayout>
  );
};

export default EditActivityLog;
