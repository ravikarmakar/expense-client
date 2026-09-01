import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';

// 1. Initialize native bootstrap and API client BEFORE component tree mounts
import '../config/bootstrap';

// 2. Import query client and persistence options
import { queryClient, persistOptions } from '../config/queryClient';

// 3. Import UI components, context, and custom hooks
import { ThemeProvider, useTheme } from '../context/ThemeContext';
import { AuthGuard } from '../module/auth/components/AuthGuard';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { UpdateDialog } from '../components/UpdateDialog';
import { CustomAlertDialog } from '../components/CustomAlertDialog';
import { useAuthErrorListener } from '../hooks/useAuthErrorListener';
import { COLORS } from '../constants/theme';

/**
 * Root Navigation Stack & UI Overlays
 */
function RootLayoutNav() {
  const { isDark } = useTheme();
  const { authAlertVisible, dismissAlert } = useAuthErrorListener();

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} translucent />
      <AuthGuard>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: isDark ? '#08110F' : COLORS.background },
          }}
        >
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="groups/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="activity-logs" options={{ headerShown: false }} />
        </Stack>
      </AuthGuard>

      {/* Global Application Dialog Overlays */}
      <UpdateDialog />
      <CustomAlertDialog
        visible={authAlertVisible}
        title="Session Expired"
        message="Your session has expired. Please log in again."
        onConfirm={dismissAlert}
        icon="log-out"
        iconColor={COLORS.error}
      />
    </>
  );
}

/**
 * Root Application Layout Entry Point
 */
export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <ThemeProvider>
          <PersistQueryClientProvider client={queryClient} persistOptions={persistOptions}>
            <RootLayoutNav />
          </PersistQueryClientProvider>
        </ThemeProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
