import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { COLORS, CURRENCY_SYMBOL, CATEGORY_ICONS, PREDEFINED_AVATARS } from '../../constants/theme';
import { globalStyles } from '../../styles/globalStyles';
import { TopAppBar } from '../../components/TopAppBar';
import { GroupCard } from '../../components/GroupCard';
import { HighlightItem } from '../../components/HighlightItem';
import { AddExpenseModal } from '../../components/AddExpenseModal';
import { useMe, useExpenses, useGroups, useExpensesSummary } from '@workspace/api';

export default function HomeTabScreen() {
  const [addExpenseVisible, setAddExpenseVisible] = useState(false);
  const { data: user } = useMe();
  const {
    data: expensesData,
    isLoading: expensesLoading,
    refetch: refetchExpenses,
  } = useExpenses({ limit: 3 });
  const { data: groups, refetch: refetchGroups } = useGroups();
  const { data: summary, refetch: refetchSummary } = useExpensesSummary();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([refetchExpenses(), refetchGroups(), refetchSummary()]);
    setIsRefreshing(false);
  };

  const expenses = expensesData?.expenses ?? [];
  const recentGroups = (groups ?? []).slice(0, 2);

  // Compute net balance from groups
  const rawOwed = (groups ?? [])
    .filter((g) => g.myBalance > 0)
    .reduce((sum, g) => sum + g.myBalance, 0);
  const totalOwedToMe = rawOwed < 0.01 ? 0 : rawOwed;

  const rawOwe = (groups ?? [])
    .filter((g) => g.myBalance < 0)
    .reduce((sum, g) => sum + Math.abs(g.myBalance), 0);
  const totalIOwe = rawOwe < 0.01 ? 0 : rawOwe;

  const rawNetBalance = totalOwedToMe - totalIOwe;
  const netBalance = Math.abs(rawNetBalance) < 0.01 ? 0 : rawNetBalance;

  const totalSpent = summary?.totalSpent ?? 0;
  const totalGroupSpent = summary?.totalGroupSpent ?? 0;

  const greetingHour = new Date().getHours();
  const greeting =
    greetingHour < 12 ? 'Good Morning' : greetingHour < 17 ? 'Good Afternoon' : 'Good Evening';

  return (
    <View style={styles.container}>
      <TopAppBar onNotificationPress={() => router.push('/(tabs)/activity')} />

      <ScrollView
        contentContainerStyle={globalStyles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
      >
        {/* Greeting Section */}
        <View style={styles.greetingHeader}>
          <View>
            <Text style={styles.greetingSub}>{greeting},</Text>
            <Text style={styles.greetingName}>{user?.name?.split(' ')[0] ?? 'Welcome'}</Text>
          </View>
          <TouchableOpacity activeOpacity={0.8} onPress={() => router.push('/(tabs)/settings')}>
            <Image
              source={{ uri: user?.image || PREDEFINED_AVATARS[0] }}
              style={styles.greetingAvatar}
            />
          </TouchableOpacity>
        </View>

        {/* Main Balance Card */}
        <View style={styles.balanceCard}>
          <View style={[styles.abstractCircle, styles.circleTopRight]} />
          <View style={[styles.abstractCircle, styles.circleBottomLeft]} />

          <View style={styles.mainBalanceWrapper}>
            <Text style={styles.balanceLabel}>Total Net Balance</Text>
            <Text style={styles.balanceAmount}>
              {CURRENCY_SYMBOL}
              {netBalance.toFixed(2)}
            </Text>
          </View>

          <View style={styles.balanceDivider} />

          {/* 2x2 Stats Grid */}
          <View style={styles.statsGrid}>
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <View style={[styles.statIconBg, { backgroundColor: COLORS.primaryFixed }]}>
                  <Ionicons name="arrow-down" size={16} color={COLORS.primary} />
                </View>
                <View>
                  <Text style={styles.statLabel}>Owed to you</Text>
                  <Text style={[styles.statValue, { color: COLORS.primaryFixed }]}>
                    {CURRENCY_SYMBOL}
                    {totalOwedToMe.toFixed(2)}
                  </Text>
                </View>
              </View>
              <View style={styles.statBox}>
                <View style={[styles.statIconBg, { backgroundColor: COLORS.errorContainer }]}>
                  <Ionicons name="arrow-up" size={16} color={COLORS.error} />
                </View>
                <View>
                  <Text style={styles.statLabel}>You owe</Text>
                  <Text style={[styles.statValue, { color: COLORS.errorContainer }]}>
                    {CURRENCY_SYMBOL}
                    {totalIOwe.toFixed(2)}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <View style={[styles.statIconBg, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
                  <Ionicons name="wallet-outline" size={16} color="#ffffff" />
                </View>
                <View>
                  <Text style={styles.statLabel}>Total Spent</Text>
                  <Text style={styles.statValue}>
                    {CURRENCY_SYMBOL}
                    {totalSpent.toFixed(2)}
                  </Text>
                </View>
              </View>
              <View style={styles.statBox}>
                <View style={[styles.statIconBg, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
                  <Ionicons name="people-outline" size={16} color="#ffffff" />
                </View>
                <View>
                  <Text style={styles.statLabel}>Group Spent</Text>
                  <Text style={styles.statValue}>
                    {CURRENCY_SYMBOL}
                    {totalGroupSpent.toFixed(2)}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={globalStyles.sectionContainer}>
          <Text style={globalStyles.sectionTitle}>Quick Actions</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickActionsScroll}
          >
            {/* Add Expense */}
            <TouchableOpacity
              style={styles.quickActionItem}
              activeOpacity={0.8}
              onPress={() => setAddExpenseVisible(true)}
            >
              <View
                style={[styles.quickActionIconContainer, styles.quickActionIconContainerActive]}
              >
                <Ionicons name="add" size={28} color="#ffffff" />
              </View>
              <Text style={styles.quickActionLabel} numberOfLines={2}>
                Add Expense
              </Text>
            </TouchableOpacity>

            {/* New Group */}
            <TouchableOpacity
              style={styles.quickActionItem}
              activeOpacity={0.8}
              onPress={() => router.push('/(tabs)/groups')}
            >
              <View style={styles.quickActionIconContainer}>
                <Ionicons name="people-outline" size={24} color={COLORS.primary} />
              </View>
              <Text style={styles.quickActionLabel} numberOfLines={2}>
                New Group
              </Text>
            </TouchableOpacity>

            {/* Settle Up */}
            <TouchableOpacity
              style={styles.quickActionItem}
              activeOpacity={0.8}
              onPress={() => router.push('/(tabs)/groups')}
            >
              <View style={styles.quickActionIconContainer}>
                <MaterialIcons name="payments" size={26} color={COLORS.secondary} />
              </View>
              <Text style={styles.quickActionLabel} numberOfLines={2}>
                Settle Up
              </Text>
            </TouchableOpacity>

            {/* Activity */}
            <TouchableOpacity
              style={styles.quickActionItem}
              activeOpacity={0.8}
              onPress={() => router.push('/(tabs)/activity')}
            >
              <View style={styles.quickActionIconContainer}>
                <MaterialIcons name="bar-chart" size={26} color={COLORS.tertiary} />
              </View>
              <Text style={styles.quickActionLabel} numberOfLines={2}>
                Activity
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Active Groups */}
        {recentGroups.length > 0 && (
          <View style={globalStyles.sectionContainer}>
            <View style={globalStyles.sectionHeaderRow}>
              <Text style={globalStyles.sectionTitle}>Active Groups</Text>
              <TouchableOpacity activeOpacity={0.7} onPress={() => router.push('/(tabs)/groups')}>
                <Text style={globalStyles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            {recentGroups.map((group) => (
              <GroupCard
                key={group.id}
                name={`${group.emoji ?? '👥'} ${group.name}`}
                activity={`${group.memberCount} members`}
                memberAvatars={group.members.slice(0, 2).map((m) => m.image ?? '')}
                totalMembersCount={group.memberCount}
                balanceText={
                  Math.abs(group.myBalance) < 0.01
                    ? 'Settled'
                    : group.myBalance > 0
                      ? `Owed ${CURRENCY_SYMBOL}${group.myBalance.toFixed(2)}`
                      : `You owe ${CURRENCY_SYMBOL}${Math.abs(group.myBalance).toFixed(2)}`
                }
                balanceType={
                  Math.abs(group.myBalance) < 0.01
                    ? 'settled'
                    : group.myBalance > 0
                      ? 'owed'
                      : 'owe'
                }
                onPress={() => router.push(`/groups/${group.id}`)}
              />
            ))}
          </View>
        )}

        {/* Recent Highlights — real expenses */}
        {expenses.length > 0 && (
          <View style={[globalStyles.sectionContainer, styles.pbHighlight]}>
            <View style={globalStyles.sectionHeaderRow}>
              <Text style={globalStyles.sectionTitle}>Recent Expenses</Text>
              <TouchableOpacity activeOpacity={0.7} onPress={() => router.push('/(tabs)/activity')}>
                <Text style={globalStyles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.highlightsContainer}>
              {expenses.map((expense) => {
                const isMine = expense.paidBy.userId === user?.id;
                const iconCfg = CATEGORY_ICONS[expense.category] || CATEGORY_ICONS.Other;
                return (
                  <HighlightItem
                    key={expense.id}
                    title={`${expense.title}`}
                    subtitle={`${expense.category} · ${new Date(expense.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`}
                    amount={`${CURRENCY_SYMBOL}${expense.amount.toFixed(2)}`}
                    secondaryText={isMine ? 'You paid' : `${expense.paidBy.name} paid`}
                    secondaryTextColor={isMine ? 'green' : 'gray'}
                    iconName={iconCfg.icon}
                    iconLib={iconCfg.lib}
                    iconBgColor={iconCfg.bg}
                    iconColor={iconCfg.color}
                  />
                );
              })}
            </View>
          </View>
        )}

        {/* Empty state */}
        {expenses.length === 0 && !expensesLoading && recentGroups.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateEmoji}>💰</Text>
            <Text style={styles.emptyStateTitle}>Start tracking expenses!</Text>
            <Text style={styles.emptyStateSubtitle}>
              Add your first expense or create a group to start splitting costs with friends.
            </Text>
            <TouchableOpacity
              style={styles.emptyStateCta}
              onPress={() => setAddExpenseVisible(true)}
            >
              <Ionicons name="add-circle" size={18} color="#fff" />
              <Text style={styles.emptyStateCtaText}>Add First Expense</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.85}
        onPress={() => setAddExpenseVisible(true)}
      >
        <Ionicons name="add" size={32} color="#ffffff" />
      </TouchableOpacity>

      <AddExpenseModal
        visible={addExpenseVisible}
        onClose={() => setAddExpenseVisible(false)}
        onSuccess={refetchExpenses}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  greetingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  greetingSub: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.outline,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  greetingName: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.onSurface,
    letterSpacing: -0.5,
  },
  greetingAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.surfaceContainer,
  },
  balanceCard: {
    backgroundColor: COLORS.primary,
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    overflow: 'hidden',
    position: 'relative',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  abstractCircle: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  circleTopRight: {
    width: 128,
    height: 128,
    top: -64,
    right: -64,
    backgroundColor: COLORS.primaryFixed,
    opacity: 0.15,
  },
  circleBottomLeft: {
    width: 96,
    height: 96,
    bottom: -48,
    left: -48,
    backgroundColor: COLORS.secondary,
    opacity: 0.1,
  },
  mainBalanceWrapper: {
    alignItems: 'center',
    marginVertical: 4,
  },
  balanceLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primaryFixed,
    textTransform: 'uppercase',
    letterSpacing: 1,
    opacity: 0.9,
  },
  balanceAmount: {
    fontSize: 34,
    fontWeight: '700',
    color: '#ffffff',
    marginTop: 4,
    letterSpacing: -0.5,
  },
  balanceDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    marginVertical: 20,
  },
  statsGrid: {
    gap: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  statBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 16,
  },
  statIconBg: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
  },
  quickActionsScroll: {
    paddingLeft: 4,
    paddingBottom: 4,
  },
  quickActionItem: {
    alignItems: 'center',
    marginRight: 16,
    width: 64,
  },
  quickActionIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  quickActionIconContainerActive: {
    backgroundColor: COLORS.secondary,
  },
  quickActionLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: COLORS.onSurface,
    textAlign: 'center',
    lineHeight: 14,
  },
  pbHighlight: { paddingBottom: 24 },
  highlightsContainer: { gap: 12 },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
    gap: 10,
  },
  emptyStateEmoji: { fontSize: 48 },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  emptyStateSubtitle: {
    fontSize: 13,
    color: COLORS.outline,
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyStateCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    marginTop: 8,
  },
  emptyStateCtaText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    zIndex: 40,
  },
});
