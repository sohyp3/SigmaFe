module.exports = function (api) {
  api.cache(true)
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
    ],
    plugins: [
      'expo-router/babel',
      'babel-plugin-macros',
      'nativewind/babel',
      ['react-native-worklets/plugin', { blackbox: true }],
      ['react-native-reanimated/plugin', { relativeSourceLocation: true }],
    ],
  }
}