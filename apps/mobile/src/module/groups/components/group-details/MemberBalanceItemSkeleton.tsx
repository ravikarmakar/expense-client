import React from 'react';
import { StyleSheet, View } from 'react-native';
import { COLORS } from '../../../../constants/theme';
import { SkeletonLoader } from '../../../../components/SkeletonLoader';

interface MemberBalanceItemSkeletonProps {
  isLast?: boolean;
}

export function MemberBalanceItemSkeleton({ isLast = false }: MemberBalanceItemSkeletonProps) {
  return (
    <View style={[styles.row, !isLast && styles.rowBorder]}>
      {/* Avatar circle skeleton */}
      <SkeletonLoader width={44} height={44} borderRadius={22} />

      {/* Member Info skeleton */}
      <View style={styles.memberInfo}>
        <SkeletonLoader width={100} height={14} borderRadius={6} style={{ marginBottom: 4 }} />
        <SkeletonLoader width={80} height={12} borderRadius={6} />
      </View>

      {/* Settle button skeleton on the right */}
      <SkeletonLoader width={60} height={26} borderRadius={13} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceContainerLow,
  },
  memberInfo: {
    flex: 1,
    gap: 2,
  },
});
