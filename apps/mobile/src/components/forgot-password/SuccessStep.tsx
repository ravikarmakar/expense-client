import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';

interface SuccessStepProps {
  onBackToSignIn: () => void;
}

export function SuccessStep({ onBackToSignIn }: SuccessStepProps) {
  return (
    <View style={styles.stepContainer}>
      {/* Header Section */}
      <View style={styles.headerSection}>
        <Text style={styles.headerTitle}>Success!</Text>
        <Text style={styles.headerSubtitle}>Your password has been successfully reset.</Text>
      </View>

      {/* Form/Content Section */}
      <View style={styles.formSection}>
        <View style={styles.successContainer}>
          <View style={styles.successIconBadge}>
            <Ionicons name="checkmark-circle" size={56} color={COLORS.primary} />
          </View>
          <Text style={styles.successTitle}>Password Reset Complete</Text>
          <Text style={styles.successDescription}>
            Your password has been successfully updated. You can now use your new password to sign
            in.
          </Text>

          <TouchableOpacity
            onPress={onBackToSignIn}
            style={styles.primaryButton}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>Back to Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  stepContainer: {
    flex: 1,
  },
  headerSection: {
    marginTop: 10,
    marginBottom: 30,
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
  formSection: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainer,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  successIconBadge: {
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.onSurface,
    marginBottom: 8,
  },
  successDescription: {
    fontSize: 14,
    color: COLORS.outline,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
    fontWeight: '500',
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    width: '100%',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});
