import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { COLORS, CURRENCY_SYMBOL, CATEGORY_ICONS } from '../constants/theme';
import type { Expense } from '@workspace/api';

interface ExpenseItemProps {
  expense: Expense;
  currentUserId?: string;
  onPress?: () => void;
}

export const ExpenseItem = React.memo(function ExpenseItem({
  expense,
  currentUserId,
  onPress,
}: ExpenseItemProps) {
  const defaultOnPress = () => router.push(`/expense/${expense.id}`);

  const cfg = CATEGORY_ICONS[expense.category] ?? CATEGORY_ICONS.Other;

  // Calculate balance display
  const isMyExpense = expense.paidBy.userId === currentUserId;
  const youOwe = expense.youOwe ?? 0;
  const myShare = expense.myShare;

  let balanceLabel = '';
  let balanceColor = COLORS.outline;
  let balanceBg = COLORS.surfaceContainerLow;

  if (isMyExpense && expense.splits && expense.splits.length > 1) {
    const othersOwe = expense.splits
      .filter((s) => s.userId !== currentUserId && !s.paid)
      .reduce((sum, s) => sum + s.amount, 0);
    if (othersOwe > 0) {
      balanceLabel = `Owed ${CURRENCY_SYMBOL}${othersOwe.toFixed(2)}`;
      balanceColor = '#1b5e20'; // Darker green for text
      balanceBg = '#e8f5e9'; // Soft green pill background
    }
  } else if (youOwe > 0) {
    balanceLabel = `Owe ${CURRENCY_SYMBOL}${youOwe.toFixed(2)}`;
    balanceColor = '#c62828'; // Darker red for text
    balanceBg = '#ffebee'; // Soft red pill background
  } else if (youOwe < 0) {
    balanceLabel = `Owed ${CURRENCY_SYMBOL}${Math.abs(youOwe).toFixed(2)}`;
    balanceColor = '#1b5e20';
    balanceBg = '#e8f5e9';
  } else if (myShare !== undefined && myShare !== null) {
    balanceLabel = `${CURRENCY_SYMBOL}${myShare.toFixed(2)}`;
    balanceColor = COLORS.onSurfaceVariant;
    balanceBg = COLORS.surfaceContainerHigh;
  }

  const dateStr = new Date(expense.date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
  });

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress ?? defaultOnPress}
      activeOpacity={0.75}
    >
      {/* Category icon with modern rounded corners */}
      <View style={[styles.iconBg, { backgroundColor: cfg.bg }]}>
        {cfg.lib === 'Ionicons' ? (
          <Ionicons name={cfg.icon as never} size={22} color={cfg.color} />
        ) : (
          <MaterialIcons name={cfg.icon as never} size={22} color={cfg.color} />
        )}
      </View>

      {/* Main content */}
      <View style={styles.info}>
        {expense.group && (
          <Text style={styles.groupHeader} numberOfLines={1}>
            {expense.group.emoji} {expense.group.name}
          </Text>
        )}
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1}>
            {expense.title}
          </Text>
          {expense.isWalletPayment && (
            <View style={styles.walletBadge}>
              <Ionicons name="wallet" size={9} color={COLORS.primary} />
              <Text style={styles.walletBadgeText}>Wallet</Text>
            </View>
          )}
        </View>

        <View style={styles.metaRow}>
          <Text style={styles.paidBy} numberOfLines={1}>
            {isMyExpense ? 'You paid' : `${expense.paidBy.name.split(' ')[0]} paid`}
          </Text>
          <View style={styles.dot} />
          <Text style={styles.date}>{dateStr}</Text>
        </View>
      </View>

      {/* Right side: total amount + status pill */}
      <View style={styles.right}>
        <Text style={styles.totalAmount}>
          {CURRENCY_SYMBOL}
          {expense.amount.toFixed(2)}
        </Text>
        {balanceLabel ? (
          <View style={[styles.statusPill, { backgroundColor: balanceBg }]}>
            <Text style={[styles.statusPillText, { color: balanceColor }]}>{balanceLabel}</Text>
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 20, // More rounded modern container
    padding: 16, // Spacious padding
    gap: 14,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainer,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },
  iconBg: {
    width: 48, // Larger icon container
    height: 48,
    borderRadius: 14, // Modern rounded rectangle
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  info: {
    flex: 1,
    justifyContent: 'center',
    gap: 4,
  },
  title: {
    fontSize: 16, // Larger title text
    fontWeight: '700',
    color: COLORS.onSurface,
    flexShrink: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  walletBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryFixed,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 3,
  },
  walletBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.onPrimaryFixedVariant,
    lineHeight: 12,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexShrink: 1, // Allow row to shrink
  },
  paidBy: {
    fontSize: 12, // Increased from 11
    color: COLORS.outline,
    fontWeight: '500',
    flexShrink: 1, // Shrink text if needed
  },
  dot: {
    width: 4, // Slightly larger separator dot
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.outlineVariant,
    marginHorizontal: 3,
  },
  date: {
    fontSize: 12, // Increased from 11
    color: COLORS.outline,
    fontWeight: '500',
  },
  groupHeader: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  right: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 4,
    flexShrink: 0,
    minWidth: 80,
  },
  totalAmount: {
    fontSize: 16, // Increased from 14
    fontWeight: '700', // Bold amount display
    color: COLORS.onSurface,
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusPillText: {
    fontSize: 10.5, // Legible status text
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    lineHeight: 14,
  },
});
