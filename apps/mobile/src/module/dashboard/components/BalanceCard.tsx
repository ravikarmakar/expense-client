import React from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../styles/dashboard.styles';
import { SkeletonLoader } from '../../../components/SkeletonLoader';
import { CURRENCY_SYMBOL } from '../../../constants/theme';
import { SparklineChart } from './SparklineChart';

interface BalanceCardProps {
  totalSpent: number;
  totalOwedToMe: number;
  totalIOwe: number;
  netBalance: number;
  totalGroupSpent: number;
  statsLoading: boolean;
  groupsLoading: boolean;
  groupsEmpty: boolean;
  timeRange: 'week' | 'month' | 'all';
  onTimeRangeChange: (range: 'week' | 'month' | 'all') => void;
  onTotalSpentPress: () => void;
  onOwedPress: () => void;
  onOwePress: () => void;
  onNetBalancePress: () => void;
  onGroupSpentPress: () => void;
  variant?: 'light' | 'dark';
}

/**
 * Premium, production-ready dark emerald hero balance layout.
 * Apple Wallet & Linear inspired clean design hierarchy.
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
  timeRange,
  onTimeRangeChange,
  onTotalSpentPress,
  onOwedPress,
  onOwePress,
  onNetBalancePress,
  onGroupSpentPress,
  variant = 'light',
}: BalanceCardProps) {
  const isDark = variant === 'dark';
  const showGroupsSkeleton = groupsLoading && groupsEmpty;
  const showStatsSkeleton = statsLoading;

  return (
    <View
      style={[
        styles.balanceCard,
        !isDark && {
          backgroundColor: '#006948',
          borderColor: 'transparent',
          borderRadius: 24,
          elevation: 6,
          shadowColor: '#006948',
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.25,
          shadowRadius: 12,
        },
      ]}
    >
      {/* Header Row: Title & Inline Switcher */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 12,
        }}
      >
        <Text style={[styles.balanceLabel, !isDark && { color: 'rgba(255, 255, 255, 0.75)' }]}>
          {timeRange === 'week'
            ? 'WEEKLY SPENDING'
            : timeRange === 'month'
              ? 'MONTHLY SPENDING'
              : 'ALL-TIME SPENDING'}
        </Text>

        {/* Tiny Switcher pills */}
        <View
          style={{
            flexDirection: 'row',
            backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255, 255, 255, 0.12)',
            borderRadius: 8,
            padding: 2,
            borderWidth: 1,
            borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255, 255, 255, 0.18)',
          }}
        >
          {(['week', 'month', 'all'] as const).map((range) => {
            const isActive = timeRange === range;
            const label = range === 'week' ? 'W' : range === 'month' ? 'M' : 'All';
            return (
              <TouchableOpacity
                key={range}
                activeOpacity={0.7}
                onPress={() => onTimeRangeChange(range)}
                style={{
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 6,
                  backgroundColor: isActive
                    ? isDark
                      ? 'rgba(16, 185, 129, 0.08)'
                      : 'rgba(255, 255, 255, 0.22)'
                    : 'transparent',
                }}
              >
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: '800',
                    color: isActive
                      ? isDark
                        ? '#10B981'
                        : '#ffffff'
                      : isDark
                        ? '#74817B'
                        : 'rgba(255, 255, 255, 0.6)',
                  }}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Hero Total Spending Amount */}
      <TouchableOpacity
        style={{ alignItems: 'flex-start', marginBottom: 12 }}
        activeOpacity={0.8}
        onPress={onTotalSpentPress}
      >
        {showStatsSkeleton ? (
          <SkeletonLoader width={160} height={40} style={styles.skeletonBalanceOnDark} />
        ) : (
          <Text style={[styles.balanceAmount, !isDark && { color: '#ffffff' }, { marginTop: 0 }]}>
            {CURRENCY_SYMBOL}
            {totalSpent.toFixed(2)}
          </Text>
        )}
      </TouchableOpacity>

      {/* Minimal Sparkline Trend Line */}
      {!showStatsSkeleton && <SparklineChart timeRange={timeRange} />}

      <View
        style={[styles.balanceDivider, !isDark && { backgroundColor: 'rgba(255, 255, 255, 0.12)' }]}
      />

      {/* 2x2 Stats Summary Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statsRow}>
          {/* Owed to You */}
          <TouchableOpacity
            style={[
              styles.statBox,
              !isDark && {
                backgroundColor: 'rgba(0, 0, 0, 0.15)',
                borderColor: 'rgba(255, 255, 255, 0.08)',
              },
            ]}
            activeOpacity={0.85}
            onPress={onOwedPress}
          >
            <View
              style={[
                styles.statIconBg,
                {
                  backgroundColor: isDark ? 'rgba(16, 185, 129, 0.08)' : 'rgba(133, 248, 196, 0.2)',
                },
              ]}
            >
              <Ionicons name="arrow-down" size={15} color={isDark ? '#10B981' : '#85f8c4'} />
            </View>
            <View style={styles.statContent}>
              <Text style={[styles.statLabel, !isDark && { color: 'rgba(255, 255, 255, 0.72)' }]}>
                Owed to you
              </Text>
              {showGroupsSkeleton ? (
                <SkeletonLoader width={60} height={16} style={styles.skeletonOnDark} />
              ) : (
                <Text style={[styles.statValue, { color: isDark ? '#10B981' : '#85f8c4' }]}>
                  {CURRENCY_SYMBOL}
                  {totalOwedToMe.toFixed(2)}
                </Text>
              )}
            </View>
          </TouchableOpacity>

          {/* You Owe */}
          <TouchableOpacity
            style={[
              styles.statBox,
              !isDark && {
                backgroundColor: 'rgba(0, 0, 0, 0.15)',
                borderColor: 'rgba(255, 255, 255, 0.08)',
              },
            ]}
            activeOpacity={0.85}
            onPress={onOwePress}
          >
            <View
              style={[
                styles.statIconBg,
                {
                  backgroundColor: isDark ? 'rgba(239, 68, 68, 0.08)' : 'rgba(255, 180, 171, 0.2)',
                },
              ]}
            >
              <Ionicons name="arrow-up" size={15} color={isDark ? '#EF4444' : '#ffb4ab'} />
            </View>
            <View style={styles.statContent}>
              <Text style={[styles.statLabel, !isDark && { color: 'rgba(255, 255, 255, 0.72)' }]}>
                You owe
              </Text>
              {showGroupsSkeleton ? (
                <SkeletonLoader width={60} height={16} style={styles.skeletonOnDark} />
              ) : (
                <Text style={[styles.statValue, { color: isDark ? '#f87171' : '#ffb4ab' }]}>
                  {CURRENCY_SYMBOL}
                  {totalIOwe.toFixed(2)}
                </Text>
              )}
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.statsRow}>
          {/* Net Balance */}
          <TouchableOpacity
            style={[
              styles.statBox,
              !isDark && {
                backgroundColor: 'rgba(0, 0, 0, 0.15)',
                borderColor: 'rgba(255, 255, 255, 0.08)',
              },
            ]}
            activeOpacity={0.85}
            onPress={onNetBalancePress}
          >
            <View
              style={[
                styles.statIconBg,
                {
                  backgroundColor: isDark
                    ? 'rgba(255, 255, 255, 0.04)'
                    : 'rgba(255, 255, 255, 0.12)',
                },
              ]}
            >
              <Ionicons
                name="scale-outline"
                size={15}
                color={isDark ? '#A8B3AE' : 'rgba(255, 255, 255, 0.85)'}
              />
            </View>
            <View style={styles.statContent}>
              <Text style={[styles.statLabel, !isDark && { color: 'rgba(255, 255, 255, 0.72)' }]}>
                Net Balance
              </Text>
              {showGroupsSkeleton ? (
                <SkeletonLoader width={60} height={16} style={styles.skeletonOnDark} />
              ) : (
                <Text style={[styles.statValue, !isDark && { color: '#ffffff' }]}>
                  {CURRENCY_SYMBOL}
                  {netBalance.toFixed(2)}
                </Text>
              )}
            </View>
          </TouchableOpacity>

          {/* Group Spent */}
          <TouchableOpacity
            style={[
              styles.statBox,
              !isDark && {
                backgroundColor: 'rgba(0, 0, 0, 0.15)',
                borderColor: 'rgba(255, 255, 255, 0.08)',
              },
            ]}
            activeOpacity={0.85}
            onPress={onGroupSpentPress}
          >
            <View
              style={[
                styles.statIconBg,
                {
                  backgroundColor: isDark
                    ? 'rgba(255, 255, 255, 0.04)'
                    : 'rgba(255, 255, 255, 0.12)',
                },
              ]}
            >
              <Ionicons
                name="people-outline"
                size={15}
                color={isDark ? '#A8B3AE' : 'rgba(255, 255, 255, 0.85)'}
              />
            </View>
            <View style={styles.statContent}>
              <Text style={[styles.statLabel, !isDark && { color: 'rgba(255, 255, 255, 0.72)' }]}>
                Group Spent
              </Text>
              {showStatsSkeleton ? (
                <SkeletonLoader width={60} height={16} style={styles.skeletonOnDark} />
              ) : (
                <Text style={[styles.statValue, !isDark && { color: '#ffffff' }]}>
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
