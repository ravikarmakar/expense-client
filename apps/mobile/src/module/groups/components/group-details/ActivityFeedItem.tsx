import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ExpenseItem } from '../../../../components/ExpenseItem';
import { IncomeItem } from '../../../../components/IncomeItem';
import { SettlementItem } from '../SettlementItem';
import type { Expense, Income, Settlement, ActivityItem } from '@workspace/api';

export type FeedItem =
  | { type: 'expense'; data: Expense }
  | { type: 'income'; data: Income }
  | { type: 'settlement'; data: Settlement }
  | ActivityItem;

interface ActivityFeedItemProps {
  item: FeedItem;
  currentUserId?: string;
  onPress?: () => void;
  onDeleteSettlement?: (settlementId: string) => void;
  isSettled?: boolean;
  variant?: 'light' | 'dark';
  fullBleed?: boolean;
}

export const ActivityFeedItem: React.FC<ActivityFeedItemProps> = ({
  item,
  currentUserId,
  onPress,
  onDeleteSettlement,
  isSettled,
  variant = 'light',
  fullBleed = false,
}) => {
  const wrapperStyle = fullBleed ? styles.fullBleedWrapper : styles.normalWrapper;

  if (item.type === 'expense') {
    return (
      <View style={wrapperStyle}>
        <ExpenseItem
          expense={item.data}
          currentUserId={currentUserId}
          onPress={onPress}
          isSettled={isSettled ?? item.data.isSettled}
          variant={variant}
        />
      </View>
    );
  }

  if (item.type === 'income') {
    return (
      <View style={wrapperStyle}>
        <IncomeItem income={item.data} variant={variant} onPress={onPress} />
      </View>
    );
  }

  if (item.type === 'settlement') {
    return (
      <View style={wrapperStyle}>
        <SettlementItem
          settlement={item.data}
          currentUserId={currentUserId}
          onDelete={onDeleteSettlement}
          variant={variant}
        />
      </View>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  normalWrapper: {},
  fullBleedWrapper: {
    marginHorizontal: -20,
  },
});
