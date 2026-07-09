import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Animated,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { COLORS } from '../../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRegister, getErrorMessage, clientRegisterSchema } from '@workspace/api';
import { PasswordRequirements } from '../../components/PasswordRequirements';
import { TermsAndConditions } from '../../components/TermsAndConditions';
import { LinearGradient } from 'expo-linear-gradient';
import { AuthTextInput } from '../../components/AuthTextInput';

export default function SignupScreen() {
  const registerMutation = useRegister();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);

  const buttonScale = useRef(new Animated.Value(1)).current;
  const emailInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);
  const confirmPasswordInputRef = useRef<TextInput>(null);

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

  const loading = registerMutation.isPending;
  const isSubmitDisabled =
    !name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim() || loading;

  const handleSignUp = () => {
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }

    const result = clientRegisterSchema.safeParse({
      name: name.trim(),
      email: email.trim(),
      password,
    });
    if (!result.success) {
      setErrorMessage(result.error.issues[0].message);
      return;
    }

    setErrorMessage('');
    registerMutation.mutate(result.data, {
      onSuccess: () => {
        // Server sends OTP email — navigate to verification screen
        router.push({ pathname: '/otp', params: { email: email.trim() } });
      },
      onError: (err) => {
        setErrorMessage(getErrorMessage(err, 'Registration failed. Please try again.'));
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#f0fdf4', '#f8f9fa']} style={StyleSheet.absoluteFillObject} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Unified Branding Header */}
          <View style={styles.logoSection}>
            <View style={styles.logoRow}>
              <Ionicons name="wallet" size={32} color={COLORS.primary} />
              <Text style={styles.appName}>SplitShare</Text>
            </View>
            <Text style={styles.appTagline}>Splitting bills made easy and beautiful</Text>
          </View>

          {/* Form */}
          <View style={styles.formSection}>
            <Text style={styles.screenTitle}>Create Account</Text>

            {errorMessage ? (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={18} color={COLORS.error} />
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}

            {/* Name Input */}
            <AuthTextInput
              label="Full Name"
              icon="person-outline"
              value={name}
              onChangeText={(text) => {
                setName(text);
                if (errorMessage) setErrorMessage('');
              }}
              placeholder="Enter your name"
              autoCapitalize="words"
              autoComplete="name"
              textContentType="none"
              returnKeyType="next"
              onSubmitEditing={() => emailInputRef.current?.focus()}
              blurOnSubmit={false}
              loading={loading}
            />

            {/* Email Input */}
            <AuthTextInput
              ref={emailInputRef}
              label="Email Address"
              icon="mail-outline"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (errorMessage) setErrorMessage('');
              }}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              textContentType="none"
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
              onChangeText={(text) => {
                setPassword(text);
                if (errorMessage) setErrorMessage('');
              }}
              placeholder="Min 8 chars (A-Z, a-z, 0-9, !@#)"
              secureTextEntry={!isPasswordVisible}
              autoCapitalize="none"
              autoComplete="new-password"
              textContentType="none"
              returnKeyType="next"
              onSubmitEditing={() => confirmPasswordInputRef.current?.focus()}
              blurOnSubmit={false}
              loading={loading}
              rightIcon={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
              onRightIconPress={() => setIsPasswordVisible(!isPasswordVisible)}
            />

            {password.length > 0 && <PasswordRequirements password={password} />}

            {/* Confirm Password Input */}
            <AuthTextInput
              ref={confirmPasswordInputRef}
              label="Confirm Password"
              icon="lock-closed-outline"
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                if (errorMessage) setErrorMessage('');
              }}
              placeholder="Confirm your password"
              secureTextEntry={!isConfirmPasswordVisible}
              autoCapitalize="none"
              autoComplete="new-password"
              textContentType="none"
              returnKeyType="done"
              onSubmitEditing={handleSignUp}
              loading={loading}
              rightIcon={isConfirmPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
              onRightIconPress={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}
            />

            {/* Sign Up Button */}
            <TouchableOpacity
              onPress={handleSignUp}
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
                    <Text style={styles.primaryButtonText}>Create Account</Text>
                  )}
                </LinearGradient>
              </Animated.View>
            </TouchableOpacity>
          </View>

          {/* Footer Section */}
          <View style={styles.footerContainer}>
            <View style={styles.footerSection}>
              <Text style={styles.footerLabel}>Already have an account? </Text>
              <TouchableOpacity
                onPress={() => router.push('/login')}
                activeOpacity={0.7}
                disabled={loading}
              >
                <Text style={styles.footerLink}>Sign In</Text>
              </TouchableOpacity>
            </View>

            {/* Terms & Conditions Link */}
            <TermsAndConditions action="signup" />
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
});
