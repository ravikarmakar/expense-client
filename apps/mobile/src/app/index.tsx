import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { Redirect } from 'expo-router';
import { useMe } from '@workspace/api';
import { COLORS } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';

/**
 * Initial splash route — the very first screen Expo Router renders.
 *
 * Shows the SplitShare branded logo screen while auth resolves,
 * then uses Expo Router's declarative <Redirect /> to navigate directly to:
 *   • /(tabs) if authenticated
 *   • /(auth)/otp if email unverified
 *   • /(auth)/login if unauthenticated
 */
export default function SplashRoute() {
  const { data: user, isLoading } = useMe();
  const logoScale = React.useRef(new Animated.Value(0.8)).current;
  const logoOpacity = React.useRef(new Animated.Value(0)).current;

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
  }, []);

  // Hide the native splash once our branded screen is painted
  React.useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  // 1. While auth state is resolving, render SplitShare branded splash screen
  if (isLoading) {
    return (
      <View style={styles.container}>
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: logoOpacity,
              transform: [{ scale: logoScale }],
            },
          ]}
        >
          <View style={styles.iconCircle}>
            <Ionicons name="wallet" size={40} color="#ffffff" />
          </View>
          <Text style={styles.appName}>SplitShare</Text>
          <Text style={styles.tagline}>Split expenses, not friendships</Text>
        </Animated.View>

        <View style={styles.bottomSection}>
          <LoadingDots />
        </View>
      </View>
    );
  }

  // 2. Auth resolved: Redirect declaratively based on user state
  if (user) {
    if (user.emailVerified === false) {
      return (
        <Redirect
          href={{
            pathname: '/(auth)/otp',
            params: { email: user.email },
          }}
        />
      );
    }
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/(auth)/login" />;
}

function LoadingDots() {
  const dot1 = React.useRef(new Animated.Value(0.3)).current;
  const dot2 = React.useRef(new Animated.Value(0.3)).current;
  const dot3 = React.useRef(new Animated.Value(0.3)).current;

  React.useEffect(() => {
    const animate = (dot: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0.3,
            duration: 400,
            useNativeDriver: true,
          }),
        ])
      );

    animate(dot1, 0).start();
    animate(dot2, 150).start();
    animate(dot3, 300).start();
  }, []);

  return (
    <View style={styles.dotsRow}>
      <Animated.View style={[styles.dot, { opacity: dot1 }]} />
      <Animated.View style={[styles.dot, { opacity: dot2 }]} />
      <Animated.View style={[styles.dot, { opacity: dot3 }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  appName: {
    fontSize: 32,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 8,
    fontWeight: '500',
  },
  bottomSection: {
    position: 'absolute',
    bottom: 80,
    alignItems: 'center',
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ffffff',
  },
});
