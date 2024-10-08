import 'react-native-gesture-handler';
import React from 'react';
import * as eva from '@eva-design/eva';
import { ApplicationProvider, IconRegistry } from '@ui-kitten/components';
import { default as theme } from './src/common/theme/theme.json';
import { default as mapping } from './src/common/theme/mappings.json';
import * as Font from 'expo-font';
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { StyleSheet, View } from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import AuthContextProvider from './src/contexts/auth/AuthContextProvider';
import Router from './src/routes/Router';
import { Amplify } from 'aws-amplify';
import './src/common/config/i18n';
import { AMPLIFY_CONFIG } from './src/common/config/amplify';
import Toast from 'react-native-toast-message';
import { toastConfig } from './src/common/config/toast';
import { QueryClient, QueryClientProvider } from 'react-query';
import { FeatherIconsPack } from './src/common/adapters/feather-icons.adapter';
import * as SplashScreen from 'expo-splash-screen';
import * as Notifications from 'expo-notifications';
import NotificationContextProvider from './src/contexts/notification/NotificationContextProvider';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Configure Amplify for Login
Amplify.configure(AMPLIFY_CONFIG as any);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 0,
      staleTime: 0, // DEFAULT: 0 seconds
      cacheTime: 300000, // DEFAULT: 5 minutes (300000 ms)
      refetchOnMount: true,
      refetchOnWindowFocus: false,
      refetchOnReconnect: 'always',
      suspense: false,
    },
  },
});

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});
// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default () => {
  const navigationRef = useNavigationContainerRef();
  // // init fonts
  const [fontsLoaded] = Font.useFonts({
    'roboto-bold': require('./src/assets/fonts/Roboto-Bold.ttf'),
    'roboto-medium': require('./src/assets/fonts/Roboto-Medium.ttf'),
    'roboto-regular': require('./src/assets/fonts/Roboto-Regular.ttf'),
    'titilium-web': require('./src/assets/fonts/TitilliumWeb-SemiBold.ttf'),
  });

  return fontsLoaded ? (
    <>
      <IconRegistry icons={FeatherIconsPack} />
      <ApplicationProvider
        {...eva}
        theme={{ ...eva.dark, ...theme } as any}
        customMapping={mapping}
      >
        <GestureHandlerRootView style={styles.gestureHandler}>
          <QueryClientProvider client={queryClient}>
            <AuthContextProvider>
              <NavigationContainer ref={navigationRef}>
                <NotificationContextProvider navigation={navigationRef}>
                  <Router />
                </NotificationContextProvider>
              </NavigationContainer>
            </AuthContextProvider>
          </QueryClientProvider>
        </GestureHandlerRootView>

        <ExpoStatusBar style="dark" />
      </ApplicationProvider>
      <Toast config={toastConfig} />
    </>
  ) : (
    <View />
  );
};

const styles = StyleSheet.create({
  gestureHandler: { flex: 1 },
});
