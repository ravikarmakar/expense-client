import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { COLORS, CURRENCY_SYMBOL } from '../../constants/theme';
import { AddExpenseModal } from '../../components/AddExpenseModal';
import { ExpenseItem } from '../../components/ExpenseItem';
import { ExpenseItemSkeleton } from '../../components/ExpenseItemSkeleton';
import { SkeletonLoader } from '../../components/SkeletonLoader';
import { ErrorView } from '../../components/ErrorView';
import { EmptyState } from '../../components/EmptyState';
import { usePersonalController, useCategories, type Expense } from '@workspace/api';
import { getDateHeading } from '../../utils/date';
import { getCategoryVisuals } from '../../constants/categories';
import { getDateRangeLabel } from '../../components/ActivityOverviewChartCard';
import { useExport } from '../../hooks/useExport';
import { ExportModalBottomSheet } from '../../components/ExportModalBottomSheet';
import { ExportProgressAndSuccessModal } from '../../components/ExportProgressAndSuccessModal';
import { FloatingDropdownMenu } from '../../components/FloatingDropdownMenu';
import { useTheme } from '../../context/ThemeContext';

const PERIOD_OPTIONS = [
  { label: 'This Month', value: 'this-month', icon: 'calendar-number-outline' },
  { label: 'Last 7 Days', value: 'last-7-days', icon: 'time-outline' },
  { label: 'Last 30 Days', value: 'last-30-days', icon: 'timer-outline' },
  { label: 'Last Month', value: 'last-month', icon: 'play-back-outline' },
  { label: 'All Time', value: 'all-time', icon: 'infinite-outline' },
  { label: 'Select Month', value: 'custom_month', icon: 'calendar-outline' },
  { label: 'Select Year', value: 'custom_year', icon: 'ribbon-outline' },
] as const;

