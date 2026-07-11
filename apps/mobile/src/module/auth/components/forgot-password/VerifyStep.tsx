import React, { useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../../constants/theme';
import { authStyles } from '../../styles/auth.styles';

const CODE_LENGTH = 6;

const formatCooldown = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s < 10 ? '0' : ''}${s}`;
};

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
  const isLockedOut = cooldown > 60;
  const isSubmitDisabled = code.some((digit) => !digit) || loading || isLockedOut;

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
    if (code.every((digit) => digit !== '') && !loading && !isLockedOut) {
      onVerifyOtp();
    }
  }, [code, loading, isLockedOut]);

  // Auto-focus the first box when code is cleared (e.g., after an error)
  React.useEffect(() => {
    if (code.every((digit) => digit === '')) {
      inputRefs.current[0]?.focus();
    }
  }, [code]);

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
        <Text style={authStyles.headerTitle}>Verify Code</Text>
        <Text style={authStyles.headerSubtitle}>
          We sent a 6-digit reset code to <Text style={authStyles.emailHighlight}>{email}</Text>
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

        {successMessage ? (
          <View style={authStyles.successNotification}>
            <Ionicons name="checkmark-circle" size={18} color={COLORS.secondary} />
            <Text style={authStyles.successNotificationText}>{successMessage}</Text>
          </View>
        ) : null}

        <Text style={authStyles.inputLabel}>Verification Code</Text>
        <View style={authStyles.otpGrid}>
          {code.map((digit, idx) => (
            <View
              key={idx}
              style={[
                authStyles.otpBoxContainer,
                digit ? authStyles.otpBoxFilled : null,
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
                style={authStyles.otpInput}
                editable={!loading && !isLockedOut}
                textContentType="oneTimeCode"
                autoComplete="one-time-code"
              />
            </View>
          ))}
        </View>

        {/* Resend Action */}
        <View style={authStyles.resendContainer}>
          <Text style={authStyles.resendText}>{"Didn't receive the code? "}</Text>
          <TouchableOpacity
            onPress={onResendOtp}
            activeOpacity={0.7}
            disabled={resendLoading || cooldown > 0}
          >
            {resendLoading ? (
              <ActivityIndicator size="small" color={COLORS.secondary} />
            ) : (
              <Text style={[authStyles.resendLink, cooldown > 0 && authStyles.disabledLink]}>
                {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend Code'}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Verify OTP Button */}
        <TouchableOpacity
          onPress={onVerifyOtp}
          style={[authStyles.primaryButton, isSubmitDisabled && authStyles.disabledButton]}
          activeOpacity={0.8}
          disabled={isSubmitDisabled}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={authStyles.primaryButtonText}>
              {isLockedOut ? `Locked out (${formatCooldown(cooldown)})` : 'Verify Code'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
