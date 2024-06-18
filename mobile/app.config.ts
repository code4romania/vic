import { ExpoConfig } from '@expo/config-types';
import { config } from 'dotenv';

config(); // Load environment variables from .env file

const expoConfig: ExpoConfig = {
  name: 'vic',
  slug: 'vic',
  scheme: 'vic',
  version: '1.0.6',
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
    buildNumber: '8',
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
    versionCode: 6,
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
    apiUrl: 'https://api-vic-staging.ngohub.ro',
    awsRegion: 'eu-west-1',
    userPoolId: 'eu-west-1_HRB7J3vjJ',
    userPoolClientId: '4sihusclii449k2otmeetl4dgq',
    awsDomain: 'vic-staging.auth.eu-west-1.amazoncognito.com',
    eas: {
      projectId: '6aaad982-5a5c-4af8-b66c-7689afe74e1f',
    },
    policyLink: 'https://www.ngohub.ro/ro/politica-de-confidentialitate',
    termsLink: 'https://www.ngohub.ro/ro/termeni-si-conditii',
    infoLink: 'https://www.ngohub.ro/ro/vic',
    contactEmail: 'civic@commitglobal.org',
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
