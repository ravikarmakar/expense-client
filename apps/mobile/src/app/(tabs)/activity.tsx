import React from 'react';
import { router } from 'expo-router';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  NativeScrollEvent,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, CURRENCY_SYMBOL } from '../../constants/theme';
import {
  getDateRangeLabel,
  getPeriodDurationText,
} from '../../components/ActivityOverviewChartCard';
import { ExpenseItemSkeleton } from '../../components/ExpenseItemSkeleton';
import { AddExpenseModal } from '../../components/AddExpenseModal';
import { AddIncomeModal } from '../../components/AddIncomeModal';
import { ActivityFeedItem } from '../../module/groups/components/group-details/ActivityFeedItem';
import { ActivityOverviewChartCard } from '../../components/ActivityOverviewChartCard';
import { useTheme } from '../../context/ThemeContext';
import { ErrorView } from '../../components/ErrorView';
import { useExport } from '../../hooks/useExport';
import { ExportModalBottomSheet } from '../../components/ExportModalBottomSheet';
import { ExportProgressAndSuccessModal } from '../../components/ExportProgressAndSuccessModal';
import { FloatingDropdownMenu } from '../../components/FloatingDropdownMenu';
import { EmptyState } from '../../components/EmptyState';
import {
  useActivityController,
  useIncomes,
  useSettlements,
  useExpensesSummary,
  type Income,
  type Settlement,
} from '@workspace/api';
import { getDateHeading } from '../../utils/date';
import { hapticFeedback } from '../../utils/haptics';

const BATCH_SIZE = 15;

const PERIOD_OPTIONS = [
  { label: 'This Month', value: 'this-month', icon: 'calendar-number-outline' },
  { label: 'Last 7 Days', value: 'last-7-days', icon: 'time-outline' },
  { label: 'Last 30 Days', value: 'last-30-days', icon: 'timer-outline' },
  { label: 'Last Month', value: 'last-month', icon: 'play-back-outline' },
  { label: 'All Time', value: 'all-time', icon: 'infinite-outline' },
  { label: 'Select Month', value: 'custom_month', icon: 'calendar-outline' },
  { label: 'Select Year', value: 'custom_year', icon: 'ribbon-outline' },
] as const;

