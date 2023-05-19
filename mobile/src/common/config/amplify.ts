import Constants from 'expo-constants';

export const AMPLIFY_CONFIG = {
  Auth: {
    region: Constants.expoConfig?.extra?.awsRegion,
    userPoolId: Constants.expoConfig?.extra?.userPoolId,
    userPoolWebClientId: Constants.expoConfig?.extra?.userPoolClientId, // ONGHub
  },
  oauth: {
    domain: Constants.expoConfig?.extra?.awsDomain,
    scope: ['email', 'profile', 'openid', 'aws.cognito.signin.user.admin'],
    redirectSignIn: Constants.expoConfig?.extra?.redirectUrl,
    redirectSignOut: Constants.expoConfig?.extra?.redirectUrl,
    responseType: 'code', // or 'token', note that REFRESH token will only be generated when the responseType is code
    authenticationFlowType: 'USER_PASSWORD_AUTH',
  },
};
