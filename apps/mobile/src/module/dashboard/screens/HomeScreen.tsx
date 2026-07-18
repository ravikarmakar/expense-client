import React, { useCallback, useState } from 'react';
import { Text, View, ScrollView, TouchableOpacity, RefreshControl, Image } from 'react-native';
import { styles } from '../styles/dashboard.styles';
import { Ionicons } from '@expo/vector-icons';
import { CategorySpendingCard } from '../components/CategorySpendingCard';
import { QuickActionsCard } from '../components/QuickActionsCard';
import { ActiveGroupsCard } from '../components/ActiveGroupsCard';
import { BalanceCard } from '../components/BalanceCard';
import { AddExpenseModal } from '../../../components/AddExpenseModal';
import { CreateGroupModal } from '../../groups/components/CreateGroupModal';
import { CreateCategoryModal } from '../../../components/CreateCategoryModal';
import { GroupCardSkeleton } from '../../groups/components/GroupCardSkeleton';
import { ExpenseItemSkeleton } from '../../../components/ExpenseItemSkeleton';
import { EmptyState } from '../../../components/EmptyState';
import { SkeletonLoader } from '../../../components/SkeletonLoader';
import { useDashboardController } from '@workspace/api';
import { router } from 'expo-router';
import { resolveAvatar } from '../../../constants/theme';
import { globalStyles } from '../../../styles/globalStyles';
import { TopAppBar } from '../../../components/TopAppBar';
import { RecentExpenses } from '../components/RecentExpenses';
import { useSinglePress } from '../../../hooks/useSinglePress';

