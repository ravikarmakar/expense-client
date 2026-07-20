import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface BrandedLaunchScreenProps {
  logoOpacity?: Animated.Value;
  logoScale?: Animated.Value;
}

/**
 * Premium SplitShare Branded Launch Screen
 *
 * Displays a lush dark emerald gradient background, glassmorphic glowing logo circle,
 * crisp brand typography, and animated pulse loading dots.
 */
export function BrandedLaunchScreen({ logoOpacity, logoScale }: BrandedLaunchScreenProps) {
  // Default values if animation values are not passed
  const defaultOpacity = React.useRef(new Animated.Value(1)).current;
  const defaultScale = React.useRef(new Animated.Value(1)).current;

  const opacity = logoOpacity ?? defaultOpacity;
  const scale = logoScale ?? defaultScale;

  return (
    <LinearGradient
      colors={['#022c22', '#064e3b', '#022c22']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      {/* Decorative ambient background glows */}
      <View style={styles.ambientGlowTop} />
      <View style={styles.ambientGlowBottom} />

      {/* Main Logo Section */}
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity,
            transform: [{ scale }],
          },
        ]}
      >
        <View style={styles.iconGlowWrapper}>
          <LinearGradient
            colors={['rgba(52, 211, 153, 0.25)', 'rgba(16, 185, 129, 0.08)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.iconCircle}
          >
            <Ionicons name="wallet" size={42} color="#34d399" />
          </LinearGradient>
        </View>

        <Text style={styles.appName}>SplitShare</Text>
        <Text style={styles.tagline}>Split expenses, not friendships</Text>
      </Animated.View>

      {/* Bottom Section with Animated Loading Dots */}
      <View style={styles.bottomSection}>
        <LoadingDots />
      </View>
    </LinearGradient>
  );
}

/**
 * Smooth Animated Pulse Dots
 */
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

    const a1 = animate(dot1, 0);
    const a2 = animate(dot2, 150);
    const a3 = animate(dot3, 300);

    a1.start();
    a2.start();
    a3.start();

    return () => {
      a1.stop();
      a2.stop();
      a3.stop();
    };
  }, [dot1, dot2, dot3]);

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
    justifyContent: 'center',
    alignItems: 'center',
  },
  ambientGlowTop: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(52, 211, 153, 0.08)',
  },
  ambientGlowBottom: {
    position: 'absolute',
    bottom: -100,
    left: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(16, 185, 129, 0.06)',
  },
  logoContainer: {
    alignItems: 'center',
  },
  iconGlowWrapper: {
    borderRadius: 48,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 12,
    marginBottom: 22,
  },
  iconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(52, 211, 153, 0.35)',
  },
  appName: {
    fontSize: 34,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.8,
  },
  tagline: {
    fontSize: 14,
    color: 'rgba(209, 250, 229, 0.75)',
    marginTop: 8,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  bottomSection: {
    position: 'absolute',
    bottom: 80,
    alignItems: 'center',
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: '#34d399',
  },
});
