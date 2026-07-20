import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  StyleSheet,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useChangePasswordController } from '@workspace/api';

import { AuthTextInput } from './AuthTextInput';
import { PasswordRequirements } from './PasswordRequirements';
import { TactileButton } from '../../../components/TactileButton';
import { CustomAlertDialog } from '@/components/CustomAlertDialog';
import { authStyles } from '../styles/auth.styles';
import { useKeyboardHeight } from '@/hooks/useKeyboardHeight';
import { useHideTabBar } from '@/hooks/useHideTabBar';
import { hapticFeedback } from '../../../utils/haptics';

interface ChangePasswordModalProps {
  visible: boolean;
  onClose: () => void;
}

/**
 * Premium Dark Matte Change Password Modal (#08110F).
 * Features real-time inline validation on blur, Tactile Emerald CTAs,
 * live Password Requirements, and native Haptic Feedback.
 */
export function ChangePasswordModal({ visible, onClose }: ChangePasswordModalProps) {
  const [successAlertVisible, setSuccessAlertVisible] = useState(false);
  const insets = useSafeAreaInsets();
  const keyboardHeight = useKeyboardHeight();
  useHideTabBar(visible);

  const newPasswordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);

  // Inline Validation States
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
    resetController,
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

  const handleClose = () => {
    setCurrentPasswordError('');
    setNewPasswordError('');
    setConfirmPasswordError('');
    resetController();
    onClose();
  };

  const handleAlertConfirm = () => {
    setSuccessAlertVisible(false);
    handleClose();
  };

  // Inline Validation Methods
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

  const renderContent = () => (
    <View style={[styles.modalContent, { paddingBottom: Math.max(insets.bottom, 24) + 12 }]}>
      {/* Top Subtle Spotlight Gradient Header */}
      <LinearGradient
        colors={['rgba(20, 42, 33, 0.45)', 'rgba(12, 26, 20, 0.1)', '#08110F']}
        locations={[0, 0.5, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Sheet Handle */}
      <View style={styles.sheetHandleContainer}>
        <View style={styles.sheetHandle} />
      </View>

      {/* Header */}
      <View style={styles.modalHeader}>
        <View style={styles.headerTitleContainer}>
          <View style={styles.iconCircle}>
            <Ionicons name="key-outline" size={18} color="#34d399" />
          </View>
          <Text style={styles.modalTitle}>
            {step === 'VERIFY' ? 'Verify Identity' : 'Set New Password'}
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleClose}
          style={styles.closeButton}
          activeOpacity={0.7}
          disabled={verifyLoading || changeLoading}
        >
          <Ionicons name="close" size={22} color="rgba(255, 255, 255, 0.8)" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {errorMessage ? (
          <View style={authStyles.errorContainer}>
            <Ionicons name="alert-circle" size={18} color="#fca5a5" />
            <Text style={authStyles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        {step === 'VERIFY' ? (
          <View style={styles.formContainer}>
            <Text style={styles.modalDescription}>
              Please enter your current password to confirm your identity.
            </Text>

            <AuthTextInput
              label="Current Password"
              icon="lock-closed-outline"
              placeholder="Enter current password"
              value={currentPassword}
              onChangeText={(text) => {
                setCurrentPassword(text);
                if (currentPasswordError) setCurrentPasswordError('');
              }}
              onBlur={validateCurrentPasswordOnBlur}
              error={currentPasswordError}
              secureTextEntry={!isCurrentPasswordVisible}
              returnKeyType="done"
              onSubmitEditing={onVerifySubmit}
              loading={verifyLoading}
              rightIcon={isCurrentPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
              onRightIconPress={() => setIsCurrentPasswordVisible(!isCurrentPasswordVisible)}
            />

            <TactileButton
              title="Verify Password"
              icon="shield-checkmark-outline"
              variant="emerald"
              onPress={onVerifySubmit}
              loading={verifyLoading}
              style={{ marginTop: 12 }}
            />
          </View>
        ) : (
          <View style={styles.formContainer}>
            <Text style={styles.modalDescription}>
              Choose a strong, secure password that is at least 8 characters long.
            </Text>

            {/* New Password */}
            <AuthTextInput
              ref={newPasswordRef}
              label="New Password"
              icon="lock-closed-outline"
              placeholder="Enter new password"
              value={newPassword}
              onChangeText={(text) => {
                setNewPassword(text);
                if (newPasswordError) setNewPasswordError('');
              }}
              onBlur={validateNewPasswordOnBlur}
              error={newPasswordError}
              secureTextEntry={!isNewPasswordVisible}
              returnKeyType="next"
              onSubmitEditing={() => confirmPasswordRef.current?.focus()}
              blurOnSubmit={false}
              loading={changeLoading}
              rightIcon={isNewPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
              onRightIconPress={() => setIsNewPasswordVisible(!isNewPasswordVisible)}
            />

            {newPassword.length > 0 && <PasswordRequirements password={newPassword} />}

            {/* Confirm Password */}
            <AuthTextInput
              ref={confirmPasswordRef}
              label="Confirm New Password"
              icon="lock-closed-outline"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                if (confirmPasswordError) setConfirmPasswordError('');
              }}
              onBlur={validateConfirmPasswordOnBlur}
              error={confirmPasswordError}
              secureTextEntry={!isConfirmPasswordVisible}
              returnKeyType="done"
              onSubmitEditing={onChangeSubmit}
              loading={changeLoading}
              rightIcon={isConfirmPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
              onRightIconPress={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}
            />

            <TactileButton
              title="Update Password"
              icon="checkmark-done-outline"
              variant="emerald"
              onPress={onChangeSubmit}
              loading={changeLoading}
              style={{ marginTop: 12 }}
            />
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
        iconColor="#34d399"
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
            styles.modalOverlay,
            Platform.OS === 'android' && {
              paddingBottom: Math.max(0, keyboardHeight - insets.bottom),
            },
          ]}
        >
          {Platform.OS === 'ios' ? (
            <KeyboardAvoidingView behavior="padding" style={styles.keyboardAvoidingView}>
              {renderContent()}
            </KeyboardAvoidingView>
          ) : (
            <View style={styles.keyboardAvoidingView}>{renderContent()}</View>
          )}
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(4, 9, 8, 0.75)',
    justifyContent: 'flex-end',
  },
  keyboardAvoidingView: {
    width: '100%',
  },
  modalContent: {
    backgroundColor: '#08110F',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 22,
    paddingTop: 12,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.18)',
    position: 'relative',
    overflow: 'hidden',
  },
  sheetHandleContainer: {
    alignItems: 'center',
    paddingVertical: 8,
    marginBottom: 8,
  },
  sheetHandle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(52, 211, 153, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.25)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.3,
  },
  closeButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  modalDescription: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(209, 250, 229, 0.7)',
    lineHeight: 20,
    marginBottom: 18,
  },
  scrollContent: {
    paddingBottom: 10,
  },
  formContainer: {
    width: '100%',
  },
});
