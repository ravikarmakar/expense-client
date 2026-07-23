import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { SuccessCard } from './SuccessCard';
import { TactileButton } from './TactileButton';

interface ExpenseSuccessViewProps {
  title: string;
  amount: number;
  category: string;
  groupName?: string;
  onDone: () => void;
  variant?: 'light' | 'dark';
}

export function ExpenseSuccessView({
  title,
  amount,
  category,
  groupName,
  onDone,
  variant = 'light',
}: ExpenseSuccessViewProps) {
  const isDark = variant === 'dark';

  return (
    <View style={styles.container}>
      <View style={styles.successBadge}>
        <Ionicons name="checkmark-circle" size={72} color={isDark ? '#10B981' : COLORS.primary} />
      </View>

      <Text style={[styles.successTitle, isDark && { color: '#FFFFFF' }]}>Expense Added!</Text>
      <Text style={[styles.successSubtitle, isDark && { color: '#74817B' }]}>
        Your transaction has been recorded successfully.
      </Text>

      <SuccessCard
        title={title}
        amount={amount}
        category={category}
        groupName={groupName}
        variant={variant}
      />

      <TactileButton title="Done" variant="emerald" onPress={onDone} style={styles.doneBtn} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    alignItems: 'center',
    width: '100%',
  },
  successBadge: {
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.onSurface,
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 14,
    color: COLORS.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  doneBtn: {
    marginTop: 8,
    width: '100%',
  },
});
