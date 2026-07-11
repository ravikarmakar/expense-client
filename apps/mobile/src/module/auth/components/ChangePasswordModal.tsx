import React, { useState } from 'react';
import {
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
import { COLORS } from '../../../constants/theme';
import { AuthTextInput } from './AuthTextInput';
import { CustomAlertDialog } from '@/components/CustomAlertDialog';
import { useChangePasswordController } from '@workspace/api';
import { authStyles } from '../styles/auth.styles';

interface ChangePasswordModalProps {
  visible: boolean;
  onClose: () => void;
}

export function ChangePasswordModal({ visible, onClose }: ChangePasswordModalProps) {
  const [successAlertVisible, setSuccessAlertVisible] = useState(false);

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
        setSuccessAlertVisible(true);
      }
    },
    onError: () => {},
  });

  const handleClose = () => {
    resetController();
    onClose();
  };

  const handleAlertConfirm = () => {
    setSuccessAlertVisible(false);
    handleClose();
  };

  const isVerifyButtonDisabled = !currentPassword.trim() || verifyLoading;
  const isChangeButtonDisabled = !newPassword.trim() || !confirmPassword.trim() || changeLoading;

  return (
    <>
      <CustomAlertDialog
        visible={successAlertVisible}
        title="Password Updated"
        message="Your password has been changed successfully."
        onConfirm={handleAlertConfirm}
        confirmText="Awesome"
        icon="checkmark-circle"
        iconColor={COLORS.primary}
      />
      <Modal
        animationType="slide"
        transparent={true}
        visible={visible}
        onRequestClose={handleClose}
      >
        <View style={authStyles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={authStyles.keyboardAvoidingView}
          >
            <View style={authStyles.modalContent}>
              {/* Header */}
              <View style={authStyles.modalHeader}>
                <Text style={authStyles.modalTitle}>
                  {step === 'VERIFY' ? 'Verify Identity' : 'Set New Password'}
                </Text>
                <TouchableOpacity
                  onPress={handleClose}
                  style={authStyles.closeButton}
                  activeOpacity={0.7}
                  disabled={verifyLoading || changeLoading}
                >
                  <Ionicons name="close" size={24} color={COLORS.onSurface} />
                </TouchableOpacity>
              </View>

              {/* Error Message */}
              {errorMessage ? (
                <View style={authStyles.errorContainer}>
                  <Ionicons name="alert-circle" size={18} color={COLORS.error} />
                  <Text style={authStyles.errorText}>{errorMessage}</Text>
                </View>
              ) : null}

              {/* Form scroll wrapper to prevent button hiding */}
              <ScrollView
                contentContainerStyle={authStyles.scrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                {step === 'VERIFY' ? (
                  <View style={authStyles.formContainer}>
                    <Text style={authStyles.modalDescription}>
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
                      onRightIconPress={() =>
                        setIsCurrentPasswordVisible(!isCurrentPasswordVisible)
                      }
                    />

                    <TouchableOpacity
                      onPress={handleVerifyPassword}
                      style={[
                        authStyles.primaryButton,
                        isVerifyButtonDisabled && authStyles.disabledButton,
                      ]}
                      activeOpacity={0.8}
                      disabled={isVerifyButtonDisabled}
                    >
                      {verifyLoading ? (
                        <ActivityIndicator color="#ffffff" />
                      ) : (
                        <Text style={authStyles.primaryButtonText}>Verify Password</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={authStyles.formContainer}>
                    <Text style={authStyles.modalDescription}>
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
                      onRightIconPress={() =>
                        setIsConfirmPasswordVisible(!isConfirmPasswordVisible)
                      }
                    />

                    <TouchableOpacity
                      onPress={handleChangePassword}
                      style={[
                        authStyles.primaryButton,
                        isChangeButtonDisabled && authStyles.disabledButton,
                      ]}
                      activeOpacity={0.8}
                      disabled={isChangeButtonDisabled}
                    >
                      {changeLoading ? (
                        <ActivityIndicator color="#ffffff" />
                      ) : (
                        <Text style={authStyles.primaryButtonText}>Update Password</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                )}
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </>
  );
}
