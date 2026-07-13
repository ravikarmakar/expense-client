import React from 'react';
import { AppState } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
  QueryClientProvider,
  useQueryClient,
  focusManager,
  onlineManager,
} from '@tanstack/react-query';
import { createApiClient, createQueryClient, onAuthError } from '@workspace/api';
import NetInfo from '@react-native-community/netinfo';
import { COLORS } from '../constants/theme';
import { env } from '../env';
import { AuthGuard } from '../module/auth/components/AuthGuard';

// Configure TanStack Query onlineManager for React Native NetInfo connection changes
onlineManager.setEventListener((setOnline) => {
  return NetInfo.addEventListener((state) => {
    setOnline(!!state.isConnected);
  });
});

// Online checker: Native connection verification via NetInfo
const isOnlineCheck = async () => {
  const state = await NetInfo.fetch();
  return !!state.isConnected;
};

// ── Bootstrap the API client once, at module load time ──────────────────────
// expo-secure-store is the secure storage adapter for mobile apps.
createApiClient(
  env.API_URL,
  {
    getItem: (key) => SecureStore.getItemAsync(key),
    setItem: (key, value) => SecureStore.setItemAsync(key, value),
    removeItem: (key) => SecureStore.deleteItemAsync(key),
  },
  isOnlineCheck
);

// Configure TanStack Query focusManager for React Native AppState changes
focusManager.setEventListener((onFocus) => {
  const subscription = AppState.addEventListener('change', (status) => {
    if (status === 'active') {
      onFocus();
    }
  });

  return () => subscription.remove();
});

import { UpdateDialog } from '../components/UpdateDialog';
import { CustomAlertDialog } from '../components/CustomAlertDialog';

// Create QueryClient outside component to avoid re-creation on re-renders
const queryClient = createQueryClient();

// ── Root nav — switches between auth and tab stacks ───────────────────────
function RootLayoutNav() {
  const queryClient = useQueryClient();
  const [authAlertVisible, setAuthAlertVisible] = React.useState(false);

  // ── Listen for 401 events from the axios interceptor ──
  React.useEffect(() => {
    const cleanup = onAuthError(() => {
      queryClient.setQueryData(['auth', 'me'], null);
      setAuthAlertVisible(true);
    });
    return cleanup;
  }, [queryClient]);

  return (
    <>
      <AuthGuard>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="groups/[id]" options={{ headerShown: false }} />
        </Stack>
      </AuthGuard>
      <UpdateDialog />
      <CustomAlertDialog
        visible={authAlertVisible}
        title="Session Expired"
        message="Your session has expired. Please log in again."
        onConfirm={() => setAuthAlertVisible(false)}
        icon="log-out"
        iconColor={COLORS.error}
      />
    </>
  );
}

import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <RootLayoutNav />
        <StatusBar style="dark" />
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
