import React from 'react';
import PageLayout from '../layouts/PageLayout';
import { Text } from '@ui-kitten/components';
import i18n from '../common/config/i18n';

const JoinEvent = ({ navigation }: any) => {
  console.log('JoinEvent');

  return (
    <PageLayout title={i18n.t('event:join')} onBackButtonPress={navigation.goBack}>
      <Text category="h1">JoinEvent</Text>
    </PageLayout>
  );
};

export default JoinEvent;
