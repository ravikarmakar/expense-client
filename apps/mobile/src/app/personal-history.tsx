import React, { useState, useMemo, useCallback } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
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
import { ExpenseItem } from '../components/ExpenseItem';
import { ExpenseItemSkeleton } from '../components/ExpenseItemSkeleton';
import { AddExpenseModal } from '../components/AddExpenseModal';
import { getDateRangeLabel } from '../components/ActivityOverviewChartCard';
import { useTheme } from '../context/ThemeContext';
import { ErrorView } from '../components/ErrorView';
import { EmptyState } from '../components/EmptyState';
import { getCategoryVisuals } from '../constants/categories';
import { useMe, useExpenses, useCategories, type ExpenseCategory } from '@workspace/api';
import { getDateHeading } from '../utils/date';
import { useExport } from '../hooks/useExport';
import { ExportModalBottomSheet } from '../components/ExportModalBottomSheet';
import { ExportProgressAndSuccessModal } from '../components/ExportProgressAndSuccessModal';

const DATE_RANGE_OPTIONS = [
  { label: 'All Time', value: 'all-time', icon: 'infinite-outline' },
  { label: 'This Month', value: 'this-month', icon: 'calendar-number-outline' },
  { label: 'Last Month', value: 'last-month', icon: 'play-back-outline' },
  { label: 'Last 7 Days', value: 'last-7-days', icon: 'time-outline' },
  { label: 'Last 30 Days', value: 'last-30-days', icon: 'timer-outline' },
] as const;

const SORT_OPTIONS = [
  { label: 'Date: Newest First', value: 'date-desc', icon: 'calendar-outline' },
  { label: 'Date: Oldest First', value: 'date-asc', icon: 'time-outline' },
  { label: 'Amount: Low to High', value: 'amount-asc', icon: 'trending-up-outline' },
  { label: 'Amount: High to Low', value: 'amount-desc', icon: 'trending-down-outline' },
] as const;

