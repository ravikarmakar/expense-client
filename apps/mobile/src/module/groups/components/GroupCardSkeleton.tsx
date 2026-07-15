import React from 'react';
import { StyleSheet, View } from 'react-native';
import { COLORS } from '../../../constants/theme';
import { SkeletonLoader } from '../../../components/SkeletonLoader';

export function GroupCardSkeleton() {
  return (
    <View style={styles.groupCard}>
      {/* Left circle avatar skeleton */}
      <SkeletonLoader width={48} height={48} borderRadius={24} />

      {/* Center content container skeleton */}
      <View style={styles.centerContainer}>
        {/* Name skeleton */}
        <SkeletonLoader width={120} height={16} borderRadius={8} style={{ marginBottom: 4 }} />
        {/* Activity skeleton */}
        <SkeletonLoader width={160} height={12} borderRadius={6} style={{ marginBottom: 6 }} />
        {/* Avatars overlap row skeleton */}
        <View style={styles.avatarOverlapContainer}>
          <SkeletonLoader width={22} height={22} borderRadius={11} />
          <SkeletonLoader width={22} height={22} borderRadius={11} style={styles.overlapAvatar2} />
          {/* Member count text skeleton */}
          <SkeletonLoader width={60} height={12} borderRadius={6} style={{ marginLeft: 8 }} />
        </View>
      </View>

      {/* Right container skeleton */}
      <View style={styles.rightContainer}>
        <SkeletonLoader width={80} height={22} borderRadius={10} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  groupCard: {
    backgroundColor: COLORS.surface,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.surfaceContainer,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    gap: 2,
  },
  avatarOverlapContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  overlapAvatar2: {
    marginLeft: -6,
  },
  rightContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    maxWidth: 120,
  },
});
