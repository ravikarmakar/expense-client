import React, { useState, useMemo } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LineChart, BarChart } from 'react-native-gifted-charts';
import { TopAppBar } from '../components/TopAppBar';
import { COLORS, CURRENCY_SYMBOL, CATEGORY_ICONS } from '../constants/theme';
import { useExpenseAnalytics, useMe } from '@workspace/api';
import { globalStyles } from '../styles/globalStyles';
import { ExpenseItem } from '../components/ExpenseItem';
import { LoadingView } from '../components/LoadingView';
import { ErrorView } from '../components/ErrorView';

const screenWidth = Dimensions.get('window').width;

export default function TotalSpentScreen() {
  const router = useRouter();
  const [timeframe, setTimeframe] = useState<'today' | 'week' | 'month' | 'year'>('month');
  const [filterType, setFilterType] = useState<'all' | 'personal' | 'group'>('all');

  // Format today's date to YYYY-MM-DD in local time
  const getTodayString = () => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const [refDate] = useState<string>(getTodayString());
  const { data: me } = useMe();
  const { data: analytics, isLoading, isError, refetch } = useExpenseAnalytics(timeframe, refDate);

  // Dynamic client-side analytics re-aggregation
  const aggregatedData = useMemo(() => {
    if (!analytics) return null;

    const { expenses, history, comparison, timeframe: serverTimeframe } = analytics;

    // 1. Filter expenses
    const filteredExpenses = expenses.filter((e) => {
      if (filterType === 'all') return true;
      if (filterType === 'personal') return e.groupId === null;
      if (filterType === 'group') return e.groupId !== null;
      return true;
    });

    // 2. Calculate totals
    const activeSpent = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
    const activePersonalSpent = filteredExpenses.reduce(
      (sum, e) => sum + (e.groupId === null ? e.amount : 0),
      0
    );
    const activeGroupSpent = filteredExpenses.reduce(
      (sum, e) => sum + (e.groupId !== null ? e.amount : 0),
      0
    );

    // 3. Determine previous spent for comparison
    let prevSpent = comparison.totalSpent;
    if (filterType === 'personal') {
      prevSpent = comparison.totalPersonalSpent;
    } else if (filterType === 'group') {
      prevSpent = comparison.totalGroupSpent;
    }

    // 4. Calculate percentage change
    let percentChange = 0;
    let spendingIncreased = false;
    if (prevSpent > 0) {
      percentChange = ((activeSpent - prevSpent) / prevSpent) * 100;
      spendingIncreased = percentChange > 0;
    }

    // 5. Generate active chart history data
    const activeChartData = history.map((hl, index) => {
      const matched = filteredExpenses.filter((exp) => {
        if (serverTimeframe === 'year') {
          return exp.date.substring(0, 7) === hl.date;
        } else if (serverTimeframe === 'today') {
          const expHour = new Date(exp.createdAt).getHours();
          const bucketIdx = Math.floor(expHour / 4); // 0 to 5
          return bucketIdx === index;
        } else {
          return exp.date === hl.date;
        }
      });
      const amount = matched.reduce((sum, e) => sum + e.amount, 0);
      return {
        value: amount,
        label: hl.label,
      };
    });

    // 6. Group categories
    const categoryMap = new Map<string, number>();
    for (const exp of filteredExpenses) {
      categoryMap.set(exp.category, (categoryMap.get(exp.category) || 0) + exp.amount);
    }
    const activeCategorySpent = Array.from(categoryMap.entries())
      .map(([category, amount]) => {
        const percentage = activeSpent > 0 ? (amount / activeSpent) * 100 : 0;
        return {
          category,
          amount: Math.round(amount * 100) / 100,
          percentage: Math.round(percentage * 100) / 100,
        };
      })
      .sort((a, b) => b.amount - a.amount);

    // Calculate user specific group details (My payments vs My share)
    const myPayments = filteredExpenses
      .filter((e) => e.paidBy?.userId === me?.id)
      .reduce((sum, e) => sum + e.amount, 0);

    const myShare = filteredExpenses.reduce((sum, e) => {
      const mySplit = e.splits?.find((s) => s.userId === me?.id);
      return sum + (mySplit ? mySplit.amount : 0);
    }, 0);

    return {
      filteredExpenses,
      activeSpent,
      activePersonalSpent,
      activeGroupSpent,
      prevSpent,
      percentChange,
      spendingIncreased,
      activeChartData,
      activeCategorySpent,
      myPayments,
      myShare,
    };
  }, [analytics, filterType, me]);

  if (isLoading) {
    return <LoadingView />;
  }

  if (isError || !analytics || !aggregatedData) {
    return <ErrorView message="Failed to load analytics data" onRetry={refetch} />;
  }

  const { startDate, endDate } = analytics;
  const {
    filteredExpenses,
    activeSpent,
    activePersonalSpent,
    activeGroupSpent,
    prevSpent,
    percentChange,
    spendingIncreased,
    activeChartData,
    activeCategorySpent,
    myPayments,
    myShare,
  } = aggregatedData;

  // Format dates for header subtitle
  const formatPeriodLabel = () => {
    if (timeframe === 'today') {
      const d = new Date(startDate);
      return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    }
    if (timeframe === 'year') {
      return `Year ${startDate.substring(0, 4)}`;
    }
    const startObj = new Date(startDate);
    const endObj = new Date(endDate);
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
    return `${startObj.toLocaleDateString('en-IN', options)} - ${endObj.toLocaleDateString('en-IN', options)}`;
  };

  const chartWidth = screenWidth - 72; // Accounting for margins & paddings

  return (
    <View style={styles.container}>
      <TopAppBar title="Spent Analytics" showBack={true} onBack={() => router.back()} />

      <ScrollView
        contentContainerStyle={globalStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Timeframe Selector (Today, Week, Month, Year) */}
        <View style={styles.tabSelectorContainer}>
          {(['today', 'week', 'month', 'year'] as const).map((t) => (
            <TouchableOpacity
              key={t}
              style={[styles.tabBtn, timeframe === t && styles.tabBtnActive]}
              onPress={() => setTimeframe(t)}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabBtnText, timeframe === t && styles.tabBtnTextActive]}>
                {t.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Filter Type Selector (All, Personal, Group) */}
        <View style={styles.filterSelectorContainer}>
          {(['all', 'personal', 'group'] as const).map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.filterBtn, filterType === f && styles.filterBtnActive]}
              onPress={() => setFilterType(f)}
              activeOpacity={0.8}
            >
              <Text style={[styles.filterBtnText, filterType === f && styles.filterBtnTextActive]}>
                {f === 'all' ? 'ALL' : f === 'personal' ? 'PERSONAL' : 'GROUPS'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Date Range Subtitle */}
        <Text style={styles.periodLabel}>{formatPeriodLabel()}</Text>

        {/* Hero Spent Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroCardMain}>
            <View>
              <Text style={styles.heroLabel}>
                {filterType === 'all'
                  ? 'Total Spent'
                  : filterType === 'personal'
                    ? 'Personal Spent'
                    : 'Group Spent'}
              </Text>
              <Text style={styles.heroAmount}>
                {CURRENCY_SYMBOL}
                {activeSpent.toFixed(2)}
              </Text>
            </View>
            {prevSpent > 0 ? (
              <View
                style={[
                  styles.trendBadge,
                  {
                    backgroundColor: spendingIncreased
                      ? COLORS.errorContainer
                      : 'rgba(27, 94, 32, 0.1)',
                  },
                ]}
              >
                <Ionicons
                  name={spendingIncreased ? 'trending-up' : 'trending-down'}
                  size={14}
                  color={spendingIncreased ? COLORS.error : '#1b5e20'}
                />
                <Text
                  style={[
                    styles.trendText,
                    { color: spendingIncreased ? COLORS.error : '#1b5e20' },
                  ]}
                >
                  {Math.abs(percentChange).toFixed(1)}%
                </Text>
              </View>
            ) : null}
          </View>

          {prevSpent > 0 ? (
            <Text style={styles.comparisonSubtext}>
              {spendingIncreased ? 'Spent ' : 'Saved '}
              <Text style={{ fontWeight: '700' }}>
                {CURRENCY_SYMBOL}
                {Math.abs(activeSpent - prevSpent).toFixed(2)}
              </Text>{' '}
              compared to previous {timeframe} ({CURRENCY_SYMBOL}
              {prevSpent.toFixed(0)})
            </Text>
          ) : (
            <Text style={styles.comparisonSubtext}>No history for previous {timeframe}</Text>
          )}

          {filterType === 'all' && (
            <>
              <View style={styles.balanceDivider} />

              {/* Breakdown Personal vs Group */}
              <View style={styles.breakdownRow}>
                <View style={styles.breakdownCol}>
                  <View style={[styles.breakdownIconBg, { backgroundColor: '#e2dfff' }]}>
                    <Ionicons name="person" size={14} color={COLORS.secondary} />
                  </View>
                  <View>
                    <Text style={styles.breakdownLabel}>Personal</Text>
                    <Text style={styles.breakdownAmount}>
                      {CURRENCY_SYMBOL}
                      {activePersonalSpent.toFixed(2)}
                    </Text>
                  </View>
                </View>

                <View style={styles.breakdownDivider} />

                <View style={styles.breakdownCol}>
                  <View style={[styles.breakdownIconBg, { backgroundColor: '#e8f5e9' }]}>
                    <Ionicons name="people" size={14} color="#2e7d32" />
                  </View>
                  <View>
                    <Text style={styles.breakdownLabel}>Group Share</Text>
                    <Text style={styles.breakdownAmount}>
                      {CURRENCY_SYMBOL}
                      {activeGroupSpent.toFixed(2)}
                    </Text>
                  </View>
                </View>
              </View>
            </>
          )}

          {filterType === 'group' && (
            <>
              <View style={styles.balanceDivider} />

              {/* Breakdown My Payments vs My Share */}
              <View style={styles.breakdownRow}>
                <View style={styles.breakdownCol}>
                  <View style={[styles.breakdownIconBg, { backgroundColor: '#e2dfff' }]}>
                    <Ionicons name="card-outline" size={14} color={COLORS.secondary} />
                  </View>
                  <View>
                    <Text style={styles.breakdownLabel}>My Payments</Text>
                    <Text style={styles.breakdownAmount}>
                      {CURRENCY_SYMBOL}
                      {myPayments.toFixed(2)}
                    </Text>
                  </View>
                </View>

                <View style={styles.breakdownDivider} />

                <View style={styles.breakdownCol}>
                  <View style={[styles.breakdownIconBg, { backgroundColor: '#e8f5e9' }]}>
                    <Ionicons name="pie-chart-outline" size={14} color="#2e7d32" />
                  </View>
                  <View>
                    <Text style={styles.breakdownLabel}>My Share</Text>
                    <Text style={styles.breakdownAmount}>
                      {CURRENCY_SYMBOL}
                      {myShare.toFixed(2)}
                    </Text>
                  </View>
                </View>
              </View>
            </>
          )}
        </View>

        {/* Visual Trend Chart */}
        <View style={styles.sectionContainer}>
          <Text style={globalStyles.sectionTitle}>Spending Trend</Text>
          <View style={styles.chartCard}>
            {activeSpent === 0 ? (
              <View style={styles.emptyChartContainer}>
                <Ionicons name="bar-chart-outline" size={32} color={COLORS.outlineVariant} />
                <Text style={styles.emptyChartText}>No spending record in this period</Text>
              </View>
            ) : timeframe === 'month' ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={{ paddingRight: 20 }}>
                  <BarChart
                    data={activeChartData}
                    barWidth={10}
                    spacing={8}
                    initialSpacing={10}
                    height={150}
                    color={COLORS.primary}
                    noOfSections={3}
                    yAxisThickness={0}
                    xAxisThickness={1}
                    xAxisColor={COLORS.surfaceContainer}
                    rulesColor={COLORS.surfaceContainer}
                    rulesType="solid"
                    yAxisTextStyle={styles.axisLabelText}
                    xAxisLabelTextStyle={styles.axisLabelText}
                  />
                </View>
              </ScrollView>
            ) : (
              <LineChart
                data={activeChartData}
                width={chartWidth}
                height={150}
                areaChart
                thickness={3}
                color={COLORS.primary}
                startFillColor={COLORS.primary}
                endFillColor={COLORS.primary}
                startOpacity={0.4}
                endOpacity={0.05}
                noOfSections={3}
                yAxisThickness={0}
                xAxisThickness={1}
                xAxisColor={COLORS.surfaceContainer}
                rulesColor={COLORS.surfaceContainer}
                rulesType="solid"
                spacing={
                  timeframe === 'today'
                    ? (chartWidth - 20) / 5
                    : timeframe === 'week'
                      ? (chartWidth - 20) / 6
                      : (chartWidth - 20) / 11
                }
                initialSpacing={10}
                dataPointsColor={COLORS.primary}
                dataPointsRadius={4}
                xAxisLabelTextStyle={styles.axisLabelText}
                yAxisTextStyle={styles.axisLabelText}
              />
            )}
          </View>
        </View>

        {/* Category Spent Breakdown */}
        <View style={styles.sectionContainer}>
          <Text style={globalStyles.sectionTitle}>Spending by Category</Text>
          <View style={styles.categoryCard}>
            {activeCategorySpent.length === 0 ? (
              <Text style={styles.noDataText}>No categories to display</Text>
            ) : (
              <View style={styles.listViewContainer}>
                {activeCategorySpent.map((item) => {
                  const config = CATEGORY_ICONS[item.category] || CATEGORY_ICONS.Other;
                  return (
                    <View key={item.category} style={styles.categoryRow}>
                      <View style={styles.categoryHeader}>
                        <View style={styles.categoryInfo}>
                          <View style={[styles.categoryIconBg, { backgroundColor: config.bg }]}>
                            {config.lib === 'Ionicons' ? (
                              <Ionicons
                                name={config.icon as never}
                                size={15}
                                color={config.color}
                              />
                            ) : (
                              <MaterialIcons
                                name={config.icon as never}
                                size={15}
                                color={config.color}
                              />
                            )}
                          </View>
                          <Text style={styles.categoryName}>{item.category}</Text>
                          <Text style={styles.categoryPercentage}>
                            {item.percentage.toFixed(0)}%
                          </Text>
                        </View>
                        <Text style={styles.categoryAmountText}>
                          {CURRENCY_SYMBOL}
                          {item.amount.toFixed(2)}
                        </Text>
                      </View>
                      <View style={styles.categoryProgressTrack}>
                        <View
                          style={[
                            styles.categoryProgressFill,
                            { width: `${item.percentage}%`, backgroundColor: config.color },
                          ]}
                        />
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        </View>

        {/* Expense List in Active Period */}
        <View style={[styles.sectionContainer, { marginBottom: 40 }]}>
          <Text style={globalStyles.sectionTitle}>Expenses in Period</Text>
          <View style={styles.expenseList}>
            {filteredExpenses.length === 0 ? (
              <View style={styles.emptyExpensesContainer}>
                <Ionicons name="receipt-outline" size={32} color={COLORS.outlineVariant} />
                <Text style={styles.emptyExpensesText}>No expenses logged in this period</Text>
              </View>
            ) : (
              filteredExpenses.map((expense) => (
                <ExpenseItem key={expense.id} expense={expense} currentUserId={me?.id} />
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  tabSelectorContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceContainer,
    borderRadius: 16,
    padding: 4,
    gap: 4,
    marginBottom: 12,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  tabBtnActive: {
    backgroundColor: COLORS.surface,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  tabBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.outline,
    letterSpacing: 0.5,
  },
  tabBtnTextActive: {
    color: COLORS.primary,
  },
  filterSelectorContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: 12,
    padding: 3,
    gap: 3,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainer,
  },
  filterBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9,
  },
  filterBtnActive: {
    backgroundColor: COLORS.primary,
  },
  filterBtnText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: COLORS.outline,
    letterSpacing: 0.5,
  },
  filterBtnTextActive: {
    color: '#ffffff',
  },
  periodLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.outline,
    textTransform: 'uppercase',
    letterSpacing: 1,
    textAlign: 'center',
    marginBottom: 20,
  },
  heroCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: COLORS.surfaceContainer,
    padding: 20,
    marginBottom: 24,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
  },
  heroCardMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  heroLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.outline,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  heroAmount: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.onSurface,
    marginTop: 4,
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  trendText: {
    fontSize: 12,
    fontWeight: '700',
  },
  comparisonSubtext: {
    fontSize: 12,
    color: COLORS.outline,
    lineHeight: 18,
  },
  balanceDivider: {
    height: 1,
    backgroundColor: COLORS.surfaceContainer,
    marginVertical: 16,
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  breakdownCol: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  breakdownIconBg: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  breakdownLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.outline,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  breakdownAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  breakdownDivider: {
    width: 1,
    height: 32,
    backgroundColor: COLORS.surfaceContainer,
    marginHorizontal: 16,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  chartCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: COLORS.surfaceContainer,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  axisLabelText: {
    color: COLORS.outline,
    fontSize: 9,
    fontWeight: '600',
  },
  emptyChartContainer: {
    height: 150,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  emptyChartText: {
    fontSize: 12,
    color: COLORS.outline,
    fontWeight: '600',
  },
  categoryCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: COLORS.surfaceContainer,
    padding: 20,
  },
  noDataText: {
    textAlign: 'center',
    color: COLORS.outline,
    fontSize: 13,
    paddingVertical: 12,
  },
  listViewContainer: {
    gap: 16,
  },
  categoryRow: {
    gap: 8,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  categoryIconBg: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  categoryPercentage: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.outline,
    backgroundColor: COLORS.surfaceContainerLow,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  categoryAmountText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  categoryProgressTrack: {
    height: 6,
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: 3,
    overflow: 'hidden',
  },
  categoryProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  expenseList: {
    gap: 12,
  },
  emptyExpensesContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: COLORS.surfaceContainer,
    paddingVertical: 32,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  emptyExpensesText: {
    fontSize: 12,
    color: COLORS.outline,
    fontWeight: '600',
  },
});
