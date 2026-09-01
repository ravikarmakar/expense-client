import React from 'react';
import { View, StyleSheet } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { useRouter, type Href } from 'expo-router';
import { useMe } from '@workspace/api';
import { useTheme } from '../../../context/ThemeContext';
import { COLORS } from '../../../constants/theme';
import { OfflineScreen } from '../../../components/OfflineScreen';
import { useNetworkStatus } from '../../../hooks/useNetworkStatus';
import { useNavigationReady } from '../../../hooks/useNavigationReady';

/**
 * Determines target route based on user auth status
 */
function getAuthTargetRoute(
  user: { emailVerified?: boolean; email: string } | null | undefined
): string {
  if (user) {
    if (user.emailVerified === false) {
      return `/(auth)/otp?email=${encodeURIComponent(user.email)}`;
    }
    return '/(tabs)';
  }
  return '/(auth)/welcome';
}

/**
 * AuthGuard — centralized authentication gate for the app.
 *
 * Keeps native OS splash screen visible while auth resolves in background.
 * Uses modular hooks for network monitoring and navigation container readiness.
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isDark } = useTheme();
  const { data: user, isLoading, refetch } = useMe();
  const router = useRouter();
  const isNavigationReady = useNavigationReady();
  const { isOffline, retryConnection } = useNetworkStatus(refetch);

  const lastRouteRef = React.useRef<string | null>(null);
  const splashHiddenRef = React.useRef(false);

  // Hide native splash helper
  const hideSplashDirectly = React.useCallback(() => {
    if (!splashHiddenRef.current) {
      splashHiddenRef.current = true;
      SplashScreen.hideAsync().catch(() => {});
    }
  }, []);

  // Auth Resolution & Route Transition Effect
  React.useEffect(() => {
    if (isLoading || !isNavigationReady) return;

    // If offline without a cached user session, reveal offline view
    if (isOffline && !user) {
      hideSplashDirectly();
      return;
    }

    const targetRoute = getAuthTargetRoute(user);

    if (lastRouteRef.current !== targetRoute) {
      lastRouteRef.current = targetRoute;
      router.replace(targetRoute as Href);

      // Hide native splash screen directly onto target screen once route transition completes
      const timer = setTimeout(hideSplashDirectly, 100);
      return () => clearTimeout(timer);
    } else {
      hideSplashDirectly();
    }
  }, [user, isLoading, isNavigationReady, isOffline, router, hideSplashDirectly]);

  // If offline, without cached user session, and initial loading complete: show OfflineScreen
  if (isOffline && !user && !isLoading) {
    return <OfflineScreen onRetry={retryConnection} />;
  }

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#08110F' : COLORS.background }]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
