const baseConfig = require('./packages/eslint-config/base.js');
const nextConfig = require('./packages/eslint-config/next.js');
const reactNativeConfig = require('./packages/eslint-config/react-native.js');
function restrictToWorkspace(configs, workspacePath) {
  return configs.map((config) => {
    if (config.ignores) {
      return config;
    }
    if (config.files) {
      return {
        ...config,
        files: config.files.map((pattern) => {
          return pattern.startsWith('**/')
            ? `${workspacePath}/${pattern.slice(3)}`
            : `${workspacePath}/${pattern}`;
        }),
      };
    }
    return {
      ...config,
      files: [
        `${workspacePath}/**/*.ts`,
        `${workspacePath}/**/*.tsx`,
        `${workspacePath}/**/*.js`,
        `${workspacePath}/**/*.jsx`,
      ],
    };
  });
}

module.exports = [
  ...baseConfig,
  ...restrictToWorkspace(nextConfig, 'apps/web'),
  ...restrictToWorkspace(reactNativeConfig, 'apps/mobile'),
];