export default function ActivityTabScreen() {
  const {
    user,
    addExpenseVisible,
    setAddExpenseVisible,
    dateRange,
    setDateRange,
    isRefreshing,
    sortedExpenses,
    isLoading,
    isError,
    refetch,
    handleRefresh,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useActivityController();

  const { isDark } = useTheme();
  const variant = isDark ? 'dark' : 'light';
  const [addIncomeVisible, setAddIncomeVisible] = React.useState(false);
  const [displayLimit, setDisplayLimit] = React.useState(BATCH_SIZE);

  const [isPeriodDropdownOpen, setIsPeriodDropdownOpen] = React.useState(false);

  // Export Hook
  const exportHook = useExport();

  const { data: summaryData } = useExpensesSummary();

  const { data: incomeData } = useIncomes();
  const rawIncomes = incomeData?.incomes ?? [];

  const filteredIncomes = React.useMemo(() => {
    return rawIncomes.filter((inc) => {
      if (dateRange !== 'all-time') {
        const incDate = new Date(inc.date);
        const now = new Date();
        if (dateRange === 'this-month') {
          if (incDate.getMonth() !== now.getMonth() || incDate.getFullYear() !== now.getFullYear())
            return false;
        } else if (dateRange === 'last-month') {
          const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          if (
            incDate.getMonth() !== lastMonth.getMonth() ||
            incDate.getFullYear() !== lastMonth.getFullYear()
          )
            return false;
        } else if (dateRange === 'last-7-days') {
          const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          if (incDate < sevenDaysAgo) return false;
        } else if (dateRange === 'last-30-days') {
          const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          if (incDate < thirtyDaysAgo) return false;
        } else if (dateRange.startsWith('month-')) {
          const parts = dateRange.replace('month-', '').split('-');
          const year = parseInt(parts[0], 10);
          const month = parseInt(parts[1], 10) - 1;
          if (incDate.getFullYear() !== year || incDate.getMonth() !== month) return false;
        }
      }
      return true;
    });
  }, [rawIncomes, dateRange]);

  const { data: settlementData } = useSettlements();
  const rawSettlements = settlementData?.settlements ?? [];

  const filteredSettlements = React.useMemo(() => {
    return rawSettlements.filter((set) => {
      if (dateRange !== 'all-time') {
        const setDate = new Date(set.createdAt);
        const now = new Date();
        if (dateRange === 'this-month') {
          if (setDate.getMonth() !== now.getMonth() || setDate.getFullYear() !== now.getFullYear())
            return false;
        } else if (dateRange === 'last-month') {
          const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          if (
            setDate.getMonth() !== lastMonth.getMonth() ||
            setDate.getFullYear() !== lastMonth.getFullYear()
          )
            return false;
        } else if (dateRange === 'last-7-days') {
          const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          if (setDate < sevenDaysAgo) return false;
        } else if (dateRange === 'last-30-days') {
          const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          if (setDate < thirtyDaysAgo) return false;
        } else if (dateRange.startsWith('month-')) {
          const parts = dateRange.replace('month-', '').split('-');
          const year = parseInt(parts[0], 10);
          const month = parseInt(parts[1], 10) - 1;
          if (setDate.getFullYear() !== year || setDate.getMonth() !== month) return false;
        }
      }
      return true;
    });
  }, [rawSettlements, dateRange]);

  type ActivityFeedItem =
    | {
        kind: 'expense';
        id: string;
        date: string;
        amount: number;
        item: (typeof sortedExpenses)[0];
      }
    | { kind: 'income'; id: string; date: string; amount: number; item: Income }
    | { kind: 'settlement'; id: string; date: string; amount: number; item: Settlement };

  const combinedActivityFeed = React.useMemo(() => {
    const expensesList: ActivityFeedItem[] = sortedExpenses.map((e) => ({
      kind: 'expense' as const,
      id: e.id,
      date: e.date,
      amount: e.amount,
      item: e,
    }));
    const incomesList: ActivityFeedItem[] = filteredIncomes.map((i) => ({
      kind: 'income' as const,
      id: i.id,
      date: i.date,
      amount: i.amount,
      item: i,
    }));
    const settlementsList: ActivityFeedItem[] = filteredSettlements.map((s) => ({
      kind: 'settlement' as const,
      id: s.id,
      date: s.createdAt,
      amount: s.amount,
      item: s,
    }));

    const list = [...expensesList, ...incomesList, ...settlementsList];
    list.sort((a, b) => {
      const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime();
      if (dateDiff !== 0) return dateDiff;
      const createdA =
        'item' in a && a.item && 'createdAt' in a.item
          ? new Date(a.item.createdAt as string | Date).getTime()
          : 0;
      const createdB =
        'item' in b && b.item && 'createdAt' in b.item
          ? new Date(b.item.createdAt as string | Date).getTime()
          : 0;
      return createdB - createdA;
    });
    return list;
  }, [sortedExpenses, filteredIncomes, filteredSettlements]);

  // Preview feed (max 15 items on Activity tab)
  const paginatedFeed = React.useMemo(() => {
    return combinedActivityFeed.slice(0, 15);
  }, [combinedActivityFeed]);

  const handleLoadMore = React.useCallback(() => {
    if (displayLimit < combinedActivityFeed.length) {
      // More client-side items available, just bump the limit
      setDisplayLimit((prev) => prev + BATCH_SIZE);
    } else if (hasNextPage && !isFetchingNextPage) {
      // All client-side items shown, fetch next page from server
      fetchNextPage();
      setDisplayLimit((prev) => prev + BATCH_SIZE);
    }
  }, [displayLimit, combinedActivityFeed.length, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Reset display limit when date range changes
  React.useEffect(() => {
    setDisplayLimit(BATCH_SIZE);
  }, [dateRange]);

  const isCloseToBottom = ({
    layoutMeasurement,
    contentOffset,
    contentSize,
  }: NativeScrollEvent) => {
    const paddingToBottom = 50;
    return layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;
  };

  const insets = useSafeAreaInsets();

  // Quick Overview totals (handles all-time aggregate & period filtering)
  const totalExpenses = React.useMemo(() => {
    if (dateRange === 'all-time' && summaryData?.totalSpent !== undefined) {
      return summaryData.totalSpent;
    }
    return sortedExpenses.reduce((sum, e) => sum + e.amount, 0);
  }, [sortedExpenses, dateRange, summaryData]);

  const groupSpent = React.useMemo(() => {
    if (dateRange === 'all-time' && summaryData?.totalGroupSpent !== undefined) {
      return summaryData.totalGroupSpent;
    }
    return sortedExpenses.filter((e) => e.groupId !== null).reduce((sum, e) => sum + e.amount, 0);
  }, [sortedExpenses, dateRange, summaryData]);

  const totalSettled = React.useMemo(
    () => filteredSettlements.reduce((sum, s) => sum + s.amount, 0),
    [filteredSettlements]
  );
  const totalIncome = React.useMemo(
    () => filteredIncomes.reduce((sum, i) => sum + i.amount, 0),
    [filteredIncomes]
  );

  const overviewStats = [
    {
      label: 'Total Spent',
      value: totalExpenses,
      icon: 'wallet-outline' as const,
      iconLib: 'Ionicons' as const,
      color: '#F43F5E',
      iconBg: isDark ? 'rgba(244, 63, 94, 0.18)' : '#FFE4E6',
      cardBg: isDark ? 'rgba(244, 63, 94, 0.09)' : '#FFF1F2',
      borderColor: isDark ? 'rgba(244, 63, 94, 0.25)' : '#FECDD3',
    },
    {
      label: 'Group Spent',
      value: groupSpent,
      icon: 'people-outline' as const,
      iconLib: 'Ionicons' as const,
      color: '#8B5CF6',
      iconBg: isDark ? 'rgba(139, 92, 246, 0.18)' : '#EDE9FE',
      cardBg: isDark ? 'rgba(139, 92, 246, 0.09)' : '#F5F3FF',
      borderColor: isDark ? 'rgba(139, 92, 246, 0.25)' : '#DDD6FE',
    },
    {
      label: 'Settlements',
      value: totalSettled,
      icon: 'swap-horizontal-outline' as const,
      iconLib: 'Ionicons' as const,
      color: '#6366F1',
      iconBg: isDark ? 'rgba(99, 102, 241, 0.18)' : '#E0E7FF',
      cardBg: isDark ? 'rgba(99, 102, 241, 0.09)' : '#EEF2FF',
      borderColor: isDark ? 'rgba(99, 102, 241, 0.25)' : '#C7D2FE',
    },
    {
      label: 'Income',
      value: totalIncome,
      icon: 'trending-up' as const,
      iconLib: 'Ionicons' as const,
      color: '#10B981',
      iconBg: isDark ? 'rgba(16, 185, 129, 0.18)' : '#D1FAE5',
      cardBg: isDark ? 'rgba(16, 185, 129, 0.09)' : '#ECFDF5',
      borderColor: isDark ? 'rgba(16, 185, 129, 0.25)' : '#A7F3D0',
    },
  ];

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      {/* Header Bar */}
      <View
        style={[
          styles.headerContainer,
          isDark && styles.headerContainerDark,
          { paddingTop: insets.top + 16 },
        ]}
      >
        <View style={styles.headerRow}>
          <View>
            <Text style={[styles.headerTitle, isDark && styles.headerTitleDark]}>Activity</Text>
            <Text style={[styles.headerSubtitle, isDark && styles.headerSubtitleDark]}>
              Your financial overview at a glance
            </Text>
          </View>
          <View style={styles.headerRightActions}>
            {/* AI Smart Insights Button */}
            <TouchableOpacity
              style={[
                styles.headerIconBtn,
                isDark
                  ? { backgroundColor: 'rgba(139, 92, 246, 0.2)' }
                  : { backgroundColor: '#F3E8FF' },
              ]}
              activeOpacity={0.7}
              onPress={() => {
                hapticFeedback.selection();
                router.push('/total-spent');
              }}
            >
              <Ionicons name="sparkles" size={20} color="#8B5CF6" />
            </TouchableOpacity>

            {/* Analytics Button */}
            <TouchableOpacity
              style={[styles.headerIconBtn, isDark && styles.headerIconBtnDark]}
              activeOpacity={0.7}
              onPress={() => {
                hapticFeedback.selection();
                router.push('/activity-analytics');
              }}
            >
              <Ionicons
                name="bar-chart-outline"
                size={24}
                color={isDark ? '#F9FAFB' : COLORS.onSurface}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 100 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => {
              setDisplayLimit(BATCH_SIZE);
              handleRefresh();
            }}
          />
        }
        onScroll={({ nativeEvent }) => {
          if (isCloseToBottom(nativeEvent)) {
            handleLoadMore();
          }
        }}
        scrollEventThrottle={400}
      >
        {/* Top Period Selector Bar: Floating Emerald Pill with Live Pulse Dot */}
        <View style={styles.topPeriodBar}>
          <View style={[styles.durationPulsePill, isDark && styles.durationPulsePillDark]}>
            <View style={[styles.livePulseDot, isDark && styles.livePulseDotDark]} />
            <Text
              style={[styles.durationPulseText, isDark && styles.durationPulseTextDark]}
              numberOfLines={1}
            >
              {getPeriodDurationText(dateRange)}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.datePickerBtn, isDark && styles.datePickerBtnDark]}
            onPress={() => setIsPeriodDropdownOpen(!isPeriodDropdownOpen)}
            activeOpacity={0.8}
          >
            <Ionicons
              name="calendar-outline"
              size={14}
              color={isDark ? '#34D399' : COLORS.primary}
            />
            <Text style={[styles.datePickerBtnText, isDark && styles.datePickerBtnTextDark]}>
              {getDateRangeLabel(dateRange)}
            </Text>
            <Ionicons
              name={isPeriodDropdownOpen ? 'chevron-up' : 'chevron-down'}
              size={12}
              color={isDark ? '#9CA3AF' : COLORS.outline}
            />
          </TouchableOpacity>
        </View>

        {/* Quick Overview Stats */}
        {!isLoading && !isError && (
          <View style={styles.overviewSection}>
            <View style={styles.overviewGrid}>
              {overviewStats.map((stat) => (
                <View
                  key={stat.label}
                  style={[
                    styles.overviewCard,
                    {
                      backgroundColor: stat.cardBg,
                      borderColor: stat.borderColor,
                    },
                  ]}
                >
                  <View style={styles.overviewCardHeader}>
                    <View style={[styles.overviewIconBg, { backgroundColor: stat.iconBg }]}>
                      <Ionicons name={stat.icon} size={16} color={stat.color} />
                    </View>
                    <Text
                      style={[styles.overviewCardLabel, isDark && styles.overviewCardLabelDark]}
                      numberOfLines={1}
                    >
                      {stat.label}
                    </Text>
                  </View>
                  <Text style={[styles.overviewCardValue, { color: stat.color }]}>
                    {CURRENCY_SYMBOL}
                    {stat.value.toLocaleString('en-IN', {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Activity Pie & Cashflow Chart Overview */}
        <ActivityOverviewChartCard
          expenses={sortedExpenses}
          incomes={filteredIncomes}
          settlements={filteredSettlements}
          variant={variant}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
        />

        {/* Loading */}
        {isLoading && (
          <View>
            <ExpenseItemSkeleton />
            <ExpenseItemSkeleton />
            <ExpenseItemSkeleton />
            <ExpenseItemSkeleton />
            <ExpenseItemSkeleton />
            <ExpenseItemSkeleton />
          </View>
        )}

        {/* Error */}
        {isError && <ErrorView message="Failed to load expenses" onRetry={refetch} />}

        {/* Empty */}
        {!isLoading && !isError && combinedActivityFeed.length === 0 && (
          <EmptyState
            icon="receipt-long"
            iconLib="MaterialIcons"
            title="No activity yet"
            description="Add your first expense or income to start tracking!"
            ctaText="Add Expense"
            onCtaPress={() => setAddExpenseVisible(true)}
            ctaIcon="add-circle"
          />
        )}

        {/* Combined Activity List (Expenses & Income synced chronologically) */}
        {paginatedFeed.length > 0 && (
          <View style={styles.activityFeed}>
            {/* Activity Logs Header */}
            <View style={styles.activityHeaderRow}>
              <TouchableOpacity
                onPress={() => router.push({ pathname: '/activity-logs', params: { dateRange } })}
                activeOpacity={0.7}
              >
                <Text
                  style={[styles.activityHeaderTitle, isDark && styles.activityHeaderTitleDark]}
                >
                  Activity Logs
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.seeAllBtn}
                onPress={() => router.push({ pathname: '/activity-logs', params: { dateRange } })}
                activeOpacity={0.7}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={[styles.seeAllText, isDark && styles.seeAllTextDark]}>See All</Text>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={isDark ? '#34D399' : COLORS.primary}
                />
              </TouchableOpacity>
            </View>

            {(() => {
              let lastDateHeading = '';
              return paginatedFeed.map((entry) => {
                const currentHeading = getDateHeading(entry.date);
                const showHeading = currentHeading !== lastDateHeading;
                lastDateHeading = currentHeading;

                return (
                  <React.Fragment key={`${entry.kind}-${entry.id}`}>
                    {showHeading && (
                      <View
                        style={[
                          styles.dateHeaderContainer,
                          isDark && styles.dateHeaderContainerDark,
                        ]}
                      >
                        <Text style={[styles.dateHeaderText, isDark && styles.dateHeaderTextDark]}>
                          {currentHeading}
                        </Text>
                      </View>
                    )}
                    <ActivityFeedItem
                      item={
                        entry.kind === 'expense'
                          ? { type: 'expense', data: entry.item }
                          : entry.kind === 'income'
                            ? { type: 'income', data: entry.item }
                            : { type: 'settlement', data: entry.item }
                      }
                      currentUserId={user?.id}
                      variant={variant}
                      onPress={
                        entry.kind === 'income'
                          ? () => router.push(`/income/${entry.item.id}`)
                          : undefined
                      }
                    />
                  </React.Fragment>
                );
              });
            })()}
          </View>
        )}

        {/* See All Logs Bottom Button */}
        {!isLoading && !isError && combinedActivityFeed.length > 0 && (
          <View style={styles.seeAllLogsContainer}>
            <Text style={[styles.caughtUpText, isDark && styles.caughtUpTextDark]}>
              {combinedActivityFeed.length > 15
                ? `Showing 15 of ${combinedActivityFeed.length} activity logs`
                : "You're all caught up!"}
            </Text>
            <TouchableOpacity
              style={[styles.seeAllLogsBtn, isDark && styles.seeAllLogsBtnDark]}
              onPress={() =>
                router.push({
                  pathname: '/activity-logs',
                  params: { dateRange },
                })
              }
              activeOpacity={0.8}
            >
              <Text style={[styles.seeAllLogsBtnText, isDark && styles.seeAllLogsBtnTextDark]}>
                See All Logs
              </Text>
              <Ionicons
                name="arrow-forward"
                size={16}
                color={isDark ? '#34D399' : COLORS.primary}
              />
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <AddExpenseModal
        visible={addExpenseVisible}
        onClose={() => setAddExpenseVisible(false)}
        onSuccess={() => refetch()}
      />

      <AddIncomeModal
        visible={addIncomeVisible}
        onClose={() => setAddIncomeVisible(false)}
        onSuccess={() => refetch()}
        variant={variant}
      />

      {/* Export History Selection Bottom Sheet Modal */}
      <ExportModalBottomSheet
        visible={exportHook.exportModalVisible}
        onClose={() => exportHook.setExportModalVisible(false)}
        dateRange={exportHook.dateRange}
        setDateRange={exportHook.setDateRange}
        customStartDate={exportHook.customStartDate}
        setCustomStartDate={exportHook.setCustomStartDate}
        customEndDate={exportHook.customEndDate}
        setCustomEndDate={exportHook.setCustomEndDate}
        format={exportHook.format}
        setFormat={exportHook.setFormat}
        onConfirmExport={() =>
          exportHook.executeExport(sortedExpenses, user?.name || user?.email || 'User', 'activity')
        }
      />

      {/* Export Progress & Success Modal */}
      <ExportProgressAndSuccessModal
        isGenerating={exportHook.isGenerating}
        progressMessage={exportHook.progressMessage}
        successVisible={exportHook.successModalVisible}
        onCloseSuccess={() => exportHook.setSuccessModalVisible(false)}
        exportResult={exportHook.exportResult}
        onOpenFile={exportHook.handleOpenFile}
        onShareFile={exportHook.handleShareFile}
        onSaveToDownloads={exportHook.handleSaveToDownloads}
      />

      {/* Reusable Floating Dropdown Overlay Menu with built-in Month & Year sub-views */}
      <FloatingDropdownMenu
        visible={isPeriodDropdownOpen}
        onClose={() => setIsPeriodDropdownOpen(false)}
        title="Timeframe Options"
        options={PERIOD_OPTIONS}
        selectedValue={dateRange}
        isSelected={(opt) => {
          if (opt.value === 'custom_month') {
            return dateRange.startsWith('month-');
          }
          if (opt.value === 'custom_year') {
            return dateRange.startsWith('year-');
          }
          return dateRange === opt.value;
        }}
        onSelect={(opt) => {
          setDateRange(opt.value);
        }}
        variant={variant}
        topOffset={insets.top + 105}
        rightOffset={16}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  containerDark: {
    backgroundColor: '#08110F',
  },
  scrollContent: {
    paddingTop: 16,
    paddingBottom: 100,
    paddingHorizontal: 0,
  },
  headerContainer: {
    backgroundColor: COLORS.background,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  headerContainerDark: {
    backgroundColor: '#08110F',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.onSurface,
    letterSpacing: -0.5,
  },
  headerTitleDark: {
    color: '#F9FAFB',
  },
  headerSubtitle: {
    fontSize: 11,
    color: COLORS.outline,
    fontWeight: '500',
    marginTop: 2,
  },
  headerSubtitleDark: {
    color: '#6B7280',
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerIconBtn: {
    padding: 6,
    borderRadius: 8,
  },
  headerIconBtnDark: {},
  tabHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tabTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.onSurface,
    letterSpacing: -0.5,
  },
  tabSubtitle: {
    fontSize: 12,
    color: COLORS.outline,
    fontWeight: '600',
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  activeFiltersRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
    paddingHorizontal: 4,
    paddingBottom: 4,
  },
  activeFilterBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#e2dfff', // Light lavender
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#c5c1ff',
  },
  activeFilterBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.secondary,
  },

  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 48,
    borderWidth: 2, // Bold outline border
    borderColor: COLORS.primary, // Highlighted outline
    elevation: 3,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  searchIconInline: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.onSurface,
    fontWeight: '700', // Bold search query text input
    paddingVertical: 6,
  },
  clearSearchBtn: {
    padding: 4,
  },
  searchIconBtn: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    borderWidth: 1.5, // Bolder outline for buttons
    borderColor: COLORS.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  filterBtn: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    borderWidth: 1.5, // Bolder outline for buttons
    borderColor: COLORS.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  activityFeed: {},
  activityHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    marginBottom: 10,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  activityHeaderTitle: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '800',
    color: COLORS.onSurface,
  },
  activityHeaderTitleDark: {
    color: '#F9FAFB',
  },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  seeAllText: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
    color: COLORS.primary,
  },
  seeAllTextDark: {
    color: '#34D399',
  },
  loadingMore: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  loadingMoreText: {
    fontSize: 13,
    color: COLORS.outline,
    fontWeight: '500',
  },
  dateHeaderContainer: {
    backgroundColor: COLORS.surfaceContainerLow,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceContainer,
  },
  dateHeaderContainerDark: {
    backgroundColor: '#131D1A',
    borderBottomColor: '#1E292B',
  },
  dateHeaderText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.outline,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  dateHeaderTextDark: {
    color: '#34D399',
  },
  topFadeOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
  },
  // --- Quick Overview ---
  overviewSection: {
    paddingHorizontal: 16,
    marginBottom: 4,
  },
  overviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  overviewCard: {
    width: '48%',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainer,
    gap: 8,
  },
  overviewCardDark: {
    backgroundColor: '#101917',
    borderColor: '#1E292B',
  },
  overviewCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  overviewIconBg: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overviewCardLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.outline,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    flex: 1,
  },
  overviewCardLabelDark: {
    color: '#9CA3AF',
  },
  overviewCardValue: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  // --- Top Period Selector Bar ---
  topPeriodBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  durationPulsePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D1FAE5',
    gap: 7,
    maxWidth: '58%',
  },
  durationPulsePillDark: {
    backgroundColor: 'rgba(52, 211, 153, 0.1)',
    borderColor: 'rgba(52, 211, 153, 0.3)',
  },
  livePulseDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  livePulseDotDark: {
    backgroundColor: '#34D399',
  },
  durationPulseText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#047857',
  },
  durationPulseTextDark: {
    color: '#34D399',
  },
  datePickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 5,
  },
  datePickerBtnDark: {
    backgroundColor: '#131D1A',
    borderColor: '#1E292B',
  },
  datePickerBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  datePickerBtnTextDark: {
    color: '#34D399',
  },
  // --- Period Filter Modal Styles ---
  periodModalScroll: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 16,
  },
  modalSectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.outline,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 6,
    marginTop: 2,
  },
  modalSectionTitleDark: {
    color: '#9CA3AF',
  },
  pillsContainer: {
    gap: 10,
    paddingRight: 10,
    paddingBottom: 4,
  },
  pillCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceContainerLow,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainer,
  },
  pillCardDark: {
    backgroundColor: '#131D1A',
    borderColor: '#1E292B',
  },
  pillCardActive: {
    backgroundColor: COLORS.secondaryFixed + '50',
    borderColor: COLORS.secondary,
  },
  pillCardActiveDark: {
    backgroundColor: '#34D399',
    borderColor: '#34D399',
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.onSurfaceVariant,
  },
  pillTextDark: {
    color: '#9CA3AF',
  },
  pillTextActive: {
    fontWeight: '800',
    color: COLORS.secondary,
  },
  pillTextActiveDark: {
    fontWeight: '800',
    color: '#101917',
  },
  yearSelectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 4,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainer,
  },
  yearSelectorRowDark: {
    backgroundColor: '#131D1A',
    borderColor: '#1E292B',
  },
  yearNavBtn: {
    padding: 3,
  },
  yearText: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.onSurface,
  },
  yearTextDark: {
    color: '#F3F4F6',
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  monthGridCell: {
    width: '31.5%',
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: COLORS.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.surfaceContainer,
    position: 'relative',
  },
  monthGridCellDark: {
    backgroundColor: '#131D1A',
    borderColor: '#1E292B',
  },
  monthCellSelected: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
  },
  monthCellSelectedDark: {
    backgroundColor: '#34D399',
    borderColor: '#34D399',
  },
  monthCellText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  monthCellTextDark: {
    color: '#D1D5DB',
  },
  monthCellTextSelected: {
    color: '#ffffff',
    fontWeight: '800',
  },
  monthCellTextSelectedDark: {
    color: '#101917',
    fontWeight: '800',
  },
  currentMonthDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.secondary,
    position: 'absolute',
    bottom: 3,
  },
  // --- See All Logs Bottom Section ---
  seeAllLogsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 10,
    marginTop: 8,
  },
  caughtUpText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.outline,
  },
  caughtUpTextDark: {
    color: '#6B7280',
  },
  seeAllLogsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceContainerLow,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainer,
  },
  seeAllLogsBtnDark: {
    backgroundColor: '#131D1A',
    borderColor: '#1E292B',
  },
  seeAllLogsBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
  seeAllLogsBtnTextDark: {
    color: '#34D399',
  },
});
