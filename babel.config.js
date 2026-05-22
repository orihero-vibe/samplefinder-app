module.exports = function(api) {
  // Invalidate the Babel cache when .env changes so react-native-dotenv
  // picks up new values without a manual cache wipe.
  api.cache.using(() => {
    try {
      return require('fs').readFileSync(require('path').join(__dirname, '.env'), 'utf8');
    } catch {
      return '';
    }
  });
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@': './src',
            '@/components': './src/components',
            '@/screens': './src/screens',
            '@/navigation': './src/navigation',
            '@/utils': './src/utils',
            '@/assets': './src/assets',
          },
          extensions: [
            '.ios.ts',
            '.android.ts',
            '.ts',
            '.ios.tsx',
            '.android.tsx',
            '.tsx',
            '.jsx',
            '.js',
            '.json',
            '.png',
            '.jpg',
            '.jpeg',
            '.gif',
            '.svg',
            '.webp',
          ],
        },
      ],
      [
        'module:react-native-dotenv',
        {
          moduleName: '@env',
          path: '.env',
        },
      ],
      'react-native-reanimated/plugin',
    ],
  };
};

