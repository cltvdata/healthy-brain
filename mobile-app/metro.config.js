const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Fix Firebase v9+ compatibility with Metro bundler
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
