import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, CURRENCY_SYMBOL } from '../../../../constants/theme';
import { SkeletonLoader } from '../../../../components/SkeletonLoader';
import { detailStyles as styles } from '../../styles/group.styles';
import { useGroupDetail } from '../../contexts/GroupDetailContext';

export function GroupBalanceCard() {
  const { isLoading, group, myBalance } = useGroupDetail();

  return (
    <View
      style={[
        styles.balanceCard,
        {
          backgroundColor: COLORS.primary,
        },
      ]}
    >
      <View style={[styles.abstractCircle, styles.circleTopRight]} />
      <View style={[styles.abstractCircle, styles.circleBottomLeft]} />

      <View style={styles.balanceHeader}>
        <Text style={[styles.balanceCardLabel, { color: 'rgba(255,255,255,0.8)' }]}>
          {isLoading || !group
            ? 'Calculating balances...'
            : Math.abs(myBalance) < 0.01
              ? "You're all settled up!"
              : myBalance > 0
                ? 'You are owed'
                : 'You owe'}
        </Text>
        <View
          style={[
            styles.statusDot,
            {
              backgroundColor: '#ffffff',
            },
          ]}
        />
      </View>

      {isLoading || !group ? (
        <SkeletonLoader
          width={120}
          height={32}
          borderRadius={6}
          style={{ marginVertical: 4, backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
        />
      ) : (
        <Text style={[styles.balanceCardAmount, { color: '#ffffff' }]}>
          {Math.abs(myBalance) >= 0.01
            ? `${myBalance < 0 ? '-' : ''}${CURRENCY_SYMBOL}${Math.abs(myBalance).toFixed(2)}`
            : `${CURRENCY_SYMBOL}0.00`}
        </Text>
      )}

      <View style={styles.balanceCardDivider} />

      <View style={styles.balanceCardFooter}>
        <View style={styles.metaItem}>
          <Ionicons name="people" size={16} color="rgba(255,255,255,0.8)" />
          {isLoading || !group ? (
            <SkeletonLoader
              width={24}
              height={14}
              borderRadius={4}
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
            />
          ) : (
            <Text style={[styles.balanceCardMeta, { color: 'rgba(255,255,255,0.9)' }]}>
              {group.memberCount}
            </Text>
          )}
          <Text style={[styles.balanceCardMeta, { color: 'rgba(255,255,255,0.9)' }]}>members</Text>
        </View>
        <View style={styles.metaItem}>
          <Ionicons name="receipt" size={16} color="rgba(255,255,255,0.8)" />
          {isLoading || !group ? (
            <SkeletonLoader
              width={50}
              height={14}
              borderRadius={4}
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
            />
          ) : (
            <Text style={[styles.balanceCardMeta, { color: 'rgba(255,255,255,0.9)' }]}>
              {CURRENCY_SYMBOL}
              {group.totalExpenses.toFixed(2)}
            </Text>
          )}
          <Text style={[styles.balanceCardMeta, { color: 'rgba(255,255,255,0.9)' }]}>spent</Text>
        </View>
      </View>
    </View>
  );
}
