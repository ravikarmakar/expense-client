import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

interface AuthScreenLayoutProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  showBranding?: boolean;
  children: React.ReactNode;
}

export function AuthScreenLayout({
  title,
  subtitle,
  onBack,
  showBranding,
  children,
}: AuthScreenLayoutProps) {
  return (
    <SafeAreaView style={styles.container}>
      {showBranding && (
        <LinearGradient colors={['#f0fdf4', '#f8f9fa']} style={StyleSheet.absoluteFillObject} />
      )}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View style={styles.headerSection}>
            {onBack && (
              <View style={styles.backButtonRow}>
                <TouchableOpacity onPress={onBack} activeOpacity={0.7} style={styles.backButton}>
                  <Ionicons name="arrow-back" size={24} color={COLORS.onSurface} />
                </TouchableOpacity>
              </View>
            )}
            {showBranding ? (
              <View style={styles.logoSection}>
                <View style={styles.logoRow}>
                  <Ionicons name="wallet" size={32} color={COLORS.primary} />
                  <Text style={styles.appName}>SplitShare</Text>
                </View>
                <Text style={styles.appTagline}>Splitting bills made easy and beautiful</Text>
              </View>
            ) : (
              <>
                <Text style={styles.headerTitle}>{title}</Text>
                {subtitle ? <Text style={styles.headerSubtitle}>{subtitle}</Text> : null}
              </>
            )}
          </View>

          <View style={styles.formSection}>{children}</View>

          <View style={styles.spacer} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  headerSection: {
    marginTop: 10,
    marginBottom: 30,
  },
  backButtonRow: {
    marginBottom: 20,
    marginLeft: -4,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.onSurface,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.outline,
    marginTop: 6,
    lineHeight: 20,
    fontWeight: '500',
  },
  logoSection: {
    alignItems: 'center',
    marginTop: 14,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },
  appName: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.onSurface,
    letterSpacing: -0.5,
  },
  appTagline: {
    fontSize: 13,
    color: COLORS.outline,
    marginTop: 4,
    fontWeight: '500',
  },
  formSection: {
    backgroundColor: COLORS.surface,
    borderRadius: 28,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainer,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
  },
  spacer: {
    height: 40,
  },
});
