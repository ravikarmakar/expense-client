import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SkeletonLoader } from '../../../../components/SkeletonLoader';

/**
 * Skeleton for the analytics content area (hero card, trend chart,
 * member pie, category breakdown, share progress).
 *
 * The header (TopAppBar) and timeframe tabs are rendered by the parent
 * screen so the user can still interact with them while data loads.
 */
export function GroupAnalyticsContentSkeleton() {
  return (
    <View style={styles.container}>
      {/* ── Hero Card ── */}
      <View style={styles.card}>
        <SkeletonLoader width={120} height={13} borderRadius={6} style={styles.mb6} />
        <SkeletonLoader width={160} height={32} borderRadius={8} style={styles.mb16} />
        <SkeletonLoader width="100%" height={1} borderRadius={0} style={styles.mb16} />
        <View style={styles.row}>
          <View style={styles.flex1}>
            <SkeletonLoader width={80} height={11} borderRadius={5} style={styles.mb6} />
            <SkeletonLoader width={100} height={20} borderRadius={6} />
          </View>
          <View style={styles.verticalDivider} />
          <View style={styles.flex1}>
            <SkeletonLoader width={60} height={11} borderRadius={5} style={styles.mb6} />
            <SkeletonLoader width={100} height={20} borderRadius={6} />
          </View>
        </View>
      </View>

      {/* ── Spending Trend Card ── */}
      <View style={styles.card}>
        <SkeletonLoader width={130} height={16} borderRadius={6} style={styles.mb16} />
        <View style={styles.barsRow}>
          {[60, 90, 50, 120, 70, 100, 55, 85, 65, 110].map((h, i) => (
            <SkeletonLoader key={i} width={18} height={h} borderRadius={5} />
          ))}
        </View>
      </View>

      {/* ── Expenses by Member Card ── */}
      <View style={styles.card}>
        <SkeletonLoader width={160} height={16} borderRadius={6} style={styles.mb20} />
        <View style={styles.pieRow}>
          {/* Donut ring */}
          <View style={styles.donutOuter}>
            <SkeletonLoader width={160} height={160} borderRadius={80} />
            <View style={styles.donutHole} />
          </View>
          {/* Legend */}
          <View style={styles.legendList}>
            {[100, 80, 120, 60].map((w, i) => (
              <View key={i} style={styles.legendRow}>
                <SkeletonLoader width={12} height={12} borderRadius={6} />
                <SkeletonLoader width={w} height={12} borderRadius={5} style={styles.ml8} />
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* ── Spending by Category Card ── */}
      <View style={styles.card}>
        <SkeletonLoader width={180} height={16} borderRadius={6} style={styles.mb16} />
        {Array.from({ length: 4 }).map((_, i) => (
          <View key={i} style={styles.categoryRow}>
            <View style={[styles.row, styles.mb8]}>
              <SkeletonLoader width={32} height={32} borderRadius={10} />
              <SkeletonLoader width={100} height={14} borderRadius={6} style={styles.ml10} />
              <View style={styles.flex1} />
              <SkeletonLoader width={60} height={14} borderRadius={6} />
            </View>
            <SkeletonLoader width="100%" height={6} borderRadius={3} />
          </View>
        ))}
      </View>

      {/* ── My Share Progress Card ── */}
      <View style={[styles.card, styles.lastCard]}>
        <SkeletonLoader width={140} height={16} borderRadius={6} style={styles.mb16} />
        <SkeletonLoader width="100%" height={16} borderRadius={8} style={styles.mb12} />
        <View style={styles.row}>
          <SkeletonLoader width={100} height={12} borderRadius={5} />
          <SkeletonLoader width={80} height={12} borderRadius={5} style={styles.ml8} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    padding: 20,
    marginBottom: 20,
  },
  lastCard: {
    marginBottom: 30,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  pieRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flex1: {
    flex: 1,
  },
  verticalDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 16,
  },
  barsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
  },
  donutOuter: {
    width: 160,
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutHole: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#ffffff',
  },
  legendList: {
    flex: 1,
    marginLeft: 20,
    gap: 12,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryRow: {
    marginBottom: 16,
  },
  mb6: { marginBottom: 6 },
  mb8: { marginBottom: 8 },
  mb12: { marginBottom: 12 },
  mb16: { marginBottom: 16 },
  mb20: { marginBottom: 20 },
  ml8: { marginLeft: 8 },
  ml10: { marginLeft: 10 },
});
