// babel.config.cjs
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      require.resolve('expo-router/babel'),
      ['module-resolver', {
        root: ['.'],
        alias: {
          '@': './src',        // => "@/components/BottomBar" apunta a "<raíz>/src/components/BottomBar"
        },
        extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
      }],
    ],
  };
};
