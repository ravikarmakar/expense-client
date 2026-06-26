import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClientProvider } from '@tanstack/react-query';
import { createApiClient, createQueryClient } from '@workspace/api';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { COLORS } from '../constants/theme';
import { env } from '../env';

// ── Bootstrap the API client once, at module load time ──────────────────────
// AsyncStorage is the platform storage adapter for React Native.
createApiClient(env.API_URL, {
  getItem: (key) => AsyncStorage.getItem(key),
  setItem: (key, value) => AsyncStorage.setItem(key, value),
  removeItem: (key) => AsyncStorage.removeItem(key),
});

// Create QueryClient outside component to avoid re-creation on re-renders
const queryClient = createQueryClient();

// ── Root nav — switches between auth and tab stacks ───────────────────────
function RootLayoutNav() {
  const { isAuthenticated, isReady } = useAuth();

  // Show a loading indicator while we check AsyncStorage for a saved token
  if (!isReady) {
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
      {isAuthenticated ? (
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      ) : (
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      )}
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RootLayoutNav />
        <StatusBar style="dark" />
      </AuthProvider>
    </QueryClientProvider>
  );
}
