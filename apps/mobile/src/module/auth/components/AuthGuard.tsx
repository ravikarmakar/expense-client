import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
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
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { data: user, isLoading } = useMe();
  const router = useRouter();
  const navigationRef = useNavigationContainerRef();
  const [isNavigationReady, setIsNavigationReady] = React.useState(false);
  const [isInitialRedirectDone, setIsInitialRedirectDone] = React.useState(false);

  // Logo spring & opacity animations
  const logoScale = React.useRef(new Animated.Value(0.8)).current;
  const logoOpacity = React.useRef(new Animated.Value(0)).current;
  const lastRouteRef = React.useRef<string | null>(null);
  const splashHiddenRef = React.useRef(false);

  // Animate logo on mount
  React.useEffect(() => {
    Animated.parallel([
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, [logoOpacity, logoScale]);

  // Hide Expo native splash once our React Native tree has painted
  React.useEffect(() => {
    if (!splashHiddenRef.current) {
      splashHiddenRef.current = true;
      SplashScreen.hideAsync();
    }
  }, []);

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

    // Delay hiding the splash overlay until Expo Router completes the background route transition
    const timer = setTimeout(() => {
      setIsInitialRedirectDone(true);
    }, 150);

    return () => clearTimeout(timer);
  }, [user, isLoading, isNavigationReady, router]);

  const showSplashOverlay = isLoading || !isInitialRedirectDone;

  return (
    <View style={styles.container}>
      {/* 1. Always render children (<Stack>) so Root Navigator is ALWAYS mounted */}
      {children}

      {/* 2. Show premium branded splash overlay ON TOP until initial route transition completes */}
      {showSplashOverlay && (
        <View style={styles.splashOverlay}>
          <BrandedLaunchScreen logoOpacity={logoOpacity} logoScale={logoScale} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#08110F',
  },
  splashOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 99999,
  },
});
