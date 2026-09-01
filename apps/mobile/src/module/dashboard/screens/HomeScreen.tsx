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
import { MonthlyProjectionsCard } from '../components/MonthlyProjectionsCard';
import { QuickFeatureLinksCard } from '../components/QuickFeatureLinksCard';
import { QuickActionsCard } from '../components/QuickActionsCard';
import { ActiveGroupsCard } from '../components/ActiveGroupsCard';
import { BalanceCard } from '../components/BalanceCard';
import { BudgetProgressCard } from '../components/BudgetProgressCard';
import { SetLimitModal } from '../components/SetLimitModal';
import { AddExpenseModal } from '../../../components/AddExpenseModal';
import { AddIncomeModal } from '../../../components/AddIncomeModal';
import { AddLoanModal } from '../../../components/AddLoanModal';
import { CreateGroupModal } from '../../groups/components/CreateGroupModal';
import { CreateCategoryModal } from '../../../components/CreateCategoryModal';
import { GroupCardSkeleton } from '../../groups/components/GroupCardSkeleton';
import { ExpenseItemSkeleton } from '../../../components/ExpenseItemSkeleton';
import { EmptyState } from '../../../components/EmptyState';
import { SkeletonLoader } from '../../../components/SkeletonLoader';
import { useDashboardController, useIncomes } from '@workspace/api';
import { router } from 'expo-router';
import { resolveAvatar, CURRENCY_SYMBOL } from '../../../constants/theme';
import { globalStyles } from '../../../styles/globalStyles';
import { TopAppBar } from '../../../components/TopAppBar';
import { RecentExpenses } from '../components/RecentExpenses';
import { RecentIncome } from '../components/RecentIncome';
import { useSinglePress } from '../../../hooks/useSinglePress';
import { useTheme } from '../../../context/ThemeContext';
import { AppBackground } from '../../../components/AppBackground';

