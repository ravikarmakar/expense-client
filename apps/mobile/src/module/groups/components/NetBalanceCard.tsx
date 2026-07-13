import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, CURRENCY_SYMBOL } from '../../../constants/theme';
import { styles } from '../styles/groups-tab.styles';

interface NetBalanceCardProps {
  totalOwedToMe: number;
  totalIOwe: number;
}

export function NetBalanceCard({ totalOwedToMe, totalIOwe }: NetBalanceCardProps) {
  const netBalance = totalOwedToMe - totalIOwe;

  return (
    <View style={styles.netBalanceCard}>
      <View style={styles.netBalanceHeader}>
        <View>
          <Text style={styles.netBalanceLabel}>Net Balance</Text>
          <Text
            style={[
              styles.netBalanceAmount,
              {
                color:
                  netBalance > 0
                    ? COLORS.primary
                    : netBalance < 0
                      ? COLORS.error
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
          color={netBalance > 0 ? COLORS.primary : netBalance < 0 ? COLORS.error : COLORS.outline}
        />
      </View>

      <View style={styles.netBalanceRow}>
        {/* Plus flow */}
        <View style={styles.netBalanceCol}>
          <View style={[styles.iconRoundBg, { backgroundColor: 'rgba(0, 105, 72, 0.08)' }]}>
            <Ionicons name="arrow-down" size={14} color={COLORS.primary} />
          </View>
          <View style={styles.netBalanceTextContainer}>
            <Text style={styles.netBalanceDetailLabel}>Owed to you:</Text>
            <Text style={[styles.netBalanceDetailValue, { color: COLORS.primary }]}>
              {CURRENCY_SYMBOL}
              {totalOwedToMe.toFixed(2)}
            </Text>
          </View>
        </View>

        <View style={styles.netBalanceColSeparator} />

        {/* Minus flow */}
        <View style={styles.netBalanceCol}>
          <View style={[styles.iconRoundBg, { backgroundColor: 'rgba(186, 26, 26, 0.08)' }]}>
            <Ionicons name="arrow-up" size={14} color={COLORS.error} />
          </View>
          <View style={styles.netBalanceTextContainer}>
            <Text style={styles.netBalanceDetailLabel}>You owe:</Text>
            <Text style={[styles.netBalanceDetailValue, { color: COLORS.error }]}>
              {CURRENCY_SYMBOL}
              {totalIOwe.toFixed(2)}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
