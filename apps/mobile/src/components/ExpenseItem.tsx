import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { COLORS, CURRENCY_SYMBOL, CATEGORY_ICONS } from '../constants/theme';
import { type Expense } from '@workspace/api';

interface TransactionItemProps {
  expense: Expense;
  currentUserId?: string;
  onPress?: () => void;
  isSettled?: boolean;
}

export const ExpenseItem = React.memo(function TransactionItem({
  expense,
  currentUserId,
  onPress,
  isSettled,
}: TransactionItemProps) {
  const defaultOnPress = () => router.push(`/expense/${expense.id}`);

  const finalIsSettled = isSettled !== undefined ? isSettled : expense.isSettled || false;

  // Format payer name display
  const isMyExpense = expense.paidBy.userId === currentUserId;
  const payerDisplayName = isMyExpense ? 'You' : expense.paidBy.name.split(' ')[0] || 'User';

  // Format payment source subtitle
  const sourceSubtitle = expense.group
    ? `${expense.group.emoji} ${expense.group.name} • ${expense.isWalletPayment ? 'Paid via Wallet' : `Paid by ${payerDisplayName}`}`
    : `Personal • ${expense.category} • Paid by You`;

  // Look up category icon configuration
  const cfg = CATEGORY_ICONS[expense.category] ?? CATEGORY_ICONS.Other;

  // Format timestamp (e.g. "13 Jul 2026, 08:29 AM")
  const dateObj = new Date(expense.date);
  const dateStr = dateObj.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const createdObj = new Date(expense.createdAt || expense.date);
  let hours = createdObj.getHours();
  const minutes = createdObj.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  const timeStr = `${hours.toString().padStart(2, '0')}:${minutes} ${ampm}`;
  const fullDateTimeStr = `${dateStr}, ${timeStr}`;

  // Calculate balance display
  let balanceLabel = '';
  let balanceColor = '#70757a';

  if (expense.groupId) {
    if (isMyExpense) {
      const othersOwe = expense.splits
        ? expense.splits
            .filter((s) => s.userId !== currentUserId && !s.paid)
            .reduce((sum, s) => sum + s.amount, 0)
        : 0;
      if (othersOwe > 0) {
        balanceLabel = `Owed ${CURRENCY_SYMBOL}${othersOwe.toFixed(2)}`;
        balanceColor = finalIsSettled ? '#70757a' : '#1b5e20';
      } else {
        balanceLabel = 'Settled';
        balanceColor = '#137333';
      }
    } else {
      const mySplit = expense.splits?.find((s) => s.userId === currentUserId);
      if (mySplit) {
        if (mySplit.paid) {
          balanceLabel = 'Settled';
          balanceColor = '#137333';
        } else {
          balanceLabel = `Owe ${CURRENCY_SYMBOL}${mySplit.amount.toFixed(2)}`;
          balanceColor = finalIsSettled ? '#70757a' : '#c62828';
        }
      }
    }
  }

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress ?? defaultOnPress}
      activeOpacity={0.6}
    >
      {/* Left: Category Icon Avatar */}
      <View style={[styles.avatarCircle, { backgroundColor: cfg.bg }]}>
        {cfg.lib === 'Ionicons' ? (
          <Ionicons name={cfg.icon as never} size={22} color={cfg.color} />
        ) : (
          <MaterialIcons name={cfg.icon as never} size={22} color={cfg.color} />
        )}
      </View>

      {/* Middle: Title, Payment Subtitle, Date */}
      <View style={styles.middleSection}>
        <Text style={styles.sourceText} numberOfLines={1}>
          {sourceSubtitle}
        </Text>
        <Text style={styles.titleText} numberOfLines={1}>
          {expense.title}
        </Text>
        <Text style={styles.dateText}>{fullDateTimeStr}</Text>
      </View>

      {/* Right: Amount & Chevron */}
      <View style={styles.rightSection}>
        <View style={styles.amountContainer}>
          <Text style={[styles.amountText, styles.amountDebit]}>
            {CURRENCY_SYMBOL}
            {expense.amount.toFixed(2)}
          </Text>
          {expense.isWalletPayment ? (
            <View style={styles.walletPaidBadge}>
              <Ionicons name="wallet" size={9} color={COLORS.primary} />
              <Text style={styles.walletPaidBadgeText}>Wallet</Text>
            </View>
          ) : (
            <>
              {balanceLabel ? (
                <Text style={[styles.balanceText, { color: balanceColor }]} numberOfLines={1}>
                  {balanceLabel}
                </Text>
              ) : null}
              {finalIsSettled ? (
                <View style={styles.settledBadgeContainer}>
                  <Text style={styles.settledBadgeText}>Covered by settlement</Text>
                </View>
              ) : null}
            </>
          )}
        </View>
        <Ionicons name="chevron-forward" size={16} color="#000000" style={styles.chevron} />
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '500',
  },
  doubleCircleContainer: {
    marginRight: 14,
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outerRupeeCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#bdc1c6',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  innerRupeeCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#4285f4', // Blue border
    backgroundColor: '#fdd835', // Yellow/Gold background
    alignItems: 'center',
    justifyContent: 'center',
  },
  rupeeSymbol: {
    fontSize: 18,
    fontWeight: '700',
    color: '#3c4043',
  },
  middleSection: {
    flex: 1,
    justifyContent: 'center',
  },
  sourceText: {
    fontSize: 11.5,
    color: '#70757a',
    marginBottom: 2,
    fontWeight: '400',
  },
  titleText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#202124',
    marginBottom: 3,
    letterSpacing: 0.3,
  },
  dateText: {
    fontSize: 11.5,
    color: '#70757a',
    fontWeight: '400',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    minWidth: 90,
  },
  amountContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  amountText: {
    fontSize: 15,
    fontWeight: '600',
  },
  amountCredit: {
    color: '#137333', // Amazon Pay green for credits
  },
  amountDebit: {
    color: '#202124', // Amazon Pay dark for debits
  },
  balanceText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  chevron: {
    marginLeft: 10,
    opacity: 0.8,
  },
  settledBadgeContainer: {
    backgroundColor: '#e6f4ea',
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 2,
    marginTop: 3,
  },
  settledBadgeText: {
    fontSize: 9.5,
    color: '#137333',
    fontWeight: '700',
  },
  walletPaidBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryFixed,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 2.5,
    marginTop: 3,
  },
  walletPaidBadgeText: {
    fontSize: 8.5,
    fontWeight: '800',
    color: COLORS.onPrimaryFixedVariant,
    lineHeight: 11,
    textTransform: 'uppercase',
  },
});
