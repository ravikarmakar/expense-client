import React from 'react';
import { Text, View, ScrollView, TouchableOpacity, RefreshControl, Image } from 'react-native';
import { styles } from '../styles/dashboard.styles';
import { Ionicons } from '@expo/vector-icons';
import { CategorySpendingCard } from '../components/CategorySpendingCard';
import { QuickActionsCard } from '../components/QuickActionsCard';
import { ActiveGroupsCard } from '../components/ActiveGroupsCard';
import { RecentExpensesCard } from '../components/RecentExpensesCard';
import { AddExpenseModal } from '../../../components/AddExpenseModal';
import { CreateGroupModal } from '../../groups/components/CreateGroupModal';
import { EmptyState } from '../../../components/EmptyState';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { useDashboardController } from '@workspace/api';
import { router } from 'expo-router';
import { COLORS, CURRENCY_SYMBOL } from '../../../constants/theme';
import { globalStyles } from '../../../styles/globalStyles';
import { TopAppBar } from '../../../components/TopAppBar';

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
            {user?.image ? (
              <Image source={{ uri: user.image }} style={styles.greetingAvatar} />
            ) : (
              <View
                style={[
                  styles.greetingAvatar,
                  {
                    backgroundColor: COLORS.surfaceContainer,
                    alignItems: 'center',
                    justifyContent: 'center',
                  },
                ]}
              >
                <Ionicons name="person" size={20} color={COLORS.outline} />
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Main Balance Card */}
        <View style={styles.balanceCard}>
          <View style={[styles.abstractCircle, styles.circleTopRight]} />
          <View style={[styles.abstractCircle, styles.circleBottomLeft]} />

          <View style={styles.mainBalanceWrapper}>
            <Text style={styles.balanceLabel}>Total Net Balance</Text>
            {groupsLoading && groups.length === 0 ? (
              <SkeletonLoader
                width={140}
                height={32}
                style={{ marginTop: 6, backgroundColor: 'rgba(255,255,255,0.2)' }}
              />
            ) : (
              <Text style={styles.balanceAmount}>
                {CURRENCY_SYMBOL}
                {netBalance.toFixed(2)}
              </Text>
            )}
          </View>

          <View style={styles.balanceDivider} />

          {/* 2x2 Stats Grid */}
          <View style={styles.statsGrid}>
            <View style={styles.statsRow}>
              <TouchableOpacity
                style={styles.statBox}
                activeOpacity={0.8}
                onPress={() => router.push({ pathname: '/settle-up', params: { type: 'owed' } })}
              >
                <View style={[styles.statIconBg, { backgroundColor: COLORS.primaryFixed }]}>
                  <Ionicons name="arrow-down" size={16} color={COLORS.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.statLabel}>Owed to you</Text>
                  {groupsLoading && groups.length === 0 ? (
                    <SkeletonLoader
                      width={50}
                      height={16}
                      style={{ marginTop: 2, backgroundColor: 'rgba(255,255,255,0.15)' }}
                    />
                  ) : (
                    <Text style={[styles.statValue, { color: COLORS.primaryFixed }]}>
                      {CURRENCY_SYMBOL}
                      {totalOwedToMe.toFixed(2)}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.statBox}
                activeOpacity={0.8}
                onPress={() => router.push({ pathname: '/settle-up', params: { type: 'owe' } })}
              >
                <View style={[styles.statIconBg, { backgroundColor: COLORS.errorContainer }]}>
                  <Ionicons name="arrow-up" size={16} color={COLORS.error} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.statLabel}>You owe</Text>
                  {groupsLoading && groups.length === 0 ? (
                    <SkeletonLoader
                      width={50}
                      height={16}
                      style={{ marginTop: 2, backgroundColor: 'rgba(255,255,255,0.15)' }}
                    />
                  ) : (
                    <Text style={[styles.statValue, { color: COLORS.errorContainer }]}>
                      {CURRENCY_SYMBOL}
                      {totalIOwe.toFixed(2)}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
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
                <View style={{ flex: 1 }}>
                  <Text style={styles.statLabel}>Total Spent</Text>
                  {statsLoading && !stats ? (
                    <SkeletonLoader
                      width={50}
                      height={16}
                      style={{ marginTop: 2, backgroundColor: 'rgba(255,255,255,0.15)' }}
                    />
                  ) : (
                    <Text style={styles.statValue}>
                      {CURRENCY_SYMBOL}
                      {totalSpent.toFixed(2)}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.statBox}
                activeOpacity={0.8}
                onPress={() => router.push('/owed-details')}
              >
                <View style={[styles.statIconBg, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
                  <Ionicons name="people-outline" size={16} color="#ffffff" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.statLabel}>Group Spent</Text>
                  {statsLoading && !stats ? (
                    <SkeletonLoader
                      width={50}
                      height={16}
                      style={{ marginTop: 2, backgroundColor: 'rgba(255,255,255,0.15)' }}
                    />
                  ) : (
                    <Text style={styles.statValue}>
                      {CURRENCY_SYMBOL}
                      {totalGroupSpent.toFixed(2)}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <QuickActionsCard
          onAddExpensePress={() => setAddExpenseVisible(true)}
          onCreateGroupPress={() => setCreateGroupVisible(true)}
          disabled={groupsLoading}
        />

        {/* Active Groups */}
        {groupsLoading && groups.length === 0 ? (
          <View style={globalStyles.sectionContainer}>
            <View style={globalStyles.sectionHeaderRow}>
              <Text style={globalStyles.sectionTitle}>Active Groups</Text>
            </View>
            <View style={{ gap: 12 }}>
              <SkeletonLoader height={72} />
              <SkeletonLoader height={72} />
            </View>
          </View>
        ) : (
          <ActiveGroupsCard recentGroups={recentGroups} />
        )}

        {/* Recent Expenses */}
        {expensesLoading && expenses.length === 0 ? (
          <View style={[globalStyles.sectionContainer, { paddingBottom: 24 }]}>
            <View style={globalStyles.sectionHeaderRow}>
              <Text style={globalStyles.sectionTitle}>Recent Expenses</Text>
            </View>
            <View style={{ gap: 12 }}>
              <SkeletonLoader height={60} />
              <SkeletonLoader height={60} />
              <SkeletonLoader height={60} />
            </View>
          </View>
        ) : (
          <RecentExpensesCard expenses={expenses} currentUserId={user?.id} />
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
              onCtaPress={() => setAddExpenseVisible(true)}
              ctaIcon="add-circle"
            />
          )}

        {/* Category Spending Analytics */}
        {statsLoading && !stats ? (
          <View style={[globalStyles.sectionContainer, { paddingBottom: 24 }]}>
            <Text style={globalStyles.sectionTitle}>Spending by Category</Text>
            <SkeletonLoader height={160} style={{ marginTop: 12 }} />
          </View>
        ) : (
          <CategorySpendingCard summary={stats} totalSpent={totalSpent} />
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={[styles.fab, groupsLoading && styles.fabDisabled]}
        activeOpacity={0.85}
        onPress={() => setAddExpenseVisible(true)}
        disabled={groupsLoading}
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
