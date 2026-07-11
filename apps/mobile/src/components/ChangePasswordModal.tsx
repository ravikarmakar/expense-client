import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { AuthTextInput } from './AuthTextInput';
import { useChangePasswordController } from '@workspace/api';

interface ChangePasswordModalProps {
  visible: boolean;
  onClose: () => void;
}

export function ChangePasswordModal({ visible, onClose }: ChangePasswordModalProps) {
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
    resetController,
  } = useChangePasswordController({
    onSuccess: (action) => {
      if (action === 'CHANGED') {
        alert('Success: Your password has been changed successfully.');
        handleClose();
      }
    },
    onError: () => {},
  });

  const handleClose = () => {
    resetController();
    onClose();
  };

  const isVerifyButtonDisabled = !currentPassword.trim() || verifyLoading;
  const isChangeButtonDisabled = !newPassword.trim() || !confirmPassword.trim() || changeLoading;

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={handleClose}>
      <View style={styles.modalOverlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoidingView}
        >
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {step === 'VERIFY' ? 'Verify Identity' : 'Set New Password'}
              </Text>
              <TouchableOpacity
                onPress={handleClose}
                style={styles.closeButton}
                activeOpacity={0.7}
                disabled={verifyLoading || changeLoading}
              >
                <Ionicons name="close" size={24} color={COLORS.onSurface} />
              </TouchableOpacity>
            </View>

            {/* Error Message */}
            {errorMessage ? (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={18} color={COLORS.error} />
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}

            {/* Form scroll wrapper to prevent button hiding */}
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {step === 'VERIFY' ? (
                <View style={styles.formContainer}>
                  <Text style={styles.modalDescription}>
                    Please enter your current password to continue.
                  </Text>

                  <AuthTextInput
                    label="Current Password"
                    icon="lock-closed-outline"
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                    placeholder="Enter current password"
                    secureTextEntry={!isCurrentPasswordVisible}
                    autoCapitalize="none"
                    textContentType="oneTimeCode"
                    autoComplete="off"
                    loading={verifyLoading}
                    rightIcon={isCurrentPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
                    onRightIconPress={() => setIsCurrentPasswordVisible(!isCurrentPasswordVisible)}
                  />

                  <TouchableOpacity
                    onPress={handleVerifyPassword}
                    style={[styles.primaryButton, isVerifyButtonDisabled && styles.disabledButton]}
                    activeOpacity={0.8}
                    disabled={isVerifyButtonDisabled}
                  >
                    {verifyLoading ? (
                      <ActivityIndicator color="#ffffff" />
                    ) : (
                      <Text style={styles.primaryButtonText}>Verify Password</Text>
                    )}
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.formContainer}>
                  <Text style={styles.modalDescription}>
                    Create a new secure password. It must meet complexity requirements.
                  </Text>

                  <AuthTextInput
                    label="New Password"
                    icon="lock-closed-outline"
                    value={newPassword}
                    onChangeText={setNewPassword}
                    placeholder="Enter new password"
                    secureTextEntry={!isNewPasswordVisible}
                    autoCapitalize="none"
                    textContentType="oneTimeCode"
                    autoComplete="off"
                    loading={changeLoading}
                    rightIcon={isNewPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
                    onRightIconPress={() => setIsNewPasswordVisible(!isNewPasswordVisible)}
                  />

                  <AuthTextInput
                    label="Confirm New Password"
                    icon="lock-closed-outline"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Confirm new password"
                    secureTextEntry={!isConfirmPasswordVisible}
                    autoCapitalize="none"
                    textContentType="oneTimeCode"
                    autoComplete="off"
                    loading={changeLoading}
                    rightIcon={isConfirmPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
                    onRightIconPress={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}
                  />

                  <TouchableOpacity
                    onPress={handleChangePassword}
                    style={[styles.primaryButton, isChangeButtonDisabled && styles.disabledButton]}
                    activeOpacity={0.8}
                    disabled={isChangeButtonDisabled}
                  >
                    {changeLoading ? (
                      <ActivityIndicator color="#ffffff" />
                    ) : (
                      <Text style={styles.primaryButtonText}>Update Password</Text>
                    )}
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  keyboardAvoidingView: {
    width: '100%',
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainer,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  closeButton: {
    padding: 4,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.errorContainer,
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(186, 26, 26, 0.1)',
  },
  errorText: {
    fontSize: 12,
    color: COLORS.error,
    fontWeight: '600',
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  formContainer: {
    width: '100%',
  },
  modalDescription: {
    fontSize: 13,
    color: COLORS.outline,
    marginBottom: 20,
    lineHeight: 18,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    height: 54,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    marginTop: 16,
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
