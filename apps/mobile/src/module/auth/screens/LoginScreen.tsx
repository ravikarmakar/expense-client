import React, { useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { COLORS } from '../../../constants/theme';
import { useLoginController } from '@workspace/api';
import { TermsAndConditions } from '../components/TermsAndConditions';
import { AuthTextInput } from '../components/AuthTextInput';
import { AuthScreenLayout } from '../components/AuthScreenLayout';
import { LinearGradient } from 'expo-linear-gradient';
import { authStyles } from '../styles/auth.styles';

export default function LoginScreen() {
  const passwordInputRef = useRef<TextInput>(null);
  const buttonScale = useRef(new Animated.Value(1)).current;

  const {
    email,
    password,
    errorMessage,
    isPasswordVisible,
    setIsPasswordVisible,
    loading,
    isSubmitDisabled,
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
    <AuthScreenLayout showBranding title="Sign In">
      <Text style={authStyles.screenTitle}>Sign In</Text>

      {errorMessage ? (
        <View style={authStyles.errorContainer}>
          <Ionicons name="alert-circle" size={18} color={COLORS.error} />
          <Text style={authStyles.errorText}>{errorMessage}</Text>
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
        placeholder="Enter your password"
        secureTextEntry={!isPasswordVisible}
        autoCapitalize="none"
        autoComplete="password"
        textContentType="password"
        returnKeyType="done"
        onSubmitEditing={handleSignIn}
        loading={loading}
        rightIcon={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
        onRightIconPress={() => setIsPasswordVisible(!isPasswordVisible)}
      />

      <TouchableOpacity
        onPress={() => router.push('/forgot-password')}
        style={[authStyles.forgotPassword, loading && { opacity: 0.4 }]}
        activeOpacity={0.7}
        disabled={loading}
      >
        <Text style={authStyles.forgotPasswordText}>Forgot Password?</Text>
      </TouchableOpacity>

      {/* Sign In Button */}
      <TouchableOpacity
        onPress={handleSignIn}
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
              <Text style={authStyles.primaryButtonText}>Sign In</Text>
            )}
          </LinearGradient>
        </Animated.View>
      </TouchableOpacity>

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
