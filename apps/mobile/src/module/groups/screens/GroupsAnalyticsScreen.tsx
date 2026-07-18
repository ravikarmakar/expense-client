import React from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { TopAppBar } from '../../../components/TopAppBar';
import { COLORS, CURRENCY_SYMBOL } from '../../../constants/theme';
import { useGroupAnalytics } from '@workspace/api';
import { GroupsAnalyticsSkeleton } from '../components/GroupsAnalyticsSkeleton';

export default function GroupsAnalyticsScreen() {
  const router = useRouter();

  // Fetch group analytics
  const { data: groups, isLoading: isLoadingGroups } = useGroupAnalytics();

  const showSkeleton = isLoadingGroups || !groups;

  return (
    <View style={styles.container}>
      <TopAppBar title="Group Analytics" showBack={true} onBack={() => router.back()} />

      {showSkeleton ? (
        <GroupsAnalyticsSkeleton />
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {(!groups || groups.length === 0) && (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconBg}>
                <Ionicons name="people" size={32} color={COLORS.primary} />
              </View>
              <Text style={styles.emptyTitle}>No Groups Yet</Text>
              <Text style={styles.emptySubtitle}>
                Join or create a group to start tracking splits.
              </Text>
            </View>
          )}

          {groups &&
            groups.map((group) => {
              const isMyBalancePositive = group.myBalance > 0;
              const hasBalance = Math.abs(group.myBalance) >= 0.01;

              // Spend Share progress calculations
              const totalCalculated = group.myPayments + group.myShare;
              const paymentProgress = totalCalculated > 0 ? group.myPayments / totalCalculated : 0;
              const shareProgress = totalCalculated > 0 ? group.myShare / totalCalculated : 0;

              return (
                <View key={group.id} style={styles.groupSpentCard}>
                  <View style={styles.groupSpentHeader}>
                    <View style={styles.groupTitleBlock}>
                      <View style={styles.groupEmojiCircle}>
                        <Text style={styles.groupEmojiText}>{group.emoji}</Text>
                      </View>
                      <View>
                        <Text style={styles.groupSpentName}>{group.name}</Text>
                        <Text style={styles.groupSpentType}>{group.type.toUpperCase()} GROUP</Text>
                      </View>
                    </View>

                    {hasBalance ? (
                      <View
                        style={[
                          styles.groupBalanceBadge,
                          {
                            backgroundColor: isMyBalancePositive
                              ? 'rgba(77, 150, 255, 0.12)'
                              : 'rgba(255, 107, 107, 0.12)',
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.groupBalanceBadgeText,
                            { color: isMyBalancePositive ? COLORS.primaryContainer : COLORS.error },
                          ]}
                        >
                          {isMyBalancePositive ? 'Owed: ' : 'Owe: '}
                          {CURRENCY_SYMBOL}
                          {Math.abs(group.myBalance).toFixed(2)}
                        </Text>
                      </View>
                    ) : (
                      <View
                        style={[
                          styles.groupBalanceBadge,
                          { backgroundColor: 'rgba(255,255,255,0.06)' },
                        ]}
                      >
                        <Text
                          style={[styles.groupBalanceBadgeText, { color: COLORS.onSurfaceVariant }]}
                        >
                          Settled
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Spend Comparison breakdown */}
                  <View style={styles.spentMetaGrid}>
                    <View style={styles.spentMetaColumn}>
                      <Text style={styles.spentMetaLabel}>My Payments</Text>
                      <Text style={[styles.spentMetaVal, { color: COLORS.primaryContainer }]}>
                        {CURRENCY_SYMBOL}
                        {group.myPayments.toFixed(2)}
                      </Text>
                    </View>
                    <View style={styles.spentMetaColumn}>
                      <Text style={styles.spentMetaLabel}>My Share</Text>
                      <Text style={[styles.spentMetaVal, { color: COLORS.error }]}>
                        {CURRENCY_SYMBOL}
                        {group.myShare.toFixed(2)}
                      </Text>
                    </View>
                    <View style={styles.spentMetaColumn}>
                      <Text style={styles.spentMetaLabel}>Group Total</Text>
                      <Text style={styles.spentMetaVal}>
                        {CURRENCY_SYMBOL}
                        {group.totalExpenses.toFixed(2)}
                      </Text>
                    </View>
                  </View>

                  {/* Custom progress comparison bar */}
                  <View style={styles.progressContainer}>
                    <View style={styles.progressBarWrapper}>
                      {group.totalExpenses > 0 ? (
                        <>
                          <View
                            style={[
                              styles.progressSegment,
                              {
                                flex: paymentProgress,
                                backgroundColor: COLORS.primaryContainer,
                                borderTopLeftRadius: 4,
                                borderBottomLeftRadius: 4,
                              },
                            ]}
                          />
                          <View
                            style={[
                              styles.progressSegment,
                              {
                                flex: shareProgress,
                                backgroundColor: COLORS.error,
                                borderTopRightRadius: 4,
                                borderBottomRightRadius: 4,
                              },
                            ]}
                          />
                        </>
                      ) : (
                        <View
                          style={[
                            styles.progressSegment,
                            {
                              flex: 1,
                              backgroundColor: 'rgba(255,255,255,0.08)',
                              borderRadius: 4,
                            },
                          ]}
                        />
                      )}
                    </View>
                    <View style={styles.progressLabels}>
                      <Text
                        style={[styles.progressIndicatorLabel, { color: COLORS.primaryContainer }]}
                      >
                        ● Paid ({Math.round(paymentProgress * 100)}%)
                      </Text>
                      <Text style={[styles.progressIndicatorLabel, { color: COLORS.error }]}>
                        ● Share ({Math.round(shareProgress * 100)}%)
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background || '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  emptyContainer: {
    paddingVertical: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIconBg: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.04)',
  },
  emptyTitle: {
    color: COLORS.onSurface || '#191c1d',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  emptySubtitle: {
    color: COLORS.onSurfaceVariant || '#3d4a42',
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  groupSpentCard: {
    backgroundColor: COLORS.surface || '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  groupSpentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  groupTitleBlock: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  groupEmojiCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
  },
  groupEmojiText: {
    fontSize: 18,
  },
  groupSpentName: {
    color: COLORS.onSurface || '#191c1d',
    fontSize: 15,
    fontWeight: '700',
  },
  groupSpentType: {
    color: COLORS.onSurfaceVariant || '#3d4a42',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  groupBalanceBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  groupBalanceBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  spentMetaGrid: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  spentMetaColumn: {
    flex: 1,
    alignItems: 'center',
  },
  spentMetaLabel: {
    color: COLORS.onSurfaceVariant || '#3d4a42',
    fontSize: 10,
    fontWeight: '600',
    marginBottom: 4,
  },
  spentMetaVal: {
    color: COLORS.onSurface || '#191c1d',
    fontSize: 13,
    fontWeight: '700',
  },
  progressContainer: {
    marginTop: 4,
  },
  progressBarWrapper: {
    height: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    borderRadius: 4,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  progressSegment: {
    height: '100%',
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  progressIndicatorLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
});
