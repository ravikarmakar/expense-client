import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { SkeletonLoader } from '../../../components/SkeletonLoader';
import { TransactionItemSkeleton } from '../../../components/TransactionItemSkeleton';
import { COLORS } from '../../../constants/theme';

const screenWidth = Dimensions.get('window').width;
const chartWidth = screenWidth - 72;

export const SpentAnalyticsSkeleton = () => {
  return (
    <View style={styles.container}>
      {/* Hero Card Skeleton */}
      <View style={styles.cardSkeleton}>
        <View style={styles.row}>
          <View>
            <SkeletonLoader width={100} height={12} borderRadius={6} style={{ marginBottom: 8 }} />
            <SkeletonLoader width={160} height={32} borderRadius={8} />
          </View>
          <SkeletonLoader width={60} height={24} borderRadius={12} />
        </View>
        <SkeletonLoader
          width={200}
          height={12}
          borderRadius={6}
          style={{ marginTop: 12, marginBottom: 16 }}
        />
        <View style={styles.divider} />
        <View style={styles.row}>
          <View style={styles.col}>
            <SkeletonLoader width={80} height={10} borderRadius={5} style={{ marginBottom: 6 }} />
            <SkeletonLoader width={100} height={16} borderRadius={8} />
          </View>
          <View style={styles.dividerVertical} />
          <View style={styles.col}>
            <SkeletonLoader width={80} height={10} borderRadius={5} style={{ marginBottom: 6 }} />
            <SkeletonLoader width={100} height={16} borderRadius={8} />
          </View>
        </View>
      </View>

      {/* Chart Skeleton */}
      <View style={styles.cardSkeleton}>
        <SkeletonLoader
          width={120}
          height={16}
          borderRadius={8}
          style={{ marginBottom: 16, alignSelf: 'flex-start' }}
        />
        <View style={styles.chartContainer}>
          <SkeletonLoader width={chartWidth} height={140} borderRadius={16} />
        </View>
      </View>

      {/* Category Breakdown Skeleton */}
      <View style={styles.cardSkeleton}>
        <SkeletonLoader
          width={150}
          height={16}
          borderRadius={8}
          style={{ marginBottom: 16, alignSelf: 'flex-start' }}
        />
        <View style={{ gap: 16, width: '100%' }}>
          {[1, 2, 3].map((i) => (
            <View key={i} style={styles.categoryRow}>
              <View style={styles.row}>
                <View style={styles.rowAlign}>
                  <SkeletonLoader
                    width={32}
                    height={32}
                    borderRadius={10}
                    style={{ marginRight: 10 }}
                  />
                  <SkeletonLoader width={80} height={14} borderRadius={6} />
                </View>
                <SkeletonLoader width={60} height={14} borderRadius={6} />
              </View>
              <SkeletonLoader width="100%" height={6} borderRadius={3} />
            </View>
          ))}
        </View>
      </View>

      {/* Expenses List Skeleton */}
      <View style={{ marginTop: 8 }}>
        <SkeletonLoader
          width={140}
          height={16}
          borderRadius={8}
          style={{ marginBottom: 16, marginLeft: 20 }}
        />
        <View style={{ marginHorizontal: -20 }}>
          <TransactionItemSkeleton />
          <TransactionItemSkeleton />
          <TransactionItemSkeleton />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  cardSkeleton: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainer,
    padding: 20,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  rowAlign: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  col: {
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.surfaceContainerHigh,
    marginVertical: 16,
    width: '100%',
  },
  dividerVertical: {
    width: 1,
    height: 32,
    backgroundColor: COLORS.surfaceContainerHigh,
    marginHorizontal: 16,
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  categoryRow: {
    gap: 8,
    width: '100%',
  },
});
