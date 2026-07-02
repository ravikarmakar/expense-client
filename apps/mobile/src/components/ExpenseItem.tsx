import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { COLORS, CURRENCY_SYMBOL, CATEGORY_ICONS } from '../constants/theme';
import type { Expense } from '@workspace/api';

interface ExpenseItemProps {
  expense: Expense;
  currentUserId?: string;
  onPress?: () => void;
}

export function ExpenseItem({ expense, currentUserId, onPress }: ExpenseItemProps) {
  const cfg = CATEGORY_ICONS[expense.category] ?? CATEGORY_ICONS.Other;

  // Calculate balance display
  const isMyExpense = expense.paidBy.userId === currentUserId;
  const youOwe = expense.youOwe ?? 0;
  const myShare = expense.myShare;

  let balanceLabel = '';
  let balanceColor = COLORS.outline;

  if (isMyExpense && expense.splits && expense.splits.length > 1) {
    const othersOwe = expense.splits
      .filter((s) => s.userId !== currentUserId)
      .reduce((sum, s) => sum + s.amount, 0);
    if (othersOwe > 0) {
      balanceLabel = `+${CURRENCY_SYMBOL}${othersOwe.toFixed(2)}`;
      balanceColor = '#2e7d32';
    }
  } else if (youOwe > 0) {
    balanceLabel = `-${CURRENCY_SYMBOL}${youOwe.toFixed(2)}`;
    balanceColor = COLORS.error;
  } else if (youOwe < 0) {
    balanceLabel = `+${CURRENCY_SYMBOL}${Math.abs(youOwe).toFixed(2)}`;
    balanceColor = '#2e7d32';
  } else if (myShare !== undefined && myShare !== null) {
    balanceLabel = `${CURRENCY_SYMBOL}${myShare.toFixed(2)}`;
    balanceColor = COLORS.outline;
  }

  const dateStr = new Date(expense.date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
  });

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.75}>
      {/* Category icon */}
      <View style={[styles.iconBg, { backgroundColor: cfg.bg }]}>
        {cfg.lib === 'Ionicons' ? (
          <Ionicons name={cfg.icon as never} size={22} color={cfg.color} />
        ) : (
          <MaterialIcons name={cfg.icon as never} size={22} color={cfg.color} />
        )}
      </View>

      {/* Main content */}
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>
          {expense.title}
        </Text>
        <View style={styles.metaRow}>
          <Text style={styles.paidBy}>
            {isMyExpense ? 'You paid' : `${expense.paidBy.name} paid`}
          </Text>
          <View style={styles.dot} />
          <Text style={styles.date}>{dateStr}</Text>
          {expense.groupId && (
            <>
              <View style={styles.dot} />
              <Ionicons name="people" size={11} color={COLORS.outline} />
            </>
          )}
        </View>
      </View>

      {/* Right side: total + share */}
      <View style={styles.right}>
        <Text style={styles.totalAmount}>
          {CURRENCY_SYMBOL}
          {expense.amount.toFixed(2)}
        </Text>
        {balanceLabel ? (
          <Text style={[styles.shareLabel, { color: balanceColor }]}>{balanceLabel}</Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainer,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
  },
  iconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  info: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.onSurface,
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
  },
  date: {
    fontSize: 11,
    color: COLORS.outline,
  },
  right: {
    alignItems: 'flex-end',
    gap: 2,
    flexShrink: 0,
  },
  totalAmount: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  shareLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
});
