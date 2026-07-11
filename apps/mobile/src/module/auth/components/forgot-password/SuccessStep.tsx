import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../../constants/theme';
import { authStyles } from '../../styles/auth.styles';

interface SuccessStepProps {
  onBackToSignIn: () => void;
}

export function SuccessStep({ onBackToSignIn }: SuccessStepProps) {
  return (
    <View style={authStyles.stepContainer}>
      {/* Header Section */}
      <View style={authStyles.headerSection}>
        <Text style={authStyles.headerTitle}>Success!</Text>
        <Text style={authStyles.headerSubtitle}>Your password has been successfully reset.</Text>
      </View>

      {/* Form/Content Section */}
      <View style={authStyles.formSection}>
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
            style={authStyles.primaryButton}
            activeOpacity={0.8}
          >
            <Text style={authStyles.primaryButtonText}>Back to Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
});
