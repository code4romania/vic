import React, { useEffect } from 'react';
import PageLayout from '../layouts/PageLayout';
import { Text } from '@ui-kitten/components';
import { Image, Platform, StyleSheet } from 'react-native';
import { View } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import GoogleButton from '../components/GoogleButton';
import AppleButton from '../components/AppleButton';
import FacebookButton from '../components/FacebookButton';
import ScrollViewLayout from '../layouts/ScrollViewLayout';
import { ALLOW_FONT_SCALLING } from '../common/constants/constants';
import SignUpButton from '../components/SignUpButton';
import { usePaddingTop } from '../hooks/usePaddingTop';

const Landing = ({ navigation }: any) => {
  const { isUserPending, loginWithSocial } = useAuth();
  const { t } = useTranslation('landing');
  const paddingTop = usePaddingTop();

  useEffect(() => {
    if (isUserPending) {
      navigation.navigate('create-user');
    }
  }, [isUserPending, navigation]);

  const onLoginButtonPress = () => {
    navigation.navigate('login');
  };

  return (
    <PageLayout title="" headerStyle={{ paddingTop }}>
      <ScrollViewLayout>
        <View style={styles.container}>
          <Image source={require('../assets/images/vic-logo.png')} style={styles.image} />
          <Text allowFontScaling={ALLOW_FONT_SCALLING} category="c1" style={styles.message}>{`${t(
            'message',
          )}`}</Text>
          <View style={styles.buttonsContainer}>
            {/* Email: sign-up and login are the same flow, a code sent by email (#514) */}
            <SignUpButton onPress={onLoginButtonPress} />
            {/* Apple is required next to the other social logins on iOS (App Store guideline 4.8) */}
            {Platform.OS === 'ios' && <AppleButton onPress={() => loginWithSocial('apple')} />}
            <GoogleButton onPress={() => loginWithSocial('google')} />
            <FacebookButton onPress={() => loginWithSocial('facebook')} />
          </View>
          {/* <Text allowFontScaling={ALLOW_FONT_SCALLING} style={styles.version}>
            v0.14.10
          </Text> */}
        </View>
      </ScrollViewLayout>
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
    padding: 4,
  },
});
