import { ExpoConfig } from '@expo/config-types';
import { config } from 'dotenv';

config(); // Load environment variables from .env file

const expoConfig: ExpoConfig = {
  name: 'vic',
  slug: 'vic',
  scheme: 'vic',
  version: '1.0.18',
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
    buildNumber: '21',
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
    versionCode: 21,
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
    'expo-font',
    [
      'expo-document-picker',
      {
        iCloudContainerEnvironment: 'Development',
      },
    ],
    [
      'expo-image-picker',
      {
        photosPermission: 'The app accesses your photos to allow you to set a profile picture.',
        cameraPermission: 'The app accesses your camera to allow you to set a profile picture.',
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
  runtimeVersion: {
    policy: 'sdkVersion',
  },
  owner: 'commit-global',
};
export default expoConfig;
