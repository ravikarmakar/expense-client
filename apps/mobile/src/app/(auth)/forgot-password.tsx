import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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

const CODE_LENGTH = 6;

type Step = 'EMAIL' | 'VERIFY' | 'RESET' | 'SUCCESS';

export default function ForgotPasswordScreen() {
  const forgotPasswordMutation = useForgotPassword();
  const verifyResetCodeMutation = useVerifyResetCode();
  const resetPasswordMutation = useResetPassword();

  const [step, setStep] = useState<Step>('EMAIL');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [secureNewPassword, setSecureNewPassword] = useState(true);
  const [secureConfirmPassword, setSecureConfirmPassword] = useState(true);

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [cooldown, setCooldown] = useState(0);

  const inputRefs = useRef<(TextInput | null)[]>(Array(CODE_LENGTH).fill(null));

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

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
          setCooldown(60);
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
          inputRefs.current[0]?.focus();
          setCooldown(60);
        },
        onError: (err) => {
          setErrorMessage(getErrorMessage(err, 'Failed to resend code. Please try again.'));
        },
      }
    );
  };

  const handleOtpTextChange = (text: string, index: number) => {
    const digit = text.replace(/[^0-9]/g, '').slice(-1);
    const newCode = [...code];
    newCode[index] = digit;
    setCode(newCode);

    if (digit.length > 0 && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyPress = (e: { nativeEvent: { key: string } }, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && code[index] === '' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
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
        setStep('RESET');
      },
      onError: (err) => {
        setErrorMessage(getErrorMessage(err, 'Invalid or expired code. Please try again.'));
      },
    });
  };

  const handleResetPassword = () => {
    const fullCode = code.join('');
    const trimmedEmail = email.trim();

    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }

    const validation = clientResetPasswordSchema.safeParse({
      email: trimmedEmail,
      code: fullCode,
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
    if (step === 'VERIFY') {
      setStep('EMAIL');
    } else if (step === 'RESET') {
      setStep('VERIFY');
      setCode(Array(CODE_LENGTH).fill(''));
    } else {
      router.back();
    }
  };

  const emailLoading = forgotPasswordMutation.isPending;
  const verifyLoading = verifyResetCodeMutation.isPending;
  const resetLoading = resetPasswordMutation.isPending;

  const isEmailSubmitDisabled = !email.trim() || emailLoading;
  const isVerifySubmitDisabled = code.some((digit) => !digit) || verifyLoading;
  const isResetSubmitDisabled = !newPassword || !confirmPassword || resetLoading;

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
          {/* Header Section */}
          <View style={styles.headerSection}>
            <View
              style={[
                styles.backButtonRow,
                (emailLoading || verifyLoading || resetLoading) && { opacity: 0.5 },
              ]}
            >
              <TouchableOpacity
                onPress={handleBackPress}
                activeOpacity={0.7}
                style={styles.backButton}
                disabled={emailLoading || verifyLoading || resetLoading}
              >
                <Ionicons name="arrow-back" size={24} color={COLORS.onSurface} />
              </TouchableOpacity>
            </View>
            <Text style={styles.headerTitle}>
              {step === 'EMAIL' && 'Reset Password'}
              {step === 'VERIFY' && 'Verify Code'}
              {step === 'RESET' && 'New Password'}
              {step === 'SUCCESS' && 'Success!'}
            </Text>
            <Text style={styles.headerSubtitle}>
              {step === 'EMAIL' &&
                "Enter your email address and we'll send you an OTP to reset your password."}
              {step === 'VERIFY' && (
                <>
                  We sent a 6-digit reset code to <Text style={styles.emailHighlight}>{email}</Text>
                </>
              )}
              {step === 'RESET' && 'Please choose a strong password to secure your account.'}
              {step === 'SUCCESS' && 'Your password has been successfully reset.'}
            </Text>
          </View>

          {/* Form Content */}
          <View style={styles.formSection}>
            {errorMessage ? (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={18} color={COLORS.error} />
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}

            {successMessage && step === 'VERIFY' ? (
              <View style={styles.successNotification}>
                <Ionicons name="checkmark-circle" size={18} color={COLORS.secondary} />
                <Text style={styles.successNotificationText}>{successMessage}</Text>
              </View>
            ) : null}

            {step === 'EMAIL' && (
              <>
                {/* Email Input */}
                <Text style={styles.inputLabel}>Email Address</Text>
                <View style={[styles.inputContainer, emailLoading && { opacity: 0.6 }]}>
                  <Ionicons
                    name="mail-outline"
                    size={20}
                    color={COLORS.outline}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Enter your email"
                    placeholderTextColor={COLORS.outlineVariant}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    style={styles.textInput}
                    editable={!emailLoading}
                  />
                </View>

                {/* Submit Email Button */}
                <TouchableOpacity
                  onPress={handleSendOtp}
                  style={[styles.primaryButton, isEmailSubmitDisabled && styles.disabledButton]}
                  activeOpacity={0.8}
                  disabled={isEmailSubmitDisabled}
                >
                  {emailLoading ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <Text style={styles.primaryButtonText}>Send Reset Code</Text>
                  )}
                </TouchableOpacity>
              </>
            )}

            {step === 'VERIFY' && (
              <>
                {/* OTP Code Input */}
                <Text style={styles.inputLabel}>Verification Code</Text>
                <View style={styles.otpGrid}>
                  {code.map((digit, idx) => (
                    <View
                      key={idx}
                      style={[
                        styles.otpBoxContainer,
                        digit ? styles.otpBoxFilled : null,
                        verifyLoading && { opacity: 0.6 },
                      ]}
                    >
                      <TextInput
                        ref={(ref) => {
                          inputRefs.current[idx] = ref;
                        }}
                        value={digit}
                        onChangeText={(text) => handleOtpTextChange(text, idx)}
                        onKeyPress={(e) => handleOtpKeyPress(e, idx)}
                        placeholder="•"
                        placeholderTextColor={COLORS.outlineVariant}
                        keyboardType="number-pad"
                        maxLength={1}
                        selectTextOnFocus
                        style={styles.otpInput}
                        editable={!verifyLoading}
                      />
                    </View>
                  ))}
                </View>

                {/* Resend Action */}
                <View style={styles.resendContainer}>
                  <Text style={styles.resendText}>{"Didn't receive the code? "}</Text>
                  <TouchableOpacity
                    onPress={handleResendOtp}
                    activeOpacity={0.7}
                    disabled={emailLoading || cooldown > 0}
                  >
                    {emailLoading ? (
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
                  onPress={handleVerifyOtp}
                  style={[styles.primaryButton, isVerifySubmitDisabled && styles.disabledButton]}
                  activeOpacity={0.8}
                  disabled={isVerifySubmitDisabled}
                >
                  {verifyLoading ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <Text style={styles.primaryButtonText}>Verify Code</Text>
                  )}
                </TouchableOpacity>
              </>
            )}

            {step === 'RESET' && (
              <>
                {/* New Password Input */}
                <Text style={styles.inputLabel}>New Password</Text>
                <View style={[styles.inputContainer, resetLoading && { opacity: 0.6 }]}>
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color={COLORS.outline}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    value={newPassword}
                    onChangeText={setNewPassword}
                    placeholder="Enter new password"
                    placeholderTextColor={COLORS.outlineVariant}
                    secureTextEntry={secureNewPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    style={styles.textInput}
                    editable={!resetLoading}
                  />
                  <TouchableOpacity
                    onPress={() => setSecureNewPassword(!secureNewPassword)}
                    style={styles.eyeIconButton}
                    disabled={resetLoading}
                  >
                    <Ionicons
                      name={secureNewPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color={COLORS.outline}
                    />
                  </TouchableOpacity>
                </View>

                {/* Confirm New Password Input */}
                <Text style={styles.inputLabel}>Confirm New Password</Text>
                <View style={[styles.inputContainer, resetLoading && { opacity: 0.6 }]}>
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color={COLORS.outline}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Confirm new password"
                    placeholderTextColor={COLORS.outlineVariant}
                    secureTextEntry={secureConfirmPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    style={styles.textInput}
                    editable={!resetLoading}
                  />
                  <TouchableOpacity
                    onPress={() => setSecureConfirmPassword(!secureConfirmPassword)}
                    style={styles.eyeIconButton}
                    disabled={resetLoading}
                  >
                    <Ionicons
                      name={secureConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color={COLORS.outline}
                    />
                  </TouchableOpacity>
                </View>

                {/* Reset Password Button */}
                <TouchableOpacity
                  onPress={handleResetPassword}
                  style={[styles.primaryButton, isResetSubmitDisabled && styles.disabledButton]}
                  activeOpacity={0.8}
                  disabled={isResetSubmitDisabled}
                >
                  {resetLoading ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <Text style={styles.primaryButtonText}>Reset Password</Text>
                  )}
                </TouchableOpacity>
              </>
            )}

            {step === 'SUCCESS' && (
              <View style={styles.successContainer}>
                <View style={styles.successIconBadge}>
                  <Ionicons name="checkmark-circle" size={56} color={COLORS.primary} />
                </View>
                <Text style={styles.successTitle}>Password Reset Complete</Text>
                <Text style={styles.successDescription}>
                  Your password has been successfully updated. You can now use your new password to
                  sign in.
                </Text>

                <TouchableOpacity
                  onPress={() => router.replace('/login')}
                  style={styles.primaryButton}
                  activeOpacity={0.8}
                >
                  <Text style={styles.primaryButtonText}>Back to Sign In</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainer,
    marginBottom: 24,
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    color: COLORS.onSurface,
    fontSize: 15,
    fontWeight: '500',
    height: '100%',
  },
  eyeIconButton: {
    padding: 8,
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
  successContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  successIconBadge: {
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.onSurface,
    marginBottom: 8,
  },
  successDescription: {
    fontSize: 14,
    color: COLORS.outline,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
    fontWeight: '500',
  },
  emailHighlight: {
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  spacer: {
    height: 60,
  },
});
