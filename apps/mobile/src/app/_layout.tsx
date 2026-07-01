import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClientProvider, useQueryClient } from '@tanstack/react-query';
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

// Create QueryClient outside component to avoid re-creation on re-renders
const queryClient = createQueryClient();

// ── Root nav — switches between auth and tab stacks ───────────────────────
function RootLayoutNav() {
  const { data: user, isLoading, isError } = useMe();
  const router = useRouter();
  const queryClient = useQueryClient();

  console.log('[RootLayoutNav] state:', { user, isLoading, isError });

  // ── Listen for 401 events from the axios interceptor ──
  React.useEffect(() => {
    const cleanup = onAuthError(() => {
      queryClient.setQueryData(['auth', 'me'], null);
    });
    return cleanup;
  }, [queryClient]);

  React.useEffect(() => {
    if (isLoading) return;

    if (user) {
      if (user.emailVerified === false) {
        router.replace({ pathname: '/(auth)/otp', params: { email: user.email } });
      } else {
        router.replace('/(tabs)');
      }
    } else {
      router.replace('/(auth)/login');
    }
  }, [user, isLoading, isError]);

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
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <RootLayoutNav />
      <StatusBar style="dark" />
    </QueryClientProvider>
  );
}
