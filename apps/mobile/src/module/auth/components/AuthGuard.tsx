import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useRouter, useRootNavigationState } from 'expo-router';
import { useMe } from '@workspace/api';
import { COLORS } from '../../../constants/theme';

/**
 * AuthGuard — centralised authentication gate for the app.
 *
 * Reads the current `useMe()` query and, once the root navigator is ready,
 * redirects to the correct stack:
 *   • Authenticated + unverified email  →  OTP screen
 *   • Authenticated + verified          →  Tab stack
 *   • Unauthenticated                   →  Login screen
 *
 * A `lastRouteRef` prevents duplicate navigations when reactive deps like
 * `rootNavigationState.key` change after a redirect has already fired (this
 * was the source of the "double login-page navigation" bug on logout).
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { data: user, isLoading } = useMe();
  const router = useRouter();
  const rootNavigationState = useRootNavigationState();
  const isNavigationReady = React.useMemo(
    () => !!rootNavigationState?.key,
    [rootNavigationState?.key]
  );

  // Track the last route we navigated to so we never fire the same
  // redirect twice in a row (prevents the double-navigation bug).
  const lastRouteRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    // Wait until the query has settled AND the navigator is mounted.
    if (isLoading || !isNavigationReady) return;

    let targetRoute: string;

    if (user) {
      if (user.emailVerified === false) {
        targetRoute = `/(auth)/otp?email=${user.email}`;
      } else {
        targetRoute = '/(tabs)';
      }
    } else {
      targetRoute = '/(auth)/login';
    }

    // Only navigate if we haven't already redirected to this route.
    if (lastRouteRef.current !== targetRoute) {
      lastRouteRef.current = targetRoute;

      if (user && user.emailVerified === false) {
        router.replace({
          pathname: '/(auth)/otp',
          params: { email: user.email },
        });
      } else if (user) {
        router.replace('/(tabs)');
      } else {
        router.replace('/(auth)/login');
      }
    }
  }, [user, isLoading, isNavigationReady]);

  // Show a loading spinner while the auth state is being resolved.
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

  return <>{children}</>;
}
