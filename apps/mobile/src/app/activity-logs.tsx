import React, { useState, useMemo, useCallback } from 'react';
import { router } from 'expo-router';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Modal,
  ActivityIndicator,
  NativeScrollEvent,
  TextInput,
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../constants/theme';
import { ExpenseItemSkeleton } from '../components/ExpenseItemSkeleton';
import { AddExpenseModal } from '../components/AddExpenseModal';
import { AddIncomeModal } from '../components/AddIncomeModal';
import { ActivityFeedItem } from '../module/groups/components/group-details/ActivityFeedItem';
import { getDateRangeLabel } from '../components/ActivityOverviewChartCard';
import { useTheme } from '../context/ThemeContext';
import { ErrorView } from '../components/ErrorView';
import { EmptyState } from '../components/EmptyState';
import { getCategoryVisuals } from '../constants/categories';
import {
  useMe,
  useExpenses,
  useIncomes,
  useSettlements,
  useCategories,
  type ExpenseCategory,
  type Income,
  type Settlement,
} from '@workspace/api';
import { getDateHeading } from '../utils/date';
import { useExport } from '../hooks/useExport';
import { ExportModalBottomSheet } from '../components/ExportModalBottomSheet';
import { ExportProgressAndSuccessModal } from '../components/ExportProgressAndSuccessModal';
import { hapticFeedback } from '../utils/haptics';
import { BottomSheetModal } from '../components/BottomSheetModal';

const DATE_RANGE_OPTIONS = [
  { label: 'All Time', value: 'all-time', icon: 'infinite-outline' },
  { label: 'This Month', value: 'this-month', icon: 'calendar-number-outline' },
  { label: 'Last Month', value: 'last-month', icon: 'play-back-outline' },
  { label: 'Last 7 Days', value: 'last-7-days', icon: 'time-outline' },
  { label: 'Last 30 Days', value: 'last-30-days', icon: 'timer-outline' },
  { label: 'Select Year', value: 'select-year', icon: 'ribbon-outline' },
] as const;

const SORT_OPTIONS = [
  { label: 'Date: Newest First', value: 'date-desc', icon: 'calendar-outline' },
  { label: 'Date: Oldest First', value: 'date-asc', icon: 'time-outline' },
  { label: 'Amount: Low to High', value: 'amount-asc', icon: 'trending-up-outline' },
  { label: 'Amount: High to Low', value: 'amount-desc', icon: 'trending-down-outline' },
] as const;

