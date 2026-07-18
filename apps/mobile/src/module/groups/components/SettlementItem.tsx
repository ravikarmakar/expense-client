import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, CURRENCY_SYMBOL } from '../../../constants/theme';
import { Settlement } from '@workspace/api';

interface SettlementItemProps {
  settlement: Settlement;
  currentUserId?: string;
}

export const SettlementItem: React.FC<SettlementItemProps> = ({ settlement, currentUserId }) => {
  const isFromMe = settlement.fromId === currentUserId;
  const isToMe = settlement.toId === currentUserId;

  const dateStr = new Date(settlement.createdAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <View style={styles.container}>
      <View style={styles.iconBg}>
        <Ionicons name="swap-horizontal" size={20} color={COLORS.primary} />
      </View>
      <View style={styles.info}>
        <Text style={styles.titleText}>
          <Text style={styles.boldText}>{isFromMe ? 'You' : settlement.from?.name || 'User'}</Text>{' '}
          paid <Text style={styles.boldText}>{isToMe ? 'you' : settlement.to?.name || 'User'}</Text>
        </Text>
        <Text style={styles.dateText}>{dateStr}</Text>
      </View>
      <Text style={styles.amountText}>
        {CURRENCY_SYMBOL}
        {settlement.amount.toFixed(2)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
  },
  iconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primaryFixed,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  info: {
    flex: 1,
    justifyContent: 'center',
  },
  titleText: {
    fontSize: 15,
    color: '#202124',
    marginBottom: 3,
  },
  boldText: {
    fontWeight: '600',
  },
  dateText: {
    fontSize: 11.5,
    color: '#70757a',
    fontWeight: '400',
  },
  amountText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.primary,
  },
});
