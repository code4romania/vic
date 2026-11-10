import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

export async function registerForPushNotificationsAsync() {
  let token;
  let userWasAsked = false;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus, canAskAgain } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (canAskAgain) {
      const { status } = await Notifications.requestPermissionsAsync();
      userWasAsked = true;
      if (existingStatus !== 'granted' && canAskAgain) {
        finalStatus = status;
      }
    }

    if (finalStatus !== 'granted') {
      return { token: undefined, userWasAsked };
    }
    try {
      token = (
        await Notifications.getExpoPushTokenAsync({
          projectId: Constants.expoConfig?.extra?.eas.projectId,
        })
      ).data;
    } catch {
      return { token: undefined, userWasAsked };
    }
  }

  return { token, userWasAsked };
}
