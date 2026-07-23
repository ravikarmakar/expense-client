import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../context/ThemeContext';

import { AppBackground } from '../../../components/AppBackground';

interface AuthScreenLayoutProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  children: React.ReactNode;
}

export function AuthScreenLayout({ title, subtitle, onBack, children }: AuthScreenLayoutProps) {
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const paddingTop =
    Math.max(insets.top, Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 20) + 8;

  return (
    <AppBackground style={styles.container}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        translucent
        backgroundColor="transparent"
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingTop }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Top Safe Area Header Bar */}
          <View style={styles.headerSection}>
            <View style={styles.topHeaderRow}>
              {onBack ? (
                <TouchableOpacity
                  onPress={onBack}
                  activeOpacity={0.7}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  style={styles.backButton}
                >
                  <Ionicons name="arrow-back" size={26} color={isDark ? '#ffffff' : '#191c1d'} />
                </TouchableOpacity>
              ) : null}
              <Text style={[styles.headerTitle, !isDark && { color: '#191c1d' }]}>{title}</Text>
            </View>
            {subtitle ? (
              <Text style={[styles.headerSubtitle, !isDark && { color: '#6d7a72' }]}>
                {subtitle}
              </Text>
            ) : null}
          </View>

          {/* Form Content */}
          <View style={styles.contentSection}>{children}</View>

          <View style={styles.spacer} />
        </ScrollView>
      </KeyboardAvoidingView>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#08110F',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingBottom: 30,
  },
  headerSection: {
    marginTop: 8,
    marginBottom: 24,
  },
  topHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    padding: 4,
    marginLeft: -4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(209, 250, 229, 0.72)',
    marginTop: 6,
    lineHeight: 20,
    fontWeight: '500',
  },
  contentSection: {
    width: '100%',
  },
  spacer: {
    height: 20,
  },
});
