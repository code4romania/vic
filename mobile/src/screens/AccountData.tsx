import React from 'react';
import { Text } from '@ui-kitten/components';
import PageLayout from '../layouts/PageLayout';
import i18n from '../common/config/i18n';

const AccountData = ({ navigation }: any) => {
  return (
    <PageLayout title={i18n.t('settings:account')} onBackButtonPress={navigation.goBack}>
      <Text category="h1">Account Data</Text>
    </PageLayout>
  );
};

export default AccountData;
