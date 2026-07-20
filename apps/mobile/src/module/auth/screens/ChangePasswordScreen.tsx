import React, { useRef, useState, useCallback } from 'react';
import { View, Text, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useChangePasswordController } from '@workspace/api';

import { AuthScreenLayout } from '../components/AuthScreenLayout';
import { AuthTextInput } from '../components/AuthTextInput';
import { PasswordRequirements } from '../components/PasswordRequirements';
import { TactileButton } from '../../../components/TactileButton';
import { CustomAlertDialog } from '@/components/CustomAlertDialog';
import { authStyles } from '../styles/auth.styles';
import { hapticFeedback } from '../../../utils/haptics';

/**
 * Premium Dark Matte Change Password Screen (#08110F).
 * Two-step: verify current password → set new password.
 * Uses identical auth components as Register/Signup for visual consistency.
 */
export default function ChangePasswordScreen() {
  const [successAlertVisible, setSuccessAlertVisible] = useState(false);

  const newPasswordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);

  // Inline validation states
  const [currentPasswordError, setCurrentPasswordError] = useState('');
  const [newPasswordError, setNewPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  const {
    step,
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    isCurrentPasswordVisible,
    setIsCurrentPasswordVisible,
    isNewPasswordVisible,
    setIsNewPasswordVisible,
    isConfirmPasswordVisible,
    setIsConfirmPasswordVisible,
    errorMessage,
    verifyLoading,
    changeLoading,
    handleVerifyPassword,
    handleChangePassword,
  } = useChangePasswordController({
    onSuccess: (action) => {
      if (action === 'CHANGED') {
        hapticFeedback.success();
        setSuccessAlertVisible(true);
      }
    },
    onError: () => {
      hapticFeedback.error();
    },
  });

  // Inline Validation
  const validateCurrentPasswordOnBlur = useCallback(() => {
    if (!currentPassword) {
      setCurrentPasswordError('Current password is required');
      hapticFeedback.error();
      return false;
    }
    setCurrentPasswordError('');
    return true;
  }, [currentPassword]);

  const validateNewPasswordOnBlur = useCallback(() => {
    if (!newPassword) {
      setNewPasswordError('New password is required');
      hapticFeedback.error();
      return false;
    } else if (newPassword.length < 8) {
      setNewPasswordError('Password must be at least 8 characters');
      hapticFeedback.error();
      return false;
    }
    setNewPasswordError('');
    return true;
  }, [newPassword]);

  const validateConfirmPasswordOnBlur = useCallback(() => {
    if (!confirmPassword) {
      setConfirmPasswordError('Please confirm your new password');
      hapticFeedback.error();
      return false;
    } else if (confirmPassword !== newPassword) {
      setConfirmPasswordError('Passwords do not match');
      hapticFeedback.error();
      return false;
    }
    setConfirmPasswordError('');
    return true;
  }, [confirmPassword, newPassword]);

  const onVerifySubmit = useCallback(() => {
    if (validateCurrentPasswordOnBlur()) {
      handleVerifyPassword();
    }
  }, [validateCurrentPasswordOnBlur, handleVerifyPassword]);

  const onChangeSubmit = useCallback(() => {
    const isNewValid = validateNewPasswordOnBlur();
    const isConfirmValid = validateConfirmPasswordOnBlur();
    if (isNewValid && isConfirmValid) {
      handleChangePassword();
    }
  }, [validateNewPasswordOnBlur, validateConfirmPasswordOnBlur, handleChangePassword]);

  const title = step === 'VERIFY' ? 'Verify Identity' : 'Set New Password';
  const loading = verifyLoading || changeLoading;

  return (
    <>
      <CustomAlertDialog
        visible={successAlertVisible}
        title="Password Updated"
        message="Your password has been changed successfully."
        onConfirm={() => {
          setSuccessAlertVisible(false);
          router.back();
        }}
        confirmText="Awesome"
        icon="checkmark-circle"
        iconColor="#34d399"
      />

      <AuthScreenLayout title={title} onBack={() => router.back()}>
        {/* API Error Banner */}
        {errorMessage ? (
          <View style={authStyles.errorContainer}>
            <Ionicons name="alert-circle" size={18} color="#fca5a5" />
            <Text style={authStyles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        {step === 'VERIFY' ? (
          <>
            <AuthTextInput
              label="Current Password"
              icon="lock-closed-outline"
              placeholder="Enter your current password"
              value={currentPassword}
              onChangeText={(text) => {
                setCurrentPassword(text);
                if (currentPasswordError) setCurrentPasswordError('');
              }}
              onBlur={validateCurrentPasswordOnBlur}
              error={currentPasswordError}
              secureTextEntry={!isCurrentPasswordVisible}
              autoCapitalize="none"
              autoComplete="password"
              textContentType="password"
              returnKeyType="done"
              onSubmitEditing={onVerifySubmit}
              loading={loading}
              rightIcon={isCurrentPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
              onRightIconPress={() => setIsCurrentPasswordVisible(!isCurrentPasswordVisible)}
            />

            <TactileButton
              title="Verify Password"
              icon="shield-checkmark-outline"
              variant="emerald"
              onPress={onVerifySubmit}
              loading={verifyLoading}
            />
          </>
        ) : (
          <>
            {/* New Password */}
            <AuthTextInput
              ref={newPasswordRef}
              label="New Password"
              icon="lock-closed-outline"
              placeholder="Min 8 chars (A-Z, a-z, 0-9, !@#)"
              value={newPassword}
              onChangeText={(text) => {
                setNewPassword(text);
                if (newPasswordError) setNewPasswordError('');
              }}
              onBlur={validateNewPasswordOnBlur}
              error={newPasswordError}
              secureTextEntry={!isNewPasswordVisible}
              autoCapitalize="none"
              autoComplete="off"
              textContentType="oneTimeCode"
              returnKeyType="next"
              onSubmitEditing={() => confirmPasswordRef.current?.focus()}
              blurOnSubmit={false}
              loading={loading}
              rightIcon={isNewPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
              onRightIconPress={() => setIsNewPasswordVisible(!isNewPasswordVisible)}
            />

            {newPassword.length > 0 && <PasswordRequirements password={newPassword} />}

            {/* Confirm New Password */}
            <AuthTextInput
              ref={confirmPasswordRef}
              label="Confirm New Password"
              icon="lock-closed-outline"
              placeholder="Re-enter your new password"
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                if (confirmPasswordError) setConfirmPasswordError('');
              }}
              onBlur={validateConfirmPasswordOnBlur}
              error={confirmPasswordError}
              secureTextEntry={!isConfirmPasswordVisible}
              autoCapitalize="none"
              autoComplete="off"
              textContentType="oneTimeCode"
              returnKeyType="done"
              onSubmitEditing={onChangeSubmit}
              loading={loading}
              rightIcon={isConfirmPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
              onRightIconPress={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}
            />

            <TactileButton
              title="Update Password"
              icon="checkmark-done-outline"
              variant="emerald"
              onPress={onChangeSubmit}
              loading={changeLoading}
              style={{ marginTop: 8 }}
            />
          </>
        )}
      </AuthScreenLayout>
    </>
  );
}
