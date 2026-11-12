module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // Unistyles 3: processes StyleSheet.create from react-native-unistyles under src/
    plugins: [['react-native-unistyles/plugin', { root: 'src' }]],
  };
};
