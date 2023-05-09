import React from 'react';
import PageLayout from '../layouts/PageLayout';
import { Button } from '@ui-kitten/components';
import i18n from '../common/config/i18n';

const ForgotPassword = ({ navigation }: any) => {
  const onContinueButtonPress = () => {
    console.log('continue');
  };

  return (
    <PageLayout title={i18n.t('login:reset_password')} onBackButtonPress={navigation.goBack}>
      <Button onPress={onContinueButtonPress}>Next</Button>
    </PageLayout>
  );
};

export default ForgotPassword;
