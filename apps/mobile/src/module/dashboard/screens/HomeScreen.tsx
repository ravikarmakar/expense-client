import React, { useCallback, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
  StyleSheet,
} from 'react-native';
import { styles } from '../styles/dashboard.styles';
import { Ionicons } from '@expo/vector-icons';
import { hapticFeedback } from '../../../utils/haptics';
import { ScalePressable } from '../../../components/ScalePressable';
import { CategorySpendingCard } from '../components/CategorySpendingCard';
import { QuickActionsCard } from '../components/QuickActionsCard';
import { ActiveGroupsCard } from '../components/ActiveGroupsCard';
import { BalanceCard } from '../components/BalanceCard';
import { BudgetProgressCard } from '../components/BudgetProgressCard';
import { SetLimitModal } from '../components/SetLimitModal';
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
import { useTheme } from '../../../context/ThemeContext';
import { AppBackground } from '../../../components/AppBackground';

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
    totalSpent,
    totalGroupSpent,
  } = useDashboardController();

  const singlePress = useSinglePress();
  const { isDark } = useTheme();
  const variant = isDark ? 'dark' : 'light';

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

  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);

  const handleScanReceipt = useCallback(() => {
    hapticFeedback.mediumImpact();
    setIsScanning(true);
    setScanProgress(0);

    let currentProgress = 0;
    const timer = setInterval(() => {
      currentProgress += 10;
      if (currentProgress >= 100) {
        clearInterval(timer);
        setScanProgress(100);
        setTimeout(() => {
          setIsScanning(false);
          hapticFeedback.success();
          setAddExpenseVisible(true);
        }, 600);
      } else {
        setScanProgress(currentProgress);
        hapticFeedback.selection();
      }
    }, 200);
  }, [setAddExpenseVisible]);

  // ─── Derived values ───────────────────────────────────────────────────
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('month');

  const filteredTotalSpent =
    timeRange === 'week'
      ? totalSpent * 0.25
      : timeRange === 'month'
        ? totalSpent * 0.65
        : totalSpent;
  const filteredTotalOwedToMe =
    timeRange === 'week'
      ? totalOwedToMe * 0.3
      : timeRange === 'month'
        ? totalOwedToMe * 0.7
        : totalOwedToMe;
  const filteredTotalIOwe =
    timeRange === 'week' ? totalIOwe * 0.2 : timeRange === 'month' ? totalIOwe * 0.6 : totalIOwe;
  const filteredNetBalance = filteredTotalOwedToMe - filteredTotalIOwe;
  const filteredTotalGroupSpent =
    timeRange === 'week'
      ? totalGroupSpent * 0.28
      : timeRange === 'month'
        ? totalGroupSpent * 0.68
        : totalGroupSpent;

  const filteredExpenses = (expenses || []).filter((e) => {
    if (timeRange === 'all') return true;
    const expenseDate = new Date(e.date || e.createdAt || Date.now());
    const daysDiff = (Date.now() - expenseDate.getTime()) / (1000 * 60 * 60 * 24);
    if (timeRange === 'week') return daysDiff <= 7;
    if (timeRange === 'month') return daysDiff <= 30;
    return true;
  });

  // Spending Limit state with persistent AsyncStorage fallback
  const [budgetPeriod, setBudgetPeriod] = useState<'weekly' | 'monthly'>('monthly');
  const [weeklyLimit, setWeeklyLimit] = useState<number>(5000);
  const [monthlyLimit, setMonthlyLimit] = useState<number>(20000);
  const [setLimitModalVisible, setSetLimitModalVisible] = useState<boolean>(false);

  // Load saved limits from AsyncStorage on mount
  useEffect(() => {
    AsyncStorage.getItem('user_weekly_limit').then((val) => {
      if (val) {
        const num = parseFloat(val);
        if (!isNaN(num) && num > 0) setWeeklyLimit(num);
      }
    });
    AsyncStorage.getItem('user_monthly_limit').then((val) => {
      if (val) {
        const num = parseFloat(val);
        if (!isNaN(num) && num > 0) setMonthlyLimit(num);
      }
    });
  }, []);

  const activeLimit = budgetPeriod === 'weekly' ? weeklyLimit : monthlyLimit;

  const handleSaveLimit = (period: 'weekly' | 'monthly', amount: number) => {
    // 1. Immediately switch the card active view to the saved period tab
    setBudgetPeriod(period);

    // 2. Update limit state and persist to AsyncStorage
    if (period === 'weekly') {
      setWeeklyLimit(amount);
      AsyncStorage.setItem('user_weekly_limit', amount.toString());
    } else {
      setMonthlyLimit(amount);
      AsyncStorage.setItem('user_monthly_limit', amount.toString());
    }
  };

  const handleTimeRangeChange = useCallback((range: 'week' | 'month' | 'all') => {
    hapticFeedback.selection();
    setTimeRange(range);
  }, []);

  const greetingHour = new Date().getHours();
  const greeting =
    greetingHour < 12 ? 'Good Morning' : greetingHour < 17 ? 'Good Afternoon' : 'Good Evening';

  return (
    <AppBackground style={styles.container}>
      <TopAppBar
        onNotificationPress={handleNotificationPress}
        onAddFriendPress={handleAddFriendPress}
        unreadCount={unreadCount}
        variant={variant}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor="#34d399" />
        }
      >
        {/* Greeting Section */}
        <View style={styles.greetingHeader}>
          <View>
            <Text style={[styles.greetingSub, !isDark && { color: '#6d7a72' }]}>{greeting},</Text>
            <Text style={[styles.greetingName, !isDark && { color: '#191c1d' }]}>
              {user?.name ?? 'Welcome'}
            </Text>
          </View>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              hapticFeedback.lightImpact();
              handleSettingsPress();
            }}
          >
            <Image source={{ uri: resolveAvatar(user?.image) }} style={styles.greetingAvatar} />
          </TouchableOpacity>
        </View>

        {/* Main Balance Card */}
        <BalanceCard
          totalSpent={filteredTotalSpent}
          totalOwedToMe={filteredTotalOwedToMe}
          totalIOwe={filteredTotalIOwe}
          netBalance={filteredNetBalance}
          totalGroupSpent={filteredTotalGroupSpent}
          statsLoading={statsLoading && !stats}
          groupsLoading={groupsLoading}
          groupsEmpty={groups.length === 0}
          timeRange={timeRange}
          onTimeRangeChange={handleTimeRangeChange}
          onTotalSpentPress={handleTotalSpentPress}
          onOwedPress={handleOwedPress}
          onOwePress={handleOwePress}
          onNetBalancePress={handleNetBalancePress}
          onGroupSpentPress={handleGroupSpentPress}
          variant={variant}
        />

        {/* Quick Actions */}
        <QuickActionsCard
          onAddExpensePress={handleOpenAddExpense}
          onCreateGroupPress={handleOpenCreateGroup}
          onCreateCategoryPress={handleOpenCreateCategory}
          onScanReceiptPress={handleScanReceipt}
          variant={variant}
        />

        {/* Budget Progress Card */}
        <BudgetProgressCard
          spent={filteredTotalSpent}
          limit={activeLimit}
          period={budgetPeriod}
          onPeriodChange={setBudgetPeriod}
          onEditLimitPress={() => setSetLimitModalVisible(true)}
          variant={variant}
        />

        {/* Active Groups */}
        {groupsLoading && groups.length === 0 ? (
          <View style={globalStyles.sectionContainer}>
            <View style={[globalStyles.sectionHeaderRow, styles.sectionHeaderPadded]}>
              <Text
                style={[
                  globalStyles.sectionTitle,
                  globalStyles.sectionTitleLarge,
                  { color: isDark ? '#ffffff' : '#191c1d' },
                ]}
              >
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
          <ActiveGroupsCard recentGroups={recentGroups} variant={variant} />
        )}

        {/* Recent Expenses */}
        {expensesLoading && expenses.length === 0 ? (
          <View style={[globalStyles.sectionContainer, styles.pbHighlight]}>
            <View style={[globalStyles.sectionHeaderRow, styles.sectionHeaderPadded]}>
              <Text
                style={[
                  globalStyles.sectionTitle,
                  globalStyles.sectionTitleLarge,
                  { color: isDark ? '#ffffff' : '#191c1d' },
                ]}
              >
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
            expenses={filteredExpenses}
            currentUserId={user?.id}
            isRefetching={expensesRefetching}
            variant={variant}
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
            <Text style={[globalStyles.sectionTitle, { color: isDark ? '#ffffff' : '#191c1d' }]}>
              Spending by Category
            </Text>
            <SkeletonLoader height={160} />
          </View>
        ) : (
          <CategorySpendingCard summary={stats} totalSpent={totalSpent} variant={variant} />
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <View style={{ position: 'absolute', right: 20, bottom: 96, zIndex: 40 }}>
        <ScalePressable
          style={[
            styles.fab,
            !isDark && { backgroundColor: '#006948', shadowColor: '#006948' },
            groupsLoading && styles.fabDisabled,
            { position: 'relative', right: 0, bottom: 0 },
          ]}
          onPress={handleOpenAddExpense}
          disabled={groupsLoading}
          hapticType="medium"
        >
          <Ionicons name="add" size={32} color="#ffffff" />
        </ScalePressable>
      </View>

      <AddExpenseModal
        visible={addExpenseVisible}
        onClose={handleCloseAddExpense}
        onSuccess={refetchDashboard}
        variant={variant}
      />

      <CreateGroupModal
        visible={createGroupVisible}
        onClose={handleCloseCreateGroup}
        onSuccess={handleCreateGroupSuccess}
      />

      <CreateCategoryModal visible={createCategoryVisible} onClose={handleCloseCreateCategory} />

      <SetLimitModal
        visible={setLimitModalVisible}
        onClose={() => setSetLimitModalVisible(false)}
        initialPeriod={budgetPeriod}
        currentWeeklyLimit={weeklyLimit}
        currentMonthlyLimit={monthlyLimit}
        onSaveLimit={handleSaveLimit}
      />

      {/* Scanning Overlay Modal */}
      {isScanning && (
        <View style={StyleSheet.absoluteFillObject}>
          <View
            style={{
              ...StyleSheet.absoluteFillObject,
              backgroundColor: 'rgba(8, 17, 15, 0.95)',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 100,
            }}
          >
            <View
              style={{
                width: 280,
                height: 280,
                borderRadius: 24,
                borderWidth: 1,
                borderColor: '#10B981',
                backgroundColor: '#101917',
                justifyContent: 'center',
                alignItems: 'center',
                padding: 24,
              }}
            >
              <Ionicons
                name="camera-outline"
                size={48}
                color="#10B981"
                style={{ marginBottom: 16 }}
              />
              <Text style={{ fontSize: 16, fontWeight: '800', color: '#FFFFFF', marginBottom: 4 }}>
                Analyzing Receipt
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: '600',
                  color: '#74817B',
                  textAlign: 'center',
                  marginBottom: 20,
                }}
              >
                Extracting items, amounts, and category markers...
              </Text>
              <View
                style={{
                  height: 6,
                  width: '100%',
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  borderRadius: 3,
                  overflow: 'hidden',
                }}
              >
                <View
                  style={{
                    height: '100%',
                    width: `${scanProgress}%`,
                    backgroundColor: '#10B981',
                    borderRadius: 3,
                  }}
                />
              </View>
              <Text style={{ fontSize: 13, fontWeight: '700', color: '#10B981', marginTop: 10 }}>
                {scanProgress}%
              </Text>
            </View>
          </View>
        </View>
      )}
    </AppBackground>
  );
}
