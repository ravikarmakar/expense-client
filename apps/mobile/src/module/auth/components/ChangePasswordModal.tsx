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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useKeyboardHeight } from '@/hooks/useKeyboardHeight';
import { useHideTabBar } from '@/hooks/useHideTabBar';

interface ChangePasswordModalProps {
  visible: boolean;
  onClose: () => void;
}

export function ChangePasswordModal({ visible, onClose }: ChangePasswordModalProps) {
  const [successAlertVisible, setSuccessAlertVisible] = useState(false);
  const insets = useSafeAreaInsets();
  const keyboardHeight = useKeyboardHeight();
  useHideTabBar(visible);

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

  const renderContent = () => (
    <View style={[authStyles.modalContent, { paddingBottom: Math.max(insets.bottom, 24) + 8 }]}>
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

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={authStyles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {errorMessage ? <Text style={authStyles.errorText}>{errorMessage}</Text> : null}

        {step === 'VERIFY' ? (
          <View style={authStyles.formContainer}>
            <Text style={authStyles.modalDescription}>
              Please enter your current password to continue.
            </Text>

            <AuthTextInput
              label="CURRENT PASSWORD"
              icon="lock-closed-outline"
              placeholder="Enter current password"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry={!isCurrentPasswordVisible}
              rightIcon={isCurrentPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
              onRightIconPress={() => setIsCurrentPasswordVisible(!isCurrentPasswordVisible)}
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
              Choose a strong, secure password that is at least 8 characters long.
            </Text>

            <AuthTextInput
              label="NEW PASSWORD"
              icon="lock-closed-outline"
              placeholder="Enter new password"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry={!isNewPasswordVisible}
              rightIcon={isNewPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
              onRightIconPress={() => setIsNewPasswordVisible(!isNewPasswordVisible)}
            />

            <AuthTextInput
              label="CONFIRM PASSWORD"
              icon="lock-closed-outline"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!isConfirmPasswordVisible}
              rightIcon={isConfirmPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
              onRightIconPress={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}
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
  );

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
        statusBarTranslucent={true}
      >
        <View
          style={[
            authStyles.modalOverlay,
            Platform.OS === 'android' && {
              paddingBottom: Math.max(0, keyboardHeight - insets.bottom),
            },
          ]}
        >
          {Platform.OS === 'ios' ? (
            <KeyboardAvoidingView behavior="padding" style={authStyles.keyboardAvoidingView}>
              {renderContent()}
            </KeyboardAvoidingView>
          ) : (
            <View style={authStyles.keyboardAvoidingView}>{renderContent()}</View>
          )}
        </View>
      </Modal>
    </>
  );
}
