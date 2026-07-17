import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Modal,
  Platform,
  ActivityIndicator,
  NativeScrollEvent,
  TextInput,
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, CURRENCY_SYMBOL, CATEGORY_ICONS } from '../../constants/theme';
import { ExpenseItem } from '../../components/ExpenseItem';
import { ExpenseItemSkeleton } from '../../components/ExpenseItemSkeleton';
import { SkeletonLoader } from '../../components/SkeletonLoader';
import { AddExpenseModal } from '../../components/AddExpenseModal';
import { ErrorView } from '../../components/ErrorView';
import { EmptyState } from '../../components/EmptyState';
import { useExpenses, useMe, type ExpenseCategory } from '@workspace/api';
import { getDateHeading } from '../../utils/date';

const FILTER_TABS: Array<{ label: string; value: ExpenseCategory | 'All' }> = [
  { label: 'All', value: 'All' },
  { label: 'Food', value: 'Food' },
  { label: 'Transport', value: 'Transport' },
  { label: 'Shopping', value: 'Shopping' },
  { label: 'Bills', value: 'Bills' },
  { label: 'Travel', value: 'Travel' },
  { label: 'Health', value: 'Health' },
  { label: 'Other', value: 'Other' },
];

const DATE_RANGE_OPTIONS = [
  { label: 'All Time', value: 'all-time', icon: 'calendar-outline' },
  { label: 'This Month', value: 'this-month', icon: 'calendar-number-outline' },
  { label: 'Last Month', value: 'last-month', icon: 'play-back-outline' },
  { label: 'Last 7 Days', value: 'last-7-days', icon: 'time-outline' },
  { label: 'Last 30 Days', value: 'last-30-days', icon: 'timer-outline' },
] as const;

type DateRangeValue = (typeof DATE_RANGE_OPTIONS)[number]['value'];

const SORT_OPTIONS = [
  { label: 'Date: Newest First', value: 'date-desc', icon: 'calendar-outline' },
  { label: 'Date: Oldest First', value: 'date-asc', icon: 'time-outline' },
  { label: 'Amount: Low to High', value: 'amount-asc', icon: 'trending-up-outline' },
  { label: 'Amount: High to Low', value: 'amount-desc', icon: 'trending-down-outline' },
] as const;

type SortValue = (typeof SORT_OPTIONS)[number]['value'];

