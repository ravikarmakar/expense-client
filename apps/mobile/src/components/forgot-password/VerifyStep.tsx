import React, { useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';

const CODE_LENGTH = 6;

interface VerifyStepProps {
  email: string;
  code: string[];
  setCode: (code: string[]) => void;
  onVerifyOtp: () => void;
  onResendOtp: () => void;
  loading: boolean;
  resendLoading: boolean;
  cooldown: number;
  errorMessage: string;
  successMessage: string;
  onBack: () => void;
}

export function VerifyStep({
  email,
  code,
  setCode,
  onVerifyOtp,
  onResendOtp,
  loading,
  resendLoading,
  cooldown,
  errorMessage,
  successMessage,
  onBack,
}: VerifyStepProps) {
  const inputRefs = useRef<(TextInput | null)[]>(Array(CODE_LENGTH).fill(null));
  const isSubmitDisabled = code.some((digit) => !digit) || loading;

  const handleTextChange = (text: string, index: number) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    if (cleaned.length > 1) {
      // Paste behavior
      const newCode = [...code];
      const pasteLength = Math.min(cleaned.length, CODE_LENGTH - index);
      for (let i = 0; i < pasteLength; i++) {
        newCode[index + i] = cleaned[i];
      }
      setCode(newCode);

      // Focus the last filled box
      const lastFocusIndex = Math.min(index + pasteLength, CODE_LENGTH - 1);
      inputRefs.current[lastFocusIndex]?.focus();
      return;
    }

    // Single digit typing
    const digit = cleaned.slice(-1);
    const newCode = [...code];
    newCode[index] = digit;
    setCode(newCode);

    if (digit.length > 0 && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: { nativeEvent: { key: string } }, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && code[index] === '' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Auto-submit when all code digits are filled
  React.useEffect(() => {
    if (code.every((digit) => digit !== '') && !loading) {
      onVerifyOtp();
    }
  }, [code, loading]);

  // Auto-focus the first box when code is cleared (e.g., after an error)
  React.useEffect(() => {
    if (code.every((digit) => digit === '')) {
      inputRefs.current[0]?.focus();
    }
  }, [code]);

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
        <Text style={styles.headerTitle}>Verify Code</Text>
        <Text style={styles.headerSubtitle}>
          We sent a 6-digit reset code to <Text style={styles.emailHighlight}>{email}</Text>
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

        {successMessage ? (
          <View style={styles.successNotification}>
            <Ionicons name="checkmark-circle" size={18} color={COLORS.secondary} />
            <Text style={styles.successNotificationText}>{successMessage}</Text>
          </View>
        ) : null}

        <Text style={styles.inputLabel}>Verification Code</Text>
        <View style={styles.otpGrid}>
          {code.map((digit, idx) => (
            <View
              key={idx}
              style={[
                styles.otpBoxContainer,
                digit ? styles.otpBoxFilled : null,
                loading && { opacity: 0.6 },
              ]}
            >
              <TextInput
                ref={(ref) => {
                  inputRefs.current[idx] = ref;
                }}
                value={digit}
                onChangeText={(text) => handleTextChange(text, idx)}
                onKeyPress={(e) => handleKeyPress(e, idx)}
                placeholder="•"
                placeholderTextColor={COLORS.outlineVariant}
                keyboardType="number-pad"
                maxLength={CODE_LENGTH}
                selectTextOnFocus
                style={styles.otpInput}
                editable={!loading}
                textContentType="oneTimeCode"
                autoComplete="one-time-code"
              />
            </View>
          ))}
        </View>

        {/* Resend Action */}
        <View style={styles.resendContainer}>
          <Text style={styles.resendText}>{"Didn't receive the code? "}</Text>
          <TouchableOpacity
            onPress={onResendOtp}
            activeOpacity={0.7}
            disabled={resendLoading || cooldown > 0}
          >
            {resendLoading ? (
              <ActivityIndicator size="small" color={COLORS.secondary} />
            ) : (
              <Text style={[styles.resendLink, cooldown > 0 && styles.disabledLink]}>
                {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend Code'}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Verify OTP Button */}
        <TouchableOpacity
          onPress={onVerifyOtp}
          style={[styles.primaryButton, isSubmitDisabled && styles.disabledButton]}
          activeOpacity={0.8}
          disabled={isSubmitDisabled}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.primaryButtonText}>Verify Code</Text>
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
  emailHighlight: {
    fontWeight: '700',
    color: COLORS.onSurface,
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
  successNotification: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(22, 163, 74, 0.08)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(22, 163, 74, 0.15)',
  },
  successNotificationText: {
    fontSize: 12,
    color: COLORS.secondary,
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
  otpGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 24,
  },
  otpBoxContainer: {
    flex: 1,
    height: 58,
    borderRadius: 14,
    backgroundColor: COLORS.surfaceContainerLow,
    borderWidth: 1.5,
    borderColor: COLORS.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpBoxFilled: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.surface,
  },
  otpInput: {
    width: '100%',
    height: '100%',
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  resendText: {
    fontSize: 13,
    color: COLORS.outline,
    fontWeight: '500',
  },
  resendLink: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  disabledLink: {
    color: COLORS.outline,
    opacity: 0.6,
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
