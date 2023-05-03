import React from 'react';
import PageLayout from '../layouts/PageLayout';
import { Button } from '@ui-kitten/components';
import i18n from '../common/config/i18n';

const CreateAccount = ({ navigation }: any) => {
  const onContinueButtonPress = () => {
    console.log('continue');
  };

  return (
    <PageLayout title={i18n.t('register:title')} onBackButtonPress={navigation.goBack}>
      <Button onPress={onContinueButtonPress}>Next</Button>
    </PageLayout>
  );
};

export default CreateAccount;
