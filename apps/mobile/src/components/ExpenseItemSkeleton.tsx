import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SkeletonLoader } from './SkeletonLoader';
import { useTheme } from '../context/ThemeContext';

export function ExpenseItemSkeleton() {
  const { isDark } = useTheme();

  return (
    <View style={[styles.container, isDark && { borderBottomColor: 'rgba(255, 255, 255, 0.06)' }]}>
      {/* Left: Category Icon Avatar Skeleton */}
      <SkeletonLoader width={48} height={48} borderRadius={24} style={{ marginRight: 14 }} />

      {/* Middle: Title, Payment Subtitle, Date Skeleton */}
      <View style={styles.middleSection}>
        {/* Source Text Skeleton */}
        <SkeletonLoader width={140} height={12} borderRadius={6} style={{ marginBottom: 5 }} />
        {/* Title Text Skeleton */}
        <SkeletonLoader width={100} height={15} borderRadius={8} style={{ marginBottom: 5 }} />
        {/* Date Text Skeleton */}
        <SkeletonLoader width={120} height={11} borderRadius={6} />
      </View>

      {/* Right: Amount & Chevron Skeleton */}
      <View style={styles.rightSection}>
        <View style={styles.amountContainer}>
          {/* Amount Skeleton */}
          <SkeletonLoader width={60} height={15} borderRadius={8} />
          {/* Balance Label Skeleton */}
          <SkeletonLoader width={50} height={12} borderRadius={6} style={{ marginTop: 5 }} />
        </View>
        <Ionicons
          name="chevron-forward"
          size={16}
          color={isDark ? 'rgba(255, 255, 255, 0.2)' : '#bdc1c6'}
          style={styles.chevron}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  middleSection: {
    flex: 1,
    justifyContent: 'center',
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
  chevron: {
    marginLeft: 10,
    opacity: 0.5,
  },
});