export default function HomeScreen() {
  const { data: incomeData } = useIncomes();
  const incomesList = incomeData?.incomes ?? [];

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
  const [addIncomeVisible, setAddIncomeVisible] = useState(false);
  const [addLoanVisible, setAddLoanVisible] = useState(false);

  // ─── Stable handlers (won't create new closures on each render) ───────
  const handleNotificationPress = useCallback(() => router.push('/notifications'), []);
  const handleAddFriendPress = useCallback(() => router.push('/add-friend'), []);
  const handleSettingsPress = useCallback(() => router.push('/(tabs)/settings'), []);
  const handleOpenAddExpense = useCallback(() => setAddExpenseVisible(true), []);
  const handleCloseAddExpense = useCallback(() => setAddExpenseVisible(false), []);
  const handleOpenAddIncome = useCallback(() => setAddIncomeVisible(true), []);
  const handleCloseAddIncome = useCallback(() => setAddIncomeVisible(false), []);
  const handleOpenAddLoan = useCallback(() => setAddLoanVisible(true), []);
  const handleCloseAddLoan = useCallback(() => setAddLoanVisible(false), []);
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
    () => singlePress(() => router.push('/activity-analytics'))(),
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
    () => singlePress(() => router.push('/groups/settle-up'))(),
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

  // All spending and balance values show real all-time totals.
  const filteredTotalSpent = totalSpent;
  const filteredTotalOwedToMe = totalOwedToMe;
  const filteredTotalIOwe = totalIOwe;
  const filteredNetBalance = filteredTotalOwedToMe - filteredTotalIOwe;
  const filteredTotalGroupSpent = totalGroupSpent;

  const filteredExpenses = expenses || [];

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
          totalIncome={stats?.totalIncome}
          totalOwedToMe={filteredTotalOwedToMe}
          totalIOwe={filteredTotalIOwe}
          netBalance={filteredNetBalance}
          totalGroupSpent={filteredTotalGroupSpent}
          expenses={filteredExpenses}
          incomes={incomesList}
          statsLoading={statsLoading && !stats}
          groupsLoading={groupsLoading}
          groupsEmpty={groups.length === 0}
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
          onAddIncomePress={handleOpenAddIncome}
          onLendBorrowPress={handleOpenAddLoan}
          onCreateGroupPress={handleOpenCreateGroup}
          onCreateCategoryPress={handleOpenCreateCategory}
          onScanReceiptPress={handleScanReceipt}
          variant={variant}
        />

        {/* Premium Lend & Borrow Tracker Card */}
        <ScalePressable
          style={[
            styles.lendBorrowCard,
            isDark ? styles.lendBorrowCardDark : styles.lendBorrowCardLight,
          ]}
          onPress={() => {
            hapticFeedback.lightImpact();
            router.push('/lend-borrow');
          }}
        >
          {/* Decorative background glow elements */}
          <View style={styles.lbCircle1} />
          <View style={styles.lbCircle2} />

          {/* Header Row: Badge Tag & Action Arrow */}
          <View style={styles.lbHeaderRow}>
            <View style={[styles.lbBadge, isDark ? styles.lbBadgeDark : styles.lbBadgeLight]}>
              <Ionicons name="hand-left" size={12} color={isDark ? '#34D399' : '#0F766E'} />
              <Text
                style={[styles.lbBadgeText, isDark ? { color: '#34D399' } : { color: '#0F766E' }]}
              >
                LEND & BORROW
              </Text>
            </View>

            <View
              style={[styles.lbArrowContainer, isDark ? styles.lbArrowDark : styles.lbArrowLight]}
            >
              <Ionicons name="arrow-forward" size={14} color={isDark ? '#34D399' : '#0F766E'} />
            </View>
          </View>

          {/* Card Title & Subtitle */}
          <Text style={[styles.lbTitle, isDark ? { color: '#FFFFFF' } : { color: '#0F172A' }]}>
            Lend & Borrow Tracker
          </Text>
          <Text style={[styles.lbSub, isDark ? { color: '#9CA3AF' } : { color: '#64748B' }]}>
            Track debts, loans to friends, banks & loan apps
          </Text>

          {/* Live Balance Summary Chips */}
          <View style={styles.lbMetricsRow}>
            <View
              style={[
                styles.lbMetricChip,
                isDark ? styles.lbMetricChipOwedDark : styles.lbMetricChipOwedLight,
              ]}
            >
              <Ionicons name="arrow-down-circle" size={13} color="#10B981" />
              <Text style={styles.lbMetricOwedText}>
                Owed to you: {CURRENCY_SYMBOL}
                {filteredTotalOwedToMe.toFixed(0)}
              </Text>
            </View>

            <View
              style={[
                styles.lbMetricChip,
                isDark ? styles.lbMetricChipOweDark : styles.lbMetricChipOweLight,
              ]}
            >
              <Ionicons name="arrow-up-circle" size={13} color="#EF4444" />
              <Text style={styles.lbMetricOweText}>
                You owe: {CURRENCY_SYMBOL}
                {filteredTotalIOwe.toFixed(0)}
              </Text>
            </View>
          </View>
        </ScalePressable>

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

        {/* Budget & Spending Limit Progress Card */}
        <BudgetProgressCard
          spent={filteredTotalSpent}
          limit={activeLimit}
          period={budgetPeriod}
          onPeriodChange={setBudgetPeriod}
          onEditLimitPress={() => setSetLimitModalVisible(true)}
          variant={variant}
        />

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

        {/* Recent Income */}
        <RecentIncome variant={variant} onAddIncomePress={handleOpenAddIncome} />

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

        {/* Financial Health & Safe-to-Spend Projection Card */}
        <MonthlyProjectionsCard
          totalSpent={totalSpent}
          monthlyLimit={activeLimit}
          variant={variant}
          onEditLimitPress={() => setSetLimitModalVisible(true)}
        />

        {/* You're All Caught Up - Quick Feature Navigation Links */}
        <QuickFeatureLinksCard variant={variant} />
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

      <AddIncomeModal
        visible={addIncomeVisible}
        onClose={handleCloseAddIncome}
        onSuccess={refetchDashboard}
        variant={variant}
      />

      <AddLoanModal
        visible={addLoanVisible}
        onClose={handleCloseAddLoan}
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
