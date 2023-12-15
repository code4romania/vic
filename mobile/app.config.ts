import { ExpoConfig } from '@expo/config-types';
import { config } from 'dotenv';

config(); // Load environment variables from .env file

const expoConfig: ExpoConfig = {
  name: 'vic',
  slug: 'vic',
  scheme: 'vic',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './src/assets/images/icon.png',
  userInterfaceStyle: 'light',
  splash: {
    image: './src/assets/images/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff',
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    buildNumber: '1',
    supportsTablet: true,
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
    versionCode: 1,
    adaptiveIcon: {
      foregroundImage: './src/assets/images/adaptive-icon.png',
      backgroundColor: '#ffffff',
    },
    googleServicesFile: './google-services.json',
    package: 'org.commitglobal.vic',
  },
  web: {
    favicon: './src/assets/images/favicon.png',
    build: { babel: { include: ['@ui-kitten/components'] } },
  },
  plugins: [
    'expo-localization',
    [
      'expo-document-picker',
      {
        iCloudContainerEnvironment: 'Development',
      },
    ],
    [
      'expo-image-picker',
      {
        photosPermission: 'The app accesses your photos to let you share them with your friends.',
      },
    ],
  ],
  extra: {
    apiUrl: process.env.EXPO_PUBLIC_API_URL,
    awsRegion: process.env.EXPO_PUBLIC_AWS_REGION,
    userPoolId: process.env.EXPO_PUBLIC_USER_POOL_ID,
    userPoolClientId: process.env.EXPO_PUBLIC_USER_POOL_CLIENT_ID,
    awsDomain: process.env.EXPO_PUBLIC_AWS_DOMAIN,
    eas: {
      projectId: '6aaad982-5a5c-4af8-b66c-7689afe74e1f',
    },
    policyLink: process.env.EXPO_PUBLIC_PRIVACY_POLICY_LINK,
    termsLink: process.env.EXPO_PUBLIC_TERMS_AND_CONDITIONS_LINK,
    infoLink: process.env.EXPO_PUBLIC_INFORMATION_LINK,
  },
  updates: {
    url: 'https://u.expo.dev/6aaad982-5a5c-4af8-b66c-7689afe74e1f',
  },
  runtimeVersion: {
    policy: 'sdkVersion',
  },
  owner: 'commit-global',
};
export default expoConfig;
