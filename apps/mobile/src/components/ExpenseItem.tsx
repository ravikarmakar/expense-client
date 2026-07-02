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
      .filter((s) => s.userId !== currentUserId)
      .reduce((sum, s) => sum + s.amount, 0);
    if (othersOwe > 0) {
      balanceLabel = `Owed ${CURRENCY_SYMBOL}${othersOwe.toFixed(0)}`;
      balanceColor = '#1b5e20'; // Darker green for text
      balanceBg = '#e8f5e9'; // Soft green pill background
    }
  } else if (youOwe > 0) {
    balanceLabel = `Owe ${CURRENCY_SYMBOL}${youOwe.toFixed(0)}`;
    balanceColor = '#c62828'; // Darker red for text
    balanceBg = '#ffebee'; // Soft red pill background
  } else if (youOwe < 0) {
    balanceLabel = `Owed ${CURRENCY_SYMBOL}${Math.abs(youOwe).toFixed(0)}`;
    balanceColor = '#1b5e20';
    balanceBg = '#e8f5e9';
  } else if (myShare !== undefined && myShare !== null) {
    balanceLabel = `${CURRENCY_SYMBOL}${myShare.toFixed(0)}`;
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
          <Ionicons name={cfg.icon as never} size={20} color={cfg.color} />
        ) : (
          <MaterialIcons name={cfg.icon as never} size={20} color={cfg.color} />
        )}
      </View>

      {/* Main content */}
      <View style={styles.info}>
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

          {expense.group ? (
            <>
              <View style={styles.dot} />
              <View style={styles.groupBadge}>
                <Text style={styles.groupBadgeText} numberOfLines={1}>
                  {expense.group.emoji} {expense.group.name}
                </Text>
              </View>
            </>
          ) : expense.groupId ? (
            <>
              <View style={styles.dot} />
              <Ionicons name="people" size={11} color={COLORS.outline} />
            </>
          ) : null}
        </View>
      </View>

      {/* Right side: total amount + status pill */}
      <View style={styles.right}>
        <Text style={styles.totalAmount}>
          {CURRENCY_SYMBOL}
          {expense.amount.toFixed(0)}
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
    borderRadius: 16,
    padding: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainer,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
  },
  iconBg: {
    width: 44,
    height: 44,
    borderRadius: 12, // Modern rounded rectangle
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  info: {
    flex: 1,
    justifyContent: 'center',
    gap: 3,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.onSurface,
    flexShrink: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  walletBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryFixed,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    gap: 2,
  },
  walletBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.onPrimaryFixedVariant,
    lineHeight: 12, // Explicit line height for perfect vertical alignment
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  paidBy: {
    fontSize: 11,
    color: COLORS.outline,
    fontWeight: '500',
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: COLORS.outlineVariant,
    marginHorizontal: 2, // Space out separator dots
  },
  date: {
    fontSize: 11,
    color: COLORS.outline,
  },
  groupBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceContainerLow,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    maxWidth: 90,
  },
  groupBadgeText: {
    fontSize: 9,
    fontWeight: '600',
    color: COLORS.onSurfaceVariant,
    lineHeight: 12, // Centered badge text
  },
  right: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 4,
    flexShrink: 0,
  },
  totalAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    lineHeight: 13, // Centered pill text
  },
});
