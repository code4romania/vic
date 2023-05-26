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
    supportsTablet: true,
    bundleIdentifier: 'com.commitglobal.teo',
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './src/assets/images/adaptive-icon.png',
      backgroundColor: '#ffffff',
    },
    package: 'com.commitglobal.teo',
  },
  web: {
    favicon: './src/assets/images/favicon.png',
    build: { babel: { include: ['@ui-kitten/components'] } },
  },
  plugins: ['expo-localization'],
  extra: {
    apiUrl: process.env.API_URL,
    redirectUrl: process.env.REDIRECT_URL,
    awsRegion: process.env.AWS_REGION,
    userPoolId: process.env.USER_POOL_ID,
    userPoolClientId: process.env.USER_POOL_CLIENT_ID,
    awsDomain: process.env.AWS_DOMAIN,
    eas: {
      projectId: 'bcbf432c-f07a-4373-a9f1-f67f6281932e',
    },
  },
  owner: 'tribus-tech',
};
export default expoConfig;
