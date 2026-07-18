import React from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../styles/dashboard.styles';
import { SkeletonLoader } from '../../../components/SkeletonLoader';
import { COLORS, CURRENCY_SYMBOL } from '../../../constants/theme';

interface BalanceCardProps {
  totalSpent: number;
  totalOwedToMe: number;
  totalIOwe: number;
  netBalance: number;
  totalGroupSpent: number;
  statsLoading: boolean;
  groupsLoading: boolean;
  groupsEmpty: boolean;
  onTotalSpentPress: () => void;
  onOwedPress: () => void;
  onOwePress: () => void;
  onNetBalancePress: () => void;
  onGroupSpentPress: () => void;
}

/**
 * The hero balance card on the HomeScreen.
 * Extracted to its own memoized component to prevent re-renders from unrelated state changes
 * (e.g. modal visibility, expense list changes).
 */
export const BalanceCard = React.memo(function BalanceCard({
  totalSpent,
  totalOwedToMe,
  totalIOwe,
  netBalance,
  totalGroupSpent,
  statsLoading,
  groupsLoading,
  groupsEmpty,
  onTotalSpentPress,
  onOwedPress,
  onOwePress,
  onNetBalancePress,
  onGroupSpentPress,
}: BalanceCardProps) {
  const showGroupsSkeleton = groupsLoading && groupsEmpty;
  const showStatsSkeleton = statsLoading;

  return (
    <View style={styles.balanceCard}>
      <View style={[styles.abstractCircle, styles.circleTopRight]} />
      <View style={[styles.abstractCircle, styles.circleBottomLeft]} />

      {/* Hero Total */}
      <TouchableOpacity
        style={styles.mainBalanceWrapper}
        activeOpacity={0.8}
        onPress={onTotalSpentPress}
      >
        <Text style={styles.balanceLabel}>All-Time Spending</Text>
        {showStatsSkeleton ? (
          <SkeletonLoader width={140} height={32} style={styles.skeletonBalanceOnDark} />
        ) : (
          <Text style={styles.balanceAmount}>
            {CURRENCY_SYMBOL}
            {totalSpent.toFixed(2)}
          </Text>
        )}
      </TouchableOpacity>

      <View style={styles.balanceDivider} />

      {/* 2x2 Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statsRow}>
          {/* Owed to you */}
          <TouchableOpacity style={styles.statBox} activeOpacity={0.8} onPress={onOwedPress}>
            <View style={[styles.statIconBg, { backgroundColor: COLORS.primaryFixed }]}>
              <Ionicons name="arrow-down" size={16} color={COLORS.primary} />
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statLabel}>Owed to you</Text>
              {showGroupsSkeleton ? (
                <SkeletonLoader width={50} height={16} style={styles.skeletonOnDark} />
              ) : (
                <Text style={[styles.statValue, { color: COLORS.primaryFixed }]}>
                  {CURRENCY_SYMBOL}
                  {totalOwedToMe.toFixed(2)}
                </Text>
              )}
            </View>
          </TouchableOpacity>

          {/* You owe */}
          <TouchableOpacity style={styles.statBox} activeOpacity={0.8} onPress={onOwePress}>
            <View style={[styles.statIconBg, { backgroundColor: COLORS.errorContainer }]}>
              <Ionicons name="arrow-up" size={16} color={COLORS.error} />
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statLabel}>You owe</Text>
              {showGroupsSkeleton ? (
                <SkeletonLoader width={50} height={16} style={styles.skeletonOnDark} />
              ) : (
                <Text style={[styles.statValue, { color: COLORS.errorContainer }]}>
                  {CURRENCY_SYMBOL}
                  {totalIOwe.toFixed(2)}
                </Text>
              )}
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.statsRow}>
          {/* Net Balance */}
          <TouchableOpacity style={styles.statBox} activeOpacity={0.8} onPress={onNetBalancePress}>
            <View style={[styles.statIconBg, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
              <Ionicons name="scale-outline" size={16} color="#ffffff" />
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statLabel}>Net Balance</Text>
              {showGroupsSkeleton ? (
                <SkeletonLoader width={50} height={16} style={styles.skeletonOnDark} />
              ) : (
                <Text style={styles.statValue}>
                  {CURRENCY_SYMBOL}
                  {netBalance.toFixed(2)}
                </Text>
              )}
            </View>
          </TouchableOpacity>

          {/* Group Spent */}
          <TouchableOpacity style={styles.statBox} activeOpacity={0.8} onPress={onGroupSpentPress}>
            <View style={[styles.statIconBg, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
              <Ionicons name="people-outline" size={16} color="#ffffff" />
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statLabel}>Group Spent</Text>
              {showStatsSkeleton ? (
                <SkeletonLoader width={50} height={16} style={styles.skeletonOnDark} />
              ) : (
                <Text style={styles.statValue}>
                  {CURRENCY_SYMBOL}
                  {totalGroupSpent.toFixed(2)}
                </Text>
              )}
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
});
