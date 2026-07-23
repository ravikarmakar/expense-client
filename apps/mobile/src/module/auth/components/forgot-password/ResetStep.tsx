import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { z } from 'zod';
import { PasswordRequirements } from '../PasswordRequirements';
import { AuthTextInput } from '../AuthTextInput';
import { TactileButton } from '../../../../components/TactileButton';
import { authStyles } from '../../styles/auth.styles';

import { useTheme } from '../../../../context/ThemeContext';

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
}: ResetStepProps) {
  const { isDark } = useTheme();
  const [secureNewPassword, setSecureNewPassword] = useState(true);
  const [secureConfirmPassword, setSecureConfirmPassword] = useState(true);

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
    <View style={{ width: '100%' }}>
      {errorMessage ? (
        <View
          style={[
            authStyles.errorContainer,
            !isDark && { backgroundColor: '#fee2e2', borderColor: '#fca5a5' },
          ]}
        >
          <Ionicons name="alert-circle" size={18} color={isDark ? '#fca5a5' : '#dc2626'} />
          <Text style={[authStyles.errorText, !isDark && { color: '#dc2626' }]}>
            {errorMessage}
          </Text>
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
      <TactileButton
        title="Reset Password"
        icon="key-outline"
        variant="emerald"
        onPress={handleSubmit}
        loading={loading}
        style={{ marginTop: 8 }}
      />

      {/* Helper description note placed below the button */}
      <Text style={[styles.footerNote, !isDark && { color: '#6d7a72' }]}>
        Please choose a strong password to secure your account.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  footerNote: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 19,
    fontWeight: '500',
    paddingHorizontal: 12,
  },
});
