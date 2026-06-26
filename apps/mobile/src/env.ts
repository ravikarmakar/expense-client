import Constants from 'expo-constants';

/**
 * Type-safe environment variable helper.
 * Automatically resolves variables starting with EXPO_PUBLIC_ in development and production.
 */

export const env = {
  API_URL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000',
  NODE_ENV: process.env.NODE_ENV || 'development',
  EXPO_PROJECT_ID: Constants.expoConfig?.extra?.eas?.projectId || '',
} as const;

if (__DEV__) {
  // eslint-disable-next-line no-console
  console.log('[Environment Config]: Loaded API_URL =', env.API_URL);
}
