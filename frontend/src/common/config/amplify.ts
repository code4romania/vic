export const AMPLIFY_CONFIG = {
  Auth: {
    region: import.meta.env.VITE_AWS_REGION,
    userPoolId: import.meta.env.VITE_USER_POOL_ID,
    userPoolWebClientId: import.meta.env.VITE_USER_POOL_CLIENT_ID, // ONGHub
  },
  oauth: {
    domain: import.meta.env.VITE_COGNITO_OAUTH_DOMAIN,
    scope: ['email', 'profile', 'openid', 'aws.cognito.signin.user.admin'],
    redirectSignIn: import.meta.env.VITE_APP_FRONTEND_URL,
    redirectSignOut: import.meta.env.VITE_APP_FRONTEND_URL,
    responseType: 'code', // or 'token', note that REFRESH token will only be generated when the responseType is code
  },
};

console.log('AMPLIFY_CONFIG', AMPLIFY_CONFIG);
