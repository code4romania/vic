module.exports = {
  dependencies: {
    // Pulled in by aws-amplify v5 (@aws-amplify/notifications) but unused: the app only configures
    // Amplify Auth and handles push via expo-notifications. Its native code doesn't compile on RN 0.81.
    '@aws-amplify/rtn-push-notification': {
      platforms: {
        android: null,
        ios: null,
      },
    },
  },
};
