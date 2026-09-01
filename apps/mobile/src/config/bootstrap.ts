import * as SecureStore from 'expo-secure-store';
import * as SplashScreen from 'expo-splash-screen';
import NetInfo from '@react-native-community/netinfo';
import { onlineManager } from '@tanstack/react-query';
import { createApiClient } from '@workspace/api';
import { enableFreeze } from 'react-native-screens';
import { env } from '../env';

/**
 * Bootstrap App Initialization
 *
 * Configures low-level native flags, splash screen preservation,
 * network status managers, and API client adapters before component mounting.
 */

// 1. Disable screen freezing on Android to prevent software canvas hardware bitmap crashes
enableFreeze(false);

// 2. Keep native splash screen visible while JS runtime and auth resolve in background
SplashScreen.preventAutoHideAsync();

// 3. Configure TanStack Query onlineManager for React Native NetInfo connection changes
onlineManager.setEventListener((setOnline) => {
  return NetInfo.addEventListener((state) => {
    setOnline(!!state.isConnected);
  });
});

// Native online status checker
const isOnlineCheck = async () => {
  const state = await NetInfo.fetch();
  return !!state.isConnected;
};

// 4. Bootstrap API Client singleton with SecureStore storage adapter
createApiClient(
  env.API_URL,
  {
    getItem: (key) => SecureStore.getItemAsync(key),
    setItem: (key, value) => SecureStore.setItemAsync(key, value),
    removeItem: (key) => SecureStore.deleteItemAsync(key),
  },
  isOnlineCheck
);
