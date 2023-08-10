import { ExpoConfig } from '@expo/config-types';
import { config } from 'dotenv';

config(); // Load environment variables from .env file

const expoConfig: ExpoConfig = {
  name: 'teo',
  slug: 'teo',
  scheme: 'teo',
  version: '0.0.1',
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
    buildNumber: '3',
    supportsTablet: true,
    bundleIdentifier: 'com.commitglobal.vic',
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
    versionCode: 3,
    adaptiveIcon: {
      foregroundImage: './src/assets/images/adaptive-icon.png',
      backgroundColor: '#ffffff',
    },
    googleServicesFile: './google-services.json',
    package: 'com.commitglobal.vic',
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
    apiUrl: process.env.API_URL,
    redirectUrl: process.env.REDIRECT_URL,
    awsRegion: process.env.AWS_REGION,
    userPoolId: process.env.USER_POOL_ID,
    userPoolClientId: process.env.USER_POOL_CLIENT_ID,
    awsDomain: process.env.AWS_DOMAIN,
    eas: {
      projectId: '7dd2fea9-6bb9-4b69-865f-c00ab46b5183',
    },
    policyLink: process.env.PRIVACY_POLICY_LINK,
    termsLink: process.env.TERMS_AND_CONDITIONS_LINK,
    infoLink: process.env.INFORMATION_LINK,
  },
  updates: {
    url: 'https://u.expo.dev/7dd2fea9-6bb9-4b69-865f-c00ab46b5183',
  },
  runtimeVersion: {
    policy: 'sdkVersion',
  },
  owner: 'commit-global',
};
export default expoConfig;
