import React from 'react';
import { ActivityIndicator, View, AppState } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { Stack, useRouter, useRootNavigationState } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClientProvider, useQueryClient, focusManager } from '@tanstack/react-query';
import { createApiClient, createQueryClient, useMe, onAuthError } from '@workspace/api';
import { COLORS } from '../constants/theme';
import { env } from '../env';

// ── Bootstrap the API client once, at module load time ──────────────────────
// expo-secure-store is the secure storage adapter for mobile apps.
createApiClient(env.API_URL, {
  getItem: (key) => SecureStore.getItemAsync(key),
  setItem: (key, value) => SecureStore.setItemAsync(key, value),
  removeItem: (key) => SecureStore.deleteItemAsync(key),
});

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

// Create QueryClient outside component to avoid re-creation on re-renders
const queryClient = createQueryClient();

// ── Root nav — switches between auth and tab stacks ───────────────────────
function RootLayoutNav() {
  const { data: user, isLoading, isError } = useMe();
  const router = useRouter();
  const rootNavigationState = useRootNavigationState();
  const queryClient = useQueryClient();

  console.warn('[RootLayoutNav] state:', { user, isLoading, isError });

  // ── Listen for 401 events from the axios interceptor ──
  React.useEffect(() => {
    const cleanup = onAuthError(() => {
      queryClient.setQueryData(['auth', 'me'], null);
    });
    return cleanup;
  }, [queryClient]);

  React.useEffect(() => {
    if (isLoading || !rootNavigationState?.key) return;

    if (user) {
      if (user.emailVerified === false) {
        router.replace({ pathname: '/(auth)/otp', params: { email: user.email } });
      } else {
        router.replace('/(tabs)');
      }
    } else {
      router.replace('/(auth)/login');
    }
  }, [user, isLoading, isError, rootNavigationState?.key]);

  // Show a loading indicator while we check/fetch session
  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: COLORS.background,
        }}
      >
        <ActivityIndicator size="large" color={COLORS.secondary} />
      </View>
    );
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="groups/[id]" options={{ headerShown: false }} />
      </Stack>
      <UpdateDialog />
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
