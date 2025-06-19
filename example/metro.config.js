const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const path = require('path');

const root = path.resolve(__dirname, '..');

const config = {
  watchFolders: [root],
  resolver: {
    alias: {
      'react-native-cookies-manager': path.resolve(root, 'src/index.tsx'),
    },
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
