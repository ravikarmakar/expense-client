import React from 'react';
import { View, StyleSheet } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { useRouter, useNavigationContainerRef, type Href } from 'expo-router';
import { useMe } from '@workspace/api';
import { BrandedLaunchScreen } from '../../../components/BrandedLaunchScreen';

/**
 * AuthGuard — centralised authentication gate for the app.
 *
 * ALWAYS renders `children` (the root <Stack>) underneath so that
 * Expo Router's navigator is mounted on render 1 (preventing layout mounting errors).
 *
 * While auth is resolving, an absolute-positioned SplitShare splash screen covers
 * the screen. Once auth resolves, it navigates to the correct target route:
 *   • Authenticated + unverified email  →  /(auth)/otp
 *   • Authenticated + verified          →  /(tabs)
 *   • Unauthenticated                   →  /(auth)/login
 */
import { useTheme } from '../../../context/ThemeContext';
import { COLORS } from '../../../constants/theme';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isDark } = useTheme();
  const { data: user, isLoading } = useMe();
  const router = useRouter();
  const navigationRef = useNavigationContainerRef();
  const [isNavigationReady, setIsNavigationReady] = React.useState(false);
  const [isInitialRedirectDone, setIsInitialRedirectDone] = React.useState(false);

  const lastRouteRef = React.useRef<string | null>(null);
  const splashHiddenRef = React.useRef(false);

  // Listen for navigation container ready state
  React.useEffect(() => {
    if (isNavigationReady) return;

    if (navigationRef?.isReady()) {
      setIsNavigationReady(true);
      return;
    }

    const unsubscribe = navigationRef?.addListener?.('state', () => {
      if (navigationRef?.isReady()) {
        setIsNavigationReady(true);
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [navigationRef, isNavigationReady]);

  // Navigate once auth is resolved AND navigation is ready
  React.useEffect(() => {
    if (isLoading || !isNavigationReady) return;

    let targetRoute: string;

    if (user) {
      if (user.emailVerified === false) {
        targetRoute = `/(auth)/otp?email=${encodeURIComponent(user.email)}`;
      } else {
        targetRoute = '/(tabs)';
      }
    } else {
      targetRoute = '/(auth)/welcome';
    }

    if (lastRouteRef.current !== targetRoute) {
      lastRouteRef.current = targetRoute;
      router.replace(targetRoute as Href);
    }

    setIsInitialRedirectDone(true);

    if (!splashHiddenRef.current) {
      splashHiddenRef.current = true;
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [user, isLoading, isNavigationReady, router]);

  const showSplashOverlay = isLoading || !isInitialRedirectDone;

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#08110F' : COLORS.background }]}>
      {/* 1. Always render children (<Stack>) so Root Navigator is ALWAYS mounted and navigationRef initializes */}
      {children}

      {/* 2. Show branded splash overlay ON TOP until initial route transition completes, then unmount completely */}
      {showSplashOverlay && (
        <View
          style={[StyleSheet.absoluteFill, { backgroundColor: isDark ? '#08110F' : '#f8f9fa' }]}
        >
          <BrandedLaunchScreen />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
