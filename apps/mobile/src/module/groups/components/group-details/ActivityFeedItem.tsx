import React from 'react';
import { View, StyleSheet } from 'react-native';
import { TransactionItem } from '../../../../components/TransactionItem';
import { SettlementItem } from '../../../settlements/components/SettlementItem';
import type { ActivityItem } from '@workspace/api';

interface ActivityFeedItemProps {
  item: ActivityItem;
  currentUserId?: string;
  onPress?: () => void;
  isSettled?: boolean;
}

export const ActivityFeedItem: React.FC<ActivityFeedItemProps> = ({
  item,
  currentUserId,
  onPress,
  isSettled,
}) => {
  if (item.type === 'expense') {
    return (
      <View style={styles.itemWrapper}>
        <TransactionItem
          expense={item.data}
          currentUserId={currentUserId}
          onPress={onPress}
          isSettled={isSettled}
        />
      </View>
    );
  }

  if (item.type === 'settlement') {
    return (
      <View style={styles.itemWrapper}>
        <SettlementItem settlement={item.data} currentUserId={currentUserId} />
      </View>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  itemWrapper: {
    marginHorizontal: -20,
  },
});
