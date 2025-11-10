module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation|@tamagui|tamagui|react-native-gesture-handler|react-native-reanimated|react-native-safe-area-context|react-native-screens|react-native-svg|moti|react-native-worklets|react-native-worklets-core)/)',
  ],
};
