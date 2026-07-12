import React from 'react';
import { View, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { globalStyles } from '../../../styles/globalStyles';
import { SkeletonLoader } from '../../dashboard/components/SkeletonLoader';
import { detailStyles as styles } from '../styles/group.styles';

interface GroupDetailSkeletonProps {
  hideHeader?: boolean;
}

export default function GroupDetailSkeleton({ hideHeader = false }: GroupDetailSkeletonProps) {
  const insets = useSafeAreaInsets();

  const content = (
    <ScrollView
      contentContainerStyle={globalStyles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Balance Card Skeleton */}
      <SkeletonLoader height={164} borderRadius={24} style={{ marginBottom: 24 }} />

      {/* Members Balances Skeleton */}
      <View style={{ gap: 12, marginBottom: 24 }}>
        <SkeletonLoader width={100} height={18} style={{ marginBottom: 8 }} />
        <SkeletonLoader height={80} borderRadius={16} />
        <SkeletonLoader height={80} borderRadius={16} />
      </View>

      {/* Tabs and List Skeletons */}
      <View style={{ gap: 12 }}>
        <SkeletonLoader height={48} borderRadius={16} style={{ marginBottom: 8 }} />
        <SkeletonLoader height={68} borderRadius={16} />
        <SkeletonLoader height={68} borderRadius={16} />
        <SkeletonLoader height={68} borderRadius={16} />
      </View>
    </ScrollView>
  );

  if (hideHeader) {
    return content;
  }

  return (
    <View style={styles.container}>
      {/* Header Skeleton */}
      <View
        style={[
          styles.header,
          { paddingTop: insets.top, height: 56 + insets.top, borderBottomWidth: 0 },
        ]}
      >
        <SkeletonLoader width={32} height={32} borderRadius={16} style={{ marginRight: 12 }} />
        <SkeletonLoader width={120} height={20} style={{ flex: 1 }} />
        <SkeletonLoader width={28} height={28} borderRadius={6} style={{ marginRight: 12 }} />
        <SkeletonLoader width={28} height={28} borderRadius={6} style={{ marginRight: 12 }} />
        <SkeletonLoader width={20} height={20} borderRadius={10} />
      </View>
      {content}
    </View>
  );
}
