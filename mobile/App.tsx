/* eslint-disable @typescript-eslint/no-unused-vars */
import 'react-native-gesture-handler';
import React, { useEffect, useRef, useState } from 'react';
import * as eva from '@eva-design/eva';
import { ApplicationProvider, Button, IconRegistry } from '@ui-kitten/components';
import { default as theme } from './src/common/theme/theme.json';
import { default as mapping } from './src/common/theme/mappings.json';
import * as Font from 'expo-font';
import { NavigationContainer } from '@react-navigation/native';
import { Platform, SafeAreaView, StatusBar, StyleSheet, View, Text } from 'react-native';
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
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';

// Configure Amplify for Login
Amplify.configure(AMPLIFY_CONFIG);

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
  // // init fonts
  const [fontsLoaded] = Font.useFonts({
    'roboto-bold': require('./src/assets/fonts/Roboto-Bold.ttf'),
    'roboto-medium': require('./src/assets/fonts/Roboto-Medium.ttf'),
    'roboto-regular': require('./src/assets/fonts/Roboto-Regular.ttf'),
    'titilium-web': require('./src/assets/fonts/TitilliumWeb-SemiBold.ttf'),
  });

  const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState<Notifications.Notification>();
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  // if (!fontsLoaded) {
  //   return null;
  // }

  useEffect(() => {
    registerForPushNotificationsAsync().then((token) => setExpoPushToken(token as string));

    notificationListener.current = Notifications.addNotificationReceivedListener(
      (notif: Notifications.Notification) => {
        console.log(notif);
        setNotification(notif);
      },
    ) as any;

    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (response: any) => {
        console.log(JSON.stringify(response));
      },
    ) as any;

    return () => {
      Notifications.removeNotificationSubscription(
        notificationListener.current as Notifications.Subscription,
      );
      Notifications.removeNotificationSubscription(
        responseListener.current as Notifications.Subscription,
      );
    };
  }, []);

  return fontsLoaded ? (
    <>
      <IconRegistry icons={FeatherIconsPack} />
      <ApplicationProvider {...eva} theme={{ ...theme } as any} customMapping={mapping}>
        {/* Add marginTop for android devices as SafeAreaView is iOS Only */}
        <SafeAreaView style={styles.container}>
          <QueryClientProvider client={queryClient}>
            <AuthContextProvider>
              <NavigationContainer>
                <Router />
              </NavigationContainer>
            </AuthContextProvider>
          </QueryClientProvider>
        </SafeAreaView>
        <ExpoStatusBar style="auto" />
      </ApplicationProvider>
      <Toast config={toastConfig} />
    </>
  ) : (
    <View />
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, marginTop: StatusBar.currentHeight },
});

async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      console.error('Failed to get push token for push notification!');
      return;
    }
    token = (
      await Notifications.getExpoPushTokenAsync({
        projectId: 'bcbf432c-f07a-4373-a9f1-f67f6281932e', // TODO update with process.env
      })
    ).data;
    console.log(token);
  } else {
    console.error('Must use physical device for Push Notifications');
  }

  return token;
}
