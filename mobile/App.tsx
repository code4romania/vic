import 'react-native-gesture-handler';
import React from 'react';
import * as eva from '@eva-design/eva';
import { ApplicationProvider, IconRegistry } from '@ui-kitten/components';
import { default as theme } from './src/common/theme/theme.json';
import { default as mapping } from './src/common/theme/mappings.json';
import { EvaIconsPack } from '@ui-kitten/eva-icons';
import * as Font from 'expo-font';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaView, StatusBar, StyleSheet } from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import AuthContextProvider from './src/contexts/auth/AuthContextProvider';
import Router from './src/routes/Router';
import { Amplify } from 'aws-amplify';
import './src/common/config/i18n';
import { AMPLIFY_CONFIG } from './src/common/config/amplify';
import Toast from 'react-native-toast-message';

// Configure Amplify for Login
Amplify.configure(AMPLIFY_CONFIG);

export default () => {
  // init fonts
  const [fontsLoaded] = Font.useFonts({
    'roboto-bold': require('./src/assets/fonts/Roboto-Bold.ttf'),
    'roboto-medium': require('./src/assets/fonts/Roboto-Medium.ttf'),
    'roboto-regular': require('./src/assets/fonts/Roboto-Regular.ttf'),
    'titilium-web': require('./src/assets/fonts/TitilliumWeb-SemiBold.ttf'),
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <>
      <IconRegistry icons={EvaIconsPack} />
      <ApplicationProvider {...eva} theme={{ ...theme }} customMapping={mapping}>
        {/* Add marginTop for android devices as SafeAreaView is iOS Only */}
        <SafeAreaView style={styles.container}>
          <AuthContextProvider>
            <NavigationContainer>
              <Router />
            </NavigationContainer>
          </AuthContextProvider>
        </SafeAreaView>
        <ExpoStatusBar style="auto" />
      </ApplicationProvider>
      <Toast />
    </>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, marginTop: StatusBar.currentHeight },
});
