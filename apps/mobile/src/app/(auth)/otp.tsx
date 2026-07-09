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
  AppState,
  AppStateStatus,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { COLORS } from '../../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  useVerifyEmail,
  useResendVerification,
  getErrorMessage,
  clientVerifyEmailSchema,
  getStorage,
} from '@workspace/api';
import { useRouteParams, otpParamsSchema } from '../../hooks/useRouteParams';

const CODE_LENGTH = 6;

export default function OtpScreen() {
  const params = useRouteParams(otpParamsSchema);
  const [email, setEmail] = useState(params.email ?? '');

  const verifyMutation = useVerifyEmail();
  const resendMutation = useResendVerification();

  const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [cooldown, setCooldown] = useState(0);

  const inputRefs = useRef<(TextInput | null)[]>(Array(CODE_LENGTH).fill(null));
  const cooldownEndTimeRef = useRef<number>(0);

  const loading = verifyMutation.isPending;
  const isSubmitDisabled = code.some((digit) => !digit) || loading;
  const resendLoading = resendMutation.isPending;

  const startCooldown = (seconds: number) => {
    cooldownEndTimeRef.current = Date.now() + seconds * 1000;
    setCooldown(seconds);
  };

  // Load and persist email in storage
  useEffect(() => {
    const handleEmailPersistence = async () => {
      try {
        const storage = getStorage();
        if (params.email) {
          await storage.setItem('pending_verification_email', params.email);
          setEmail(params.email);
        } else {
          const storedEmail = await storage.getItem('pending_verification_email');
          if (storedEmail) {
            setEmail(storedEmail);
          }
        }
      } catch (err) {
        console.warn('Failed to handle email persistence:', err);
      }
    };
    handleEmailPersistence();
    startCooldown(60);
  }, [params.email]);

  // Robust timer for cooldown that updates on AppState change
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

  const handleVerify = () => {
    if (!email) return;
    const fullCode = code.join('');
    const result = clientVerifyEmailSchema.safeParse({ email, code: fullCode });
    if (!result.success) {
      setErrorMessage(result.error.issues[0].message);
      return;
    }

    setErrorMessage('');
    verifyMutation.mutate(result.data, {
      onSuccess: () => {
        getStorage()
          .removeItem('pending_verification_email')
          .catch(() => {});
      },
      onError: (err) => {
        setErrorMessage(getErrorMessage(err, 'Invalid or expired code. Please try again.'));
        setCode(Array(CODE_LENGTH).fill(''));
        inputRefs.current[0]?.focus();
      },
    });
  };

  // Auto-submit when all code digits are filled
  useEffect(() => {
    if (code.every((digit) => digit !== '') && email) {
      handleVerify();
    }
  }, [code, email]);

  const handleResend = () => {
    if (!email || cooldown > 0) return;
    setErrorMessage('');
    setSuccessMessage('');
    resendMutation.mutate(
      { email },
      {
        onSuccess: () => {
          setSuccessMessage('A new verification code has been sent to your email.');
          setCode(Array(CODE_LENGTH).fill(''));
          inputRefs.current[0]?.focus();
          startCooldown(60);
        },
        onError: (err) => {
          setErrorMessage(getErrorMessage(err, 'Failed to resend code. Please try again.'));
        },
      }
    );
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
          {/* Header */}
          <View style={styles.headerSection}>
            <View style={styles.backButtonRow}>
              <TouchableOpacity
                onPress={() => router.back()}
                activeOpacity={0.7}
                style={styles.backButton}
              >
                <Ionicons name="arrow-back" size={24} color={COLORS.onSurface} />
              </TouchableOpacity>
            </View>
            <Text style={styles.headerTitle}>Verify Email</Text>
            <Text style={styles.headerSubtitle}>
              {'We sent a 6-digit verification code to '}
              <Text style={styles.emailHighlight}>{email || 'your email address'}</Text>
            </Text>
          </View>

          {/* Form */}
          <View style={styles.formSection}>
            {errorMessage ? (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={18} color={COLORS.error} />
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}

            {successMessage ? (
              <View style={styles.successContainer}>
                <Ionicons name="checkmark-circle" size={18} color={COLORS.secondary} />
                <Text style={styles.successText}>{successMessage}</Text>
              </View>
            ) : null}

            {/* OTP Code Box Grid — 6 digits */}
            <View style={styles.otpGrid}>
              {code.map((digit, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.otpBoxContainer,
                    digit ? styles.otpBoxFilled : null,
                    (loading || resendLoading) && { opacity: 0.6 },
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
                    editable={!(loading || resendLoading)}
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
                onPress={handleResend}
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

            {/* Verify Button */}
            <TouchableOpacity
              onPress={handleVerify}
              style={[styles.primaryButton, isSubmitDisabled && styles.disabledButton]}
              activeOpacity={0.8}
              disabled={isSubmitDisabled}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.primaryButtonText}>Verify & Continue</Text>
              )}
            </TouchableOpacity>
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
  successContainer: {
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
  successText: {
    fontSize: 12,
    color: COLORS.secondary,
    fontWeight: '600',
    flex: 1,
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
  },
  disabledButton: {
    opacity: 0.7,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  spacer: {
    height: 40,
  },
});
