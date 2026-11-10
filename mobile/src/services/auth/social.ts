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

// What POST /mobile/auth/social needs from the provider. Apple also gives a one-time
// authorization code: the backend exchanges it for a refresh token it can revoke when the account
// is deleted (App Store guideline 5.1.1(v)).
export interface ISocialCredential {
  token: string;
  authorizationCode?: string;
}

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

const appleCredential = async (): Promise<ISocialCredential> => {
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
    return {
      token: credential.identityToken,
      ...(credential.authorizationCode ? { authorizationCode: credential.authorizationCode } : {}),
    };
  } catch (error: any) {
    if (error?.code === 'ERR_REQUEST_CANCELED') {
      throw new SocialCancelledError();
    }
    throw error;
  }
};

// What POST /mobile/auth/social expects: the identity token from Google or Apple (and Apple's
// authorization code).
export const getSocialCredential = async (provider: SocialProvider): Promise<ISocialCredential> => {
  switch (provider) {
    case 'google':
      return { token: await googleIdToken() };
    case 'apple':
      return appleCredential();
  }
};

export const signOutSocial = async (): Promise<void> => {
  await GoogleSignin.signOut().catch(() => undefined);
};
