import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

export const PAYMENT_METHODS = [
  { id: 'UPI', label: 'UPI', icon: 'qrcode-scan', lib: 'MaterialCommunityIcons' },
  { id: 'Cash', label: 'Cash', icon: 'cash-outline', lib: 'Ionicons' },
  { id: 'Credit Card', label: 'Credit Card', icon: 'card-outline', lib: 'Ionicons' },
  { id: 'Debit Card', label: 'Debit Card', icon: 'card-sharp', lib: 'Ionicons' },
  { id: 'Net Banking', label: 'Net Banking', icon: 'bank-outline', lib: 'MaterialCommunityIcons' },
  { id: 'Cheque', label: 'Cheque', icon: 'text-box-check-outline', lib: 'MaterialCommunityIcons' },
  { id: 'Other', label: 'Other', icon: 'ellipsis-horizontal-circle-outline', lib: 'Ionicons' },
] as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[number]['id'];

interface PaymentMethodSelectorProps {
  selectedMethod: string | null;
  onSelect: (method: string) => void;
  variant?: 'light' | 'dark';
}

export function PaymentMethodSelector({
  selectedMethod,
  onSelect,
  variant = 'light',
}: PaymentMethodSelectorProps) {
  const isDark = variant === 'dark';

  return (
    <View style={styles.container}>
      <Text style={[styles.label, isDark && { color: '#9CA3AF' }]}>Payment Method</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        keyboardShouldPersistTaps="always"
        contentContainerStyle={styles.scrollContainer}
      >
        {PAYMENT_METHODS.map((method) => {
          const isSelected = selectedMethod === method.id;
          return (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.methodChip,
                isDark && styles.methodChipDark,
                isSelected && (isDark ? styles.methodChipActiveDark : styles.methodChipActiveLight),
              ]}
              activeOpacity={0.8}
              onPress={() => onSelect(method.id)}
            >
              {method.lib === 'Ionicons' ? (
                <Ionicons
                  name={method.icon as never}
                  size={16}
                  color={
                    isSelected
                      ? isDark
                        ? '#34D399'
                        : '#006948'
                      : isDark
                        ? '#9CA3AF'
                        : COLORS.outline
                  }
                />
              ) : (
                <MaterialCommunityIcons
                  name={method.icon as never}
                  size={16}
                  color={
                    isSelected
                      ? isDark
                        ? '#34D399'
                        : '#006948'
                      : isDark
                        ? '#9CA3AF'
                        : COLORS.outline
                  }
                />
              )}
              <Text
                style={[
                  styles.chipText,
                  isDark && { color: '#9CA3AF' },
                  isSelected &&
                    (isDark
                      ? { color: '#34D399', fontWeight: '800' }
                      : { color: '#006948', fontWeight: '800' }),
                ]}
              >
                {method.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.outline,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  scrollContainer: {
    gap: 8,
    paddingRight: 12,
  },
  methodChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 14,
    backgroundColor: COLORS.surfaceContainerLow,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainer,
  },
  methodChipDark: {
    backgroundColor: '#101917',
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  methodChipActiveLight: {
    backgroundColor: '#E6F4EA',
    borderColor: '#006948',
  },
  methodChipActiveDark: {
    backgroundColor: 'rgba(52, 211, 153, 0.15)',
    borderColor: '#34D399',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.onSurface,
  },
});
