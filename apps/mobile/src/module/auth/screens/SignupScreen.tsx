import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Animated, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { COLORS } from '../../../constants/theme';
import { useRegisterController } from '@workspace/api';
import { PasswordRequirements } from '../components/PasswordRequirements';
import { TermsAndConditions } from '../components/TermsAndConditions';
import { AuthTextInput } from '../components/AuthTextInput';
import { AuthScreenLayout } from '../components/AuthScreenLayout';
import { LinearGradient } from 'expo-linear-gradient';
import { authStyles } from '../styles/auth.styles';

export default function SignupScreen() {
  const buttonScale = useRef(new Animated.Value(1)).current;
  const emailInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);
  const confirmPasswordInputRef = useRef<TextInput>(null);

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
    isSubmitDisabled,
    handleSignUp,
    handleNameChange,
    handleEmailChange,
    handlePasswordChange,
    handleConfirmPasswordChange,
  } = useRegisterController({
    onSuccess: () => {
      router.push({ pathname: '/otp', params: { email: email.trim() } });
    },
    onError: () => {},
  });

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

  return (
    <AuthScreenLayout showBranding title="Create Account">
      <Text style={authStyles.screenTitle}>Create Account</Text>

      {errorMessage ? (
        <View style={authStyles.errorContainer}>
          <Ionicons name="alert-circle" size={18} color={COLORS.error} />
          <Text style={authStyles.errorText}>{errorMessage}</Text>
        </View>
      ) : null}

      {/* Name Input */}
      <AuthTextInput
        label="Full Name"
        icon="person-outline"
        value={name}
        onChangeText={handleNameChange}
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
        onChangeText={handleEmailChange}
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
        onChangeText={handlePasswordChange}
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
        onChangeText={handleConfirmPasswordChange}
        placeholder="Confirm your password"
        secureTextEntry={!isConfirmPasswordVisible}
        autoCapitalize="none"
        autoComplete="off"
        textContentType="oneTimeCode"
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
        style={authStyles.buttonWrapper}
        activeOpacity={0.9}
        disabled={isSubmitDisabled}
      >
        <Animated.View
          style={[
            authStyles.primaryButtonAnimated,
            { transform: [{ scale: buttonScale }] },
            isSubmitDisabled && authStyles.disabledButton,
          ]}
        >
          <LinearGradient
            colors={isSubmitDisabled ? ['#a3b8b0', '#a3b8b0'] : [COLORS.primary, '#008f62']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={authStyles.gradientButton}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={authStyles.primaryButtonText}>Create Account</Text>
            )}
          </LinearGradient>
        </Animated.View>
      </TouchableOpacity>

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
            <Text style={authStyles.footerLink}>Sign In</Text>
          </TouchableOpacity>
        </View>

        {/* Terms & Conditions Link */}
        <TermsAndConditions action="signup" disabled={loading} />
      </View>
    </AuthScreenLayout>
  );
}