export default function ActivityTabScreen() {
  const [addExpenseVisible, setAddExpenseVisible] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [activeFilter, setActiveFilter] = useState<ExpenseCategory | 'All'>('All');
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [dateRange, setDateRange] = useState<DateRangeValue>('all-time');
  const [isDateRangeDropdownOpen, setIsDateRangeDropdownOpen] = useState(false);
  const [paidByMe, setPaidByMe] = useState(false);
  const [sortBy, setSortBy] = useState<SortValue>('date-desc');
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const [useWalletOnly, setUseWalletOnly] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { data: user } = useMe();

  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const dateFilter = React.useMemo(() => {
    if (dateRange === 'all-time') return {};
    const now = new Date();
    let start = new Date();
    let end = new Date();

    if (dateRange === 'this-month') {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (dateRange === 'last-month') {
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
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
    ...(activeFilter !== 'All' && { category: activeFilter }),
    ...(paidByMe && { paidByMe: true }),
    ...(useWalletOnly && { useWallet: true }),
    ...(debouncedSearchQuery.trim() !== '' && { search: debouncedSearchQuery.trim() }),
    ...dateFilter,
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  const expenses = React.useMemo(() => {
    return expensesData?.pages.flatMap((page) => page.expenses) ?? [];
  }, [expensesData]);

  const sortedExpenses = React.useMemo(() => {
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
  }, [expenses, sortBy]);

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
    <View style={styles.container}>
      {/* Header Container with Bottom Divider line */}
      <View style={[styles.headerContainer, { paddingTop: insets.top + 16 }]}>
        {/* Header row */}
        <View style={styles.tabHeaderRow}>
          {searchVisible ? (
            <View style={styles.searchInputContainer}>
              <Ionicons
                name="search"
                size={20}
                color={COLORS.primary}
                style={styles.searchIconInline}
              />
              <TextInput
                style={styles.searchInput}
                placeholder="Search expenses by title..."
                placeholderTextColor={COLORS.outline}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus
              />
              <TouchableOpacity
                onPress={() => {
                  setSearchQuery('');
                  setSearchVisible(false);
                }}
                style={styles.clearSearchBtn}
              >
                <Ionicons name="close-circle" size={22} color={COLORS.outline} />
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <View>
                <Text style={styles.tabTitle}>Activity</Text>
                <Text style={styles.tabSubtitle}>Shared Ledger</Text>
              </View>

              <View style={styles.headerRightActions}>
                <TouchableOpacity
                  style={styles.searchIconBtn}
                  activeOpacity={0.8}
                  onPress={() => setSearchVisible(true)}
                >
                  <Ionicons name="search" size={22} color={COLORS.primary} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.filterBtn,
                    (activeFilter !== 'All' ||
                      sortBy !== 'date-desc' ||
                      paidByMe ||
                      useWalletOnly) &&
                      styles.filterBtnActive,
                  ]}
                  onPress={() => setFilterModalVisible(true)}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name="funnel"
                    size={20}
                    color={
                      activeFilter !== 'All' || sortBy !== 'date-desc' || paidByMe || useWalletOnly
                        ? '#ffffff'
                        : COLORS.primary
                    }
                  />
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>

        {/* Active Filters Row */}
        {(activeFilter !== 'All' || useWalletOnly || sortBy !== 'date-desc') && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.activeFiltersRow}
          >
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
          if (isCloseToBottom(nativeEvent) && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        }}
        scrollEventThrottle={400}
      >
        {/* Premium Total Spent Banner */}
        {(isLoading || sortedExpenses.length > 0) && (
          <View style={styles.premiumCard}>
            <View style={styles.cardCircle1} />
            <View style={styles.cardCircle2} />
            <View style={styles.premiumCardContent}>
              <View style={styles.premiumCardLeft}>
                <Text style={styles.premiumCardLabel}>Total Shared Spend</Text>
                {isLoading ? (
                  <SkeletonLoader
                    width={100}
                    height={28}
                    borderRadius={6}
                    style={{ marginTop: 4, backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                  />
                ) : (
                  <Text style={styles.premiumCardValue}>
                    {CURRENCY_SYMBOL}
                    {sortedExpenses
                      .reduce((s, e) => s + e.amount, 0)
                      .toLocaleString('en-IN', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                  </Text>
                )}
              </View>
              <View style={styles.premiumCardDivider} />
              <View style={styles.premiumCardRight}>
                <Text style={styles.premiumCardRightLabel}>Transactions</Text>
                {isLoading ? (
                  <SkeletonLoader
                    width={30}
                    height={20}
                    borderRadius={4}
                    style={{ marginTop: 4, backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                  />
                ) : (
                  <Text style={styles.premiumCardRightValue}>{sortedExpenses.length}</Text>
                )}
              </View>
            </View>
          </View>
        )}

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
        {!isLoading && !isError && sortedExpenses.length === 0 && (
          <EmptyState
            icon="receipt-long"
            iconLib="MaterialIcons"
            title="No expenses yet"
            description={
              activeFilter !== 'All'
                ? `No ${activeFilter} expenses found.`
                : 'Add your first expense to start tracking!'
            }
            ctaText={activeFilter === 'All' ? 'Add Expense' : undefined}
            onCtaPress={activeFilter === 'All' ? () => setAddExpenseVisible(true) : undefined}
            ctaIcon="add-circle"
          />
        )}

        {/* Expense list */}
        {sortedExpenses.length > 0 && (
          <View style={styles.activityFeed}>
            {(() => {
              let lastDateHeading = '';
              return sortedExpenses.map((expense) => {
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
        onSuccess={refetch}
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
                        { backgroundColor: CATEGORY_ICONS[activeFilter].bg },
                      ]}
                    >
                      {CATEGORY_ICONS[activeFilter].lib === 'Ionicons' ? (
                        <Ionicons
                          name={CATEGORY_ICONS[activeFilter].icon as never}
                          size={18}
                          color={CATEGORY_ICONS[activeFilter].color}
                        />
                      ) : (
                        <MaterialIcons
                          name={CATEGORY_ICONS[activeFilter].icon as never}
                          size={18}
                          color={CATEGORY_ICONS[activeFilter].color}
                        />
                      )}
                    </View>
                    <Text style={styles.dropdownHeaderText}>
                      {FILTER_TABS.find((t) => t.value === activeFilter)?.label || 'All Categories'}
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
                    {FILTER_TABS.map((tab) => {
                      const isSelected = activeFilter === tab.value;
                      const cfg = CATEGORY_ICONS[tab.value];
                      return (
                        <TouchableOpacity
                          key={tab.value}
                          style={[styles.dropdownItem, isSelected && styles.dropdownItemActive]}
                          onPress={() => {
                            setActiveFilter(tab.value);
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
                        name={DATE_RANGE_OPTIONS.find((o) => o.value === dateRange)?.icon as never}
                        size={18}
                        color={COLORS.secondary}
                      />
                    </View>
                    <Text style={styles.dropdownHeaderText}>
                      {DATE_RANGE_OPTIONS.find((o) => o.value === dateRange)?.label}
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
                  onPress={() => {
                    setActiveFilter('All');
                    setDateRange('all-time');
                    setPaidByMe(false);
                    setUseWalletOnly(false);
                    setSortBy('date-desc');
                    setIsCategoryDropdownOpen(false);
                    setIsDateRangeDropdownOpen(false);
                    setIsSortDropdownOpen(false);
                    setFilterModalVisible(false);
                  }}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
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
  filterBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalSheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 24,
  },
  modalHandle: {
    width: 48,
    height: 5,
    borderRadius: 3,
    backgroundColor: COLORS.surfaceContainerHigh,
    alignSelf: 'center',
    marginTop: 14,
    marginBottom: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.onSurface,
    letterSpacing: -0.5,
  },
  modalCloseBtn: {
    padding: 8,
    borderRadius: 24,
    backgroundColor: COLORS.surfaceContainerLow,
  },
  dropdownContainer: {
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  dropdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surfaceContainerLow,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  dropdownHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dropdownHeaderIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropdownHeaderText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.onSurface,
  },
  dropdownList: {
    marginTop: 8,
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: 16,
    padding: 8,
    gap: 4,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
  },
  dropdownItemActive: {
    backgroundColor: COLORS.surfaceContainer,
  },
  dropdownItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dropdownItemIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropdownItemLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.onSurfaceVariant,
  },
  dropdownItemLabelActive: {
    fontWeight: '700',
    color: COLORS.primary,
  },
  modalScrollContent: {
    paddingBottom: 32,
  },
  modalSectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.onSurfaceVariant,
    paddingHorizontal: 24,
    marginTop: 8,
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  sortList: {
    paddingHorizontal: 24,
    gap: 12,
    marginBottom: 28,
  },
  sortItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    backgroundColor: COLORS.surfaceContainerLow,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  sortItemActive: {
    borderColor: COLORS.primaryFixed,
    backgroundColor: '#e6f9f0',
  },
  sortItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  sortItemLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.onSurfaceVariant,
  },
  sortItemLabelActive: {
    color: COLORS.primary,
    fontWeight: '800',
  },
  modalActionsRow: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 16,
    marginTop: 8,
  },
  modalResetBtn: {
    flex: 1,
    height: 56,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: COLORS.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
  },
  modalResetBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.outline,
  },
  modalApplyBtn: {
    flex: 2,
    height: 56,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  modalApplyBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  premiumCard: {
    backgroundColor: COLORS.primary,
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    marginHorizontal: 16,
    overflow: 'hidden',
    position: 'relative',
    elevation: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  cardCircle1: {
    position: 'absolute',
    borderRadius: 999,
    width: 140,
    height: 140,
    top: -40,
    right: -40,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  cardCircle2: {
    position: 'absolute',
    borderRadius: 999,
    width: 80,
    height: 80,
    bottom: -30,
    left: -10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  premiumCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 2,
  },
  premiumCardLeft: {
    flex: 2,
  },
  premiumCardLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primaryFixed,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
    opacity: 0.9,
  },
  premiumCardValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -0.5,
  },
  premiumCardDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    marginHorizontal: 16,
  },
  premiumCardRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  premiumCardRightLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primaryFixed,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
    opacity: 0.9,
  },
  premiumCardRightValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
  },
  activityFeed: {},
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
});
