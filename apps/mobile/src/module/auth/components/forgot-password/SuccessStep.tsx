import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TactileButton } from '../../../../components/TactileButton';

import { useTheme } from '../../../../context/ThemeContext';

interface SuccessStepProps {
  onBackToSignIn: () => void;
}

export function SuccessStep({ onBackToSignIn }: SuccessStepProps) {
  const { isDark } = useTheme();

  return (
    <View style={styles.successContainer}>
      <View style={styles.successIconBadge}>
        <Ionicons name="checkmark-circle" size={56} color={isDark ? '#34d399' : '#006948'} />
      </View>
      <Text style={[styles.successTitle, !isDark && { color: '#191c1d' }]}>
        Password Reset Complete
      </Text>
      <Text style={[styles.successDescription, !isDark && { color: '#6d7a72' }]}>
        Your password has been successfully updated. You can now use your new password to sign in.
      </Text>

      <TactileButton
        title="Back to Sign In"
        icon="log-in-outline"
        variant="emerald"
        onPress={onBackToSignIn}
        style={{ width: '100%', marginTop: 16 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  successContainer: {
    alignItems: 'center',
    paddingVertical: 12,
    width: '100%',
  },
  successIconBadge: {
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 8,
  },
  successDescription: {
    fontSize: 14,
    color: 'rgba(209, 250, 229, 0.75)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
    fontWeight: '500',
  },
});