export default function ActivityLogsScreen() {
  const { isDark } = useTheme();
  const variant = isDark ? 'dark' : 'light';
  const exportHook = useExport();

  const { data: categoriesData } = useCategories();
  const customCategories = useMemo(() => categoriesData?.custom || [], [categoriesData]);

  const filterTabs = useMemo(() => {
    const baseTabs: Array<{ label: string; value: string }> = [
      { label: 'All Categories', value: 'All' },
      { label: 'Food', value: 'Food' },
      { label: 'Transport', value: 'Transport' },
      { label: 'Shopping', value: 'Shopping' },
      { label: 'Bills', value: 'Bills' },
      { label: 'Travel', value: 'Travel' },
      { label: 'Health', value: 'Health' },
      { label: 'Other', value: 'Other' },
    ];

    const baseSet = new Set(baseTabs.map((t) => t.value));
    const dynamicTabs = customCategories
      .filter((c) => !baseSet.has(c.name))
      .map((c) => ({ label: c.name, value: c.name }));

    return [...baseTabs, ...dynamicTabs];
  }, [customCategories]);

  const { data: user } = useMe();
  const [addExpenseVisible, setAddExpenseVisible] = useState(false);
  const [addIncomeVisible, setAddIncomeVisible] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [activeFilter, setActiveFilter] = useState<ExpenseCategory | 'All'>('All');
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [dateRange, setDateRange] = useState<string>('all-time');
  const [isDateRangeDropdownOpen, setIsDateRangeDropdownOpen] = useState(false);
  const [paidByMe, setPaidByMe] = useState(false);
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'amount-asc' | 'amount-desc'>(
    'date-desc'
  );
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const [useWalletOnly, setUseWalletOnly] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isYearPickerOpen, setIsYearPickerOpen] = useState(false);

  const currentYear = new Date().getFullYear();
  const yearOptions = useMemo(() => {
    const list = [];
    for (let y = 2000; y <= 2100; y++) {
      list.push(y);
    }
    return list;
  }, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const dateFilter = useMemo(() => {
    if (dateRange === 'all-time') return {};
    const now = new Date();
    let start = new Date();
    let end = new Date();

    if (dateRange === 'this-month') {
      start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    } else if (dateRange === 'last-month') {
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
      end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
    } else if (dateRange === 'last-7-days') {
      start.setDate(now.getDate() - 7);
    } else if (dateRange === 'last-30-days') {
      start.setDate(now.getDate() - 30);
    } else if (dateRange.startsWith('month-')) {
      const parts = dateRange.replace('month-', '').split('-');
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      if (!isNaN(year) && !isNaN(month)) {
        start = new Date(year, month, 1, 0, 0, 0, 0);
        end = new Date(year, month + 1, 0, 23, 59, 59, 999);
      }
    } else if (dateRange.startsWith('year-')) {
      const yr = parseInt(dateRange.replace('year-', ''), 10);
      if (!isNaN(yr)) {
        start = new Date(yr, 0, 1, 0, 0, 0, 0);
        end = new Date(yr, 11, 31, 23, 59, 59, 999);
      }
    }

    return {
      startDate: start.toISOString(),
      endDate: end.toISOString(),
    };
  }, [dateRange]);

  const {
    data: expensesData,
    isLoading,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useExpenses({
    limit: 15,
    ...(activeFilter !== 'All' && { category: activeFilter }),
    ...(paidByMe && { paidByMe: true }),
    ...(useWalletOnly && { useWallet: true }),
    ...(debouncedSearchQuery.trim() !== '' && { search: debouncedSearchQuery.trim() }),
    ...dateFilter,
  });

  const sortedExpenses = useMemo(() => {
    const expenses = expensesData?.pages.flatMap((page) => page.expenses) ?? [];
    return [...expenses].sort((a, b) => {
      if (sortBy === 'date-desc') {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      if (sortBy === 'date-asc') {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      }
      if (sortBy === 'amount-asc') {
        return a.amount - b.amount;
      }
      if (sortBy === 'amount-desc') {
        return b.amount - a.amount;
      }
      return 0;
    });
  }, [expensesData, sortBy]);

  const handleResetAll = useCallback(() => {
    setActiveFilter('All');
    setDateRange('all-time');
    setPaidByMe(false);
    setUseWalletOnly(false);
    setSortBy('date-desc');
    setIsCategoryDropdownOpen(false);
    setIsDateRangeDropdownOpen(false);
    setIsSortDropdownOpen(false);
    setFilterModalVisible(false);
  }, []);

  // Pagination count: 15 items per batch
  const BATCH_SIZE = 15;
  const [displayLimit, setDisplayLimit] = useState<number>(BATCH_SIZE);

  // Reset display limit when filters change
  React.useEffect(() => {
    setDisplayLimit(BATCH_SIZE);
  }, [dateRange, activeFilter, sortBy, paidByMe, useWalletOnly, debouncedSearchQuery]);

  const { data: incomeData } = useIncomes();
  const rawIncomes = incomeData?.incomes ?? [];

  const filteredIncomes = useMemo(() => {
    if (useWalletOnly || paidByMe) return [];
    if (activeFilter !== 'All') return [];

    return rawIncomes.filter((inc) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchSource = inc.source.toLowerCase().includes(q);
        const matchNotes = inc.notes ? inc.notes.toLowerCase().includes(q) : false;
        const matchMethod = inc.paymentMethod ? inc.paymentMethod.toLowerCase().includes(q) : false;
        if (!matchSource && !matchNotes && !matchMethod) return false;
      }
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
        } else if (dateRange.startsWith('year-')) {
          const yr = parseInt(dateRange.replace('year-', ''), 10);
          if (incDate.getFullYear() !== yr) return false;
        } else if (dateRange.startsWith('month-')) {
          const parts = dateRange.replace('month-', '').split('-');
          const year = parseInt(parts[0], 10);
          const month = parseInt(parts[1], 10) - 1;
          if (incDate.getFullYear() !== year || incDate.getMonth() !== month) return false;
        }
      }
      return true;
    });
  }, [rawIncomes, activeFilter, useWalletOnly, paidByMe, searchQuery, dateRange]);

  const { data: settlementData } = useSettlements();
  const rawSettlements = settlementData?.settlements ?? [];

  const filteredSettlements = useMemo(() => {
    if (useWalletOnly || paidByMe) return [];
    if (activeFilter !== 'All') return [];

    return rawSettlements.filter((set) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const fromName = set.from?.name?.toLowerCase() || '';
        const toName = set.to?.name?.toLowerCase() || '';
        if (!fromName.includes(q) && !toName.includes(q)) return false;
      }
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
        } else if (dateRange.startsWith('year-')) {
          const yr = parseInt(dateRange.replace('year-', ''), 10);
          if (setDate.getFullYear() !== yr) return false;
        } else if (dateRange.startsWith('month-')) {
          const parts = dateRange.replace('month-', '').split('-');
          const year = parseInt(parts[0], 10);
          const month = parseInt(parts[1], 10) - 1;
          if (setDate.getFullYear() !== year || setDate.getMonth() !== month) return false;
        }
      }
      return true;
    });
  }, [rawSettlements, activeFilter, useWalletOnly, paidByMe, searchQuery, dateRange]);

  type ActivityFeedItemType =
    | {
        kind: 'expense';
        id: string;
        date: string;
        amount: number;
        item: (typeof sortedExpenses)[0];
      }
    | { kind: 'income'; id: string; date: string; amount: number; item: Income }
    | { kind: 'settlement'; id: string; date: string; amount: number; item: Settlement };

  // Full mixed activity feed
  const fullActivityFeed = useMemo(() => {
    const expensesList: ActivityFeedItemType[] = sortedExpenses.map((e) => ({
      kind: 'expense' as const,
      id: e.id,
      date: e.date,
      amount: e.amount,
      item: e,
    }));
    const incomesList: ActivityFeedItemType[] = filteredIncomes.map((i) => ({
      kind: 'income' as const,
      id: i.id,
      date: i.date,
      amount: i.amount,
      item: i,
    }));
    const settlementsList: ActivityFeedItemType[] = filteredSettlements.map((s) => ({
      kind: 'settlement' as const,
      id: s.id,
      date: s.createdAt,
      amount: s.amount,
      item: s,
    }));

    const list = [...expensesList, ...incomesList, ...settlementsList];

    if (sortBy === 'date-desc') {
      list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } else if (sortBy === 'date-asc') {
      list.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    } else if (sortBy === 'amount-desc') {
      list.sort((a, b) => b.amount - a.amount);
    } else if (sortBy === 'amount-asc') {
      list.sort((a, b) => a.amount - b.amount);
    }
    return list;
  }, [sortedExpenses, filteredIncomes, filteredSettlements, sortBy]);

  // Paginated feed (15 items per batch step)
  const paginatedFeed = useMemo(() => {
    return fullActivityFeed.slice(0, displayLimit);
  }, [fullActivityFeed, displayLimit]);

  // Mapped activity items for export
  const exportItems = useMemo(() => {
    return fullActivityFeed.map((entry) => {
      if (entry.kind === 'expense') {
        return {
          id: entry.id,
          title: entry.item.title || 'Expense',
          amount: entry.amount,
          category: entry.item.category || 'Other',
          date: entry.date,
          notes: entry.item.notes || '',
          type: 'PERSONAL' as const,
        };
      } else if (entry.kind === 'income') {
        return {
          id: entry.id,
          title: entry.item.notes || entry.item.source || 'Income',
          amount: entry.amount,
          category: entry.item.source || 'Income',
          date: entry.date,
          notes: entry.item.notes || '',
          type: 'PERSONAL' as const,
        };
      } else {
        return {
          id: entry.id,
          title: `Settlement (${entry.item.from?.name || 'User'} -> ${entry.item.to?.name || 'User'})`,
          amount: entry.amount,
          category: 'Settlement',
          date: entry.date,
          notes: 'Settlement',
          type: 'PERSONAL' as const,
        };
      }
    });
  }, [fullActivityFeed]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    setDisplayLimit(BATCH_SIZE);
    await refetch();
    setIsRefreshing(false);
  }, [refetch]);

  const handleLoadMore = useCallback(() => {
    if (displayLimit < fullActivityFeed.length) {
      setDisplayLimit((prev) => prev + BATCH_SIZE);
    } else if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
      setDisplayLimit((prev) => prev + BATCH_SIZE);
    }
  }, [displayLimit, fullActivityFeed.length, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const isCloseToBottom = ({
    layoutMeasurement,
    contentOffset,
    contentSize,
  }: NativeScrollEvent) => {
    const paddingToBottom = 50;
    return layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;
  };

  const insets = useSafeAreaInsets();
  const isFiltered =
    activeFilter !== 'All' ||
    sortBy !== 'date-desc' ||
    paidByMe ||
    useWalletOnly ||
    dateRange !== 'all-time';

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      {/* Header Bar */}
      <View style={[styles.headerContainer, { paddingTop: insets.top + 12 }]}>
        <View style={styles.tabHeaderRow}>
          <View style={styles.headerLeftRow}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backBtn}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={24} color={isDark ? '#F3F4F6' : COLORS.onSurface} />
            </TouchableOpacity>
            <View>
              <Text style={[styles.tabTitle, isDark && styles.tabTitleDark]}>Activity Logs</Text>
            </View>
          </View>

          <View style={styles.headerRightActions}>
            {/* Analytics Icon Button */}
            <TouchableOpacity
              style={styles.iconBtn}
              activeOpacity={0.7}
              onPress={() => {
                hapticFeedback.selection();
                router.push('/activity-analytics');
              }}
            >
              <Ionicons
                name="bar-chart-outline"
                size={24}
                color={isDark ? '#F3F4F6' : COLORS.onSurface}
              />
            </TouchableOpacity>

            {/* Filter Icon Button */}
            <TouchableOpacity
              style={[styles.iconBtn, isFiltered && styles.filterBtnActive]}
              onPress={() => {
                hapticFeedback.selection();
                setFilterModalVisible(true);
              }}
              activeOpacity={0.7}
            >
              <Ionicons
                name="options-outline"
                size={24}
                color={isFiltered ? COLORS.primary : isDark ? '#F3F4F6' : COLORS.onSurface}
              />
            </TouchableOpacity>

            {/* Download / Export Icon Button */}
            <TouchableOpacity
              style={styles.iconBtn}
              activeOpacity={0.7}
              onPress={() => {
                hapticFeedback.selection();
                exportHook.setExportModalVisible(true);
              }}
            >
              <Ionicons
                name="download-outline"
                size={26}
                color={isDark ? '#F3F4F6' : COLORS.onSurface}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Input Box */}
        <View style={[styles.alwaysSearchContainer, isDark && styles.alwaysSearchContainerDark]}>
          <Ionicons
            name="search-outline"
            size={22}
            color={isDark ? 'rgba(255, 255, 255, 0.45)' : COLORS.outline}
            style={{ marginRight: 10 }}
          />
          <TextInput
            style={[styles.alwaysSearchInput, isDark && { color: '#ffffff' }]}
            placeholder="Search transactions & activity..."
            placeholderTextColor={isDark ? 'rgba(255, 255, 255, 0.45)' : COLORS.outline}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.trim().length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons
                name="close-circle"
                size={18}
                color={isDark ? 'rgba(255, 255, 255, 0.45)' : COLORS.outline}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Active Filters Bar */}
        {isFiltered && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.activeFiltersRow}
          >
            {dateRange !== 'all-time' && (
              <View style={styles.activeFilterBadge}>
                <Text style={styles.activeFilterBadgeText}>
                  {dateRange.startsWith('year-')
                    ? `Year ${dateRange.replace('year-', '')}`
                    : getDateRangeLabel(dateRange)}
                </Text>
                <TouchableOpacity onPress={() => setDateRange('all-time')}>
                  <Ionicons name="close-circle" size={14} color={COLORS.primary} />
                </TouchableOpacity>
              </View>
            )}
            {activeFilter !== 'All' && (
              <View style={styles.activeFilterBadge}>
                <Text style={styles.activeFilterBadgeText}>{activeFilter}</Text>
                <TouchableOpacity onPress={() => setActiveFilter('All')}>
                  <Ionicons name="close-circle" size={14} color={COLORS.primary} />
                </TouchableOpacity>
              </View>
            )}
            {useWalletOnly && (
              <View style={styles.activeFilterBadge}>
                <Text style={styles.activeFilterBadgeText}>Wallet</Text>
                <TouchableOpacity onPress={() => setUseWalletOnly(false)}>
                  <Ionicons name="close-circle" size={14} color={COLORS.primary} />
                </TouchableOpacity>
              </View>
            )}
            {sortBy !== 'date-desc' && (
              <View style={styles.activeFilterBadge}>
                <Text style={styles.activeFilterBadgeText}>
                  {sortBy === 'date-asc'
                    ? 'Oldest'
                    : sortBy === 'amount-asc'
                      ? 'Amount: Low-High'
                      : 'Amount: High-Low'}
                </Text>
                <TouchableOpacity onPress={() => setSortBy('date-desc')}>
                  <Ionicons name="close-circle" size={14} color={COLORS.primary} />
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        )}
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
        onScroll={({ nativeEvent }) => {
          if (isCloseToBottom(nativeEvent)) {
            handleLoadMore();
          }
        }}
        scrollEventThrottle={400}
      >
        {/* Loading */}
        {isLoading && (
          <View>
            <ExpenseItemSkeleton />
            <ExpenseItemSkeleton />
            <ExpenseItemSkeleton />
            <ExpenseItemSkeleton />
            <ExpenseItemSkeleton />
          </View>
        )}

        {/* Error */}
        {isError && <ErrorView message="Failed to load activity logs" onRetry={refetch} />}

        {/* Empty */}
        {!isLoading && !isError && paginatedFeed.length === 0 && (
          <EmptyState
            icon="receipt-long"
            iconLib="MaterialIcons"
            title="No activity logs found"
            description={
              activeFilter !== 'All' || searchQuery.trim()
                ? 'No transactions match your search or filters.'
                : 'No transactions recorded for the selected period.'
            }
            ctaText={activeFilter === 'All' ? 'Add Expense' : undefined}
            onCtaPress={activeFilter === 'All' ? () => setAddExpenseVisible(true) : undefined}
            ctaIcon="add-circle"
          />
        )}

        {/* Mixed Activity Feed (15 items per batch) */}
        {paginatedFeed.length > 0 && (
          <View style={styles.activityFeed}>
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

        {(isFetchingNextPage || displayLimit < fullActivityFeed.length) && (
          <View style={styles.loadingMore}>
            <ActivityIndicator size="small" color={COLORS.primary} />
            <Text style={styles.loadingMoreText}>Loading more logs...</Text>
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

      {/* Filter Modal */}
      <Modal
        animationType="slide"
        transparent
        visible={filterModalVisible}
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setFilterModalVisible(false)}
          />
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filters & Sort</Text>
              <TouchableOpacity
                onPress={() => setFilterModalVisible(false)}
                style={styles.modalCloseBtn}
              >
                <Ionicons name="close" size={22} color={COLORS.onSurface} />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modalScrollContent}
            >
              {/* Category Section */}
              <Text style={styles.modalSectionTitle}>Filter by Category</Text>
              <View style={styles.dropdownContainer}>
                <TouchableOpacity
                  style={styles.dropdownHeader}
                  onPress={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                  activeOpacity={0.8}
                >
                  <View style={styles.dropdownHeaderLeft}>
                    <View
                      style={[
                        styles.dropdownHeaderIcon,
                        { backgroundColor: getCategoryVisuals(activeFilter, customCategories).bg },
                      ]}
                    >
                      {getCategoryVisuals(activeFilter, customCategories).lib === 'Ionicons' ? (
                        <Ionicons
                          name={getCategoryVisuals(activeFilter, customCategories).icon as never}
                          size={18}
                          color={getCategoryVisuals(activeFilter, customCategories).color}
                        />
                      ) : (
                        <MaterialIcons
                          name={getCategoryVisuals(activeFilter, customCategories).icon as never}
                          size={18}
                          color={getCategoryVisuals(activeFilter, customCategories).color}
                        />
                      )}
                    </View>
                    <Text style={styles.dropdownHeaderText}>
                      {filterTabs.find((t) => t.value === activeFilter)?.label || 'All Categories'}
                    </Text>
                  </View>
                  <Ionicons
                    name={isCategoryDropdownOpen ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color={COLORS.outline}
                  />
                </TouchableOpacity>

                {isCategoryDropdownOpen && (
                  <View style={styles.dropdownList}>
                    {filterTabs.map((tab) => {
                      const isSelected = activeFilter === tab.value;
                      const cfg = getCategoryVisuals(tab.value, customCategories);
                      return (
                        <TouchableOpacity
                          key={tab.value}
                          style={[styles.dropdownItem, isSelected && styles.dropdownItemActive]}
                          onPress={() => {
                            setActiveFilter(tab.value as ExpenseCategory);
                            setIsCategoryDropdownOpen(false);
                          }}
                          activeOpacity={0.8}
                        >
                          <View style={styles.dropdownItemLeft}>
                            <View style={[styles.dropdownItemIcon, { backgroundColor: cfg.bg }]}>
                              {cfg.lib === 'Ionicons' ? (
                                <Ionicons name={cfg.icon as never} size={16} color={cfg.color} />
                              ) : (
                                <MaterialIcons
                                  name={cfg.icon as never}
                                  size={16}
                                  color={cfg.color}
                                />
                              )}
                            </View>
                            <Text
                              style={[
                                styles.dropdownItemLabel,
                                isSelected && styles.dropdownItemLabelActive,
                              ]}
                            >
                              {tab.label}
                            </Text>
                          </View>
                          {isSelected && (
                            <Ionicons name="checkmark-sharp" size={18} color={COLORS.primary} />
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </View>

              {/* Date Range Section */}
              <Text style={styles.modalSectionTitle}>Date Range</Text>
              <View style={styles.dropdownContainer}>
                <TouchableOpacity
                  style={styles.dropdownHeader}
                  onPress={() => setIsDateRangeDropdownOpen(!isDateRangeDropdownOpen)}
                  activeOpacity={0.8}
                >
                  <View style={styles.dropdownHeaderLeft}>
                    <View
                      style={[
                        styles.dropdownHeaderIcon,
                        { backgroundColor: COLORS.secondaryFixed },
                      ]}
                    >
                      <Ionicons
                        name={
                          (dateRange.startsWith('year-')
                            ? 'ribbon-outline'
                            : DATE_RANGE_OPTIONS.find((o) => o.value === dateRange)?.icon ||
                              'calendar-outline') as never
                        }
                        size={18}
                        color={COLORS.secondary}
                      />
                    </View>
                    <Text style={styles.dropdownHeaderText}>
                      {dateRange.startsWith('year-')
                        ? `Year ${dateRange.replace('year-', '')}`
                        : DATE_RANGE_OPTIONS.find((o) => o.value === dateRange)?.label ||
                          getDateRangeLabel(dateRange)}
                    </Text>
                  </View>
                  <Ionicons
                    name={isDateRangeDropdownOpen ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color={COLORS.outline}
                  />
                </TouchableOpacity>

                {isDateRangeDropdownOpen && (
                  <View style={styles.dropdownList}>
                    {DATE_RANGE_OPTIONS.map((opt) => {
                      const isSelected =
                        dateRange === opt.value ||
                        (opt.value === 'select-year' && dateRange.startsWith('year-'));
                      return (
                        <TouchableOpacity
                          key={opt.value}
                          style={[styles.dropdownItem, isSelected && styles.dropdownItemActive]}
                          onPress={() => {
                            if (opt.value === 'select-year') {
                              setIsDateRangeDropdownOpen(false);
                              setFilterModalVisible(false);
                              setTimeout(() => setIsYearPickerOpen(true), 350);
                            } else {
                              setDateRange(opt.value);
                              setIsDateRangeDropdownOpen(false);
                            }
                          }}
                          activeOpacity={0.8}
                        >
                          <View style={styles.dropdownItemLeft}>
                            <View
                              style={[
                                styles.dropdownItemIcon,
                                { backgroundColor: COLORS.secondaryFixed },
                              ]}
                            >
                              <Ionicons
                                name={opt.icon as never}
                                size={16}
                                color={COLORS.secondary}
                              />
                            </View>
                            <Text
                              style={[
                                styles.dropdownItemLabel,
                                isSelected && styles.dropdownItemLabelActive,
                              ]}
                            >
                              {opt.label}
                            </Text>
                          </View>
                          {isSelected && (
                            <Ionicons name="checkmark-sharp" size={18} color={COLORS.primary} />
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </View>

              {/* Sorting Section */}
              <Text style={styles.modalSectionTitle}>Sort By</Text>
              <View style={styles.dropdownContainer}>
                <TouchableOpacity
                  style={styles.dropdownHeader}
                  onPress={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                  activeOpacity={0.8}
                >
                  <View style={styles.dropdownHeaderLeft}>
                    <View
                      style={[styles.dropdownHeaderIcon, { backgroundColor: COLORS.tertiaryFixed }]}
                    >
                      <Ionicons
                        name={SORT_OPTIONS.find((o) => o.value === sortBy)?.icon as never}
                        size={18}
                        color={COLORS.tertiary}
                      />
                    </View>
                    <Text style={styles.dropdownHeaderText}>
                      {SORT_OPTIONS.find((o) => o.value === sortBy)?.label}
                    </Text>
                  </View>
                  <Ionicons
                    name={isSortDropdownOpen ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color={COLORS.outline}
                  />
                </TouchableOpacity>

                {isSortDropdownOpen && (
                  <View style={styles.dropdownList}>
                    {SORT_OPTIONS.map((opt) => {
                      const isSelected = sortBy === opt.value;
                      return (
                        <TouchableOpacity
                          key={opt.value}
                          style={[styles.dropdownItem, isSelected && styles.dropdownItemActive]}
                          onPress={() => {
                            setSortBy(opt.value);
                            setIsSortDropdownOpen(false);
                          }}
                          activeOpacity={0.8}
                        >
                          <View style={styles.dropdownItemLeft}>
                            <View
                              style={[
                                styles.dropdownItemIcon,
                                { backgroundColor: COLORS.tertiaryFixed },
                              ]}
                            >
                              <Ionicons
                                name={opt.icon as never}
                                size={16}
                                color={COLORS.tertiary}
                              />
                            </View>
                            <Text
                              style={[
                                styles.dropdownItemLabel,
                                isSelected && styles.dropdownItemLabelActive,
                              ]}
                            >
                              {opt.label}
                            </Text>
                          </View>
                          {isSelected && (
                            <Ionicons name="checkmark-sharp" size={18} color={COLORS.primary} />
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </View>

              {/* Payment Filter Section */}
              <Text style={styles.modalSectionTitle}>Payment</Text>
              <View style={styles.sortList}>
                <TouchableOpacity
                  style={[styles.sortItem, paidByMe && styles.sortItemActive]}
                  onPress={() => setPaidByMe(!paidByMe)}
                  activeOpacity={0.7}
                >
                  <View style={styles.sortItemLeft}>
                    <Ionicons
                      name="person"
                      size={18}
                      color={paidByMe ? COLORS.primary : COLORS.outline}
                    />
                    <Text style={[styles.sortItemLabel, paidByMe && styles.sortItemLabelActive]}>
                      Paid by me
                    </Text>
                  </View>
                  {paidByMe && <Ionicons name="checkmark-sharp" size={18} color={COLORS.primary} />}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.sortItem, useWalletOnly && styles.sortItemActive]}
                  onPress={() => setUseWalletOnly(!useWalletOnly)}
                  activeOpacity={0.7}
                >
                  <View style={styles.sortItemLeft}>
                    <Ionicons
                      name="wallet"
                      size={18}
                      color={useWalletOnly ? COLORS.primary : COLORS.outline}
                    />
                    <Text
                      style={[styles.sortItemLabel, useWalletOnly && styles.sortItemLabelActive]}
                    >
                      Paid via Wallet
                    </Text>
                  </View>
                  {useWalletOnly && (
                    <Ionicons name="checkmark-sharp" size={18} color={COLORS.primary} />
                  )}
                </TouchableOpacity>
              </View>

              {/* Action Buttons */}
              <View style={styles.modalActionsRow}>
                <TouchableOpacity
                  style={styles.modalResetBtn}
                  onPress={handleResetAll}
                  activeOpacity={0.7}
                >
                  <Text style={styles.modalResetBtnText}>Reset All</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalApplyBtn}
                  onPress={() => setFilterModalVisible(false)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.modalApplyBtnText}>Apply</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

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
          exportHook.executeExport(exportItems, user?.name || user?.email || 'User', 'activity')
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

      {/* Select Year Modal */}
      <BottomSheetModal
        visible={isYearPickerOpen}
        onClose={() => setIsYearPickerOpen(false)}
        title="Select Year"
        description={`Choose a year from 2000 to ${currentYear} (future years disabled)`}
        variant={isDark ? 'dark' : 'light'}
      >
        <ScrollView style={{ maxHeight: 340 }} showsVerticalScrollIndicator={true}>
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: 10,
              paddingVertical: 12,
              justifyContent: 'space-between',
            }}
          >
            {yearOptions.map((year) => {
              const isFutureYear = year > currentYear;
              const isSelected = dateRange === `year-${year}`;
              return (
                <TouchableOpacity
                  key={year}
                  disabled={isFutureYear}
                  style={[
                    {
                      width: '30%',
                      paddingVertical: 14,
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 14,
                      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#F9FAFB',
                      borderWidth: 1,
                      borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E5E7EB',
                    },
                    isFutureYear && {
                      opacity: 0.3,
                      backgroundColor: isDark ? '#111816' : '#F3F4F6',
                    },
                    isSelected && { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
                  ]}
                  onPress={() => {
                    if (isFutureYear) return;
                    hapticFeedback.selection();
                    setDateRange(`year-${year}`);
                    setIsYearPickerOpen(false);
                  }}
                  activeOpacity={0.75}
                >
                  <Text
                    style={[
                      {
                        fontSize: 15,
                        fontWeight: '700',
                        color: isDark ? '#ffffff' : COLORS.onSurface,
                      },
                      isFutureYear && { color: isDark ? '#4B5563' : COLORS.outline },
                      isSelected && { color: '#ffffff', fontWeight: '800' },
                    ]}
                  >
                    {year}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </BottomSheetModal>
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
  headerContainer: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f1f1',
  },
  tabHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backBtn: {
    padding: 4,
  },
  tabTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.onSurface,
    letterSpacing: -0.3,
  },
  tabTitleDark: {
    color: '#F9FAFB',
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  iconBtn: {
    padding: 8,
    borderRadius: 12,
  },
  filterBtnActive: {
    backgroundColor: '#e2dfff',
  },
  alwaysSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginTop: 8,
    minHeight: 50,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainer,
  },
  alwaysSearchContainerDark: {
    backgroundColor: '#101917',
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  alwaysSearchInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.onSurface,
    padding: 0,
  },
  activeFiltersRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
    paddingHorizontal: 2,
  },
  activeFilterBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#e2dfff',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#c5c1ff',
  },
  activeFilterBadgeText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: COLORS.primary,
  },
  scrollContent: {
    paddingTop: 0,
    paddingBottom: 40,
  },
  activityFeed: {
    paddingTop: 0,
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalSheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 34,
    maxHeight: '80%',
  },
  modalHandle: {
    width: 36,
    height: 4,
    backgroundColor: COLORS.outlineVariant,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalScrollContent: {
    paddingBottom: 16,
  },
  modalSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.onSurface,
    marginTop: 12,
    marginBottom: 8,
  },
  dropdownContainer: {
    marginBottom: 12,
  },
  dropdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  dropdownHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dropdownHeaderIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropdownHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.onSurface,
  },
  dropdownList: {
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: 12,
    marginTop: 4,
    overflow: 'hidden',
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceContainer,
  },
  dropdownItemActive: {
    backgroundColor: COLORS.secondaryFixed,
  },
  dropdownItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dropdownItemIcon: {
    width: 28,
    height: 28,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropdownItemLabel: {
    fontSize: 14,
    color: COLORS.onSurface,
    fontWeight: '500',
  },
  dropdownItemLabelActive: {
    fontWeight: '700',
    color: COLORS.primary,
  },
  sortList: {
    gap: 8,
    marginBottom: 16,
  },
  sortItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  sortItemActive: {
    backgroundColor: COLORS.primaryFixed,
  },
  sortItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sortItemLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.onSurface,
  },
  sortItemLabelActive: {
    fontWeight: '700',
    color: COLORS.primary,
  },
  modalActionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  modalResetBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    alignItems: 'center',
  },
  modalResetBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.onSurface,
  },
  modalApplyBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
  },
  modalApplyBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
});
