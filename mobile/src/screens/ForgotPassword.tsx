import React from 'react';
import PageLayout from '../layouts/PageLayout';
import { Button } from '@ui-kitten/components';
import { useTranslation } from 'react-i18next';

const ForgotPassword = ({ navigation }: any) => {
  const { t } = useTranslation('login');

  const onContinueButtonPress = () => {
    console.log('continue');
  };

  return (
    <PageLayout title={t('reset_password')} onBackButtonPress={navigation.goBack}>
      <Button onPress={onContinueButtonPress}>Next</Button>
    </PageLayout>
  );
};

export default ForgotPassword;
