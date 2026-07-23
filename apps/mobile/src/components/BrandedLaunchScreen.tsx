import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../context/ThemeContext';

interface BrandedLaunchScreenProps {
  logoOpacity?: Animated.Value;
  logoScale?: Animated.Value;
}

export function BrandedLaunchScreen({ logoOpacity, logoScale }: BrandedLaunchScreenProps) {
  const defaultOpacity = React.useRef(new Animated.Value(1)).current;
  const defaultScale = React.useRef(new Animated.Value(1)).current;
  const { isDark } = useTheme();

  const opacity = logoOpacity ?? defaultOpacity;
  const scale = logoScale ?? defaultScale;

  return (
    <View style={[styles.container, !isDark && { backgroundColor: '#f8f9fa' }]}>
      {/* Top Spotlight Gradient */}
      <LinearGradient
        colors={
          isDark
            ? ['rgba(20, 42, 33, 0.45)', 'rgba(12, 26, 20, 0.2)', '#08110F']
            : ['rgba(232, 240, 254, 0.6)', 'rgba(248, 249, 250, 0.3)', '#f8f9fa']
        }
        locations={[0, 0.38, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

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
          <View
            style={[
              styles.iconCircle,
              !isDark && {
                backgroundColor: 'rgba(0, 105, 72, 0.1)',
                borderColor: 'rgba(0, 105, 72, 0.2)',
                shadowColor: '#006948',
              },
            ]}
          >
            <Ionicons name="wallet" size={42} color={isDark ? '#34d399' : '#006948'} />
          </View>
        </View>

        <Text style={[styles.appName, !isDark && { color: '#191c1d' }]}>SplitShare</Text>
        <Text style={[styles.tagline, !isDark && { color: '#6d7a72' }]}>
          Splitting bills made easy and beautiful
        </Text>
      </Animated.View>

      {/* Bottom Section with Animated Loading Dots */}
      <View style={styles.bottomSection}>
        <LoadingDots isDark={isDark} />
      </View>
    </View>
  );
}

/**
 * Smooth Animated Pulse Dots
 */
function LoadingDots({ isDark }: { isDark: boolean }) {
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
      <Animated.View
        style={[styles.dot, !isDark && { backgroundColor: '#006948' }, { opacity: dot1 }]}
      />
      <Animated.View
        style={[styles.dot, !isDark && { backgroundColor: '#006948' }, { opacity: dot2 }]}
      />
      <Animated.View
        style={[styles.dot, !isDark && { backgroundColor: '#006948' }, { opacity: dot3 }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#08110F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  iconGlowWrapper: {
    marginBottom: 20,
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(52, 211, 153, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(52, 211, 153, 0.3)',
    shadowColor: '#34d399',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  appName: {
    fontSize: 34,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.4,
  },
  tagline: {
    fontSize: 14,
    color: 'rgba(209, 250, 229, 0.7)',
    marginTop: 8,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  bottomSection: {
    position: 'absolute',
    bottom: 70,
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
