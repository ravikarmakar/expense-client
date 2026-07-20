import React, { useRef, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useRegisterController } from '@workspace/api';
import { PasswordRequirements } from '../components/PasswordRequirements';
import { TermsAndConditions } from '../components/TermsAndConditions';
import { AuthTextInput } from '../components/AuthTextInput';
import { AuthScreenLayout } from '../components/AuthScreenLayout';
import { TactileButton } from '../../../components/TactileButton';
import { hapticFeedback } from '../../../utils/haptics';
import { authStyles } from '../styles/auth.styles';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Premium Dark Matte Create Account / Signup Screen (#08110F).
 * Features real-time inline input validation on blur underneath fields.
 */
export default function SignupScreen() {
  const emailInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);
  const confirmPasswordInputRef = useRef<TextInput>(null);

  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  const {
    name,
    email,
    password,
    confirmPassword,
    errorMessage,
    isPasswordVisible,
    setIsPasswordVisible,
    isConfirmPasswordVisible,
    setIsConfirmPasswordVisible,
    loading,
    handleSignUp,
    handleNameChange,
    handleEmailChange,
    handlePasswordChange,
    handleConfirmPasswordChange,
  } = useRegisterController({
    onSuccess: () => {
      router.push({ pathname: '/otp', params: { email: email.trim() } });
    },
    onError: () => {
      hapticFeedback.error();
    },
  });

  const validateNameOnBlur = useCallback(() => {
    if (!name.trim()) {
      setNameError('Full name is required');
      hapticFeedback.error();
    } else if (name.trim().length < 2) {
      setNameError('Name must be at least 2 characters');
      hapticFeedback.error();
    } else {
      setNameError('');
    }
  }, [name]);

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
    } else if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      hapticFeedback.error();
    } else {
      setPasswordError('');
    }
  }, [password]);

  const validateConfirmPasswordOnBlur = useCallback(() => {
    if (!confirmPassword) {
      setConfirmPasswordError('Please confirm your password');
      hapticFeedback.error();
    } else if (confirmPassword !== password) {
      setConfirmPasswordError('Passwords do not match');
      hapticFeedback.error();
    } else {
      setConfirmPasswordError('');
    }
  }, [confirmPassword, password]);

  const onSubmit = useCallback(() => {
    validateNameOnBlur();
    validateEmailOnBlur();
    validatePasswordOnBlur();
    validateConfirmPasswordOnBlur();
    handleSignUp();
  }, [
    validateNameOnBlur,
    validateEmailOnBlur,
    validatePasswordOnBlur,
    validateConfirmPasswordOnBlur,
    handleSignUp,
  ]);

  return (
    <AuthScreenLayout title="Create Account" onBack={() => router.back()}>
      {errorMessage ? (
        <View style={authStyles.errorContainer}>
          <Ionicons name="alert-circle" size={18} color="#fca5a5" />
          <Text style={authStyles.errorText}>{errorMessage}</Text>
        </View>
      ) : null}

      {/* Name Input */}
      <AuthTextInput
        label="Full Name"
        icon="person-outline"
        value={name}
        onChangeText={(text) => {
          handleNameChange(text);
          if (nameError) setNameError('');
        }}
        onBlur={validateNameOnBlur}
        error={nameError}
        placeholder="Enter your name"
        autoCapitalize="words"
        autoComplete="name"
        textContentType="name"
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
          handleEmailChange(text);
          if (emailError) setEmailError('');
        }}
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
        onChangeText={(text) => {
          handlePasswordChange(text);
          if (passwordError) setPasswordError('');
        }}
        onBlur={validatePasswordOnBlur}
        error={passwordError}
        placeholder="Min 8 chars (A-Z, a-z, 0-9, !@#)"
        secureTextEntry={!isPasswordVisible}
        autoCapitalize="none"
        autoComplete="off"
        textContentType="oneTimeCode"
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
          handleConfirmPasswordChange(text);
          if (confirmPasswordError) setConfirmPasswordError('');
        }}
        onBlur={validateConfirmPasswordOnBlur}
        error={confirmPasswordError}
        placeholder="Confirm your password"
        secureTextEntry={!isConfirmPasswordVisible}
        autoCapitalize="none"
        autoComplete="off"
        textContentType="oneTimeCode"
        returnKeyType="done"
        onSubmitEditing={onSubmit}
        loading={loading}
        rightIcon={isConfirmPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
        onRightIconPress={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}
      />

      {/* Create Account Primary Action Button */}
      <TactileButton
        title="Create Account"
        icon="person-add-outline"
        variant="emerald"
        onPress={onSubmit}
        loading={loading}
        style={{ marginTop: 8 }}
      />

      {/* Footer Section */}
      <View style={authStyles.footerContainer}>
        <View style={authStyles.footerSection}>
          <Text style={authStyles.footerLabel}>Already have an account? </Text>
          <TouchableOpacity
            onPress={() => router.push('/login')}
            activeOpacity={0.7}
            disabled={loading}
            style={loading ? { opacity: 0.4 } : undefined}
          >
            <Text style={authStyles.footerLink}>Log In</Text>
          </TouchableOpacity>
        </View>

        {/* Terms & Conditions Link */}
        <TermsAndConditions action="signup" disabled={loading} />
      </View>
    </AuthScreenLayout>
  );
}
