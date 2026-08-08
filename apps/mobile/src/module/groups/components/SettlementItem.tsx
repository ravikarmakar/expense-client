import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, CURRENCY_SYMBOL } from '../../../constants/theme';
import { Settlement } from '@workspace/api';
import { ScalePressable } from '../../../components/ScalePressable';

interface SettlementItemProps {
  settlement: Settlement;
  currentUserId?: string;
  onDelete?: (settlementId: string) => void;
  variant?: 'light' | 'dark';
}

export const SettlementItem: React.FC<SettlementItemProps> = ({
  settlement,
  currentUserId,
  onDelete,
  variant = 'light',
}) => {
  const isDark = variant === 'dark';
  const isFromMe = settlement.fromId === currentUserId;
  const isToMe = settlement.toId === currentUserId;

  const dateStr = new Date(settlement.createdAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const handlePress = () => {
    if (!onDelete) return;
    Alert.alert(
      'Delete Settlement',
      'Are you sure you want to delete this settlement? Group balances will automatically adjust.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDelete(settlement.id),
        },
      ]
    );
  };

  return (
    <ScalePressable
      style={[
        styles.container,
        isDark && {
          backgroundColor: 'transparent',
          borderBottomColor: 'rgba(255, 255, 255, 0.06)',
        },
      ]}
      onPress={onDelete ? handlePress : undefined}
      hapticType="none"
    >
      <View style={[styles.iconBg, isDark && { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
        <Ionicons name="swap-horizontal" size={20} color={isDark ? '#34d399' : COLORS.primary} />
      </View>
      <View style={styles.info}>
        <Text style={[styles.titleText, isDark && { color: '#ffffff' }]}>
          <Text style={[styles.boldText, isDark && { color: '#ffffff' }]}>
            {isFromMe ? 'You' : settlement.from?.name || 'User'}
          </Text>{' '}
          paid{' '}
          <Text style={[styles.boldText, isDark && { color: '#ffffff' }]}>
            {isToMe ? 'you' : settlement.to?.name || 'User'}
          </Text>
        </Text>
        <Text style={[styles.dateText, isDark && { color: 'rgba(255, 255, 255, 0.4)' }]}>
          {dateStr}
        </Text>
      </View>
      <Text style={[styles.amountText, isDark && { color: '#34d399' }]}>
        {CURRENCY_SYMBOL}
        {settlement.amount.toFixed(2)}
      </Text>
      {onDelete && (
        <TouchableOpacity onPress={handlePress} style={{ padding: 6, marginLeft: 6 }}>
          <Ionicons name="trash-outline" size={18} color="#eb5757" />
        </TouchableOpacity>
      )}
    </ScalePressable>
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
