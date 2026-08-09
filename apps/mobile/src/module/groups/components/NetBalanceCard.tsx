import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, CURRENCY_SYMBOL } from '../../../constants/theme';
import { styles } from '../styles/groups-tab.styles';

interface NetBalanceCardProps {
  totalOwedToMe: number;
  totalIOwe: number;
  variant?: 'light' | 'dark';
}

export function NetBalanceCard({
  totalOwedToMe,
  totalIOwe,
  variant = 'light',
}: NetBalanceCardProps) {
  const netBalance = totalOwedToMe - totalIOwe;
  const isDark = variant === 'dark';

  return (
    <View
      style={[
        styles.netBalanceCard,
        isDark && {
          backgroundColor: '#0D1A16',
          borderColor: '#1E2F2B',
        },
      ]}
    >
      <View
        style={[
          styles.netBalanceHeader,
          isDark && { borderBottomColor: 'rgba(255, 255, 255, 0.08)' },
        ]}
      >
        <View>
          <Text style={[styles.netBalanceLabel, isDark && { color: '#9CA3AF' }]}>Net Balance</Text>
          <Text
            style={[
              styles.netBalanceAmount,
              {
                color:
                  netBalance > 0
                    ? isDark
                      ? '#34D399'
                      : COLORS.primary
                    : netBalance < 0
                      ? isDark
                        ? '#F87171'
                        : COLORS.error
                      : isDark
                        ? '#F3F4F6'
                        : COLORS.onSurface,
              },
            ]}
          >
            {netBalance > 0 ? '+' : ''}
            {CURRENCY_SYMBOL}
            {netBalance.toFixed(2)}
          </Text>
        </View>
        <Ionicons
          name={
            netBalance > 0 ? 'trending-up' : netBalance < 0 ? 'trending-down' : 'checkmark-circle'
          }
          size={28}
          color={
            netBalance > 0
              ? isDark
                ? '#34D399'
                : COLORS.primary
              : netBalance < 0
                ? isDark
                  ? '#F87171'
                  : COLORS.error
                : isDark
                  ? '#9CA3AF'
                  : COLORS.outline
          }
        />
      </View>

      <View style={styles.netBalanceRow}>
        {/* Plus flow */}
        <View style={styles.netBalanceCol}>
          <View
            style={[
              styles.iconRoundBg,
              { backgroundColor: isDark ? 'rgba(52, 211, 153, 0.18)' : 'rgba(0, 105, 72, 0.08)' },
            ]}
          >
            <Ionicons name="arrow-down" size={14} color={isDark ? '#34D399' : COLORS.primary} />
          </View>
          <View style={styles.netBalanceTextContainer}>
            <Text style={[styles.netBalanceDetailLabel, isDark && { color: '#9CA3AF' }]}>
              Owed to you:
            </Text>
            <Text
              style={[styles.netBalanceDetailValue, { color: isDark ? '#34D399' : COLORS.primary }]}
            >
              {CURRENCY_SYMBOL}
              {totalOwedToMe.toFixed(2)}
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.netBalanceColSeparator,
            isDark && { backgroundColor: 'rgba(255, 255, 255, 0.08)' },
          ]}
        />

        {/* Minus flow */}
        <View style={styles.netBalanceCol}>
          <View
            style={[
              styles.iconRoundBg,
              { backgroundColor: isDark ? 'rgba(248, 113, 113, 0.18)' : 'rgba(186, 26, 26, 0.08)' },
            ]}
          >
            <Ionicons name="arrow-up" size={14} color={isDark ? '#F87171' : COLORS.error} />
          </View>
          <View style={styles.netBalanceTextContainer}>
            <Text style={[styles.netBalanceDetailLabel, isDark && { color: '#9CA3AF' }]}>
              You owe:
            </Text>
            <Text
              style={[styles.netBalanceDetailValue, { color: isDark ? '#F87171' : COLORS.error }]}
            >
              {CURRENCY_SYMBOL}
              {totalIOwe.toFixed(2)}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
