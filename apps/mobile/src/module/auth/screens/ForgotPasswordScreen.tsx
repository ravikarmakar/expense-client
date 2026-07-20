import React, { useRef, useEffect } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { router } from 'expo-router';
import { useForgotPasswordController } from '@workspace/api';

import { AuthScreenLayout } from '../components/AuthScreenLayout';
import { EmailStep } from '../components/forgot-password/EmailStep';
import { VerifyStep } from '../components/forgot-password/VerifyStep';
import { ResetStep } from '../components/forgot-password/ResetStep';
import { SuccessStep } from '../components/forgot-password/SuccessStep';

/**
 * Premium Dark Matte Forgot Password Screen (#08110F).
 * Features top safe area back button, dark matte styling, full-width input fields,
 * and Welcome-page style Tactile Action Buttons across all 4 steps.
 */
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

  const getStepTitle = () => {
    switch (step) {
      case 'EMAIL':
        return 'Reset Password';
      case 'VERIFY':
        return 'Verify Code';
      case 'RESET':
        return 'New Password';
      case 'SUCCESS':
        return 'Success!';
    }
  };

  return (
    <AuthScreenLayout
      title={getStepTitle()}
      onBack={step === 'SUCCESS' ? undefined : onBackHandler}
    >
      {step === 'EMAIL' && (
        <EmailStep
          email={email}
          setEmail={setEmail}
          onSendOtp={handleSendOtp}
          loading={emailLoading}
          errorMessage={errorMessage}
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
        />
      )}

      {step === 'SUCCESS' && <SuccessStep onBackToSignIn={() => router.replace('/login')} />}
    </AuthScreenLayout>
  );
}
