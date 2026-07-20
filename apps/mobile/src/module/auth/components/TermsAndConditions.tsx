import React from 'react';
import { Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';

interface TermsAndConditionsProps {
  action?: 'login' | 'signup';
  disabled?: boolean;
}

/**
 * Terms and Conditions footer link component.
 * Uses clean dark matte typography with crisp white link styling.
 */
export const TermsAndConditions = React.memo(function TermsAndConditions({
  action = 'signup',
  disabled = false,
}: TermsAndConditionsProps) {
  const handlePress = () => {
    Linking.openURL('https://expense-client-web.vercel.app/');
  };

  const actionText = action === 'login' ? 'signing in' : 'signing up';

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      style={[styles.termsContainer, disabled && { opacity: 0.4 }]}
      disabled={disabled}
    >
      <Text style={styles.termsText} numberOfLines={1} adjustsFontSizeToFit>
        By {actionText}, you agree to our <Text style={styles.termsLink}>Terms & Conditions</Text>
      </Text>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  termsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  termsText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    lineHeight: 16,
    fontWeight: '500',
  },
  termsLink: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});
