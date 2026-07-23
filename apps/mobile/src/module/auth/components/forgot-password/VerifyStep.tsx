import React, { useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TactileButton } from '../../../../components/TactileButton';
import { authStyles } from '../../styles/auth.styles';

import { useTheme } from '../../../../context/ThemeContext';

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
}: VerifyStepProps) {
  const { isDark } = useTheme();
  const inputRefs = useRef<(TextInput | null)[]>(Array(CODE_LENGTH).fill(null));
  const isLockedOut = cooldown > 60;

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

  // Auto-focus the first box when code is cleared
  React.useEffect(() => {
    if (code.every((digit) => digit === '')) {
      inputRefs.current[0]?.focus();
    }
  }, [code]);

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

      {successMessage ? (
        <View
          style={[
            authStyles.successContainer,
            !isDark && { backgroundColor: '#d1fae5', borderColor: '#6ee7b7' },
          ]}
        >
          <Ionicons name="checkmark-circle" size={18} color={isDark ? '#6ee7b7' : '#059669'} />
          <Text style={[authStyles.successText, !isDark && { color: '#059669' }]}>
            {successMessage}
          </Text>
        </View>
      ) : null}

      <Text style={[authStyles.inputLabel, !isDark && { color: '#6d7a72' }]}>
        Verification Code
      </Text>
      <View style={authStyles.otpGrid}>
        {code.map((digit, idx) => (
          <View
            key={idx}
            style={[
              authStyles.otpBoxContainer,
              !isDark && {
                backgroundColor: '#f3f4f5',
                borderColor: '#e2ece6',
              },
              digit && isDark && authStyles.otpBoxFilled,
              digit &&
                !isDark && {
                  backgroundColor: '#e6f4ea',
                  borderColor: '#006948',
                },
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
              placeholderTextColor={isDark ? 'rgba(255, 255, 255, 0.3)' : '#bccac0'}
              keyboardType="number-pad"
              maxLength={CODE_LENGTH}
              selectTextOnFocus
              style={[authStyles.otpInput, !isDark && { color: '#191c1d' }]}
              editable={!loading && !isLockedOut}
              textContentType="oneTimeCode"
              autoComplete="one-time-code"
              selectionColor={isDark ? '#10b981' : '#006948'}
            />
          </View>
        ))}
      </View>

      {/* Resend Action */}
      <View style={authStyles.resendContainer}>
        <Text style={[authStyles.resendText, !isDark && { color: '#6d7a72' }]}>
          {"Didn't receive the code? "}
        </Text>
        <TouchableOpacity
          onPress={onResendOtp}
          activeOpacity={0.7}
          disabled={resendLoading || cooldown > 0}
        >
          {resendLoading ? (
            <ActivityIndicator size="small" color={isDark ? '#34d399' : '#006948'} />
          ) : (
            <Text
              style={[
                authStyles.resendLink,
                !isDark && { color: '#006948' },
                cooldown > 0 && (isDark ? authStyles.disabledLink : { color: '#bccac0' }),
              ]}
            >
              {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend Code'}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Verify OTP Button */}
      <TactileButton
        title={isLockedOut ? `Locked out (${formatCooldown(cooldown)})` : 'Verify Code'}
        icon="shield-checkmark-outline"
        variant="emerald"
        onPress={onVerifyOtp}
        loading={loading}
        style={{ marginTop: 8 }}
      />

      {/* Helper description note placed below the button */}
      <Text style={[styles.footerNote, !isDark && { color: '#6d7a72' }]}>
        We sent a 6-digit reset code to{' '}
        <Text style={[styles.emailHighlight, !isDark && { color: '#191c1d' }]}>{email}</Text>
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
  emailHighlight: {
    color: '#ffffff',
    fontWeight: '700',
  },
});
