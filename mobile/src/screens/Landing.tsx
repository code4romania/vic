import React from 'react';
import PageLayout from '../layouts/PageLayout';
import { Button, Text } from '@ui-kitten/components';

const Landing = ({ navigation }: any) => {
  console.log('Landing');
  const onLoginButtonPress = () => {
    navigation.navigate('login');
  };

  const onRegisterButtonPress = () => {
    navigation.navigate('create-account');
  };

  return (
    <PageLayout title="">
      <Text category="h2">Landing</Text>
      <Button onPress={onLoginButtonPress}>Go to Login</Button>
      <Button onPress={onRegisterButtonPress}>Go to Register</Button>
    </PageLayout>
  );
};

export default Landing;
