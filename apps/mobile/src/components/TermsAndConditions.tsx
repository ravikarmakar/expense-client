import React from 'react';
import { Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { COLORS } from '../constants/theme';

interface TermsAndConditionsProps {
  action?: 'login' | 'signup';
}

export function TermsAndConditions({ action = 'signup' }: TermsAndConditionsProps) {
  const handlePress = () => {
    Linking.openURL('https://expense-client-web.vercel.app/');
  };

  const actionText = action === 'login' ? 'signing in' : 'signing up';

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.7} style={styles.termsContainer}>
      <Text style={styles.termsText}>
        By {actionText}, you agree to our <Text style={styles.termsLink}>Terms & Conditions</Text>
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  termsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    paddingHorizontal: 16,
  },
  termsText: {
    fontSize: 12,
    color: COLORS.outline,
    textAlign: 'center',
    lineHeight: 18,
    fontWeight: '500',
  },
  termsLink: {
    color: COLORS.secondary,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});