export default function PersonalHistoryScreen() {
  const params = useLocalSearchParams<{ dateRange?: string; category?: string }>();
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
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [activeFilter, setActiveFilter] = useState<ExpenseCategory | 'All'>(
    (params.category as ExpenseCategory) || 'All'
  );
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [dateRange, setDateRange] = useState<string>(params.dateRange || 'all-time');

  React.useEffect(() => {
    if (params.dateRange) {
      setDateRange(params.dateRange);
    }
    if (params.category) {
      setActiveFilter(params.category as ExpenseCategory);
    }
  }, [params.dateRange, params.category]);
  const [isDateRangeDropdownOpen, setIsDateRangeDropdownOpen] = useState(false);
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'amount-asc' | 'amount-desc'>(
    'date-desc'
  );
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

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
    personal: true,
    limit: 15,
    ...(activeFilter !== 'All' && { category: activeFilter as ExpenseCategory }),
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
    setSortBy('date-desc');
    setIsCategoryDropdownOpen(false);
    setIsDateRangeDropdownOpen(false);
    setIsSortDropdownOpen(false);
    setFilterModalVisible(false);
  }, []);

  const { isDark } = useTheme();
  const exportHook = useExport();
  const BATCH_SIZE = 15;
  const [displayLimit, setDisplayLimit] = useState<number>(BATCH_SIZE);

  React.useEffect(() => {
    setDisplayLimit(BATCH_SIZE);
  }, [dateRange, activeFilter, sortBy, debouncedSearchQuery]);

  const paginatedFeed = useMemo(() => {
    return sortedExpenses.slice(0, displayLimit);
  }, [sortedExpenses, displayLimit]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    setDisplayLimit(BATCH_SIZE);
    await refetch();
    setIsRefreshing(false);
  }, [refetch]);

  const handleLoadMore = useCallback(() => {
    if (displayLimit < sortedExpenses.length) {
      setDisplayLimit((prev) => prev + BATCH_SIZE);
    } else if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
      setDisplayLimit((prev) => prev + BATCH_SIZE);
    }
  }, [displayLimit, sortedExpenses.length, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const isCloseToBottom = ({
    layoutMeasurement,
    contentOffset,
    contentSize,
  }: NativeScrollEvent) => {
    const paddingToBottom = 50;
    return layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;
  };

  const insets = useSafeAreaInsets();

  const isFiltered = activeFilter !== 'All' || sortBy !== 'date-desc' || dateRange !== 'all-time';

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
              <Text style={[styles.tabTitle, isDark && styles.tabTitleDark]}>Personal History</Text>
            </View>
          </View>

          <View style={styles.headerRightActions}>
            <TouchableOpacity
              style={styles.iconBtn}
              activeOpacity={0.7}
              onPress={() => router.push('/total-spent')}
            >
              <Ionicons
                name="bar-chart-outline"
                size={24}
                color={isDark ? '#F3F4F6' : COLORS.onSurface}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.iconBtn, isFiltered && styles.filterBtnActive]}
              onPress={() => setFilterModalVisible(true)}
              activeOpacity={0.7}
            >
              <Ionicons
                name="options-outline"
                size={24}
                color={isFiltered ? COLORS.secondary : isDark ? '#F3F4F6' : COLORS.onSurface}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconBtn}
              activeOpacity={0.7}
              onPress={() => exportHook.setExportModalVisible(true)}
            >
              <Ionicons
                name="download-outline"
                size={26}
                color={isDark ? '#F3F4F6' : COLORS.onSurface}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Always-visible Search Input Box */}
        <View style={styles.alwaysSearchContainer}>
          <Ionicons
            name="search-outline"
            size={22}
            color={COLORS.outline}
            style={{ marginRight: 10 }}
          />
          <TextInput
            style={styles.alwaysSearchInput}
            placeholder="Search personal expenses..."
            placeholderTextColor={COLORS.outline}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.trim().length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="close-circle" size={18} color={COLORS.outline} />
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
                <Text style={styles.activeFilterBadgeText}>{getDateRangeLabel(dateRange)}</Text>
                <TouchableOpacity onPress={() => setDateRange('all-time')}>
                  <Ionicons name="close-circle" size={14} color={COLORS.secondary} />
                </TouchableOpacity>
              </View>
            )}
            {activeFilter !== 'All' && (
              <View style={styles.activeFilterBadge}>
                <Text style={styles.activeFilterBadgeText}>{activeFilter}</Text>
                <TouchableOpacity onPress={() => setActiveFilter('All')}>
                  <Ionicons name="close-circle" size={14} color={COLORS.secondary} />
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
                  <Ionicons name="close-circle" size={14} color={COLORS.secondary} />
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
        {isError && <ErrorView message="Failed to load personal history" onRetry={refetch} />}

        {/* Empty State */}
        {!isLoading && !isError && paginatedFeed.length === 0 && (
          <EmptyState
            emoji="🧾"
            title="No personal expenses found"
            description={
              isFiltered || searchQuery.trim()
                ? 'No personal expenses match your search or filters.'
                : 'You have not added any personal expenses yet.'
            }
            ctaText="Add Personal Expense"
            onCtaPress={() => setAddExpenseVisible(true)}
            ctaIcon="add-circle"
          />
        )}

        {/* Expense List grouped by date */}
        {paginatedFeed.length > 0 && (
          <View style={styles.expensesFeed}>
            {(() => {
              let lastDateHeading = '';
              return paginatedFeed.map((expense) => {
                const currentHeading = getDateHeading(expense.date);
                const showHeading = currentHeading !== lastDateHeading;
                lastDateHeading = currentHeading;

                return (
                  <React.Fragment key={expense.id}>
                    {showHeading && (
                      <View style={styles.dateHeaderContainer}>
                        <Text style={styles.dateHeaderText}>{currentHeading}</Text>
                      </View>
                    )}
                    <ExpenseItem expense={expense} currentUserId={user?.id} />
                  </React.Fragment>
                );
              });
            })()}
          </View>
        )}

        {(isFetchingNextPage || displayLimit < sortedExpenses.length) && (
          <View style={styles.loadingMore}>
            <ActivityIndicator size="small" color={COLORS.secondary} />
            <Text style={styles.loadingMoreText}>Loading more history...</Text>
          </View>
        )}
      </ScrollView>

      {/* Floating Action Button (FAB) */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.85}
        onPress={() => setAddExpenseVisible(true)}
      >
        <Ionicons name="add" size={32} color="#ffffff" />
      </TouchableOpacity>

      <AddExpenseModal
        visible={addExpenseVisible}
        initialExpenseType="PERSONAL"
        onClose={() => setAddExpenseVisible(false)}
        onSuccess={() => refetch()}
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
              {/* Category Filter */}
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
                            <Ionicons name="checkmark-sharp" size={18} color={COLORS.secondary} />
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
                          (DATE_RANGE_OPTIONS.find((o) => o.value === dateRange)?.icon ||
                            'calendar-outline') as never
                        }
                        size={18}
                        color={COLORS.secondary}
                      />
                    </View>
                    <Text style={styles.dropdownHeaderText}>
                      {DATE_RANGE_OPTIONS.find((o) => o.value === dateRange)?.label ||
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
                      const isSelected = dateRange === opt.value;
                      return (
                        <TouchableOpacity
                          key={opt.value}
                          style={[styles.dropdownItem, isSelected && styles.dropdownItemActive]}
                          onPress={() => {
                            setDateRange(opt.value);
                            setIsDateRangeDropdownOpen(false);
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
                            <Ionicons name="checkmark-sharp" size={18} color={COLORS.secondary} />
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
                      style={[
                        styles.dropdownHeaderIcon,
                        { backgroundColor: COLORS.secondaryFixed },
                      ]}
                    >
                      <Ionicons
                        name={
                          (SORT_OPTIONS.find((o) => o.value === sortBy)?.icon ||
                            'swap-vertical-outline') as never
                        }
                        size={18}
                        color={COLORS.secondary}
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
                            setSortBy(opt.value as typeof sortBy);
                            setIsSortDropdownOpen(false);
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
                            <Ionicons name="checkmark-sharp" size={18} color={COLORS.secondary} />
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </View>

              {/* Action Buttons */}
              <View style={styles.modalActionsRow}>
                <TouchableOpacity
                  style={styles.resetBtn}
                  onPress={handleResetAll}
                  activeOpacity={0.7}
                >
                  <Text style={styles.resetBtnText}>Reset All</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.applyBtn}
                  onPress={() => setFilterModalVisible(false)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.applyBtnText}>Apply Filters</Text>
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
          exportHook.executeExport(sortedExpenses, user?.name || user?.email || 'User')
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
        onSaveAgain={() =>
          exportHook.executeExport(sortedExpenses, user?.name || user?.email || 'User')
        }
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
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 48,
    borderWidth: 2,
    borderColor: COLORS.secondary,
    elevation: 3,
  },
  searchIconInline: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.onSurface,
    fontWeight: '600',
    paddingVertical: 6,
  },
  alwaysSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginTop: 12,
    minHeight: 50,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainer,
  },
  alwaysSearchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.onSurface,
    fontWeight: '600',
    padding: 0,
  },
  iconBtn: {
    padding: 6,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBtnActive: {
    backgroundColor: COLORS.secondaryFixed + '40',
    borderRadius: 8,
  },
  activeFiltersRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    paddingBottom: 2,
  },
  activeFilterBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.secondaryFixed,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  activeFilterBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  scrollContent: {
    paddingTop: 0,
    paddingBottom: 100,
  },
  expensesFeed: {},
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
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    zIndex: 40,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalSheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingBottom: 34,
    maxHeight: '85%',
  },
  modalHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.outlineVariant,
    alignSelf: 'center',
    marginBottom: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceContainer,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.onSurface,
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalScrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  modalSectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.outline,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginTop: 12,
  },
  dropdownContainer: {
    marginBottom: 8,
  },
  dropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainer,
  },
  dropdownHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dropdownHeaderIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropdownHeaderText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  dropdownList: {
    marginTop: 6,
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainer,
    overflow: 'hidden',
  },
  dropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceContainerLow,
  },
  dropdownItemActive: {
    backgroundColor: COLORS.secondaryFixed + '40',
  },
  dropdownItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dropdownItemIcon: {
    width: 26,
    height: 26,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropdownItemLabel: {
    fontSize: 13.5,
    fontWeight: '600',
    color: COLORS.onSurface,
  },
  dropdownItemLabelActive: {
    fontWeight: '800',
    color: COLORS.secondary,
  },
  modalActionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
    marginBottom: 16,
  },
  resetBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: COLORS.outlineVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.onSurfaceVariant,
  },
  applyBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#ffffff',
  },
});
