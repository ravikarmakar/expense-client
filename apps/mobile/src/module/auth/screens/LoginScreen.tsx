import React, { useRef, useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useLoginController } from '@workspace/api';
import { TermsAndConditions } from '../components/TermsAndConditions';
import { AuthTextInput } from '../components/AuthTextInput';
import { AuthScreenLayout } from '../components/AuthScreenLayout';
import { TactileButton } from '../../../components/TactileButton';
import { hapticFeedback } from '../../../utils/haptics';
import { authStyles } from '../styles/auth.styles';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Premium Dark Matte Login Screen (#08110F).
 * Features real-time inline validation on blur directly underneath inputs.
 */
export default function LoginScreen() {
  const passwordInputRef = useRef<TextInput>(null);

  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const {
    email,
    password,
    errorMessage,
    isPasswordVisible,
    setIsPasswordVisible,
    loading,
    handleSignIn,
    handleEmailChange,
    handlePasswordChange,
  } = useLoginController({
    onSuccess: (data) => {
      if (data.requiresVerification) {
        router.push({ pathname: '/otp', params: { email: email.trim() } });
      } else {
        router.replace('/(tabs)');
      }
    },
    onError: () => {
      hapticFeedback.error();
    },
  });

  const validateEmailOnBlur = useCallback(() => {
    if (!email.trim()) {
      setEmailError('Email address is required');
      hapticFeedback.error();
    } else if (!EMAIL_REGEX.test(email.trim())) {
      setEmailError('Please enter a valid email address');
      hapticFeedback.error();
    } else {
      setEmailError('');
    }
  }, [email]);

  const validatePasswordOnBlur = useCallback(() => {
    if (!password) {
      setPasswordError('Password is required');
      hapticFeedback.error();
    } else {
      setPasswordError('');
    }
  }, [password]);

  const onEmailChangeWithClear = useCallback(
    (text: string) => {
      handleEmailChange(text);
      if (emailError) setEmailError('');
    },
    [handleEmailChange, emailError]
  );

  const onPasswordChangeWithClear = useCallback(
    (text: string) => {
      handlePasswordChange(text);
      if (passwordError) setPasswordError('');
    },
    [handlePasswordChange, passwordError]
  );

  const onSubmit = useCallback(() => {
    validateEmailOnBlur();
    validatePasswordOnBlur();
    handleSignIn();
  }, [validateEmailOnBlur, validatePasswordOnBlur, handleSignIn]);

  return (
    <AuthScreenLayout title="Log In" onBack={() => router.back()}>
      {errorMessage ? (
        <View style={authStyles.errorContainer}>
          <Ionicons name="alert-circle" size={18} color="#fca5a5" />
          <Text style={authStyles.errorText}>{errorMessage}</Text>
        </View>
      ) : null}

      {/* Email Address Input */}
      <AuthTextInput
        label="Email Address"
        icon="mail-outline"
        value={email}
        onChangeText={onEmailChangeWithClear}
        onBlur={validateEmailOnBlur}
        error={emailError}
        placeholder="Enter your email"
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        textContentType="emailAddress"
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
        onChangeText={onPasswordChangeWithClear}
        onBlur={validatePasswordOnBlur}
        error={passwordError}
        placeholder="Enter your password"
        secureTextEntry={!isPasswordVisible}
        autoCapitalize="none"
        autoComplete="password"
        textContentType="password"
        returnKeyType="done"
        onSubmitEditing={onSubmit}
        loading={loading}
        rightIcon={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
        onRightIconPress={() => setIsPasswordVisible(!isPasswordVisible)}
      />

      {/* Forgot Password Link */}
      <TouchableOpacity
        onPress={() => router.push('/forgot-password')}
        style={[authStyles.forgotPassword, loading && { opacity: 0.4 }]}
        activeOpacity={0.7}
        disabled={loading}
      >
        <Text style={authStyles.forgotPasswordText}>Forgot Password?</Text>
      </TouchableOpacity>

      {/* Log In Button */}
      <TactileButton
        title="Log In"
        icon="log-in-outline"
        variant="emerald"
        onPress={onSubmit}
        loading={loading}
      />

      {/* Footer Section */}
      <View style={authStyles.footerContainer}>
        <View style={authStyles.footerSection}>
          <Text style={authStyles.footerLabel}>{"Don't have an account? "}</Text>
          <TouchableOpacity
            onPress={() => router.push('/signup')}
            activeOpacity={0.7}
            disabled={loading}
            style={loading ? { opacity: 0.4 } : undefined}
          >
            <Text style={authStyles.footerLink}>Sign Up</Text>
          </TouchableOpacity>
        </View>

        {/* Terms & Conditions Link */}
        <TermsAndConditions action="login" disabled={loading} />
      </View>
    </AuthScreenLayout>
  );
}
