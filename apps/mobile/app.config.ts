import type { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: process.env.EXPO_PUBLIC_APP_NAME || 'SplitShare',
  slug: 'splitshare',
  version: process.env.EXPO_PUBLIC_APP_VERSION || '1.0.0',
  orientation: 'portrait',
  userInterfaceStyle: 'light',
  androidNavigationBar: {
    backgroundColor: '#00000000',
    barStyle: 'dark-content',
  },
  scheme: 'expensetransaction', // Keep scheme compatible with existing deep links
  ios: {
    supportsTablet: true,
  },
  android: {
    package: process.env.EXPO_PUBLIC_ANDROID_PACKAGE || 'com.ravikarmakar.splitshare',
    versionCode: parseInt(process.env.EXPO_PUBLIC_BUILD_NUMBER || '1', 10),
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#07090e',
    },
  },
  web: {
    bundler: 'metro',
  },
  plugins: ['expo-router', 'expo-secure-store'],
});
