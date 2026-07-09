import React, { useState, useRef, useEffect } from 'react';
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
import { COLORS } from '../../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  useForgotPassword,
  useVerifyResetCode,
  useResetPassword,
  getErrorMessage,
  clientForgotPasswordSchema,
  clientVerifyResetCodeSchema,
  clientResetPasswordSchema,
} from '@workspace/api';

import { EmailStep } from '../../components/forgot-password/EmailStep';
import { VerifyStep } from '../../components/forgot-password/VerifyStep';
import { ResetStep } from '../../components/forgot-password/ResetStep';
import { SuccessStep } from '../../components/forgot-password/SuccessStep';

const CODE_LENGTH = 6;
type Step = 'EMAIL' | 'VERIFY' | 'RESET' | 'SUCCESS';

export default function ForgotPasswordScreen() {
  const forgotPasswordMutation = useForgotPassword();
  const verifyResetCodeMutation = useVerifyResetCode();
  const resetPasswordMutation = useResetPassword();

  const [step, setStep] = useState<Step>('EMAIL');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(''));

  // Security fix: Store the successfully verified code separately from live state inputs
  const [verifiedCode, setVerifiedCode] = useState('');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [cooldown, setCooldown] = useState(0);

  const cooldownEndTimeRef = useRef<number>(0);

  const startCooldown = (seconds: number) => {
    cooldownEndTimeRef.current = Date.now() + seconds * 1000;
    setCooldown(seconds);
  };

  // Robust timer for cooldown that updates on AppState change (prevents timer leaks/freezes)
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

  const handleSendOtp = () => {
    const trimmedEmail = email.trim();
    const result = clientForgotPasswordSchema.safeParse({ email: trimmedEmail });
    if (!result.success) {
      setErrorMessage(result.error.issues[0].message);
      return;
    }
    setErrorMessage('');
    forgotPasswordMutation.mutate(
      { email: trimmedEmail },
      {
        onSuccess: () => {
          setStep('VERIFY');
          startCooldown(60);
          setSuccessMessage('A 6-digit reset code has been sent to your email.');
        },
        onError: (err) =>
          setErrorMessage(getErrorMessage(err, 'Failed to send reset code. Please try again.')),
      }
    );
  };

  const handleResendOtp = () => {
    if (cooldown > 0) return;
    const trimmedEmail = email.trim();
    setErrorMessage('');
    setSuccessMessage('');
    forgotPasswordMutation.mutate(
      { email: trimmedEmail },
      {
        onSuccess: () => {
          setSuccessMessage('A new verification code has been sent to your email.');
          setCode(Array(CODE_LENGTH).fill(''));
          startCooldown(60);
        },
        onError: (err) => {
          setErrorMessage(getErrorMessage(err, 'Failed to resend code. Please try again.'));
        },
      }
    );
  };

  const handleVerifyOtp = () => {
    const fullCode = code.join('');
    const trimmedEmail = email.trim();

    const result = clientVerifyResetCodeSchema.safeParse({
      email: trimmedEmail,
      code: fullCode,
    });

    if (!result.success) {
      setErrorMessage(result.error.issues[0].message);
      return;
    }

    setErrorMessage('');
    setSuccessMessage('');
    verifyResetCodeMutation.mutate(result.data, {
      onSuccess: () => {
        // Fix: Save verified code to state to close the security gap
        setVerifiedCode(fullCode);
        setStep('RESET');
      },
      onError: (err) => {
        setErrorMessage(getErrorMessage(err, 'Invalid or expired code. Please try again.'));
      },
    });
  };

  const handleResetPassword = () => {
    const trimmedEmail = email.trim();

    // Fix: Validate using verifiedCode instead of live state code array
    const validation = clientResetPasswordSchema.safeParse({
      email: trimmedEmail,
      code: verifiedCode,
      newPassword,
    });

    if (!validation.success) {
      setErrorMessage(validation.error.issues[0].message);
      return;
    }

    setErrorMessage('');
    setSuccessMessage('');
    resetPasswordMutation.mutate(validation.data, {
      onSuccess: () => {
        setStep('SUCCESS');
      },
      onError: (err) => {
        setErrorMessage(getErrorMessage(err, 'Password reset failed. Please check your inputs.'));
      },
    });
  };

  const handleBackPress = () => {
    setErrorMessage('');
    setSuccessMessage('');
    if (step === 'VERIFY') {
      setStep('EMAIL');
    } else if (step === 'RESET') {
      setStep('VERIFY');
      // Fix: Do not clear the code array here
    } else {
      router.back();
    }
  };

  const emailLoading = forgotPasswordMutation.isPending;
  const verifyLoading = verifyResetCodeMutation.isPending;
  const resetLoading = resetPasswordMutation.isPending;

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
              onBack={handleBackPress}
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
              onBack={handleBackPress}
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
              onBack={handleBackPress}
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
