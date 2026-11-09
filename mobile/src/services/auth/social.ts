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

// Loaded on first use: without EXPO_PUBLIC_FACEBOOK_APP_ID the native SDK is not set up (app.config.ts
// leaves the plugin out) and merely importing the module crashes the app on Android.
// app.config.ts turns the SDK's auto-init off (no app events before consent), so it is initialized
// here, once, before the first login.
let facebookInitialized = false;
const facebookSdk = (): typeof import('react-native-fbsdk-next') | null => {
  if (!process.env.EXPO_PUBLIC_FACEBOOK_APP_ID) {
    return null;
  }
  const sdk: typeof import('react-native-fbsdk-next') = require('react-native-fbsdk-next');
  if (!facebookInitialized) {
    sdk.Settings.initializeSDK();
    facebookInitialized = true;
  }
  return sdk;
};

// The backend verifies a classic Facebook access token. On iOS without tracking permission the SDK
// only gives a Limited Login token, so there is no access token and the sign-in fails (social_failed).
const facebookAccessToken = async (): Promise<string> => {
  const sdk = facebookSdk();
  if (!sdk) {
    throw new Error('Facebook sign-in is not configured (EXPO_PUBLIC_FACEBOOK_APP_ID)');
  }
  const { AccessToken, LoginManager } = sdk;
  LoginManager.logOut();
  const result = await LoginManager.logInWithPermissions(['public_profile', 'email'], 'enabled');
  if (result.isCancelled) {
    throw new SocialCancelledError();
  }
  const token = await AccessToken.getCurrentAccessToken();
  if (!token?.accessToken) {
    throw new Error('Facebook returned no access token');
  }
  return token.accessToken;
};

// The token POST /mobile/auth/social expects: Google and Apple the identity token, Facebook the
// access token.
export const getSocialToken = (provider: SocialProvider): Promise<string> => {
  switch (provider) {
    case 'google':
      return googleIdToken();
    case 'apple':
      return appleIdentityToken();
    case 'facebook':
      return facebookAccessToken();
  }
};

export const signOutSocial = async (): Promise<void> => {
  await GoogleSignin.signOut().catch(() => undefined);
  facebookSdk()?.LoginManager.logOut();
};
