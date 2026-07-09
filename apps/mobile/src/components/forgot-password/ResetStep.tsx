import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { z } from 'zod';
import { COLORS } from '../../constants/theme';
import { PasswordRequirements } from '../PasswordRequirements';

const localResetPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character'),
    confirmPassword: z.string().min(1, 'Confirm password is required'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

interface ResetStepProps {
  newPassword: string;
  setNewPassword: (p: string) => void;
  confirmPassword: string;
  setConfirmPassword: (p: string) => void;
  onResetPassword: () => void;
  loading: boolean;
  errorMessage: string;
  setErrorMessage: (msg: string) => void;
  onBack: () => void;
}

export function ResetStep({
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  onResetPassword,
  loading,
  errorMessage,
  setErrorMessage,
  onBack,
}: ResetStepProps) {
  const [secureNewPassword, setSecureNewPassword] = useState(true);
  const [secureConfirmPassword, setSecureConfirmPassword] = useState(true);

  const isSubmitDisabled = !newPassword || !confirmPassword || loading;

  const handleSubmit = () => {
    const result = localResetPasswordSchema.safeParse({
      newPassword,
      confirmPassword,
    });
    if (!result.success) {
      setErrorMessage(result.error.issues[0].message);
      return;
    }
    setErrorMessage('');
    onResetPassword();
  };

  return (
    <View style={styles.stepContainer}>
      {/* Header Section */}
      <View style={styles.headerSection}>
        <View style={[styles.backButtonRow, loading && { opacity: 0.5 }]}>
          <TouchableOpacity
            onPress={onBack}
            activeOpacity={0.7}
            style={styles.backButton}
            disabled={loading}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.onSurface} />
          </TouchableOpacity>
        </View>
        <Text style={styles.headerTitle}>New Password</Text>
        <Text style={styles.headerSubtitle}>
          Please choose a strong password to secure your account.
        </Text>
      </View>

      {/* Form Section */}
      <View style={styles.formSection}>
        {errorMessage ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={18} color={COLORS.error} />
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        {/* New Password Input */}
        <Text style={styles.inputLabel}>New Password</Text>
        <View style={[styles.inputContainer, loading && { opacity: 0.6 }]}>
          <Ionicons
            name="lock-closed-outline"
            size={20}
            color={COLORS.outline}
            style={styles.inputIcon}
          />
          <TextInput
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="Enter new password"
            placeholderTextColor={COLORS.outlineVariant}
            secureTextEntry={secureNewPassword}
            autoCapitalize="none"
            autoCorrect={false}
            style={styles.textInput}
            editable={!loading}
          />
          <TouchableOpacity
            onPress={() => setSecureNewPassword(!secureNewPassword)}
            style={styles.eyeIconButton}
            disabled={loading}
          >
            <Ionicons
              name={secureNewPassword ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={COLORS.outline}
            />
          </TouchableOpacity>
        </View>

        {newPassword.length > 0 && <PasswordRequirements password={newPassword} />}

        {/* Confirm New Password Input */}
        <Text style={styles.inputLabel}>Confirm New Password</Text>
        <View style={[styles.inputContainer, loading && { opacity: 0.6 }]}>
          <Ionicons
            name="lock-closed-outline"
            size={20}
            color={COLORS.outline}
            style={styles.inputIcon}
          />
          <TextInput
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirm new password"
            placeholderTextColor={COLORS.outlineVariant}
            secureTextEntry={secureConfirmPassword}
            autoCapitalize="none"
            autoCorrect={false}
            style={styles.textInput}
            editable={!loading}
          />
          <TouchableOpacity
            onPress={() => setSecureConfirmPassword(!secureConfirmPassword)}
            style={styles.eyeIconButton}
            disabled={loading}
          >
            <Ionicons
              name={secureConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={COLORS.outline}
            />
          </TouchableOpacity>
        </View>

        {/* Reset Password Button */}
        <TouchableOpacity
          onPress={handleSubmit}
          style={[styles.primaryButton, isSubmitDisabled && styles.disabledButton]}
          activeOpacity={0.8}
          disabled={isSubmitDisabled}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.primaryButtonText}>Reset Password</Text>
          )}
        </TouchableOpacity>
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
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.errorContainer,
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(186, 26, 26, 0.1)',
  },
  errorText: {
    fontSize: 12,
    color: COLORS.error,
    fontWeight: '600',
    flex: 1,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.outline,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
    paddingLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainer,
    marginBottom: 24,
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    color: COLORS.onSurface,
    fontSize: 15,
    fontWeight: '500',
    height: '100%',
  },
  eyeIconButton: {
    padding: 8,
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
  disabledButton: {
    opacity: 0.7,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});
