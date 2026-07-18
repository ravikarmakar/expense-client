import React from 'react';
import { View, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { globalStyles } from '../../../styles/globalStyles';
import { SkeletonLoader } from '../../../components/SkeletonLoader';
import { TopAppBar } from '../../../components/TopAppBar';
import { detailStyles as styles } from '../styles/expense.styles';

export function ExpenseDetailSkeleton() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <TopAppBar title="Expense Details" showBack />

      <ScrollView
        contentContainerStyle={[globalStyles.scrollContent, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Card Skeleton */}
        <View style={styles.heroCard}>
          {/* Icon Circle */}
          <SkeletonLoader width={72} height={72} borderRadius={36} style={{ marginBottom: 16 }} />
          {/* Title Line */}
          <SkeletonLoader width={160} height={22} borderRadius={8} style={{ marginBottom: 12 }} />
          {/* Amount Line */}
          <SkeletonLoader width={120} height={36} borderRadius={8} style={{ marginBottom: 20 }} />

          {/* Meta Badges */}
          <View style={styles.heroMeta}>
            <SkeletonLoader width={110} height={28} borderRadius={14} />
            <SkeletonLoader width={80} height={28} borderRadius={14} />
            <SkeletonLoader width={90} height={28} borderRadius={14} />
          </View>
        </View>

        {/* Paid By Section Skeleton */}
        <View style={styles.section}>
          <SkeletonLoader width={80} height={18} borderRadius={6} style={{ marginBottom: 12 }} />
          <View style={styles.paidByCard}>
            {/* Avatar */}
            <SkeletonLoader width={48} height={48} borderRadius={24} style={{ marginRight: 16 }} />
            {/* Info Lines */}
            <View style={{ flex: 1, gap: 6 }}>
              <SkeletonLoader width={120} height={16} borderRadius={6} />
              <SkeletonLoader width={60} height={12} borderRadius={6} />
            </View>
          </View>
        </View>

        {/* Notes Section Skeleton */}
        <View style={styles.section}>
          <SkeletonLoader width={60} height={18} borderRadius={6} style={{ marginBottom: 12 }} />
          <View style={styles.notesCard}>
            <SkeletonLoader width={20} height={20} borderRadius={10} style={{ marginRight: 12 }} />
            <View style={{ flex: 1, gap: 6 }}>
              <SkeletonLoader width="100%" height={14} borderRadius={6} />
              <SkeletonLoader width="80%" height={14} borderRadius={6} />
            </View>
          </View>
        </View>

        {/* Split Details Section Skeleton */}
        <View style={styles.section}>
          <SkeletonLoader width={100} height={18} borderRadius={6} style={{ marginBottom: 12 }} />
          <View style={styles.splitsCard}>
            {[1, 2].map((id, index) => (
              <View key={id}>
                <View style={styles.splitRow}>
                  {/* Split Avatar */}
                  <SkeletonLoader
                    width={40}
                    height={40}
                    borderRadius={20}
                    style={{ marginRight: 12 }}
                  />
                  {/* Split Info */}
                  <View style={{ flex: 1, gap: 6 }}>
                    <SkeletonLoader width={100} height={14} borderRadius={6} />
                    <SkeletonLoader width={60} height={12} borderRadius={6} />
                  </View>
                  {/* Split Amount */}
                  <SkeletonLoader width={60} height={16} borderRadius={6} />
                </View>
                {index === 0 && <View style={styles.divider} />}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
