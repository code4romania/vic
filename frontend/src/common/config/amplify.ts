export const AMPLIFY_CONFIG = {
  Auth: {
    Cognito: {
      userPoolId: import.meta.env.VITE_USER_POOL_ID ?? '',
      userPoolClientId: import.meta.env.VITE_USER_POOL_CLIENT_ID ?? '', // ONGHub
      signUpVerificationMethod: 'code' as const,
      loginWith: {
        oauth: {
          domain: import.meta.env.VITE_COGNITO_OAUTH_DOMAIN ?? '',
          scopes: ['email', 'profile', 'openid', 'aws.cognito.signin.user.admin'],
          redirectSignIn: [import.meta.env.VITE_APP_FRONTEND_URL ?? ''],
          redirectSignOut: [import.meta.env.VITE_APP_FRONTEND_URL ?? ''],
          responseType: 'code' as const,
        },
      },
    },
  },
};
