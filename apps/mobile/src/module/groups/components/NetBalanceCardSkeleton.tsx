import React from 'react';
import { View, Text } from 'react-native';
import { SkeletonLoader } from '../../../components/SkeletonLoader';
import { styles } from '../styles/groups-tab.styles';

interface NetBalanceCardSkeletonProps {
  variant?: 'light' | 'dark';
}

export function NetBalanceCardSkeleton({ variant = 'light' }: NetBalanceCardSkeletonProps) {
  const isDark = variant === 'dark';

  return (
    <View
      style={[
        styles.netBalanceCard,
        isDark && {
          backgroundColor: '#0D1A16',
          borderColor: '#1E2F2B',
        },
      ]}
    >
      <View
        style={[
          styles.netBalanceHeader,
          isDark && { borderBottomColor: 'rgba(255, 255, 255, 0.08)' },
        ]}
      >
        <View>
          <Text style={[styles.netBalanceLabel, isDark && { color: '#9CA3AF' }]}>Net Balance</Text>
          <View style={{ marginTop: 6 }}>
            <SkeletonLoader
              width={120}
              height={28}
              borderRadius={6}
              style={isDark ? { backgroundColor: 'rgba(255, 255, 255, 0.12)' } : undefined}
            />
          </View>
        </View>
        <SkeletonLoader
          width={28}
          height={28}
          borderRadius={14}
          style={isDark ? { backgroundColor: 'rgba(255, 255, 255, 0.12)' } : undefined}
        />
      </View>

      <View style={styles.netBalanceRow}>
        {/* Plus flow */}
        <View style={styles.netBalanceCol}>
          <SkeletonLoader
            width={24}
            height={24}
            borderRadius={12}
            style={isDark ? { backgroundColor: 'rgba(255, 255, 255, 0.12)' } : undefined}
          />
          <View style={styles.netBalanceTextContainer}>
            <Text style={[styles.netBalanceDetailLabel, isDark && { color: '#9CA3AF' }]}>
              Owed to you:
            </Text>
            <SkeletonLoader
              width={60}
              height={16}
              borderRadius={4}
              style={isDark ? { backgroundColor: 'rgba(255, 255, 255, 0.12)' } : undefined}
            />
          </View>
        </View>

        <View
          style={[
            styles.netBalanceColSeparator,
            isDark && { backgroundColor: 'rgba(255, 255, 255, 0.08)' },
          ]}
        />

        {/* Minus flow */}
        <View style={styles.netBalanceCol}>
          <SkeletonLoader
            width={24}
            height={24}
            borderRadius={12}
            style={isDark ? { backgroundColor: 'rgba(255, 255, 255, 0.12)' } : undefined}
          />
          <View style={styles.netBalanceTextContainer}>
            <Text style={[styles.netBalanceDetailLabel, isDark && { color: '#9CA3AF' }]}>
              You owe:
            </Text>
            <SkeletonLoader
              width={60}
              height={16}
              borderRadius={4}
              style={isDark ? { backgroundColor: 'rgba(255, 255, 255, 0.12)' } : undefined}
            />
          </View>
        </View>
      </View>
    </View>
  );
}
