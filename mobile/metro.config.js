const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// SDK 53 resolves package.json "exports" by default. aws-amplify v5 (via tslib) and zustand v4
// break under it, so keep the pre-SDK 53 resolution until those libraries are upgraded.
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
