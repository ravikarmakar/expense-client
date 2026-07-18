import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { TopAppBar } from '../../../components/TopAppBar';
import { useExpenseAnalyticsInfinite, useMe } from '@workspace/api';
import { globalStyles } from '../../../styles/globalStyles';
import { ErrorView } from '../../../components/ErrorView';

// Subcomponents
import { SpentHeroCard } from '../components/SpentHeroCard';
import { SpendingTrendChart } from '../components/SpendingTrendChart';
import { CategorySpendingBreakdown } from '../components/CategorySpendingBreakdown';
import { AnalyticsExpensesList } from '../components/AnalyticsExpensesList';
import { SpentAnalyticsSkeleton } from '../components/SpentAnalyticsSkeleton';

// Styles
import { styles } from '../styles/analytics.styles';

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

  const { data, isLoading, isError, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useExpenseAnalyticsInfinite(timeframe, refDate, 15, filterType);

  const allExpenses = useMemo(() => {
    if (!data) return [];
    return data.pages.flatMap((page) => page.expenses);
  }, [data]);

  const activeChartData = useMemo(() => {
    const history = data?.pages[0]?.history;
    if (!history) return [];
    return history.map((item) => ({
      value: item.amount,
      label: item.label,
    }));
  }, [data]);

  const firstPage = data?.pages[0];

  // Helper variables derived when data is loaded
  const startDate = firstPage?.startDate ?? '';
  const endDate = firstPage?.endDate ?? '';
  const activeSpent = firstPage?.totalSpent ?? 0;
  const activePersonalSpent = firstPage?.totalPersonalSpent ?? 0;
  const activeGroupSpent = firstPage?.totalGroupSpent ?? 0;
  const myPayments = firstPage?.myPayments ?? 0;
  const myShare = firstPage?.myShare ?? 0;
  const activeCategorySpent = firstPage?.categorySpent ?? [];

  const prevSpent = firstPage
    ? filterType === 'personal'
      ? firstPage.comparison.totalPersonalSpent
      : filterType === 'group'
        ? firstPage.comparison.totalGroupSpent
        : firstPage.comparison.totalSpent
    : 0;

  let percentChange = 0;
  let spendingIncreased = false;
  if (prevSpent > 0) {
    percentChange = ((activeSpent - prevSpent) / prevSpent) * 100;
    spendingIncreased = percentChange > 0;
  }

  // Filter expenses (client-side filter on the fetched pages list just in case, but usually handled by hook parameter)
  const filteredExpenses = allExpenses.filter((e) => {
    if (filterType === 'all') return true;
    if (filterType === 'personal') return e.groupId === null;
    if (filterType === 'group') return e.groupId !== null;
    return true;
  });

  // Format dates for header subtitle
  const formatPeriodLabel = () => {
    if (!startDate || !endDate) return '';
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

        {isLoading ? (
          <SpentAnalyticsSkeleton />
        ) : isError || !data || !firstPage ? (
          <ErrorView message="Failed to load analytics data" onRetry={refetch} />
        ) : (
          <>
            {/* Date Range Subtitle */}
            <Text style={styles.periodLabel}>{formatPeriodLabel()}</Text>

            {/* Hero Spent Card */}
            <SpentHeroCard
              filterType={filterType}
              activeSpent={activeSpent}
              prevSpent={prevSpent}
              percentChange={percentChange}
              spendingIncreased={spendingIncreased}
              timeframe={timeframe}
              activePersonalSpent={activePersonalSpent}
              activeGroupSpent={activeGroupSpent}
              myPayments={myPayments}
              myShare={myShare}
            />

            {/* Spending Trend Chart */}
            <SpendingTrendChart
              activeSpent={activeSpent}
              timeframe={timeframe}
              activeChartData={activeChartData}
              chartWidth={chartWidth}
            />

            {/* Category Spent Breakdown */}
            <CategorySpendingBreakdown activeCategorySpent={activeCategorySpent} />

            {/* Expense List in Active Period with Load More */}
            <AnalyticsExpensesList
              filteredExpenses={filteredExpenses}
              currentUserId={me?.id}
              hasNextPage={!!hasNextPage}
              isFetchingNextPage={isFetchingNextPage}
              onLoadMore={fetchNextPage}
            />
          </>
        )}
      </ScrollView>
    </View>
  );
}
