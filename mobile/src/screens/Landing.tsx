import React, { useEffect } from 'react';
import PageLayout from '../layouts/PageLayout';
import { Text } from '@ui-kitten/components';
import { Image, StyleSheet } from 'react-native';
import { View } from 'react-native';
import LogInButton from '../components/LogInButton';
import { useAuth } from '../hooks/useAuth';
// import { CognitoHostedUIIdentityProvider } from '@aws-amplify/auth';
import { useTranslation } from 'react-i18next';
// import GoogleButton from '../components/GoogleButton';
// import AppleButton from '../components/AppleButton';
// import FacebookButton from '../components/FacebookButton';
import ScrollViewLayout from '../layouts/ScrollViewLayout';
import { ALLOW_FONT_SCALLING } from '../common/constants/constants';
import SignUpButton from '../components/SignUpButton';

const Landing = ({ navigation }: any) => {
  const { isUserPending } = useAuth();
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
      <ScrollViewLayout>
        <View style={styles.container}>
          <Image source={require('../assets/images/vic-logo.png')} style={styles.image} />
          <Text allowFontScaling={ALLOW_FONT_SCALLING} category="c1" style={styles.message}>{`${t(
            'message',
          )}`}</Text>
          <View style={styles.buttonsContainer}>
            <SignUpButton onPress={onRegisterButtonPress} />
            {/* {Platform.OS === 'ios' && (
              <AppleButton
                onPress={loginWithSocial.bind(null, CognitoHostedUIIdentityProvider.Apple)}
              />
            )}
            <GoogleButton
              onPress={loginWithSocial.bind(null, CognitoHostedUIIdentityProvider.Google)}
            />
            <FacebookButton
              onPress={loginWithSocial.bind(null, CognitoHostedUIIdentityProvider.Facebook)}
            /> */}
          </View>
          <View style={styles.separator} />
          <LogInButton onPress={onLoginButtonPress} />
        </View>
      </ScrollViewLayout>
      <Text allowFontScaling={ALLOW_FONT_SCALLING} style={styles.version}>
        v1.0.1
      </Text>
    </PageLayout>
  );
};

export default Landing;

const styles = StyleSheet.create({
  image: {
    marginBottom: 45,
    height: 240,
    width: 130,
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
    minWidth: 240,
  },
  message: {
    marginTop: 12,
    marginBottom: 40,
    textAlign: 'center',
  },
  version: {
    textAlign: 'center',
    padding: 4,
  },
});
