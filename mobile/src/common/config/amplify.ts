import Constants from 'expo-constants';
import * as Linking from 'expo-linking';

export const AMPLIFY_CONFIG = {
  Auth: {
    region: Constants.expoConfig?.extra?.awsRegion,
    userPoolId: Constants.expoConfig?.extra?.userPoolId,
    userPoolWebClientId: Constants.expoConfig?.extra?.userPoolClientId, // ONGHub
  },
  oauth: {
    domain: Constants.expoConfig?.extra?.awsDomain,
    scope: ['email', 'profile', 'openid', 'aws.cognito.signin.user.admin'],
    redirectSignIn: Linking.createURL(''),
    redirectSignOut: Linking.createURL(''),
    responseType: 'code', // or 'token', note that REFRESH token will only be generated when the responseType is code
    authenticationFlowType: 'USER_PASSWORD_AUTH',
  },
};
