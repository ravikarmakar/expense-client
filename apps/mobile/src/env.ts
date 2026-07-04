import Constants from 'expo-constants';

/**
 * Type-safe environment variable helper.
 * Automatically resolves variables starting with EXPO_PUBLIC_ in development and production.
 */

export const env = {
  API_URL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000',
  NODE_ENV: process.env.NODE_ENV || 'development',
  EXPO_PROJECT_ID: Constants.expoConfig?.extra?.eas?.projectId || '',
  APP_VERSION: Constants.expoConfig?.version || '1.0.0',
  BUILD_NUMBER: Constants.expoConfig?.android?.versionCode || 1,
} as const;

if (__DEV__) {
  // eslint-disable-next-line no-console
  console.log('[Environment Config]: Loaded API_URL =', env.API_URL);
}
