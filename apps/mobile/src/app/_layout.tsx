import React from 'react';
import { ActivityIndicator, View, AppState, Text } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { Stack, useRouter, useRootNavigationState } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
  QueryClientProvider,
  useQueryClient,
  focusManager,
  onlineManager,
} from '@tanstack/react-query';
import {
  createApiClient,
  createQueryClient,
  useMe,
  onAuthError,
  onSlowRequest,
} from '@workspace/api';
import NetInfo from '@react-native-community/netinfo';
import { COLORS } from '../constants/theme';
import { env } from '../env';

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
  const { data: user, isLoading, isError } = useMe();
  const router = useRouter();
  const rootNavigationState = useRootNavigationState();
  const queryClient = useQueryClient();
  const [isSlowConnection, setIsSlowConnection] = React.useState(false);
  const [authAlertVisible, setAuthAlertVisible] = React.useState(false);

  console.warn('[RootLayoutNav] state:', { user, isLoading, isError });

  // ── Listen for 401 events from the axios interceptor ──
  React.useEffect(() => {
    const cleanup = onAuthError(() => {
      queryClient.setQueryData(['auth', 'me'], null);
      setAuthAlertVisible(true);
    });
    return cleanup;
  }, [queryClient]);

  // ── Listen for slow requests ──
  React.useEffect(() => {
    const cleanup = onSlowRequest((isSlow) => {
      setIsSlowConnection(isSlow);
    });
    return cleanup;
  }, []);

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
      {isSlowConnection && (
        <View
          style={{
            position: 'absolute',
            top: 50,
            left: 20,
            right: 20,
            backgroundColor: 'rgba(235, 94, 40, 0.95)',
            paddingVertical: 8,
            paddingHorizontal: 16,
            borderRadius: 8,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
            zIndex: 9999,
          }}
        >
          <ActivityIndicator size="small" color="#fff" style={{ marginRight: 8 }} />
          <Text style={{ color: '#fff', fontWeight: '600', fontSize: 13 }}>
            Slow network connection detected...
          </Text>
        </View>
      )}
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
