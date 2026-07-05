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
import { Ionicons } from '@expo/vector-icons';
import { CategorySpendingCard } from '../../components/CategorySpendingCard';
import { QuickActionsCard } from '../../components/QuickActionsCard';
import { ActiveGroupsCard } from '../../components/ActiveGroupsCard';
import { RecentExpensesCard } from '../../components/RecentExpensesCard';
import { AddExpenseModal } from '../../components/AddExpenseModal';
import { CreateGroupModal } from '../../components/CreateGroupModal';
import { LoadingView } from '../../components/LoadingView';
import { ErrorView } from '../../components/ErrorView';
import { EmptyState } from '../../components/EmptyState';
import { useDashboard, useNotifications } from '@workspace/api';
import { router } from 'expo-router';
import { COLORS, CURRENCY_SYMBOL, PREDEFINED_AVATARS } from '../../constants/theme';
import { globalStyles } from '../../styles/globalStyles';
import { TopAppBar } from '../../components/TopAppBar';

export default function HomeTabScreen() {
  const [addExpenseVisible, setAddExpenseVisible] = useState(false);
  const [createGroupVisible, setCreateGroupVisible] = useState(false);

  const {
    data: dashboardData,
    isLoading: expensesLoading,
    isError,
    refetch: refetchDashboard,
  } = useDashboard();
  const { data: notifications = [], refetch: refetchNotifications } = useNotifications();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (expensesLoading && !dashboardData) {
    return <LoadingView />;
  }

  if (isError && !dashboardData) {
    return <ErrorView message="Failed to load dashboard data" onRetry={refetchDashboard} />;
  }

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([refetchDashboard(), refetchNotifications()]);
    setIsRefreshing(false);
  };

  const user = dashboardData?.user;
  const expenses = dashboardData?.recentExpenses ?? [];
  const groups = dashboardData?.groups ?? [];
  const summary = dashboardData?.stats;
  const recentGroups = groups.slice(0, 2);

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
      <TopAppBar
        onNotificationPress={() => router.push('/notifications')}
        onAddFriendPress={() => router.push('/add-friend')}
        unreadCount={unreadCount}
      />

      <ScrollView
        contentContainerStyle={globalStyles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
      >
        {/* Greeting Section */}
        <View style={styles.greetingHeader}>
          <View>
            <Text style={styles.greetingSub}>{greeting},</Text>
            <Text style={styles.greetingName}>{user?.name ?? 'Welcome'}</Text>
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
              <TouchableOpacity
                style={styles.statBox}
                activeOpacity={0.8}
                onPress={() => router.push('/total-spent')}
              >
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
              </TouchableOpacity>
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
        <QuickActionsCard
          onAddExpensePress={() => setAddExpenseVisible(true)}
          onCreateGroupPress={() => setCreateGroupVisible(true)}
        />

        {/* Active Groups */}
        <ActiveGroupsCard recentGroups={recentGroups} />

        {/* Recent Expenses */}
        <RecentExpensesCard expenses={expenses} currentUserId={user?.id} />

        {/* Empty state */}
        {expenses.length === 0 && !expensesLoading && recentGroups.length === 0 && (
          <EmptyState
            emoji="💰"
            title="Start tracking expenses!"
            description="Add your first expense or create a group to start splitting costs with friends."
            ctaText="Add First Expense"
            onCtaPress={() => setAddExpenseVisible(true)}
            ctaIcon="add-circle"
          />
        )}

        {/* Category Spending Analytics */}
        <CategorySpendingCard summary={summary} totalSpent={totalSpent} />
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
        onSuccess={refetchDashboard}
      />

      <CreateGroupModal
        visible={createGroupVisible}
        onClose={() => setCreateGroupVisible(false)}
        onSuccess={() => {
          setCreateGroupVisible(false);
          refetchDashboard();
        }}
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
  pbHighlight: { paddingBottom: 24 },
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
