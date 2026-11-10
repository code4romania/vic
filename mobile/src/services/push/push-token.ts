import * as Notifications from 'expo-notifications';
import { unregisterPushToken } from '../settings/settings.api';

// The Expo push token this device registered for the logged-in user (NotificationContextProvider).
let currentPushToken: string | undefined;

export const setPushToken = (token: string | undefined): void => {
  currentPushToken = token;
};

export const getPushToken = (): string | undefined => currentPushToken;

// Asks the backend to forget this device's token while the session still works.
// Resolves true when the backend confirmed it.
export const unregisterPushTokenFromBackend = async (): Promise<boolean> => {
  if (!currentPushToken) {
    return true;
  }
  try {
    await unregisterPushToken(currentPushToken);
    return true;
  } catch {
    return false;
  }
};

// The session ended. When the backend could not be told (offline, refresh refused, account
// deleted), stop the device itself from receiving pushes until the next login registers again:
// a logged-out phone must not show the previous user's notifications.
export const forgetPushToken = async ({
  backendForgot,
}: {
  backendForgot: boolean;
}): Promise<void> => {
  currentPushToken = undefined;
  if (!backendForgot) {
    await Notifications.unregisterForNotificationsAsync().catch(() => undefined);
  }
};
