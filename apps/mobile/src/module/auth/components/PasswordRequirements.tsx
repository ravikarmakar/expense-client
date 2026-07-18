import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../constants/theme';

interface PasswordRequirementsProps {
  password: string;
}

export const PasswordRequirements = React.memo(function PasswordRequirements({
  password,
}: PasswordRequirementsProps) {
  const requirements = [
    { label: 'Password must be at least 8 characters', met: password.length >= 8 },
    { label: 'Add a lowercase letter (a-z)', met: /[a-z]/.test(password) },
    { label: 'Add an uppercase letter (A-Z)', met: /[A-Z]/.test(password) },
    { label: 'Add a number (0-9)', met: /[0-9]/.test(password) },
    { label: 'Add a special character (e.g. !@#)', met: /[^a-zA-Z0-9]/.test(password) },
  ];

  const firstUnmet = requirements.find((req) => !req.met);

  if (!firstUnmet) {
    return (
      <View style={styles.singleLineRow}>
        <Ionicons name="checkmark-circle" size={14} color={COLORS.primary} />
        <Text style={styles.successText}>Password is secure</Text>
      </View>
    );
  }

  return (
    <View style={styles.singleLineRow}>
      <Ionicons name="alert-circle" size={14} color={COLORS.outline} />
      <Text style={styles.errorText}>{firstUnmet.label}</Text>
    </View>
  );
});

const styles = StyleSheet.create({
  singleLineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: -8,
    marginBottom: 16,
    paddingLeft: 4,
  },
  errorText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.outline,
  },
  successText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
});
