import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TactileButton } from '../../../components/TactileButton';

/**
 * Premium Dark Matte Welcome Screen (#08110F) inspired by Linear, Arc, Notion & Apple Wallet.
 * Features a subtle top spotlight, 3% opacity emerald blobs, faint vignette, and ultra-clean content focus.
 */
export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();

  // Dynamic top padding to safely clear status bar, camera notch, and dynamic islands
  const topPadding = Math.max(
    insets.top,
    Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) : 20
  );
  const bottomPadding = Math.max(insets.bottom, 20);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Subtle Top Spotlight Gradient Fading into Dark Matte Charcoal-Green */}
      <LinearGradient
        colors={['rgba(20, 42, 33, 0.45)', 'rgba(12, 26, 20, 0.2)', '#08110F']}
        locations={[0, 0.38, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Faint Vignette for Calm Depth & Border Softness */}
      <LinearGradient
        colors={['rgba(4, 9, 8, 0.25)', 'transparent', 'rgba(4, 9, 8, 0.5)']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFillObject}
        pointerEvents="none"
      />

      <View
        style={[
          styles.mainWrapper,
          { paddingTop: topPadding + 10, paddingBottom: bottomPadding + 6 },
        ]}
      >
        {/* Top Header Bar */}
        <View style={styles.header}>
          <View style={styles.brandContainer}>
            <View style={styles.headerIconCircle}>
              <Ionicons name="wallet" size={20} color="#34d399" />
            </View>
            <Text style={styles.headerBrandText}>SplitShare</Text>
          </View>

          <TouchableOpacity
            onPress={() => router.push('/(auth)/login')}
            activeOpacity={0.75}
            style={styles.loginHeaderButton}
          >
            <Text style={styles.loginHeaderText}>Log In</Text>
          </TouchableOpacity>
        </View>

        {/* Center Hero Content */}
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>Split Expenses.{'\n'}Not Friendships.</Text>
          <Text style={styles.heroSubtitle}>
            Track group expenses, manage wallets, and settle up effortlessly with friends.
          </Text>
        </View>

        {/* Bottom Actions Section */}
        <View style={styles.actionsSection}>
          {/*
            Google Auth - commented out until feature is supported
            <TactileButton
              title="Continue with Google"
              icon="logo-google"
              variant="google"
              onPress={() => router.push('/(auth)/login')}
            />

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>
          */}

          {/* Login with Email */}
          <TactileButton
            title="Login with Email"
            icon="mail"
            variant="email"
            onPress={() => router.push('/(auth)/login')}
          />

          {/* Create New Account */}
          <TactileButton
            title="Create New Account"
            icon="person-add"
            variant="emerald"
            onPress={() => router.push('/(auth)/signup')}
            style={{ marginTop: 6 }}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#08110F',
    position: 'relative',
  },
  mainWrapper: {
    flex: 1,
    justifyContent: 'space-between',
    zIndex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(52, 211, 153, 0.14)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.28)',
  },
  headerBrandText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.4,
  },
  loginHeaderButton: {
    paddingVertical: 9,
    paddingHorizontal: 18,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  loginHeaderText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.2,
  },
  heroSection: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    flex: 1,
  },
  heroTitle: {
    fontSize: 40,
    fontWeight: '900',
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: 48,
    letterSpacing: 0.5,
    marginBottom: 14,
  },
  heroSubtitle: {
    fontSize: 15,
    fontWeight: '500',
    color: 'rgba(209, 250, 229, 0.72)',
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 320,
  },
  actionsSection: {
    paddingHorizontal: 22,
  },
});
