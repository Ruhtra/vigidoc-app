/** @type {import('@babel/core').TransformOptions} */
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./src'],
          extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
          alias: {
            '@lib': './src/lib',
            '@stores': './src/stores',
            '@hooks': './src/hooks',
            '@constants': './src/constants',
            '@app-types': './src/types',
            '@components': './src/components',
            // Mantém o @/* -> ./src/* para compatibilidade
            '@': './src',
          },
        },
      ],
      // Reanimated deve ser o ÚLTIMO plugin
      'react-native-reanimated/plugin',
    ],
  };
};
