const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const { withTamagui } = require('@tamagui/metro-plugin');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const baseConfig = mergeConfig(getDefaultConfig(__dirname), {});

module.exports = withTamagui(baseConfig, {
  config: './tamagui.config.ts',
});
