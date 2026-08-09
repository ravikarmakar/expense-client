import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CURRENCY_SYMBOL } from '../constants/theme';
import { type LoanSummary } from '@workspace/api';

interface LendBorrowSummaryCardProps {
  summary?: LoanSummary;
  isDark?: boolean;
}

export function LendBorrowSummaryCard({ summary, isDark = false }: LendBorrowSummaryCardProps) {
  const totalLentPending = summary?.totalLentPending ?? 0;
  const totalBorrowedPending = summary?.totalBorrowedPending ?? 0;
  const netBalance = summary?.netBalance ?? 0;

  const isNetPositive = netBalance >= 0;

  return (
    <View
      style={[
        styles.container,
        isNetPositive
          ? isDark
            ? styles.containerLendDark
            : styles.containerLendLight
          : isDark
            ? styles.containerBorrowDark
            : styles.containerBorrowLight,
      ]}
    >
      {/* Decorative Circles */}
      <View style={styles.cardCircle1} />
      <View style={styles.cardCircle2} />

      <View style={styles.topRow}>
        <View style={styles.netInfo}>
          <Text style={styles.netTitle}>Net Balance</Text>
          <Text style={styles.netAmount}>
            {isNetPositive ? '+' : ''}
            {CURRENCY_SYMBOL}
            {netBalance.toLocaleString('en-IN', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </Text>
        </View>

        <View style={styles.iconBadge}>
          <Ionicons
            name={isNetPositive ? 'trending-up' : 'trending-down'}
            size={22}
            color="#ffffff"
          />
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.bottomGrid}>
        {/* You Owed (Lent) Pill */}
        <View style={styles.statPill}>
          <Ionicons name="arrow-down-circle" size={16} color="rgba(255, 255, 255, 0.85)" />
          <View>
            <Text style={styles.statPillLabel}>You Owed (Lent)</Text>
            <Text style={styles.statPillValue}>
              +{CURRENCY_SYMBOL}
              {totalLentPending.toFixed(2)}
            </Text>
          </View>
        </View>

        {/* You Owe (Borrowed) Pill */}
        <View style={styles.statPill}>
          <Ionicons name="arrow-up-circle" size={16} color="rgba(255, 255, 255, 0.85)" />
          <View>
            <Text style={styles.statPillLabel}>You Owe (Borrowed)</Text>
            <Text style={styles.statPillValue}>
              -{CURRENCY_SYMBOL}
              {totalBorrowedPending.toFixed(2)}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    padding: 22,
    marginBottom: 20,
    overflow: 'hidden',
    position: 'relative',
    elevation: 4,
  },
  containerLendLight: {
    backgroundColor: '#0F766E', // Rich Muted Teal Green
    shadowColor: '#0F766E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  containerLendDark: {
    backgroundColor: '#114B45', // Dimmed Deep Slate Teal
    borderWidth: 1,
    borderColor: 'rgba(45, 212, 191, 0.28)',
    shadowColor: '#0F766E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
  containerBorrowLight: {
    backgroundColor: '#9F1239', // Rich Muted Deep Rose
    shadowColor: '#9F1239',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  containerBorrowDark: {
    backgroundColor: '#6B1226', // Dimmed Deep Slate Rose
    borderWidth: 1,
    borderColor: 'rgba(251, 113, 133, 0.28)',
    shadowColor: '#9F1239',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
  cardCircle1: {
    position: 'absolute',
    borderRadius: 999,
    width: 140,
    height: 140,
    top: -40,
    right: -40,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  cardCircle2: {
    position: 'absolute',
    borderRadius: 999,
    width: 85,
    height: 85,
    bottom: -30,
    left: -20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  netInfo: {
    gap: 2,
  },
  netTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.75)',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  netAmount: {
    fontSize: 30,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -0.5,
  },
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    marginBottom: 14,
  },
  bottomGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  statPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
  },
  statPillLabel: {
    fontSize: 10.5,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  statPillValue: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#ffffff',
  },
});
