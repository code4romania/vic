import { ExpoConfig } from '@expo/config-types';
import { config } from 'dotenv';

config(); // Load environment variables from .env file

// Google sign-in on iOS needs the reversed iOS client id as a URL scheme.
const googleIosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
const googleIosUrlScheme = googleIosClientId
  ? `com.googleusercontent.apps.${googleIosClientId.replace('.apps.googleusercontent.com', '')}`
  : undefined;

// The Google plugin refuses to run without its id, so a local build without it simply has no
// Google native setup. Store builds get the ids from eas.json (or the EAS environment).
// A production build without them would ship a Google button that always fails: stop it here.
if (
  process.env.EXPO_PUBLIC_ENVIRONMENT === 'production' &&
  (!process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || !googleIosClientId)
) {
  throw new Error(
    'Production build without EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID / EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID: ' +
      'set them in the EAS "production" environment (eas env:create) or in eas.json.',
  );
}

const socialPlugins: NonNullable<ExpoConfig['plugins']> = [
  ...(googleIosUrlScheme
    ? [['@react-native-google-signin/google-signin', { iosUrlScheme: googleIosUrlScheme }] as const]
    : []),
] as NonNullable<ExpoConfig['plugins']>;

const expoConfig: ExpoConfig = {
  name: 'vic',
  slug: 'vic',
  scheme: 'vic',
  // Store builds take buildNumber / versionCode from EAS (appVersionSource: remote, autoIncrement
  // in eas.json); the numbers below are only the starting point and the local/dev value.
  version: '2.0.0',
  orientation: 'portrait',
  icon: './src/assets/images/icon.png',
  userInterfaceStyle: 'light',
  assetBundlePatterns: ['**/*'],
  ios: {
    buildNumber: '23',
    supportsTablet: false,
    bundleIdentifier: 'org.commitglobal.vic',
    entitlements: {
      'com.apple.developer.applesignin': ['Default'],
    },
    infoPlist: {
      UIBackgroundModes: ['fetch', 'remote-notification'],
    },
    config: {
      usesNonExemptEncryption: false,
    },
  },
  android: {
    versionCode: 23,
    adaptiveIcon: {
      foregroundImage: './src/assets/images/adaptive-icon.png',
      backgroundColor: '#ffffff',
    },
    googleServicesFile: process.env.GOOGLE_SERVICES_JSON,
    package: 'org.commitglobal.vic',
  },
  web: {
    favicon: './src/assets/images/favicon.png',
    build: { babel: { include: ['@ui-kitten/components'] } },
  },
  plugins: [
    'expo-localization',
    'expo-secure-store',
    'expo-apple-authentication',
    ...socialPlugins,
    'expo-font',
    [
      'expo-notifications',
      {
        // Android draws the small notification icon as a white silhouette
        icon: './src/assets/images/notification-icon.png',
        color: '#01344F',
      },
    ],
    // the app is always light at the bottom (tab bar, action bars), so keep the navigation buttons dark
    // no gray scrim behind the 3-button navigation: the screens already pad the bottom inset
    ['expo-navigation-bar', { style: 'dark', enforceContrast: false }],
    [
      'expo-splash-screen',
      {
        image: './src/assets/images/splash.png',
        resizeMode: 'contain',
        backgroundColor: '#ffffff',
        enableFullScreenImage_legacy: true,
        android: {
          image: './src/assets/images/logo.png',
          imageWidth: 200,
        },
      },
    ],
    [
      'expo-image-picker',
      {
        // the profile photo is picked from the gallery only: no camera, no microphone
        photosPermission: 'VIC folosește galeria foto doar pentru a-ți alege fotografia de profil.',
        cameraPermission: false,
        microphonePermission: false,
      },
    ],
  ],
  extra: {
    eas: {
      projectId: '6aaad982-5a5c-4af8-b66c-7689afe74e1f',
    },
  },
  updates: {
    url: 'https://u.expo.dev/6aaad982-5a5c-4af8-b66c-7689afe74e1f',
  },
  // appVersion, not sdkVersion: own-auth builds must never share over-the-air updates with the
  // 1.0.x builds (an update from this code would crash an install without expo-secure-store, and the
  // "Update now" update for 1.0.x must not land on 2.0.0). Bump `version` for every native change.
  runtimeVersion: {
    policy: 'appVersion',
  },
  owner: 'commit-global',
};
export default expoConfig;
