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
        <View style={authStyles.errorContainer}>
          <Ionicons name="alert-circle" size={18} color="#fca5a5" />
          <Text style={authStyles.errorText}>{errorMessage}</Text>
        </View>
      ) : null}

      {successMessage ? (
        <View style={authStyles.successContainer}>
          <Ionicons name="checkmark-circle" size={18} color="#6ee7b7" />
          <Text style={authStyles.successText}>{successMessage}</Text>
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
              placeholderTextColor="rgba(255, 255, 255, 0.3)"
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
            <ActivityIndicator size="small" color="#34d399" />
          ) : (
            <Text style={[authStyles.resendLink, cooldown > 0 && authStyles.disabledLink]}>
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
      <Text style={styles.footerNote}>
        We sent a 6-digit reset code to <Text style={styles.emailHighlight}>{email}</Text>
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
