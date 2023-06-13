import React, { useEffect } from 'react';
import PageLayout from '../layouts/PageLayout';
import { Text } from '@ui-kitten/components';
import Button from '../components/Button';
import { Image, Platform, StyleSheet } from 'react-native';
import { View } from 'react-native';
import LogInButton from '../components/LogInButton';
import { useAuth } from '../hooks/useAuth';
import { CognitoHostedUIIdentityProvider } from '@aws-amplify/auth';
import { useTranslation } from 'react-i18next';
import GoogleButton from '../components/GoogleButton';
import AppleButton from '../components/AppleButton';
import FacebookButton from '../components/FacebookButton';

const Landing = ({ navigation }: any) => {
  console.log('Landing');
  const { isUserPending, loginWithSocial } = useAuth();
  const { t } = useTranslation('landing');

  useEffect(() => {
    if (isUserPending) {
      navigation.navigate('create-user');
    }
  }, [isUserPending, navigation]);

  const onLoginButtonPress = () => {
    navigation.navigate('login');
  };

  const onRegisterButtonPress = () => {
    navigation.navigate('create-account');
  };

  return (
    <PageLayout title="">
      <View style={styles.container}>
        <Image source={require('../assets/images/teo-logo.png')} style={styles.image} />
        <Text category="h1">{`${t('general:register')}`}</Text>
        <Text category="c1" style={styles.message}>{`${t('message')}`}</Text>
        <View style={styles.buttonsContainer}>
          <Button onPress={onRegisterButtonPress} label={t('email')} />
          {Platform.OS === 'ios' && (
            <AppleButton
              onPress={loginWithSocial.bind(null, CognitoHostedUIIdentityProvider.Apple)}
              label={t('social.apple')}
            />
          )}
          <GoogleButton
            onPress={loginWithSocial.bind(null, CognitoHostedUIIdentityProvider.Google)}
            label={t('social.google')}
          />
          <FacebookButton
            onPress={loginWithSocial.bind(null, CognitoHostedUIIdentityProvider.Facebook)}
            label={t('social.facebook')}
          />
        </View>
        <View style={styles.separator} />
        <LogInButton onPress={onLoginButtonPress} />
        <Text style={styles.version}>v0.9</Text>
      </View>
    </PageLayout>
  );
};

export default Landing;

const styles = StyleSheet.create({
  image: {
    marginBottom: 45,
  },
  separator: {
    height: 24,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonsContainer: {
    gap: 16,
  },
  message: {
    marginTop: 12,
    marginBottom: 40,
    textAlign: 'center',
  },
  version: {
    padding: 4,
  },
});
