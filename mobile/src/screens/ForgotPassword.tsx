import React from 'react';
import PageLayout from '../layouts/PageLayout';
import { Button } from '@ui-kitten/components';

const ForgotPassword = ({ navigation }: any) => {
  const onContinueButtonPress = () => {
    console.log('continue');
  };

  return (
    <PageLayout title="Reset password" onBackButtonPress={navigation.goBack}>
      <Button onPress={onContinueButtonPress}>Next</Button>
    </PageLayout>
  );
};

export default ForgotPassword;
