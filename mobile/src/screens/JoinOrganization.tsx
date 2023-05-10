import React from 'react';
import PageLayout from '../layouts/PageLayout';
import { Text } from '@ui-kitten/components';
import i18n from '../common/config/i18n';

const JoinOrganization = ({ navigation }: any) => {
  console.log('JoinOrganization');

  return (
    <PageLayout title={i18n.t('general:join')} onBackButtonPress={navigation.goBack}>
      <Text category="h1">JoinOrganization</Text>
    </PageLayout>
  );
};

export default JoinOrganization;
