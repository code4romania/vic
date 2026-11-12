import 'react-native-gesture-handler';
// Unistyles themes must be configured before any StyleSheet is created
import './src/design/theme';
import React from 'react';
import * as eva from '@eva-design/eva';
import { ApplicationProvider, IconRegistry } from '@ui-kitten/components';
import { default as theme } from './src/common/theme/theme.json';
import { default as mapping } from './src/common/theme/mappings.json';
import * as Font from 'expo-font';
import {
  BricolageGrotesque_700Bold,
  BricolageGrotesque_800ExtraBold,
} from '@expo-google-fonts/bricolage-grotesque';
import {
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
} from '@expo-google-fonts/manrope';
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { linking } from './src/routes/linking';
import { Platform, StyleSheet, View } from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import AuthContextProvider from './src/contexts/auth/AuthContextProvider';
import Router from './src/routes/Router';
import './src/common/config/i18n';
import { ToastHost } from './src/common/config/toast';
import { QueryClientProvider } from 'react-query';
import { queryClient } from './src/services/query-client';
import { FeatherIconsPack } from './src/common/adapters/feather-icons.adapter';
import * as SplashScreen from 'expo-splash-screen';
import * as Notifications from 'expo-notifications';
import * as NavigationBar from 'expo-navigation-bar';
import NotificationContextProvider from './src/contexts/notification/NotificationContextProvider';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Keep the android navigation buttons dark on our light screens, regardless of the system theme
if (Platform.OS === 'android') {
  NavigationBar.setStyle('dark');
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
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
    // VIC 2.0 titles (Titillium Web 700); Titillium stays only in the logo
    'titillium-bold': require('./src/assets/fonts/TitilliumWeb-Bold.ttf'),
    // „Îndrăzneț”: Bricolage Grotesque for numbers and titles, Manrope for everything else
    BricolageGrotesque_700Bold,
    BricolageGrotesque_800ExtraBold,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
    Manrope_800ExtraBold,
  });

  return fontsLoaded ? (
    <>
      <IconRegistry icons={FeatherIconsPack} />
      <ApplicationProvider
        {...eva}
        theme={{ ...eva.dark, ...theme } as any}
        customMapping={mapping}
      >
        {/* the Maintenance / UpdateRequired screens render outside the navigators, which otherwise
            provide the safe area */}
        <SafeAreaProvider>
          <GestureHandlerRootView style={styles.gestureHandler}>
            <KeyboardProvider>
              <QueryClientProvider client={queryClient}>
                <BottomSheetModalProvider>
                  <AuthContextProvider>
                    <NavigationContainer
                      ref={navigationRef}
                      linking={linking}
                      navigationInChildEnabled
                    >
                      <NotificationContextProvider navigation={navigationRef}>
                        <Router />
                      </NotificationContextProvider>
                    </NavigationContainer>
                  </AuthContextProvider>
                </BottomSheetModalProvider>
              </QueryClientProvider>
            </KeyboardProvider>
          </GestureHandlerRootView>
          <ToastHost />
        </SafeAreaProvider>

        <ExpoStatusBar style="dark" />
      </ApplicationProvider>
    </>
  ) : (
    <View />
  );
};

const styles = StyleSheet.create({
  gestureHandler: { flex: 1 },
});
