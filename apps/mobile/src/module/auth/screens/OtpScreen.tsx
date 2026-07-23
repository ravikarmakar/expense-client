import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  AppState,
  AppStateStatus,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { COLORS } from '../../../constants/theme';
import { useOtpController } from '@workspace/api';
import { useRouteParams, otpParamsSchema } from '../../../hooks/useRouteParams';
import { AuthScreenLayout } from '../components/AuthScreenLayout';
import { TactileButton } from '../../../components/TactileButton';
import { authStyles } from '../styles/auth.styles';

import { useTheme } from '../../../context/ThemeContext';

const CODE_LENGTH = 6;

const formatCooldown = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s < 10 ? '0' : ''}${s}`;
};

export default function OtpScreen() {
  const { isDark } = useTheme();
  const params = useRouteParams(otpParamsSchema);
  const inputRefs = useRef<(TextInput | null)[]>(Array(CODE_LENGTH).fill(null));
  const cooldownEndTimeRef = useRef<number>(0);

  const {
    email,
    code,
    setCode,
    errorMessage,
    successMessage,
    cooldown,
    setCooldown,
    loading,
    resendLoading,
    isSubmitDisabled,
    handleVerify,
    handleResend,
    handleTextChange,
    handleKeyPress,
  } = useOtpController({
    initialEmail: params.email ?? '',
    onSuccess: (data) => {
      if (data) {
        // Successful verification — navigation redirect
        router.replace('/(tabs)');
      } else {
        // Code resent — start mobile cooldown sync
        cooldownEndTimeRef.current = Date.now() + 60 * 1000;
        setCooldown(60);
      }
    },
    onError: (_errMessage, isRateLimit) => {
      setCode(Array(CODE_LENGTH).fill(''));
      if (isRateLimit) {
        cooldownEndTimeRef.current = Date.now() + 15 * 60 * 1000; // 15 minutes
        setCooldown(15 * 60);
      } else {
        inputRefs.current[0]?.focus();
      }
    },
  });

  const isLockedOut = cooldown > 60;

  // Start initial cooldown on mount
  useEffect(() => {
    cooldownEndTimeRef.current = Date.now() + 60 * 1000;
    setCooldown(60);
  }, []);

  // Sync mobile AppState shifts for precise cooldown timing
  useEffect(() => {
    if (cooldown <= 0) return;

    const updateCooldown = () => {
      const remaining = Math.ceil((cooldownEndTimeRef.current - Date.now()) / 1000);
      if (remaining <= 0) {
        setCooldown(0);
      } else {
        setCooldown(remaining);
      }
    };

    const timer = setInterval(updateCooldown, 1000);

    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        updateCooldown();
      }
    });

    return () => {
      clearInterval(timer);
      subscription.remove();
    };
  }, [cooldown > 0]);

  return (
    <AuthScreenLayout
      title="Verify Email"
      subtitle={`We sent a 6-digit verification code to ${email || 'your email address'}`}
      onBack={() => router.back()}
    >
      {errorMessage ? (
        <View style={authStyles.errorContainer}>
          <Ionicons name="alert-circle" size={18} color={COLORS.error} />
          <Text style={authStyles.errorText}>{errorMessage}</Text>
        </View>
      ) : null}

      {successMessage ? (
        <View style={authStyles.successContainer}>
          <Ionicons name="checkmark-circle" size={18} color={COLORS.secondary} />
          <Text style={authStyles.successText}>{successMessage}</Text>
        </View>
      ) : null}

      {/* OTP Code Box Grid — 6 digits */}
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
              (loading || resendLoading) && { opacity: 0.6 },
            ]}
          >
            <TextInput
              ref={(ref) => {
                inputRefs.current[idx] = ref;
              }}
              value={digit}
              onChangeText={(text) =>
                handleTextChange(text, idx, (nextIdx) => inputRefs.current[nextIdx]?.focus())
              }
              onKeyPress={(e) =>
                handleKeyPress(e.nativeEvent.key, idx, (prevIdx) =>
                  inputRefs.current[prevIdx]?.focus()
                )
              }
              placeholder="•"
              placeholderTextColor={isDark ? 'rgba(255, 255, 255, 0.3)' : '#bccac0'}
              keyboardType="number-pad"
              maxLength={CODE_LENGTH}
              selectTextOnFocus
              style={[authStyles.otpInput, !isDark && { color: '#191c1d' }]}
              editable={!(loading || resendLoading || isLockedOut)}
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
          onPress={handleResend}
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

      {/* Verify Button */}
      <TactileButton
        title={isLockedOut ? `Locked out (${formatCooldown(cooldown)})` : 'Verify & Continue'}
        icon="shield-checkmark-outline"
        variant="emerald"
        onPress={handleVerify}
        loading={loading}
        disabled={isSubmitDisabled || isLockedOut}
        style={{ marginTop: 8 }}
      />
    </AuthScreenLayout>
  );
}
