import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CURRENCY_SYMBOL } from '../../../constants/theme';

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
  const isPositive = netBalance > 0;
  const isNegative = netBalance < 0;

  return (
    <View style={[styles.card, isDark ? styles.cardDark : styles.cardLight]}>
      {/* Background glow decoration */}
      <View
        style={[
          styles.bgGlow,
          {
            backgroundColor: isPositive
              ? 'rgba(16, 185, 129, 0.06)'
              : isNegative
                ? 'rgba(239, 68, 68, 0.05)'
                : 'rgba(52, 211, 153, 0.04)',
          },
        ]}
      />

      {/* Top Header Badge & Net Amount */}
      <View style={[styles.topRow, isDark ? styles.topRowDark : styles.topRowLight]}>
        <View>
          <View
            style={[styles.statusBadge, isDark ? styles.statusBadgeDark : styles.statusBadgeLight]}
          >
            <Ionicons
              name={isPositive ? 'trending-up' : isNegative ? 'trending-down' : 'checkmark-circle'}
              size={12}
              color={
                isPositive
                  ? isDark
                    ? '#34D399'
                    : '#059669'
                  : isNegative
                    ? '#F87171'
                    : isDark
                      ? '#9CA3AF'
                      : '#64748B'
              }
            />
            <Text
              style={[
                styles.statusBadgeText,
                {
                  color: isPositive
                    ? isDark
                      ? '#34D399'
                      : '#059669'
                    : isNegative
                      ? '#F87171'
                      : isDark
                        ? '#9CA3AF'
                        : '#64748B',
                },
              ]}
            >
              {isPositive ? 'NET RECEIVABLE' : isNegative ? 'NET PAYABLE' : 'BALANCED'}
            </Text>
          </View>
          <Text style={[styles.netLabel, isDark ? { color: '#9CA3AF' } : { color: '#64748B' }]}>
            Overall Group Position
          </Text>
        </View>

        <Text
          style={[
            styles.heroAmount,
            {
              color: isPositive
                ? isDark
                  ? '#34D399'
                  : '#059669'
                : isNegative
                  ? isDark
                    ? '#FCA5A5'
                    : '#DC2626'
                  : isDark
                    ? '#FFFFFF'
                    : '#0F172A',
            },
          ]}
        >
          {isPositive ? '+' : ''}
          {CURRENCY_SYMBOL}
          {netBalance.toFixed(2)}
        </Text>
      </View>

      {/* Split Cards: Owed to You vs You Owe */}
      <View style={styles.splitRow}>
        {/* Owed to You Card */}
        <View style={[styles.splitCard, isDark ? styles.splitOwedDark : styles.splitOwedLight]}>
          <View style={styles.splitHeader}>
            <View
              style={[
                styles.iconBg,
                { backgroundColor: isDark ? 'rgba(52, 211, 153, 0.18)' : '#DCFCE7' },
              ]}
            >
              <Ionicons name="arrow-down" size={13} color={isDark ? '#34D399' : '#059669'} />
            </View>
            <Text style={[styles.splitLabel, isDark ? { color: '#D1D5DB' } : { color: '#374151' }]}>
              Owed to you
            </Text>
          </View>
          <Text style={[styles.splitAmount, { color: isDark ? '#34D399' : '#059669' }]}>
            +{CURRENCY_SYMBOL}
            {totalOwedToMe.toFixed(2)}
          </Text>
        </View>

        {/* You Owe Card */}
        <View style={[styles.splitCard, isDark ? styles.splitOweDark : styles.splitOweLight]}>
          <View style={styles.splitHeader}>
            <View
              style={[
                styles.iconBg,
                { backgroundColor: isDark ? 'rgba(248, 113, 113, 0.18)' : '#FEE2E2' },
              ]}
            >
              <Ionicons name="arrow-up" size={13} color={isDark ? '#F87171' : '#DC2626'} />
            </View>
            <Text style={[styles.splitLabel, isDark ? { color: '#D1D5DB' } : { color: '#374151' }]}>
              You owe
            </Text>
          </View>
          <Text style={[styles.splitAmount, { color: isDark ? '#FCA5A5' : '#DC2626' }]}>
            -{CURRENCY_SYMBOL}
            {totalIOwe.toFixed(2)}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 22,
    padding: 16,
    marginBottom: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  cardDark: {
    backgroundColor: '#101917',
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.16)',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  cardLight: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F766E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  bgGlow: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    top: -50,
    right: -40,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  topRowDark: {
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  topRowLight: {
    borderBottomColor: '#E2E8F0',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  statusBadgeDark: {
    backgroundColor: 'rgba(52, 211, 153, 0.12)',
  },
  statusBadgeLight: {
    backgroundColor: 'rgba(15, 118, 110, 0.08)',
  },
  statusBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  netLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  heroAmount: {
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.6,
  },
  splitRow: {
    flexDirection: 'row',
    gap: 10,
  },
  splitCard: {
    flex: 1,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  splitOwedDark: {
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  splitOwedLight: {
    backgroundColor: '#F0FDF4',
    borderColor: '#DCFCE7',
  },
  splitOweDark: {
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  splitOweLight: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FEE2E2',
  },
  splitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  iconBg: {
    width: 22,
    height: 22,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  splitLabel: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  splitAmount: {
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: -0.4,
  },
});
