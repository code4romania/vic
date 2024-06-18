import * as Linking from 'expo-linking';

export const AMPLIFY_CONFIG = {
  Auth: {
    region: process.env.EXPO_PUBLIC_AWS_REGION,
    userPoolId: process.env.EXPO_PUBLIC_USER_POOL_ID,
    userPoolWebClientId: process.env.EXPO_PUBLIC_USER_POOL_CLIENT_ID, // ONGHub
  },
  oauth: {
    domain: process.env.EXPO_PUBLIC_AWS_DOMAIN,
    scope: ['email', 'profile', 'openid', 'aws.cognito.signin.user.admin'],
    redirectSignIn: Linking.createURL(''),
    redirectSignOut: Linking.createURL(''),
    responseType: 'code', // or 'token', note that REFRESH token will only be generated when the responseType is code
    authenticationFlowType: 'USER_PASSWORD_AUTH',
  },
};