export default function PersonalTabScreen() {
  const {
    user,
    addExpenseVisible,
    setAddExpenseVisible,
    selectedCategoryFilter,
    setSelectedCategoryFilter,
    isRefreshing,
    allExpenses,
    totalSpent,
    isLoading,
    isError,
    refetch,
    handleRefresh,
  } = usePersonalController();

  const { isDark } = useTheme();
  const variant = isDark ? 'dark' : 'light';

  const [selectedDateRange, setSelectedDateRange] = React.useState<string>('this-month');
  const [isPeriodDropdownOpen, setIsPeriodDropdownOpen] = React.useState(false);

  const { data: categoriesData } = useCategories();
  const customCategories = React.useMemo(() => categoriesData?.custom || [], [categoriesData]);

  const insets = useSafeAreaInsets();

  // Export Hook & Service
  const exportHook = useExport();

  // Combine default personal categories and custom categories from DB
  const allCategoryNames = React.useMemo(() => {
    const baseNames = [
      'Food',
      'Transport',
      'Shopping',
      'Entertainment',
      'Bills',
      'Travel',
      'Health',
      'Other',
    ];
    const customNames = customCategories
      .map((c) => c.name)
      .filter((name) => !baseNames.includes(name));
    return [...baseNames, ...customNames];
  }, [customCategories]);

  // Filter allExpenses by the selected date range directly on the screen
  const periodFilteredExpenses = React.useMemo(() => {
    if (selectedDateRange === 'all-time') return allExpenses;

    const now = new Date();
    let start = new Date();
    let end = new Date();

    if (selectedDateRange === 'this-month') {
      start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    } else if (selectedDateRange === 'last-month') {
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
      end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
    } else if (selectedDateRange === 'last-7-days') {
      start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      end = now;
    } else if (selectedDateRange === 'last-30-days') {
      start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      end = now;
    } else if (selectedDateRange.startsWith('month-')) {
      const parts = selectedDateRange.replace('month-', '').split('-');
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      if (!isNaN(year) && !isNaN(month)) {
        start = new Date(year, month, 1, 0, 0, 0, 0);
        end = new Date(year, month + 1, 0, 23, 59, 59, 999);
      }
    } else if (selectedDateRange.startsWith('year-')) {
      const year = parseInt(selectedDateRange.replace('year-', ''), 10);
      if (!isNaN(year)) {
        start = new Date(year, 0, 1, 0, 0, 0, 0);
        end = new Date(year, 11, 31, 23, 59, 59, 999);
      }
    }

    return allExpenses.filter((exp: Expense) => {
      const expDate = new Date(exp.date);
      return expDate >= start && expDate <= end;
    });
  }, [allExpenses, selectedDateRange]);

  // Compute total spent in the selected period (uses full server aggregate for all-time)
  const periodTotal = React.useMemo(() => {
    if (selectedDateRange === 'all-time') {
      return totalSpent;
    }
    return periodFilteredExpenses.reduce((sum: number, item: Expense) => sum + item.amount, 0);
  }, [periodFilteredExpenses, selectedDateRange, totalSpent]);

  // Compute category totals strictly for the SELECTED PERIOD from periodFilteredExpenses
  const categoryTotals = React.useMemo(() => {
    const totals: Record<string, number> = {};
    allCategoryNames.forEach((cat) => {
      totals[cat] = 0;
    });

    periodFilteredExpenses.forEach((exp: Expense) => {
      const cat = exp.category;
      if (cat && cat in totals) {
        totals[cat] += exp.amount;
      } else {
        totals['Other'] = (totals['Other'] ?? 0) + exp.amount;
      }
    });

    return allCategoryNames.map((cat) => ({
      name: cat,
      amount: totals[cat] ?? 0,
      iconConfig: getCategoryVisuals(cat, customCategories),
    }));
  }, [periodFilteredExpenses, allCategoryNames, customCategories]);

  // Compute active category amount
  const activeCategoryAmount = React.useMemo(() => {
    if (!selectedCategoryFilter) return periodTotal;
    const catObj = categoryTotals.find((c) => c.name === selectedCategoryFilter);
    return catObj ? catObj.amount : 0;
  }, [selectedCategoryFilter, periodTotal, categoryTotals]);

  // Dynamic card label and period button text
  const periodLabelText = getDateRangeLabel(selectedDateRange);
  const cardTitleLabel = selectedCategoryFilter
    ? `${selectedCategoryFilter} Expenses (${periodLabelText})`
    : `${periodLabelText} Expenses`;

  // Filtered expenses for preview feed
  const filteredFeedExpenses = React.useMemo(() => {
    if (!selectedCategoryFilter) return periodFilteredExpenses;

    if (selectedCategoryFilter === 'Other') {
      return periodFilteredExpenses.filter(
        (e: Expense) =>
          !e.category || e.category === 'Other' || !allCategoryNames.includes(e.category)
      );
    }

    return periodFilteredExpenses.filter((e: Expense) => e.category === selectedCategoryFilter);
  }, [periodFilteredExpenses, selectedCategoryFilter, allCategoryNames]);

  // Display expenses for the selected filter period in the tab (limited to 15 items)
  const recentExpenses = React.useMemo(() => {
    return filteredFeedExpenses.slice(0, 15);
  }, [filteredFeedExpenses]);

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      {/* Header section restored */}
      <View
        style={[
          styles.headerContainer,
          isDark && styles.headerContainerDark,
          { paddingTop: insets.top + 16 },
        ]}
      >
        <View style={styles.headerRow}>
          <View>
            <Text style={[styles.headerTitle, isDark && styles.headerTitleDark]}>My Expenses</Text>
            <Text style={[styles.headerSubtitle, isDark && styles.headerSubtitleDark]}>
              Track & manage your personal spending
            </Text>
          </View>
          <View style={styles.headerRightActions}>
            <TouchableOpacity
              style={[styles.headerIconBtn, isDark && styles.headerIconBtnDark]}
              activeOpacity={0.7}
              onPress={() => router.push('/personal-analytics')}
            >
              <Ionicons
                name="bar-chart-outline"
                size={24}
                color={isDark ? '#F9FAFB' : COLORS.onSurface}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.headerIconBtn, isDark && styles.headerIconBtnDark]}
              activeOpacity={0.7}
              onPress={() => exportHook.setExportModalVisible(true)}
            >
              <Ionicons
                name="download-outline"
                size={26}
                color={isDark ? '#F9FAFB' : COLORS.onSurface}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, styles.scrollContentExtra]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={isDark ? '#ffffff' : undefined}
          />
        }
      >
        {/* Premium Card: Dynamic Selected Category & Period - Kept Purple */}
        <View style={[styles.premiumCard, isDark && styles.premiumCardDark]}>
          <View style={styles.cardCircle1} />
          <View style={styles.cardCircle2} />

          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardLabel}>{cardTitleLabel}</Text>
            <TouchableOpacity
              style={styles.cardPeriodBtn}
              activeOpacity={0.8}
              onPress={() => setIsPeriodDropdownOpen(!isPeriodDropdownOpen)}
            >
              <Ionicons name="calendar-outline" size={13} color="#ffffff" />
              <Text style={styles.cardPeriodBtnText}>{periodLabelText}</Text>
              <Ionicons
                name={isPeriodDropdownOpen ? 'chevron-up' : 'chevron-down'}
                size={12}
                color="rgba(255, 255, 255, 0.8)"
              />
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <SkeletonLoader
              width={140}
              height={32}
              borderRadius={6}
              style={{ marginVertical: 4, backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
            />
          ) : (
            <Text style={styles.cardValue}>
              {CURRENCY_SYMBOL}
              {activeCategoryAmount.toLocaleString('en-IN', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Text>
          )}
          <View style={styles.cardFooter}>
            <Ionicons name="wallet-outline" size={14} color="rgba(255, 255, 255, 0.7)" />
            <Text style={styles.cardFooterText}>
              Total Spent (All-time): {CURRENCY_SYMBOL}
              {totalSpent.toLocaleString('en-IN', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Text>
          </View>
        </View>

        {/* Category breakdown carousel */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
            Category Spending
          </Text>
          {selectedCategoryFilter && (
            <TouchableOpacity onPress={() => setSelectedCategoryFilter(null)}>
              <Text style={[styles.clearFilterText, isDark && styles.clearFilterTextDark]}>
                Clear Filter
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.carouselContainer}
        >
          {categoryTotals.map((cat) => {
            const isSelected = selectedCategoryFilter === cat.name;
            return (
              <TouchableOpacity
                key={cat.name}
                style={[
                  styles.categoryPill,
                  isDark ? styles.categoryPillDark : { backgroundColor: cat.iconConfig.bg },
                  isSelected &&
                    (isDark ? styles.categoryPillActiveDark : styles.categoryPillActive),
                ]}
                onPress={() => setSelectedCategoryFilter(isSelected ? null : cat.name)}
                activeOpacity={0.8}
              >
                <View style={styles.categoryPillLeft}>
                  <View
                    style={[
                      styles.categoryIconBg,
                      {
                        backgroundColor: isSelected
                          ? '#ffffff'
                          : isDark
                            ? 'rgba(255, 255, 255, 0.12)'
                            : 'rgba(255, 255, 255, 0.6)',
                      },
                    ]}
                  >
                    {cat.iconConfig.lib === 'Ionicons' ? (
                      <Ionicons
                        name={cat.iconConfig.icon as React.ComponentProps<typeof Ionicons>['name']}
                        size={14}
                        color={isSelected ? COLORS.secondary : cat.iconConfig.color}
                      />
                    ) : (
                      <MaterialIcons
                        name={
                          cat.iconConfig.icon as React.ComponentProps<typeof MaterialIcons>['name']
                        }
                        size={14}
                        color={isSelected ? COLORS.secondary : cat.iconConfig.color}
                      />
                    )}
                  </View>
                  <Text
                    style={[
                      styles.categoryPillLabel,
                      {
                        color: isSelected
                          ? '#ffffff'
                          : isDark
                            ? '#E5E7EB'
                            : COLORS.onSurfaceVariant,
                      },
                    ]}
                  >
                    {cat.name}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.categoryPillAmount,
                    {
                      color: isSelected ? '#ffffff' : isDark ? '#E5E7EB' : cat.iconConfig.color,
                    },
                  ]}
                >
                  {CURRENCY_SYMBOL}
                  {cat.amount.toFixed(0)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Recent Expenses Header & View History Action */}
        <View style={[styles.sectionHeader, styles.mtNormal]}>
          <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
            Recent Expenses
          </Text>
          <TouchableOpacity
            style={styles.seeAllBtn}
            onPress={() => router.push('/personal-history')}
            activeOpacity={0.7}
          >
            <Text style={[styles.seeAllText, isDark && styles.seeAllTextDark]}>View History</Text>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={isDark ? '#A5B4FC' : COLORS.secondary}
            />
          </TouchableOpacity>
        </View>

        {/* Loading State */}
        {isLoading && (
          <View>
            <ExpenseItemSkeleton />
            <ExpenseItemSkeleton />
            <ExpenseItemSkeleton />
          </View>
        )}

        {/* Error State */}
        {isError && <ErrorView message="Failed to load personal expenses" onRetry={refetch} />}

        {/* Empty State */}
        {!isLoading && !isError && recentExpenses.length === 0 && (
          <EmptyState
            emoji="🏷️"
            title="No personal expenses yet"
            description={
              selectedCategoryFilter
                ? `No personal expenses recorded under ${selectedCategoryFilter} for ${periodLabelText}.`
                : `No personal expenses recorded for ${periodLabelText}. Click the FAB button to add one!`
            }
            variant={variant}
          />
        )}

        {/* Recent Expenses List Preview feed */}
        {recentExpenses.length > 0 && (
          <View style={styles.expensesFeed}>
            {(() => {
              let lastDateHeading = '';
              return recentExpenses.map((expense: Expense) => {
                const currentHeading = getDateHeading(expense.date);
                const showHeading = currentHeading !== lastDateHeading;
                lastDateHeading = currentHeading;

                return (
                  <React.Fragment key={expense.id}>
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
                    <ExpenseItem expense={expense} currentUserId={user?.id} variant={variant} />
                  </React.Fragment>
                );
              });
            })()}
          </View>
        )}

        {/* Subtle Caught Up & View History Text Link */}
        {!isLoading && !isError && filteredFeedExpenses.length > 0 && (
          <View style={styles.caughtUpContainer}>
            <Text style={[styles.caughtUpText, isDark && styles.caughtUpTextDark]}>
              {filteredFeedExpenses.length > 15
                ? `Showing 15 of ${filteredFeedExpenses.length} personal expenses`
                : "You're all caught up!"}
            </Text>
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: '/personal-history',
                  params: { dateRange: selectedDateRange },
                })
              }
              activeOpacity={0.7}
              style={styles.historyLinkBtn}
            >
              <Text style={[styles.historyLinkText, isDark && styles.historyLinkTextDark]}>
                See all history
              </Text>
              <Ionicons
                name="arrow-forward"
                size={15}
                color={isDark ? '#A5B4FC' : COLORS.secondary}
              />
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Floating Action Button (FAB) - Signature Purple */}
      <TouchableOpacity
        style={[styles.fab, isDark && styles.fabDark]}
        activeOpacity={0.85}
        onPress={() => setAddExpenseVisible(true)}
      >
        <Ionicons name="add" size={32} color="#ffffff" />
      </TouchableOpacity>

      {/* Add Expense Modal */}
      <AddExpenseModal
        visible={addExpenseVisible}
        initialExpenseType="PERSONAL"
        onClose={() => setAddExpenseVisible(false)}
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
          exportHook.executeExport(allExpenses, user?.name || user?.email || 'User', 'personal')
        }
        variant={variant}
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
        selectedValue={selectedDateRange}
        isSelected={(opt) => {
          if (opt.value === 'custom_month') {
            return selectedDateRange.startsWith('month-');
          }
          if (opt.value === 'custom_year') {
            return selectedDateRange.startsWith('year-');
          }
          return selectedDateRange === opt.value;
        }}
        onSelect={(opt) => {
          setSelectedDateRange(opt.value);
        }}
        variant={variant}
        accentColor={isDark ? '#818CF8' : COLORS.secondary}
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
    color: '#9CA3AF',
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
  headerIconBtnDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  scrollContentExtra: {
    paddingTop: 16,
  },
  premiumCard: {
    backgroundColor: COLORS.secondary,
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    marginHorizontal: 16,
    overflow: 'hidden',
    position: 'relative',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  premiumCardDark: {
    backgroundColor: '#4338ca',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    shadowColor: '#4338ca',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
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
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.secondaryFixed,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    flex: 1,
    marginRight: 8,
  },
  cardPeriodBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  cardPeriodBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ffffff',
  },
  cardValue: {
    fontSize: 32,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -0.5,
    marginBottom: 16,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardFooterText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.onSurface,
    letterSpacing: -0.3,
  },
  sectionTitleDark: {
    color: '#F9FAFB',
  },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
  },
  seeAllText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  seeAllTextDark: {
    color: '#A5B4FC',
  },
  clearFilterText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.secondary,
  },
  clearFilterTextDark: {
    color: '#A5B4FC',
  },
  carouselContainer: {
    paddingHorizontal: 16,
    paddingBottom: 4,
    gap: 12,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 16,
    minWidth: 140,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  categoryPillDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  categoryPillActive: {
    backgroundColor: COLORS.secondary + 'dd',
    borderColor: COLORS.secondary,
  },
  categoryPillActiveDark: {
    backgroundColor: COLORS.secondary,
    borderColor: '#818CF8',
  },
  categoryPillLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryIconBg: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryPillLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  categoryPillAmount: {
    fontSize: 14,
    fontWeight: '800',
  },
  mtNormal: {
    marginTop: 20,
  },
  expensesFeed: {},
  dateHeaderContainer: {
    backgroundColor: COLORS.surfaceContainerLow,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceContainer,
  },
  dateHeaderContainerDark: {
    backgroundColor: '#0D1714',
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  dateHeaderText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.outline,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  dateHeaderTextDark: {
    color: '#9CA3AF',
  },
  caughtUpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 20,
    marginTop: 8,
  },
  caughtUpText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.outline,
  },
  caughtUpTextDark: {
    color: '#9CA3AF',
  },
  historyLinkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft: 4,
  },
  historyLinkText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  historyLinkTextDark: {
    color: '#A5B4FC',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 96,
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
  fabDark: {
    backgroundColor: COLORS.secondary,
    shadowColor: '#818CF8',
    shadowOpacity: 0.5,
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
  periodModalScroll: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 16,
  },
  presetsGrid: {
    gap: 6,
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
  yearNavBtn: {
    padding: 3,
  },
  yearText: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.onSurface,
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
  monthGridCellSelected: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
  },
  monthCellText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  monthCellTextSelected: {
    color: '#ffffff',
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
  pillCardActive: {
    backgroundColor: COLORS.secondaryFixed + '50',
    borderColor: COLORS.secondary,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.onSurfaceVariant,
  },
  pillTextActive: {
    fontWeight: '800',
    color: COLORS.secondary,
  },
  dropdownMenu: {
    position: 'absolute',
    right: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 6,
    minWidth: 180,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#e8ece9',
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 10,
    borderRadius: 8,
  },
  dropdownItemText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.onSurface,
  },
  lendBorrowShortcutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainer,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  lendBorrowShortcutCardDark: {
    backgroundColor: '#101917',
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  shortcutIconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shortcutTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.onSurface,
  },
  shortcutSub: {
    fontSize: 11,
    color: COLORS.outline,
    marginTop: 2,
  },
  shortcutArrow: {
    padding: 4,
  },
});
