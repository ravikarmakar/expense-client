import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Modal,
} from 'react-native';
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
import { usePersonalController, useCategories } from '@workspace/api';
import { getDateHeading } from '../../utils/date';
import { getCategoryVisuals } from '../../constants/categories';
import { getDateRangeLabel } from '../../components/ActivityOverviewChartCard';
import { useExport } from '../../hooks/useExport';
import { ExportModalBottomSheet } from '../../components/ExportModalBottomSheet';
import { ExportProgressAndSuccessModal } from '../../components/ExportProgressAndSuccessModal';

const PERIOD_OPTIONS = [
  { label: 'This Month', value: 'this-month', icon: 'calendar-number-outline' },
  { label: 'Last 7 Days', value: 'last-7-days', icon: 'time-outline' },
  { label: 'Last 30 Days', value: 'last-30-days', icon: 'timer-outline' },
  { label: 'Last Month', value: 'last-month', icon: 'play-back-outline' },
  { label: 'All Time', value: 'all-time', icon: 'infinite-outline' },
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

  const [selectedDateRange, setSelectedDateRange] = React.useState<string>('this-month');
  const [periodModalVisible, setPeriodModalVisible] = React.useState(false);
  const [pickerYear, setPickerYear] = React.useState<number>(new Date().getFullYear());

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
    }

    return allExpenses.filter((exp) => {
      const expDate = new Date(exp.date);
      return expDate >= start && expDate <= end;
    });
  }, [allExpenses, selectedDateRange]);

  // Compute total spent in the selected period
  const periodTotal = React.useMemo(() => {
    return periodFilteredExpenses.reduce((sum, item) => sum + item.amount, 0);
  }, [periodFilteredExpenses]);

  // Compute category totals strictly for the SELECTED PERIOD from periodFilteredExpenses
  const categoryTotals = React.useMemo(() => {
    const totals: Record<string, number> = {};
    allCategoryNames.forEach((cat) => {
      totals[cat] = 0;
    });

    periodFilteredExpenses.forEach((exp) => {
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
        (e) => !e.category || e.category === 'Other' || !allCategoryNames.includes(e.category)
      );
    }

    return periodFilteredExpenses.filter((e) => e.category === selectedCategoryFilter);
  }, [periodFilteredExpenses, selectedCategoryFilter, allCategoryNames]);

  // Display expenses for the selected filter period in the tab
  const recentExpenses = filteredFeedExpenses;

  return (
    <View style={styles.container}>
      {/* Header section restored */}
      <View style={[styles.headerContainer, { paddingTop: insets.top + 16 }]}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerTitle}>My Expenses</Text>
            <Text style={styles.headerSubtitle}>Track & manage your personal spending</Text>
          </View>
          <View style={styles.headerRightActions}>
            <TouchableOpacity
              style={styles.headerIconBtn}
              activeOpacity={0.7}
              onPress={() => router.push('/total-spent')}
            >
              <Ionicons name="bar-chart-outline" size={24} color={COLORS.onSurface} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerIconBtn}
              activeOpacity={0.7}
              onPress={() => exportHook.setExportModalVisible(true)}
            >
              <Ionicons name="download-outline" size={26} color={COLORS.onSurface} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, styles.scrollContentExtra]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
      >
        {/* Premium Card: Dynamic Selected Category & Period */}
        <View style={styles.premiumCard}>
          <View style={styles.cardCircle1} />
          <View style={styles.cardCircle2} />

          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardLabel}>{cardTitleLabel}</Text>
            <TouchableOpacity
              style={styles.cardPeriodBtn}
              activeOpacity={0.8}
              onPress={() => setPeriodModalVisible(true)}
            >
              <Ionicons name="calendar-outline" size={13} color="#ffffff" />
              <Text style={styles.cardPeriodBtnText}>{periodLabelText}</Text>
              <Ionicons name="chevron-down" size={12} color="rgba(255, 255, 255, 0.8)" />
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
          <Text style={styles.sectionTitle}>Category Spending</Text>
          {selectedCategoryFilter && (
            <TouchableOpacity onPress={() => setSelectedCategoryFilter(null)}>
              <Text style={styles.clearFilterText}>Clear Filter</Text>
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
                  { backgroundColor: cat.iconConfig.bg },
                  isSelected && styles.categoryPillActive,
                ]}
                onPress={() => setSelectedCategoryFilter(isSelected ? null : cat.name)}
                activeOpacity={0.8}
              >
                <View style={styles.categoryPillLeft}>
                  <View
                    style={[
                      styles.categoryIconBg,
                      { backgroundColor: isSelected ? '#ffffff' : 'rgba(255, 255, 255, 0.6)' },
                    ]}
                  >
                    {cat.iconConfig.lib === 'Ionicons' ? (
                      <Ionicons
                        name={cat.iconConfig.icon as React.ComponentProps<typeof Ionicons>['name']}
                        size={14}
                        color={cat.iconConfig.color}
                      />
                    ) : (
                      <MaterialIcons
                        name={
                          cat.iconConfig.icon as React.ComponentProps<typeof MaterialIcons>['name']
                        }
                        size={14}
                        color={cat.iconConfig.color}
                      />
                    )}
                  </View>
                  <Text
                    style={[
                      styles.categoryPillLabel,
                      { color: isSelected ? '#ffffff' : COLORS.onSurfaceVariant },
                    ]}
                  >
                    {cat.name}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.categoryPillAmount,
                    { color: isSelected ? '#ffffff' : cat.iconConfig.color },
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
          <Text style={styles.sectionTitle}>Recent Expenses</Text>
          <TouchableOpacity
            style={styles.seeAllBtn}
            onPress={() => router.push('/personal-history')}
            activeOpacity={0.7}
          >
            <Text style={styles.seeAllText}>View History</Text>
            <Ionicons name="chevron-forward" size={18} color={COLORS.secondary} />
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
          />
        )}

        {/* Recent Expenses List Preview feed */}
        {recentExpenses.length > 0 && (
          <View style={styles.expensesFeed}>
            {(() => {
              let lastDateHeading = '';
              return recentExpenses.map((expense) => {
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

        {/* Subtle Caught Up & View History Text Link */}
        {!isLoading && !isError && filteredFeedExpenses.length > 0 && (
          <View style={styles.caughtUpContainer}>
            <Ionicons name="checkmark-circle-outline" size={16} color={COLORS.outline} />
            <Text style={styles.caughtUpText}>You{"'"}re all caught up!</Text>
            <TouchableOpacity
              onPress={() => router.push('/personal-history')}
              activeOpacity={0.7}
              style={styles.historyLinkBtn}
            >
              <Text style={styles.historyLinkText}>View history</Text>
              <Ionicons name="arrow-forward" size={15} color={COLORS.secondary} />
            </TouchableOpacity>
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

      {/* Add Expense Modal */}
      <AddExpenseModal
        visible={addExpenseVisible}
        initialExpenseType="PERSONAL"
        onClose={() => setAddExpenseVisible(false)}
        onSuccess={() => refetch()}
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
          exportHook.executeExport(allExpenses, user?.name || user?.email || 'User')
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
          exportHook.executeExport(allExpenses, user?.name || user?.email || 'User')
        }
      />

      {/* Period Filter Modal */}
      <Modal
        visible={periodModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setPeriodModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setPeriodModalVisible(false)}
          />
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choose Filter Period</Text>
              <TouchableOpacity
                onPress={() => setPeriodModalVisible(false)}
                style={styles.modalCloseBtn}
              >
                <Ionicons name="close" size={22} color={COLORS.onSurface} />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.periodModalScroll}
            >
              {/* Presets Section */}
              <Text style={styles.modalSectionTitle}>Quick Presets</Text>
              <View style={styles.presetsGrid}>
                {PERIOD_OPTIONS.map((opt) => {
                  const isSelected = selectedDateRange === opt.value;
                  return (
                    <TouchableOpacity
                      key={opt.value}
                      style={[
                        styles.periodOptionItem,
                        isSelected && styles.periodOptionItemSelected,
                      ]}
                      activeOpacity={0.7}
                      onPress={() => {
                        setSelectedDateRange(opt.value);
                        setPeriodModalVisible(false);
                      }}
                    >
                      <View style={styles.periodOptionLeft}>
                        <View
                          style={[
                            styles.periodOptionIconBg,
                            isSelected && { backgroundColor: COLORS.secondary },
                          ]}
                        >
                          <Ionicons
                            name={opt.icon as never}
                            size={16}
                            color={isSelected ? '#ffffff' : COLORS.secondary}
                          />
                        </View>
                        <Text
                          style={[
                            styles.periodOptionLabel,
                            isSelected && { color: COLORS.secondary, fontWeight: '800' },
                          ]}
                        >
                          {opt.label}
                        </Text>
                      </View>
                      {isSelected ? (
                        <Ionicons name="checkmark-circle" size={18} color={COLORS.secondary} />
                      ) : (
                        <Ionicons name="chevron-forward" size={16} color={COLORS.outline} />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Specific Month Selector */}
              <Text style={[styles.modalSectionTitle, { marginTop: 18 }]}>Specific Month</Text>

              {/* Year Switcher Header */}
              <View style={styles.yearSelectorRow}>
                <TouchableOpacity
                  onPress={() => setPickerYear((y) => y - 1)}
                  style={styles.yearNavBtn}
                >
                  <Ionicons name="chevron-back" size={18} color={COLORS.onSurface} />
                </TouchableOpacity>
                <Text style={styles.yearText}>{pickerYear}</Text>
                <TouchableOpacity
                  onPress={() => setPickerYear((y) => y + 1)}
                  style={styles.yearNavBtn}
                >
                  <Ionicons name="chevron-forward" size={18} color={COLORS.onSurface} />
                </TouchableOpacity>
              </View>

              {/* 12 Month Grid */}
              <View style={styles.monthGrid}>
                {[
                  'Jan',
                  'Feb',
                  'Mar',
                  'Apr',
                  'May',
                  'Jun',
                  'Jul',
                  'Aug',
                  'Sep',
                  'Oct',
                  'Nov',
                  'Dec',
                ].map((mName, idx) => {
                  const mNum = idx + 1;
                  const monthVal = `month-${pickerYear}-${mNum}`;
                  const now = new Date();
                  const isCurrentMonthNow =
                    pickerYear === now.getFullYear() && idx === now.getMonth();
                  const isSelected =
                    selectedDateRange === monthVal ||
                    (isCurrentMonthNow && selectedDateRange === 'this-month');

                  return (
                    <TouchableOpacity
                      key={mName}
                      style={[styles.monthGridCell, isSelected && styles.monthGridCellSelected]}
                      onPress={() => {
                        setSelectedDateRange(isCurrentMonthNow ? 'this-month' : monthVal);
                        setPeriodModalVisible(false);
                      }}
                      activeOpacity={0.75}
                    >
                      <Text
                        style={[styles.monthCellText, isSelected && styles.monthCellTextSelected]}
                      >
                        {mName}
                      </Text>
                      {isCurrentMonthNow && (
                        <View
                          style={[
                            styles.currentMonthDot,
                            isSelected && { backgroundColor: '#ffffff' },
                          ]}
                        />
                      )}
                    </TouchableOpacity>
                  );
                })}
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
  headerSubtitle: {
    fontSize: 11,
    color: COLORS.outline,
    fontWeight: '500',
    marginTop: 2,
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
  clearFilterText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.secondary,
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
  categoryPillActive: {
    backgroundColor: COLORS.secondary + 'dd',
    borderColor: COLORS.secondary,
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
  dateHeaderText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.outline,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
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
    paddingBottom: 14,
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
  modalSectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.outline,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginTop: 4,
  },
  periodModalScroll: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
  },
  presetsGrid: {
    gap: 8,
  },
  yearSelectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 6,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainer,
  },
  yearNavBtn: {
    padding: 4,
  },
  yearText: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.onSurface,
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  monthGridCell: {
    width: '31%',
    paddingVertical: 12,
    borderRadius: 12,
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
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  monthCellTextSelected: {
    color: '#ffffff',
    fontWeight: '800',
  },
  currentMonthDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: COLORS.secondary,
    position: 'absolute',
    bottom: 5,
  },
  periodOptionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainer,
  },
  periodOptionItemSelected: {
    backgroundColor: COLORS.secondaryFixed + '50',
    borderColor: COLORS.secondary,
  },
  periodOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  periodOptionIconBg: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: COLORS.secondaryFixed,
    alignItems: 'center',
    justifyContent: 'center',
  },
  periodOptionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.onSurface,
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
});
