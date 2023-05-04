import React from 'react';
import PageLayout from '../layouts/PageLayout';
import { Button, Text } from '@ui-kitten/components';
import { Auth } from 'aws-amplify';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Landing = ({ navigation }: any) => {
  console.log('Landing');
  // const onLoginButtonPress = () => {
  //   navigation.navigate('login');
  // };

  const onRegisterButtonPress = () => {
    navigation.navigate('create-account');
  };

  const signUp = async () => {
    try {
      const { user } = await Auth.signUp({
        username: 'birloiflorian@gmail.com',
        password: 'Test1234!',
        // attributes: {
        //   email: 'birloiflorian@gmail.com', // optional
        //   phone_number: '+440765173766', // optional - E.164 number convention
        //   // other custom attributes
        // },
        autoSignIn: {
          // optional - enables auto sign in after user is confirmed
          enabled: true,
        },
      });
      console.log(user);
    } catch (error) {
      console.log('error signing up:', error);
    }
  };

  const confirmSignUp = async () => {
    try {
      const result = await Auth.confirmSignUp('birloiflorian@gmail.com', '424729');
      console.log('result', result);
    } catch (error) {
      console.log('error confirming sign up', error);
    }
  };

  const signIn = async () => {
    try {
      const user = await Auth.signIn('birloiflorian@gmail.com', 'Test1234!');
      console.log('user', user);
    } catch (error) {
      console.log('error signing in', error);
    }
  };

  const getToken = async () => {
    try {
      const result = await AsyncStorage.getAllKeys();
      console.log('result', result);
    } catch (error) {
      console.log('error', error);
    }
  };

  const signOut = async () => {
    try {
      await Auth.signOut();
    } catch (error) {
      console.log('error signing out: ', error);
    }
  };

  return (
    <PageLayout title="Landing">
      <Text category="h2">Landing</Text>
      <Button onPress={signUp}>Sign Up</Button>
      <Button onPress={confirmSignUp}>Confirm</Button>
      <Button onPress={signIn}>Sign In</Button>
      <Button onPress={getToken}>Get Token</Button>
      <Button onPress={signOut}>Sign Out</Button>
      <Button onPress={onRegisterButtonPress}>Go to Register</Button>
    </PageLayout>
  );
};

export default Landing;
