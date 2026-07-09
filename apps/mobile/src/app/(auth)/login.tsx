import React, { useState, useRef, useCallback } from 'react';
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
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { COLORS } from '../../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLogin, getErrorMessage, clientLoginSchema, getStorage } from '@workspace/api';
import { LinearGradient } from 'expo-linear-gradient';
import { TermsAndConditions } from '../../components/TermsAndConditions';
import { AuthTextInput } from '../../components/AuthTextInput';

export default function LoginScreen() {
  const loginMutation = useLogin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);

  const passwordInputRef = useRef<TextInput>(null);
  const buttonScale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(buttonScale, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(buttonScale, {
      toValue: 1,
      useNativeDriver: true,
      friction: 4,
      tension: 40,
    }).start();
  };

  const handleEmailChange = useCallback(
    (text: string) => {
      setEmail(text);
      if (errorMessage) setErrorMessage('');
    },
    [errorMessage]
  );

  const handlePasswordChange = useCallback(
    (text: string) => {
      setPassword(text);
      if (errorMessage) setErrorMessage('');
    },
    [errorMessage]
  );

  React.useEffect(() => {
    const checkPendingVerification = async () => {
      try {
        const emailVal = await getStorage().getItem('pending_verification_email');
        if (emailVal) {
          setPendingEmail(emailVal);
        }
      } catch {
        console.warn('Failed to read pending verification email');
      }
    };
    checkPendingVerification();
  }, []);

  const loading = loginMutation.isPending;
  const isSubmitDisabled = !email.trim() || !password.trim() || loading;

  const handleSignIn = async () => {
    const result = clientLoginSchema.safeParse({ email: email.trim(), password });
    if (!result.success) {
      setErrorMessage(result.error.issues[0]?.message ?? 'Validation failed');
      return;
    }
    setErrorMessage('');
    loginMutation.mutate(result.data, {
      onSuccess: (data) => {
        if (data.data.requiresVerification) {
          // Email not verified yet — server re-sent OTP, take user to verify screen
          router.push({ pathname: '/otp', params: { email: email.trim() } });
          return;
        }
        // Explicit redirect — belt-and-suspenders alongside the cache-based redirect in _layout.tsx
        router.replace('/(tabs)');
      },
      onError: (err) => {
        setErrorMessage(getErrorMessage(err, 'Invalid email or password'));
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#f0fdf4', '#f8f9fa']} style={StyleSheet.absoluteFillObject} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Logo & Intro */}
          <View style={styles.logoSection}>
            <View style={styles.logoRow}>
              <Ionicons name="wallet" size={32} color={COLORS.primary} />
              <Text style={styles.appName}>SplitShare</Text>
            </View>
            <Text style={styles.appTagline}>Splitting bills made easy and beautiful</Text>
          </View>

          {pendingEmail ? (
            <View style={styles.pendingContainer}>
              <View style={styles.pendingLeft}>
                <View style={styles.pendingIconContainer}>
                  <Ionicons name="mail-unread-outline" size={20} color={COLORS.primary} />
                </View>
                <View style={styles.pendingTextContainer}>
                  <Text style={styles.pendingTitle}>Pending Verification</Text>
                  <Text style={styles.pendingMessage} numberOfLines={1}>
                    {pendingEmail}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.pendingButton}
                onPress={() => router.push({ pathname: '/otp', params: { email: pendingEmail } })}
                activeOpacity={0.7}
              >
                <Text style={styles.pendingButtonText}>Verify</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {/* Form */}
          <View style={styles.formSection}>
            <Text style={styles.screenTitle}>Sign In</Text>

            {errorMessage ? (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={18} color={COLORS.error} />
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}

            {/* Email Input */}
            <AuthTextInput
              label="Email Address"
              icon="mail-outline"
              value={email}
              onChangeText={handleEmailChange}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              returnKeyType="next"
              onSubmitEditing={() => passwordInputRef.current?.focus()}
              blurOnSubmit={false}
              loading={loading}
            />

            {/* Password Input */}
            <AuthTextInput
              ref={passwordInputRef}
              label="Password"
              icon="lock-closed-outline"
              value={password}
              onChangeText={handlePasswordChange}
              placeholder="Enter your password"
              secureTextEntry={!isPasswordVisible}
              autoCapitalize="none"
              autoComplete="password"
              textContentType="none"
              returnKeyType="done"
              onSubmitEditing={handleSignIn}
              loading={loading}
              rightIcon={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
              onRightIconPress={() => setIsPasswordVisible(!isPasswordVisible)}
            />

            <TouchableOpacity
              onPress={() => router.push('/forgot-password')}
              style={styles.forgotPassword}
              activeOpacity={0.7}
              disabled={loading}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            {/* Sign In Button */}
            <TouchableOpacity
              onPress={handleSignIn}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              style={styles.buttonWrapper}
              activeOpacity={0.9}
              disabled={isSubmitDisabled}
            >
              <Animated.View
                style={[
                  styles.primaryButtonAnimated,
                  { transform: [{ scale: buttonScale }] },
                  isSubmitDisabled && styles.disabledButton,
                ]}
              >
                <LinearGradient
                  colors={isSubmitDisabled ? ['#a3b8b0', '#a3b8b0'] : [COLORS.primary, '#008f62']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.gradientButton}
                >
                  {loading ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <Text style={styles.primaryButtonText}>Sign In</Text>
                  )}
                </LinearGradient>
              </Animated.View>
            </TouchableOpacity>
          </View>

          {/* Footer Section */}
          <View style={styles.footerContainer}>
            <View style={styles.footerSection}>
              <Text style={styles.footerLabel}>{"Don't have an account? "}</Text>
              <TouchableOpacity
                onPress={() => router.push('/signup')}
                activeOpacity={0.7}
                disabled={loading}
              >
                <Text style={styles.footerLink}>Sign Up</Text>
              </TouchableOpacity>
            </View>

            {/* Terms & Conditions Link */}
            <TermsAndConditions action="login" />
          </View>
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
  logoSection: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 20,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },
  appName: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.onSurface,
    letterSpacing: -0.5,
  },
  appTagline: {
    fontSize: 13,
    color: COLORS.outline,
    marginTop: 4,
    fontWeight: '500',
  },
  formSection: {
    backgroundColor: COLORS.surface,
    borderRadius: 28,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainer,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.onSurface,
    marginBottom: 20,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.errorContainer,
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(186, 26, 26, 0.1)',
  },
  errorText: {
    fontSize: 12,
    color: COLORS.error,
    fontWeight: '600',
    flex: 1,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: -8,
    marginBottom: 16,
  },
  forgotPasswordText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.secondary,
  },
  buttonWrapper: {
    marginTop: 8,
    width: '100%',
  },
  primaryButtonAnimated: {
    borderRadius: 18,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  gradientButton: {
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
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
  footerContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
  footerSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerLabel: {
    fontSize: 13,
    color: COLORS.outline,
    fontWeight: '500',
  },
  footerLink: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.secondary,
  },

  pendingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 18,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainer,
  },
  pendingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  pendingIconContainer: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 105, 72, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pendingTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  pendingTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  pendingMessage: {
    fontSize: 12,
    color: COLORS.outline,
    marginTop: 2,
  },
  pendingButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 1,
  },
  pendingButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
});
