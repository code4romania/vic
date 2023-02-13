// console.log('import.meta.env.VITE_AWS_REGION', import.meta.env.VITE_AWS_REGION);

export const AMPLIFY_CONFIG = {
  Auth: {
    region: process.env.VITE_AWS_REGION,
    userPoolId: process.env.VITE_USER_POOL_ID,
    userPoolWebClientId: process.env.VITE_USER_POOL_CLIENT_ID, // ONGHub
  },
  oauth: {
    domain: process.env.VITE_COGNITO_OAUTH_DOMAIN,
    scope: ['email', 'profile', 'openid', 'aws.cognito.signin.user.admin'],
    redirectSignIn: process.env.VITE_APP_FRONTEND_URL,
    redirectSignOut: process.env.VITE_APP_FRONTEND_URL,
    responseType: 'code', // or 'token', note that REFRESH token will only be generated when the responseType is code
  },
};

console.log('AMPLIFY_CONFIG', AMPLIFY_CONFIG);
