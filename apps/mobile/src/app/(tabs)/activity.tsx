import React from 'react';
import { router } from 'expo-router';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  NativeScrollEvent,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/theme';
import { ExpenseItemSkeleton } from '../../components/ExpenseItemSkeleton';
import { AddExpenseModal } from '../../components/AddExpenseModal';
import { AddIncomeModal } from '../../components/AddIncomeModal';
import { ActivityFeedItem } from '../../module/groups/components/group-details/ActivityFeedItem';
import { ActivityOverviewChartCard } from '../../components/ActivityOverviewChartCard';
import { useTheme } from '../../context/ThemeContext';
import { ErrorView } from '../../components/ErrorView';
import { EmptyState } from '../../components/EmptyState';
import {
  useActivityController,
  useIncomes,
  useSettlements,
  type Income,
  type Settlement,
} from '@workspace/api';
import { getDateHeading } from '../../utils/date';

const BATCH_SIZE = 15;

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

  // Client-side paginated feed (15 items per batch)
  const paginatedFeed = React.useMemo(() => {
    return combinedActivityFeed.slice(0, displayLimit);
  }, [combinedActivityFeed, displayLimit]);

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

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 16, paddingBottom: 100 },
        ]}
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
              <TouchableOpacity onPress={() => router.push('/activity-logs')} activeOpacity={0.7}>
                <Text
                  style={[styles.activityHeaderTitle, isDark && styles.activityHeaderTitleDark]}
                >
                  Activity Logs
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.seeAllBtn}
                onPress={() => router.push('/activity-logs')}
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
                      <View style={styles.dateHeaderContainer}>
                        <Text style={styles.dateHeaderText}>{currentHeading}</Text>
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

        {isFetchingNextPage && (
          <View style={styles.loadingMore}>
            <ActivityIndicator size="small" color={COLORS.primary} />
            <Text style={styles.loadingMoreText}>Loading more...</Text>
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
    paddingTop: 12,
    paddingBottom: 100,
    paddingHorizontal: 0,
  },
  headerContainer: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f1f1',
  },
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
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
  dateHeaderText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.outline,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  topFadeOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
  },
});
