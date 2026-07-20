import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
  Animated,
  KeyboardAvoidingView,
  ScrollView,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  useLoginController,
  useRegisterController,
  useForgotPasswordController,
} from '@workspace/api';

import { TactileButton } from '../../../components/TactileButton';
import { AuthTextInput } from './AuthTextInput';
import { TermsAndConditions } from './TermsAndConditions';
import { PasswordRequirements } from './PasswordRequirements';
import { EmailStep } from './forgot-password/EmailStep';
import { VerifyStep } from './forgot-password/VerifyStep';
import { ResetStep } from './forgot-password/ResetStep';
import { SuccessStep } from './forgot-password/SuccessStep';
import { authStyles } from '../styles/auth.styles';

export type AuthMode = 'WELCOME' | 'LOGIN' | 'SIGNUP' | 'FORGOT_PASSWORD';

interface AuthFlowScreenProps {
  initialMode?: AuthMode;
}

/**
 * Single-Card Morphing Auth Flow (#08110F).
 * Single persistent background, spotlight gradient & vignette with 60fps
 * in-place morphing transitions while preserving exact screen UI layout arrangements.
 */
export function AuthFlowScreen({ initialMode = 'WELCOME' }: AuthFlowScreenProps) {
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState<AuthMode>(initialMode);

  // Smooth fade transition animations for morphing content
  const contentFade = useRef(new Animated.Value(1)).current;

  // Controller Refs for Input Focus Chaining
  const loginPasswordRef = useRef<TextInput>(null);
  const signupEmailRef = useRef<TextInput>(null);
  const signupPasswordRef = useRef<TextInput>(null);
  const signupConfirmPasswordRef = useRef<TextInput>(null);

  // Switch Mode with Smooth Morphing Fade Transition (Flicker-Free Layout Sync)
  const switchMode = useCallback(
    (newMode: AuthMode) => {
      Animated.timing(contentFade, {
        toValue: 0,
        duration: 90,
        useNativeDriver: true,
      }).start(() => {
        setMode(newMode);
        // Wait 1 native frame for React to mount & measure new layout tree before fading in
        requestAnimationFrame(() => {
          Animated.timing(contentFade, {
            toValue: 1,
            duration: 140,
            useNativeDriver: true,
          }).start();
        });
      });
    },
    [contentFade]
  );

  // 1. Login Controller
  const login = useLoginController({
    onSuccess: (data) => {
      if (data.requiresVerification) {
        router.push({ pathname: '/otp', params: { email: login.email.trim() } });
      } else {
        router.replace('/(tabs)');
      }
    },
    onError: () => {},
  });

  // 2. Register / Signup Controller
  const signup = useRegisterController({
    onSuccess: () => {
      router.push({ pathname: '/otp', params: { email: signup.email.trim() } });
    },
    onError: () => {},
  });

  // 3. Forgot Password Controller
  const forgotPassword = useForgotPasswordController({
    onSuccess: () => {},
    onError: () => {},
  });

  const topPadding = Math.max(
    insets.top,
    Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) : 20
  );
  const bottomPadding = Math.max(insets.bottom, 20);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Persistent Top Spotlight Gradient */}
      <LinearGradient
        colors={['rgba(20, 42, 33, 0.45)', 'rgba(12, 26, 20, 0.2)', '#08110F']}
        locations={[0, 0.38, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Persistent Faint Edge Vignette */}
      <LinearGradient
        colors={['rgba(4, 9, 8, 0.25)', 'transparent', 'rgba(4, 9, 8, 0.5)']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFillObject}
        pointerEvents="none"
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: topPadding + 10, paddingBottom: bottomPadding + 6 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <Animated.View
            style={[
              styles.morphContainer,
              {
                opacity: contentFade,
              },
            ]}
          >
            {/* MODE: WELCOME */}
            {mode === 'WELCOME' && (
              <View style={styles.welcomeWrapper}>
                {/* Header */}
                <View style={styles.topNavRow}>
                  <View style={styles.brandContainer}>
                    <View style={styles.headerIconCircle}>
                      <Ionicons name="wallet" size={20} color="#34d399" />
                    </View>
                    <Text style={styles.headerBrandText}>SplitShare</Text>
                  </View>

                  <TouchableOpacity
                    onPress={() => switchMode('LOGIN')}
                    activeOpacity={0.75}
                    style={styles.loginHeaderButton}
                  >
                    <Text style={styles.loginHeaderText}>Log In</Text>
                  </TouchableOpacity>
                </View>

                {/* Hero Section */}
                <View style={styles.heroSection}>
                  <Text style={styles.heroTitle}>Split Expenses.{'\n'}Not Friendships.</Text>
                  <Text style={styles.heroSubtitle}>
                    Track group expenses, manage wallets, and settle up effortlessly with friends.
                  </Text>
                </View>

                {/* Actions */}
                <View style={styles.actionsSection}>
                  <TactileButton
                    title="Login with Email"
                    icon="mail"
                    variant="email"
                    onPress={() => switchMode('LOGIN')}
                  />
                  <TactileButton
                    title="Create New Account"
                    icon="person-add-outline"
                    variant="emerald"
                    onPress={() => switchMode('SIGNUP')}
                    style={{ marginTop: 6 }}
                  />
                </View>
              </View>
            )}

            {/* MODE: LOGIN */}
            {mode === 'LOGIN' && (
              <View style={styles.modeWrapper}>
                {/* Header Row */}
                <View style={styles.headerSection}>
                  <View style={styles.topHeaderRow}>
                    <TouchableOpacity
                      onPress={() => switchMode('WELCOME')}
                      activeOpacity={0.7}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      style={styles.backButton}
                    >
                      <Ionicons name="arrow-back" size={26} color="#ffffff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Log In</Text>
                  </View>
                </View>

                {/* Error Banner */}
                {login.errorMessage ? (
                  <View style={authStyles.errorContainer}>
                    <Ionicons name="alert-circle" size={18} color="#fca5a5" />
                    <Text style={authStyles.errorText}>{login.errorMessage}</Text>
                  </View>
                ) : null}

                {/* Email Input */}
                <AuthTextInput
                  label="Email Address"
                  icon="mail-outline"
                  value={login.email}
                  onChangeText={login.handleEmailChange}
                  placeholder="Enter your email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  textContentType="emailAddress"
                  returnKeyType="next"
                  onSubmitEditing={() => loginPasswordRef.current?.focus()}
                  blurOnSubmit={false}
                  loading={login.loading}
                />

                {/* Password Input */}
                <AuthTextInput
                  ref={loginPasswordRef}
                  label="Password"
                  icon="lock-closed-outline"
                  value={login.password}
                  onChangeText={login.handlePasswordChange}
                  placeholder="Enter your password"
                  secureTextEntry={!login.isPasswordVisible}
                  autoCapitalize="none"
                  autoComplete="password"
                  textContentType="password"
                  returnKeyType="done"
                  onSubmitEditing={login.handleSignIn}
                  loading={login.loading}
                  rightIcon={login.isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
                  onRightIconPress={() => login.setIsPasswordVisible(!login.isPasswordVisible)}
                />

                {/* Forgot Password Link */}
                <TouchableOpacity
                  onPress={() => switchMode('FORGOT_PASSWORD')}
                  style={[authStyles.forgotPassword, login.loading && { opacity: 0.4 }]}
                  activeOpacity={0.7}
                  disabled={login.loading}
                >
                  <Text style={authStyles.forgotPasswordText}>Forgot Password?</Text>
                </TouchableOpacity>

                {/* Primary CTA */}
                <TactileButton
                  title="Log In"
                  icon="log-in-outline"
                  variant="emerald"
                  onPress={login.handleSignIn}
                  loading={login.loading}
                />

                {/* Footer Link */}
                <View style={authStyles.footerContainer}>
                  <View style={authStyles.footerSection}>
                    <Text style={authStyles.footerLabel}>{"Don't have an account? "}</Text>
                    <TouchableOpacity
                      onPress={() => switchMode('SIGNUP')}
                      activeOpacity={0.7}
                      disabled={login.loading}
                    >
                      <Text style={authStyles.footerLink}>Sign Up</Text>
                    </TouchableOpacity>
                  </View>
                  <TermsAndConditions action="login" disabled={login.loading} />
                </View>
              </View>
            )}

            {/* MODE: SIGNUP */}
            {mode === 'SIGNUP' && (
              <View style={styles.modeWrapper}>
                {/* Header Row */}
                <View style={styles.headerSection}>
                  <View style={styles.topHeaderRow}>
                    <TouchableOpacity
                      onPress={() => switchMode('WELCOME')}
                      activeOpacity={0.7}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      style={styles.backButton}
                    >
                      <Ionicons name="arrow-back" size={26} color="#ffffff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Create Account</Text>
                  </View>
                </View>

                {/* Error Banner */}
                {signup.errorMessage ? (
                  <View style={authStyles.errorContainer}>
                    <Ionicons name="alert-circle" size={18} color="#fca5a5" />
                    <Text style={authStyles.errorText}>{signup.errorMessage}</Text>
                  </View>
                ) : null}

                {/* Full Name Input */}
                <AuthTextInput
                  label="Full Name"
                  icon="person-outline"
                  value={signup.name}
                  onChangeText={signup.handleNameChange}
                  placeholder="Enter your name"
                  autoCapitalize="words"
                  autoComplete="name"
                  textContentType="name"
                  returnKeyType="next"
                  onSubmitEditing={() => signupEmailRef.current?.focus()}
                  blurOnSubmit={false}
                  loading={signup.loading}
                />

                {/* Email Input */}
                <AuthTextInput
                  ref={signupEmailRef}
                  label="Email Address"
                  icon="mail-outline"
                  value={signup.email}
                  onChangeText={signup.handleEmailChange}
                  placeholder="Enter your email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  textContentType="emailAddress"
                  returnKeyType="next"
                  onSubmitEditing={() => signupPasswordRef.current?.focus()}
                  blurOnSubmit={false}
                  loading={signup.loading}
                />

                {/* Password Input */}
                <AuthTextInput
                  ref={signupPasswordRef}
                  label="Password"
                  icon="lock-closed-outline"
                  value={signup.password}
                  onChangeText={signup.handlePasswordChange}
                  placeholder="Min 8 chars (A-Z, a-z, 0-9, !@#)"
                  secureTextEntry={!signup.isPasswordVisible}
                  autoCapitalize="none"
                  autoComplete="off"
                  textContentType="oneTimeCode"
                  returnKeyType="next"
                  onSubmitEditing={() => signupConfirmPasswordRef.current?.focus()}
                  blurOnSubmit={false}
                  loading={signup.loading}
                  rightIcon={signup.isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
                  onRightIconPress={() => signup.setIsPasswordVisible(!signup.isPasswordVisible)}
                />

                {signup.password.length > 0 && <PasswordRequirements password={signup.password} />}

                {/* Confirm Password Input */}
                <AuthTextInput
                  ref={signupConfirmPasswordRef}
                  label="Confirm Password"
                  icon="lock-closed-outline"
                  value={signup.confirmPassword}
                  onChangeText={signup.handleConfirmPasswordChange}
                  placeholder="Confirm your password"
                  secureTextEntry={!signup.isConfirmPasswordVisible}
                  autoCapitalize="none"
                  autoComplete="off"
                  textContentType="oneTimeCode"
                  returnKeyType="done"
                  onSubmitEditing={signup.handleSignUp}
                  loading={signup.loading}
                  rightIcon={signup.isConfirmPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
                  onRightIconPress={() =>
                    signup.setIsConfirmPasswordVisible(!signup.isConfirmPasswordVisible)
                  }
                />

                {/* Primary CTA */}
                <TactileButton
                  title="Create Account"
                  icon="person-add-outline"
                  variant="emerald"
                  onPress={signup.handleSignUp}
                  loading={signup.loading}
                  style={{ marginTop: 8 }}
                />

                {/* Footer Link */}
                <View style={authStyles.footerContainer}>
                  <View style={authStyles.footerSection}>
                    <Text style={authStyles.footerLabel}>Already have an account? </Text>
                    <TouchableOpacity
                      onPress={() => switchMode('LOGIN')}
                      activeOpacity={0.7}
                      disabled={signup.loading}
                    >
                      <Text style={authStyles.footerLink}>Log In</Text>
                    </TouchableOpacity>
                  </View>
                  <TermsAndConditions action="signup" disabled={signup.loading} />
                </View>
              </View>
            )}

            {/* MODE: FORGOT_PASSWORD */}
            {mode === 'FORGOT_PASSWORD' && (
              <View style={styles.modeWrapper}>
                <View style={styles.headerSection}>
                  <View style={styles.topHeaderRow}>
                    {forgotPassword.step !== 'SUCCESS' && (
                      <TouchableOpacity
                        onPress={() => forgotPassword.handleBackPress(() => switchMode('LOGIN'))}
                        activeOpacity={0.7}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        style={styles.backButton}
                      >
                        <Ionicons name="arrow-back" size={26} color="#ffffff" />
                      </TouchableOpacity>
                    )}
                    <Text style={styles.headerTitle}>
                      {forgotPassword.step === 'EMAIL'
                        ? 'Reset Password'
                        : forgotPassword.step === 'VERIFY'
                          ? 'Verify Code'
                          : forgotPassword.step === 'RESET'
                            ? 'New Password'
                            : 'Success!'}
                    </Text>
                  </View>
                </View>

                {forgotPassword.step === 'EMAIL' && (
                  <EmailStep
                    email={forgotPassword.email}
                    setEmail={forgotPassword.setEmail}
                    onSendOtp={forgotPassword.handleSendOtp}
                    loading={forgotPassword.emailLoading}
                    errorMessage={forgotPassword.errorMessage}
                  />
                )}

                {forgotPassword.step === 'VERIFY' && (
                  <VerifyStep
                    email={forgotPassword.email}
                    code={forgotPassword.code}
                    setCode={forgotPassword.setCode}
                    onVerifyOtp={forgotPassword.handleVerifyOtp}
                    onResendOtp={forgotPassword.handleResendOtp}
                    loading={forgotPassword.verifyLoading}
                    resendLoading={forgotPassword.emailLoading}
                    cooldown={forgotPassword.cooldown}
                    errorMessage={forgotPassword.errorMessage}
                    successMessage={forgotPassword.successMessage}
                  />
                )}

                {forgotPassword.step === 'RESET' && (
                  <ResetStep
                    newPassword={forgotPassword.newPassword}
                    setNewPassword={forgotPassword.setNewPassword}
                    confirmPassword={forgotPassword.confirmPassword}
                    setConfirmPassword={forgotPassword.setConfirmPassword}
                    onResetPassword={forgotPassword.handleResetPassword}
                    loading={forgotPassword.resetLoading}
                    errorMessage={forgotPassword.errorMessage}
                    setErrorMessage={forgotPassword.setErrorMessage}
                  />
                )}

                {forgotPassword.step === 'SUCCESS' && (
                  <SuccessStep onBackToSignIn={() => switchMode('LOGIN')} />
                )}
              </View>
            )}
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#08110F',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 22,
    justifyContent: 'space-between',
  },
  morphContainer: {
    width: '100%',
    flex: 1,
    justifyContent: 'space-between',
  },
  welcomeWrapper: {
    width: '100%',
    flex: 1,
    justifyContent: 'space-between',
  },
  modeWrapper: {
    width: '100%',
  },
  topNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(52, 211, 153, 0.14)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.28)',
  },
  headerBrandText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.4,
  },
  loginHeaderButton: {
    paddingVertical: 9,
    paddingHorizontal: 18,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  loginHeaderText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.2,
  },
  heroSection: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 30,
    flex: 1,
  },
  heroTitle: {
    fontSize: 38,
    fontWeight: '900',
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: 46,
    letterSpacing: 0.5,
    marginBottom: 14,
  },
  heroSubtitle: {
    fontSize: 15,
    fontWeight: '500',
    color: 'rgba(209, 250, 229, 0.72)',
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 320,
  },
  actionsSection: {
    width: '100%',
  },
  headerSection: {
    marginTop: 8,
    marginBottom: 24,
  },
  topHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    padding: 4,
    marginLeft: -4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.2,
  },
});
