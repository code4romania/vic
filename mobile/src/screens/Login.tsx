import React from 'react';
import PageLayout from '../layouts/PageLayout';
import { Text, Button } from '@ui-kitten/components';
import { useAuth } from '../hooks/useAuth';

const Login = ({ navigation }: any) => {
  console.log('Login');
  const { login } = useAuth();

  const onForgotPasswordButtonPress = () => {
    navigation.navigate('forgot-password');
  };

  return (
    <PageLayout title="Login" onBackButtonPress={navigation.goBack}>
      <Text category="h2">Login</Text>
      <Button onPress={login}>Login</Button>
      <Button onPress={onForgotPasswordButtonPress}>Forgot Password</Button>
    </PageLayout>
  );
};

export default Login;
