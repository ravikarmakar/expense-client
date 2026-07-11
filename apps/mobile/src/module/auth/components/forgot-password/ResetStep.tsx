import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { z } from 'zod';
import { COLORS } from '../../../../constants/theme';
import { PasswordRequirements } from '../PasswordRequirements';
import { AuthTextInput } from '../AuthTextInput';
import { authStyles } from '../../styles/auth.styles';

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
    <View style={authStyles.stepContainer}>
      {/* Header Section */}
      <View style={authStyles.headerSection}>
        <View style={[authStyles.backButtonRow, loading && { opacity: 0.5 }]}>
          <TouchableOpacity
            onPress={onBack}
            activeOpacity={0.7}
            style={authStyles.backButton}
            disabled={loading}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.onSurface} />
          </TouchableOpacity>
        </View>
        <Text style={authStyles.headerTitle}>New Password</Text>
        <Text style={authStyles.headerSubtitle}>
          Please choose a strong password to secure your account.
        </Text>
      </View>

      {/* Form Section */}
      <View style={authStyles.formSection}>
        {errorMessage ? (
          <View style={authStyles.errorContainer}>
            <Ionicons name="alert-circle" size={18} color={COLORS.error} />
            <Text style={authStyles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        {/* New Password Input */}
        <AuthTextInput
          label="New Password"
          icon="lock-closed-outline"
          value={newPassword}
          onChangeText={setNewPassword}
          placeholder="Enter new password"
          secureTextEntry={secureNewPassword}
          autoCapitalize="none"
          textContentType="oneTimeCode"
          autoComplete="off"
          loading={loading}
          rightIcon={secureNewPassword ? 'eye-off-outline' : 'eye-outline'}
          onRightIconPress={() => setSecureNewPassword(!secureNewPassword)}
        />

        {newPassword.length > 0 && <PasswordRequirements password={newPassword} />}

        {/* Confirm New Password Input */}
        <AuthTextInput
          label="Confirm New Password"
          icon="lock-closed-outline"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Confirm new password"
          secureTextEntry={secureConfirmPassword}
          autoCapitalize="none"
          textContentType="oneTimeCode"
          autoComplete="off"
          loading={loading}
          rightIcon={secureConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
          onRightIconPress={() => setSecureConfirmPassword(!secureConfirmPassword)}
        />

        {/* Reset Password Button */}
        <TouchableOpacity
          onPress={handleSubmit}
          style={[authStyles.primaryButton, isSubmitDisabled && authStyles.disabledButton]}
          activeOpacity={0.8}
          disabled={isSubmitDisabled}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={authStyles.primaryButtonText}>Reset Password</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