export default function HomeScreen() {
  const {
    addExpenseVisible,
    setAddExpenseVisible,
    createGroupVisible,
    setCreateGroupVisible,
    user,
    stats,
    statsLoading,
    expenses,
    expensesLoading,
    expensesRefetching,
    groups,
    groupsLoading,
    isRefreshing,
    unreadCount,
    handleRefresh,
    refetchDashboard,
    recentGroups,
    totalOwedToMe,
    totalIOwe,
    netBalance,
    totalSpent,
    totalGroupSpent,
  } = useDashboardController();

  const singlePress = useSinglePress();

  // ─── Stable handlers (won't create new closures on each render) ───────
  const handleNotificationPress = useCallback(() => router.push('/notifications'), []);
  const handleAddFriendPress = useCallback(() => router.push('/add-friend'), []);
  const handleSettingsPress = useCallback(() => router.push('/(tabs)/settings'), []);
  const handleOpenAddExpense = useCallback(() => setAddExpenseVisible(true), []);
  const handleCloseAddExpense = useCallback(() => setAddExpenseVisible(false), []);
  const handleOpenCreateGroup = useCallback(() => setCreateGroupVisible(true), []);
  const handleCloseCreateGroup = useCallback(() => setCreateGroupVisible(false), []);
  const handleCreateGroupSuccess = useCallback(() => {
    setCreateGroupVisible(false);
    refetchDashboard();
  }, [refetchDashboard]);

  // Category modal
  const [createCategoryVisible, setCreateCategoryVisible] = useState(false);
  const handleOpenCreateCategory = useCallback(() => setCreateCategoryVisible(true), []);
  const handleCloseCreateCategory = useCallback(() => setCreateCategoryVisible(false), []);

  // Balance card navigation handlers (wrapped with singlePress for debounce)
  const handleTotalSpentPress = useCallback(
    () => singlePress(() => router.push('/total-spent'))(),
    []
  );
  const handleOwedPress = useCallback(
    () =>
      singlePress(() => router.push({ pathname: '/groups/settle-up', params: { type: 'owed' } }))(),
    []
  );
  const handleOwePress = useCallback(
    () =>
      singlePress(() => router.push({ pathname: '/groups/settle-up', params: { type: 'owe' } }))(),
    []
  );
  const handleNetBalancePress = useCallback(
    () => singlePress(() => router.push('/(tabs)/groups'))(),
    []
  );
  const handleGroupSpentPress = useCallback(
    () => singlePress(() => router.push('/groups/analytics'))(),
    []
  );

  // ─── Derived values ───────────────────────────────────────────────────
  const greetingHour = new Date().getHours();
  const greeting =
    greetingHour < 12 ? 'Good Morning' : greetingHour < 17 ? 'Good Afternoon' : 'Good Evening';

  return (
    <View style={styles.container}>
      <TopAppBar
        onNotificationPress={handleNotificationPress}
        onAddFriendPress={handleAddFriendPress}
        unreadCount={unreadCount}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
      >
        {/* Greeting Section */}
        <View style={styles.greetingHeader}>
          <View>
            <Text style={styles.greetingSub}>{greeting},</Text>
            <Text style={styles.greetingName}>{user?.name ?? 'Welcome'}</Text>
          </View>
          <TouchableOpacity activeOpacity={0.8} onPress={handleSettingsPress}>
            <Image source={{ uri: resolveAvatar(user?.image) }} style={styles.greetingAvatar} />
          </TouchableOpacity>
        </View>

        {/* Main Balance Card */}
        <BalanceCard
          totalSpent={totalSpent}
          totalOwedToMe={totalOwedToMe}
          totalIOwe={totalIOwe}
          netBalance={netBalance}
          totalGroupSpent={totalGroupSpent}
          statsLoading={statsLoading && !stats}
          groupsLoading={groupsLoading}
          groupsEmpty={groups.length === 0}
          onTotalSpentPress={handleTotalSpentPress}
          onOwedPress={handleOwedPress}
          onOwePress={handleOwePress}
          onNetBalancePress={handleNetBalancePress}
          onGroupSpentPress={handleGroupSpentPress}
        />

        {/* Quick Actions */}
        <QuickActionsCard
          onAddExpensePress={handleOpenAddExpense}
          onCreateGroupPress={handleOpenCreateGroup}
          onCreateCategoryPress={handleOpenCreateCategory}
        />

        {/* Active Groups */}
        {groupsLoading && groups.length === 0 ? (
          <View style={globalStyles.sectionContainer}>
            <View style={[globalStyles.sectionHeaderRow, styles.sectionHeaderPadded]}>
              <Text style={[globalStyles.sectionTitle, globalStyles.sectionTitleLarge]}>
                Active Groups
              </Text>
            </View>
            <View>
              <GroupCardSkeleton />
              <GroupCardSkeleton />
              <GroupCardSkeleton />
            </View>
          </View>
        ) : (
          <ActiveGroupsCard recentGroups={recentGroups} />
        )}

        {/* Recent Expenses */}
        {expensesLoading && expenses.length === 0 ? (
          <View style={[globalStyles.sectionContainer, styles.pbHighlight]}>
            <View style={[globalStyles.sectionHeaderRow, styles.sectionHeaderPadded]}>
              <Text style={[globalStyles.sectionTitle, globalStyles.sectionTitleLarge]}>
                Recent Expenses
              </Text>
            </View>
            <View>
              <ExpenseItemSkeleton />
              <ExpenseItemSkeleton />
              <ExpenseItemSkeleton />
              <ExpenseItemSkeleton />
              <ExpenseItemSkeleton />
              <ExpenseItemSkeleton />
            </View>
          </View>
        ) : (
          <RecentExpenses
            expenses={expenses}
            currentUserId={user?.id}
            isRefetching={expensesRefetching}
          />
        )}

        {/* Empty state */}
        {!expensesLoading &&
          !groupsLoading &&
          expenses.length === 0 &&
          recentGroups.length === 0 && (
            <EmptyState
              emoji="💰"
              title="Start tracking expenses!"
              description="Add your first expense or create a group to start splitting costs with friends."
              ctaText="Add First Expense"
              onCtaPress={handleOpenAddExpense}
              ctaIcon="add-circle"
            />
          )}

        {/* Category Spending Analytics */}
        {statsLoading && !stats ? (
          <View style={[globalStyles.sectionContainer, styles.pbHighlight]}>
            <Text style={globalStyles.sectionTitle}>Spending by Category</Text>
            <SkeletonLoader height={160} />
          </View>
        ) : (
          <CategorySpendingCard summary={stats} totalSpent={totalSpent} />
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={[styles.fab, groupsLoading && styles.fabDisabled]}
        activeOpacity={0.85}
        onPress={handleOpenAddExpense}
        disabled={groupsLoading}
      >
        <Ionicons name="add" size={32} color="#ffffff" />
      </TouchableOpacity>

      <AddExpenseModal
        visible={addExpenseVisible}
        onClose={handleCloseAddExpense}
        onSuccess={refetchDashboard}
      />

      <CreateGroupModal
        visible={createGroupVisible}
        onClose={handleCloseCreateGroup}
        onSuccess={handleCreateGroupSuccess}
      />

      <CreateCategoryModal visible={createCategoryVisible} onClose={handleCloseCreateCategory} />
    </View>
  );
}
