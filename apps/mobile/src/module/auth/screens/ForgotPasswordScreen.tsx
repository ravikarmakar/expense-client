import React, { useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  AppState,
  AppStateStatus,
} from 'react-native';
import { router } from 'expo-router';
import { COLORS } from '../../../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForgotPasswordController } from '@workspace/api';

import { EmailStep } from '../components/forgot-password/EmailStep';
import { VerifyStep } from '../components/forgot-password/VerifyStep';
import { ResetStep } from '../components/forgot-password/ResetStep';
import { SuccessStep } from '../components/forgot-password/SuccessStep';

export default function ForgotPasswordScreen() {
  const cooldownEndTimeRef = useRef<number>(0);

  const {
    step,
    email,
    setEmail,
    code,
    setCode,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    errorMessage,
    setErrorMessage,
    successMessage,
    cooldown,
    setCooldown,
    emailLoading,
    verifyLoading,
    resetLoading,
    handleSendOtp,
    handleResendOtp,
    handleVerifyOtp,
    handleResetPassword,
    handleBackPress,
  } = useForgotPasswordController({
    onSuccess: (nextStep) => {
      if (nextStep === 'VERIFY') {
        cooldownEndTimeRef.current = Date.now() + 60 * 1000;
        setCooldown(60);
      }
    },
    onError: (_errMessage, isRateLimit) => {
      if (isRateLimit) {
        cooldownEndTimeRef.current = Date.now() + 15 * 60 * 1000;
        setCooldown(15 * 60);
      }
    },
  });

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

  const onBackHandler = () => {
    handleBackPress(() => router.back());
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {step === 'EMAIL' && (
            <EmailStep
              email={email}
              setEmail={setEmail}
              onSendOtp={handleSendOtp}
              loading={emailLoading}
              errorMessage={errorMessage}
              onBack={onBackHandler}
            />
          )}

          {step === 'VERIFY' && (
            <VerifyStep
              email={email}
              code={code}
              setCode={setCode}
              onVerifyOtp={handleVerifyOtp}
              onResendOtp={handleResendOtp}
              loading={verifyLoading}
              resendLoading={emailLoading}
              cooldown={cooldown}
              errorMessage={errorMessage}
              successMessage={successMessage}
              onBack={onBackHandler}
            />
          )}

          {step === 'RESET' && (
            <ResetStep
              newPassword={newPassword}
              setNewPassword={setNewPassword}
              confirmPassword={confirmPassword}
              setConfirmPassword={setConfirmPassword}
              onResetPassword={handleResetPassword}
              loading={resetLoading}
              errorMessage={errorMessage}
              setErrorMessage={setErrorMessage}
              onBack={onBackHandler}
            />
          )}

          {step === 'SUCCESS' && <SuccessStep onBackToSignIn={() => router.replace('/login')} />}

          <View style={styles.spacer} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  spacer: {
    height: 60,
  },
});
