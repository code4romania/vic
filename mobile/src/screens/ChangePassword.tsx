import React from 'react';
import { Text } from '@ui-kitten/components';
import PageLayout from '../layouts/PageLayout';
import i18n from '../common/config/i18n';

const ChangePassword = ({ navigation }: any) => {
  return (
    <PageLayout title={i18n.t('settings:password')} onBackButtonPress={navigation.goBack}>
      <Text category="h1">Change Password</Text>
    </PageLayout>
  );
};

export default ChangePassword;
