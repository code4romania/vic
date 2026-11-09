import { Platform } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import {
  GoogleSignin,
  isCancelledResponse,
  isErrorWithCode,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import { SocialProvider } from './auth.api';

// The user closed the provider's sheet: no error to show.
export class SocialCancelledError extends Error {}

let googleConfigured = false;

const googleIdToken = async (): Promise<string> => {
  if (!googleConfigured) {
    GoogleSignin.configure({
      // The backend checks the token's audience against GOOGLE_CLIENT_IDS.
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
      iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    });
    googleConfigured = true;
  }
  try {
    if (Platform.OS === 'android') {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    }
    // Always show the account picker, not the account used last time.
    await GoogleSignin.signOut().catch(() => undefined);
    const response = await GoogleSignin.signIn();
    if (isCancelledResponse(response)) {
      throw new SocialCancelledError();
    }
    if (!response.data.idToken) {
      throw new Error('Google returned no idToken');
    }
    return response.data.idToken;
  } catch (error) {
    if (isErrorWithCode(error) && error.code === statusCodes.IN_PROGRESS) {
      throw new SocialCancelledError();
    }
    throw error;
  }
};

const appleIdentityToken = async (): Promise<string> => {
  try {
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
      ],
    });
    if (!credential.identityToken) {
      throw new Error('Apple returned no identityToken');
    }
    return credential.identityToken;
  } catch (error: any) {
    if (error?.code === 'ERR_REQUEST_CANCELED') {
      throw new SocialCancelledError();
    }
    throw error;
  }
};

// The token POST /mobile/auth/social expects: the identity token from Google or Apple.
export const getSocialToken = (provider: SocialProvider): Promise<string> => {
  switch (provider) {
    case 'google':
      return googleIdToken();
    case 'apple':
      return appleIdentityToken();
  }
};

export const signOutSocial = async (): Promise<void> => {
  await GoogleSignin.signOut().catch(() => undefined);
};
