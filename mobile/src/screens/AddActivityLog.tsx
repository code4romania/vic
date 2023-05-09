import React from 'react';
import { Text } from '@ui-kitten/components';
import ModalLayout from '../layouts/ModalLayout';
import i18n from '../common/config/i18n';

const AddActivityLog = ({ navigation }: any) => {
  console.log('AddActivityLog');

  return (
    <ModalLayout
      title={i18n.t('general:add', { item: i18n.t('activity_log:title').toLowerCase() })}
      onDismiss={navigation.goBack}
    >
      <Text category="h1">AddActivityLog</Text>
    </ModalLayout>
  );
};

export default AddActivityLog;
