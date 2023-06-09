import React from 'react';
import PageLayout from '../layouts/PageLayout';
import { Text } from '@ui-kitten/components';
import { useTranslation } from 'react-i18next';

const PrivacyPolicy = ({ navigation }: any) => {
  const { t } = useTranslation('privacy_policy');

  return (
    <PageLayout title={t('privacy_policy:title')} onBackButtonPress={navigation.goBack}>
      <Text>This is where privacy policy will be</Text>
    </PageLayout>
  );
};

export default PrivacyPolicy;
