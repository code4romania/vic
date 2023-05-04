import Constants from 'expo-constants';
// import AsyncStorage from '@react-native-async-storage/async-storage';

export const AMPLIFY_CONFIG = {
  Auth: {
    region: Constants.expoConfig?.extra?.awsRegion,
    userPoolId: Constants.expoConfig?.extra?.userPoolId,
    userPoolWebClientId: Constants.expoConfig?.extra?.userPoolClientId, // ONGHub
    // storage: AsyncStorage,
  },
  oauth: {
    domain: Constants.expoConfig?.extra?.awsDomain,
    scope: ['email', 'profile', 'openid', 'aws.cognito.signin.user.admin'],
    redirectSignIn: Constants.expoConfig?.extra?.redirectUrl,
    redirectSignOut: Constants.expoConfig?.extra?.redirectUrl,
    responseType: 'code', // or 'token', note that REFRESH token will only be generated when the responseType is code
  },
  // cookieStorage: {
  //   domain: 'localhost',
  //   secure: false,
  //   path: '/',
  //   expires: 365,
  // },
};
