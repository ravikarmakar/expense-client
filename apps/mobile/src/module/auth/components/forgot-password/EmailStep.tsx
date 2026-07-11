import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../../constants/theme';
import { AuthTextInput } from '../AuthTextInput';
import { authStyles } from '../../styles/auth.styles';

interface EmailStepProps {
  email: string;
  setEmail: (email: string) => void;
  onSendOtp: () => void;
  loading: boolean;
  errorMessage: string;
  onBack: () => void;
}

export function EmailStep({
  email,
  setEmail,
  onSendOtp,
  loading,
  errorMessage,
  onBack,
}: EmailStepProps) {
  const isSubmitDisabled = !email.trim() || loading;

  return (
    <View style={authStyles.stepContainer}>
      {/* Header Section */}
      <View style={authStyles.headerSection}>
        <View style={[authStyles.backButtonRow, loading && { opacity: 0.5 }]}>
          <TouchableOpacity
            onPress={onBack}
            activeOpacity={0.7}
            style={authStyles.backButton}
            disabled={loading}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.onSurface} />
          </TouchableOpacity>
        </View>
        <Text style={authStyles.headerTitle}>Reset Password</Text>
        <Text style={authStyles.headerSubtitle}>
          {"Enter your email address and we'll send you an OTP to reset your password."}
        </Text>
      </View>

      {/* Form Section */}
      <View style={authStyles.formSection}>
        {errorMessage ? (
          <View style={authStyles.errorContainer}>
            <Ionicons name="alert-circle" size={18} color={COLORS.error} />
            <Text style={authStyles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        <AuthTextInput
          label="Email Address"
          icon="mail-outline"
          value={email}
          onChangeText={setEmail}
          placeholder="Enter your email"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          textContentType="emailAddress"
          loading={loading}
        />

        {/* Submit Email Button */}
        <TouchableOpacity
          onPress={onSendOtp}
          style={[authStyles.primaryButton, isSubmitDisabled && authStyles.disabledButton]}
          activeOpacity={0.8}
          disabled={isSubmitDisabled}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={authStyles.primaryButtonText}>Send Reset Code</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
