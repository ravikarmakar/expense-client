const nextConfig = require('@workspace/eslint-config/next.js');

module.exports = [
  ...nextConfig,
  {
    rules: {
      // App-specific rules can be added here
    },
  },
];
