import React from 'react';
import { Text } from '@ui-kitten/components';
import PageLayout from '../layouts/PageLayout';
import i18n from '../common/config/i18n';

const IdentityData = ({ navigation }: any) => {
  return (
    <PageLayout title={i18n.t('settings:identity')} onBackButtonPress={navigation.goBack}>
      <Text category="h1">Identity Data</Text>
    </PageLayout>
  );
};

export default IdentityData;
