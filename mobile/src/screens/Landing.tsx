import React from 'react';
import PageLayout from '../layouts/PageLayout';
import { Text } from '@ui-kitten/components';
import Button from '../components/Button';
import { Image, StyleSheet } from 'react-native';
import { View } from 'react-native';
import i18n from '../common/config/i18n';
import LogInButton from '../components/LogInButton';
import { ButtonType } from '../common/enums/button-type.enum';

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
      <View style={styles.container}>
        <Image source={require('../assets/images/teo-logo.png')} style={styles.image} />
        <Text category="h1">{`${i18n.t('general:register')}`}</Text>
        <Text category="c1" style={styles.message}>{`${i18n.t('landing:message')}`}</Text>
        <Button
          onPress={onRegisterButtonPress}
          label={i18n.t('landing:email')}
          type={ButtonType.PRIMARY}
        />
        <View style={styles.separator} />
        <LogInButton onPress={onLoginButtonPress} />
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
  message: {
    marginTop: 12,
    marginBottom: 40,
    textAlign: 'center',
  },
});
