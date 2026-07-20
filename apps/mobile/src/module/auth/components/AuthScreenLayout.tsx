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
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

interface AuthScreenLayoutProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  children: React.ReactNode;
}

/**
 * Clean Dark Matte Auth Screen Layout (#08110F).
 * Features top safe area back button aligned with heading, full-width content section,
 * and top spotlight depth.
 */
export function AuthScreenLayout({ title, subtitle, onBack, children }: AuthScreenLayoutProps) {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Top Spotlight Gradient */}
      <LinearGradient
        colors={['rgba(20, 42, 33, 0.45)', 'rgba(12, 26, 20, 0.2)', '#08110F']}
        locations={[0, 0.38, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Faint Edge Vignette */}
      <LinearGradient
        colors={['rgba(4, 9, 8, 0.25)', 'transparent', 'rgba(4, 9, 8, 0.5)']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFillObject}
        pointerEvents="none"
      />

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
          {/* Top Safe Area Header Bar with Back Arrow and Title in Heading Row */}
          <View style={styles.headerSection}>
            <View style={styles.topHeaderRow}>
              {onBack ? (
                <TouchableOpacity
                  onPress={onBack}
                  activeOpacity={0.7}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  style={styles.backButton}
                >
                  <Ionicons name="arrow-back" size={26} color="#ffffff" />
                </TouchableOpacity>
              ) : null}
              <Text style={styles.headerTitle}>{title}</Text>
            </View>
            {subtitle ? <Text style={styles.headerSubtitle}>{subtitle}</Text> : null}
          </View>

          {/* Full-Size Form Content */}
          <View style={styles.contentSection}>{children}</View>

          <View style={styles.spacer} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
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
