import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthTextInput } from '../AuthTextInput';
import { TactileButton } from '../../../../components/TactileButton';
import { authStyles } from '../../styles/auth.styles';

import { useTheme } from '../../../../context/ThemeContext';

interface EmailStepProps {
  email: string;
  setEmail: (email: string) => void;
  onSendOtp: () => void;
  loading: boolean;
  errorMessage: string;
}

export function EmailStep({ email, setEmail, onSendOtp, loading, errorMessage }: EmailStepProps) {
  const { isDark } = useTheme();

  return (
    <View style={{ width: '100%' }}>
      {errorMessage ? (
        <View
          style={[
            authStyles.errorContainer,
            !isDark && { backgroundColor: '#fee2e2', borderColor: '#fca5a5' },
          ]}
        >
          <Ionicons name="alert-circle" size={18} color={isDark ? '#fca5a5' : '#dc2626'} />
          <Text style={[authStyles.errorText, !isDark && { color: '#dc2626' }]}>
            {errorMessage}
          </Text>
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

      <TactileButton
        title="Send Reset Code"
        icon="paper-plane-outline"
        variant="emerald"
        onPress={onSendOtp}
        loading={loading}
        style={{ marginTop: 8 }}
      />

      {/* Helper description note placed below the button */}
      <Text style={[styles.footerNote, !isDark && { color: '#6d7a72' }]}>
        {"Enter your email address and we'll send you an OTP to reset your password."}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  footerNote: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 19,
    fontWeight: '500',
    paddingHorizontal: 12,
  },
});
