import React from 'react';
import { AppState } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import * as SplashScreen from 'expo-splash-screen';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useQueryClient, focusManager, onlineManager } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createApiClient, createQueryClient, onAuthError } from '@workspace/api';
import NetInfo from '@react-native-community/netinfo';
import { COLORS } from '../constants/theme';
import { env } from '../env';
import { AuthGuard } from '../module/auth/components/AuthGuard';

// ── Keep splash screen visible until we're ready ────────────────────────────
SplashScreen.preventAutoHideAsync();

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

// ── Persist query cache to AsyncStorage for instant loads ────────────────────
const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  // Only persist queries that are successful and not stale
  throttleTime: 1000,
});

// ── Root nav — switches between auth and tab stacks ───────────────────────
function RootLayoutNav() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [authAlertVisible, setAuthAlertVisible] = React.useState(false);

  // ── Listen for 401 events from the axios interceptor ──
  React.useEffect(() => {
    const cleanup = onAuthError(() => {
      queryClient.setQueryData(['auth', 'me'], null);
      setAuthAlertVisible(true);
      router.replace('/(auth)/login');
    });
    return cleanup;
  }, [queryClient, router]);

  return (
    <>
      <AuthGuard>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#08110F' },
          }}
        >
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
import { ErrorBoundary } from '../components/ErrorBoundary';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <PersistQueryClientProvider
          client={queryClient}
          persistOptions={{
            persister: asyncStoragePersister,
            // Max age for persisted cache: 24 hours
            maxAge: 1000 * 60 * 60 * 24,
            // Don't persist auth queries (they should always be fresh)
            dehydrateOptions: {
              shouldDehydrateQuery: (query) => {
                // Skip persisting auth queries and failed queries
                const isAuthQuery = query.queryKey[0] === 'auth';
                const isSuccess = query.state.status === 'success';
                return isSuccess && !isAuthQuery;
              },
            },
          }}
        >
          <RootLayoutNav />
          <StatusBar style="dark" />
        </PersistQueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
