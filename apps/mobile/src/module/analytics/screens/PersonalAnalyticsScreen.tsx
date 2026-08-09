import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useExpenseAnalyticsInfinite, useMe, useCategories } from '@workspace/api';
import { globalStyles } from '../../../styles/globalStyles';
import { ErrorView } from '../../../components/ErrorView';
import { COLORS, CURRENCY_SYMBOL } from '../../../constants/theme';
import { useTheme } from '../../../context/ThemeContext';
import { useExport } from '../../../hooks/useExport';
import { ExportModalBottomSheet } from '../../../components/ExportModalBottomSheet';
import { ExportProgressAndSuccessModal } from '../../../components/ExportProgressAndSuccessModal';
import { getCategoryVisuals } from '../../../constants/categories';
import { PieChart } from 'react-native-gifted-charts';

// Subcomponents
import { SpendingTrendChart } from '../components/SpendingTrendChart';
import { AnalyticsExpensesList } from '../components/AnalyticsExpensesList';
import { SpentAnalyticsSkeleton } from '../components/SpentAnalyticsSkeleton';
import { FloatingDropdownMenu } from '../../../components/FloatingDropdownMenu';

const screenWidth = Dimensions.get('window').width;
const PURPLE_PRIMARY = '#4f46e5';

const TIMEFRAME_OPTIONS = [
  { label: 'Today', value: 'today', icon: 'today-outline' },
  { label: '7 Days', value: 'week', icon: 'time-outline' },
  { label: 'This Month', value: 'month', icon: 'calendar-number-outline' },
  { label: 'Last Month', value: 'last_month', icon: 'calendar-clear-outline' },
  { label: 'This Year', value: 'year', icon: 'infinite-outline' },
  { label: 'All Time', value: 'all', icon: 'globe-outline' },
  { label: 'Select Month', value: 'custom_month', icon: 'calendar-outline' },
  { label: 'Select Year', value: 'custom_year', icon: 'ribbon-outline' },
  { label: 'Choose Date', value: 'custom_date', icon: 'create-outline' },
] as const;

export default function PersonalAnalyticsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const [timeframe, setTimeframe] = useState<
    | 'today'
    | 'week'
    | 'month'
    | 'year'
    | 'all'
    | 'custom_month'
    | 'custom_year'
    | 'custom_date'
    | string
  >('month');
  const [isTimeframeDropdownOpen, setIsTimeframeDropdownOpen] = useState(false);

  // Format today's date to YYYY-MM-DD in local time
  const getTodayString = () => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  // Format last month's reference date string (1st day of last month)
  const getLastMonthString = () => {
    const now = new Date();
    const d = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    return `${yyyy}-${mm}-01`;
  };

  const [refDate, setRefDate] = useState<string>(getTodayString());

  const isTodayDate = (dateStr: string) => {
    return dateStr === getTodayString();
  };

  const isCurrentMonth = (dateStr: string) => {
    if (!dateStr) return true;
    const parts = dateStr.split('-').map(Number);
    if (parts.length < 2) return true;
    const now = new Date();
    return parts[0] === now.getFullYear() && parts[1] === now.getMonth() + 1;
  };

  const isLastMonth = (dateStr: string) => {
    if (!dateStr) return false;
    const parts = dateStr.split('-').map(Number);
    if (parts.length < 2) return false;
    const now = new Date();
    const lm = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    return parts[0] === lm.getFullYear() && parts[1] === lm.getMonth() + 1;
  };

  const getDynamicTimeframeLabel = () => {
    const todayStr = getTodayString();
    if (refDate && refDate !== todayStr) {
      const parts = refDate.split('-').map(Number);
      if (parts.length >= 1 && !isNaN(parts[0])) {
        if (timeframe === 'custom_year') {
          return `Year ${parts[0]}`;
        }
        if (parts.length === 3 && !isNaN(parts[1]) && !isNaN(parts[2])) {
          const refObj = new Date(parts[0], parts[1] - 1, parts[2]);
          if (timeframe === 'month') {
            if (isCurrentMonth(refDate)) {
              return 'This Month';
            }
            if (isLastMonth(refDate)) {
              return 'Last Month';
            }
            return refObj.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
          }
          if (timeframe === 'today') {
            return refObj.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
          }
          if (timeframe === 'year') {
            return `Year ${parts[0]}`;
          }
        }
      }
    }

    if (timeframe === 'today') return 'Today';
    if (timeframe === 'week') return '7 Days';
    if (timeframe === 'month') {
      if (isLastMonth(refDate)) return 'Last Month';
      return 'This Month';
    }
    if (timeframe === 'year') return 'This Year';
    if (timeframe === 'all') return 'All Time';
    if (timeframe === 'custom_year') {
      const yr = refDate ? refDate.split('-')[0] : new Date().getFullYear();
      return `Year ${yr}`;
    }
    return 'This Month';
  };

  const { data: me } = useMe();
  const { data: categoriesData } = useCategories();
  const customCategories = useMemo(() => categoriesData?.custom || [], [categoriesData]);
  const exportHook = useExport();

  const apiTimeframe: 'today' | 'week' | 'month' | 'year' | 'all' =
    timeframe === 'custom_year'
      ? 'year'
      : timeframe === 'custom_month'
        ? 'month'
        : timeframe === 'custom_date'
          ? 'today'
          : ['today', 'week', 'month', 'year', 'all'].includes(timeframe)
            ? (timeframe as 'today' | 'week' | 'month' | 'year' | 'all')
            : 'month';

  // Fetch strictly personal analytics from server
  const { data, isLoading, isError, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useExpenseAnalyticsInfinite(apiTimeframe, refDate, 15, 'personal');

  const allExpenses = useMemo(() => {
    if (!data) return [];
    return data.pages.flatMap((page) => page.expenses);
  }, [data]);

  const activeChartData = useMemo(() => {
    const history = data?.pages[0]?.history;
    if (!history) return [];
    return history.map((item) => {
      let dateLabel = item.label;
      if (item.date) {
        const d = new Date(item.date);
        dateLabel = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
      } else if (timeframe === 'month' && !isNaN(Number(item.label))) {
        const parts = refDate.split('-').map(Number);
        const y = parts[0] || new Date().getFullYear();
        const m = (parts[1] || new Date().getMonth() + 1) - 1;
        const dayNum = Number(item.label);
        const d = new Date(y, m, dayNum);
        dateLabel = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
      }
      return {
        value: item.amount,
        label: item.label,
        dateLabel: dateLabel,
      };
    });
  }, [data, timeframe, refDate]);

  const firstPage = data?.pages[0];

  // Helper variables derived when data is loaded
  const startDate = firstPage?.startDate ?? '';
  const endDate = firstPage?.endDate ?? '';
  const activeSpent = firstPage?.totalPersonalSpent ?? firstPage?.totalSpent ?? 0;
  const activeCategorySpent = firstPage?.categorySpent ?? [];
  const prevSpent =
    firstPage?.comparison?.totalPersonalSpent ?? firstPage?.comparison?.totalSpent ?? 0;

  let percentChange = 0;
  let spendingIncreased = false;
  if (prevSpent > 0) {
    percentChange = ((activeSpent - prevSpent) / prevSpent) * 100;
    spendingIncreased = percentChange > 0;
  }

  // Filter personal expenses
  const filteredExpenses = useMemo(() => {
    return allExpenses.filter((e) => e.groupId === null);
  }, [allExpenses]);

  // Statistics calculation for personal expenses
  const transactionCount = filteredExpenses.length;
  const avgExpense = transactionCount > 0 ? activeSpent / transactionCount : 0;

  const daysInPeriod = useMemo(() => {
    if (timeframe === 'today') return 1;
    if (timeframe === 'week') return 7;
    if (timeframe === 'month') return 30;
    if (timeframe === 'all') return 365 * 5;
    return 365;
  }, [timeframe]);

  const dailyVelocity = activeSpent / daysInPeriod;

  const topExpense = useMemo(() => {
    if (filteredExpenses.length === 0) return null;
    return [...filteredExpenses].sort((a, b) => b.amount - a.amount)[0];
  }, [filteredExpenses]);

  // Top spending category insight
  const topCategoryInsight = useMemo(() => {
    if (!activeCategorySpent || activeCategorySpent.length === 0 || activeSpent === 0) return null;
    const sorted = [...activeCategorySpent].sort((a, b) => b.amount - a.amount);
    const top = sorted[0];
    const percentage = ((top.amount / activeSpent) * 100).toFixed(0);
    return {
      name: top.category,
      amount: top.amount,
      percentage,
      visuals: getCategoryVisuals(top.category, customCategories),
    };
  }, [activeCategorySpent, activeSpent, customCategories]);

  // Most Frequent Category habit insight
  const mostFrequentCategory = useMemo(() => {
    if (!filteredExpenses || filteredExpenses.length === 0) return null;
    const counts: Record<string, number> = {};
    filteredExpenses.forEach((e) => {
      const cat = e.category || 'Other';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    let topCat = '';
    let maxCount = 0;
    Object.entries(counts).forEach(([cat, cnt]) => {
      if (cnt > maxCount) {
        maxCount = cnt;
        topCat = cat;
      }
    });
    if (maxCount <= 1) return null;
    return {
      name: topCat,
      count: maxCount,
      visuals: getCategoryVisuals(topCat, customCategories),
    };
  }, [filteredExpenses, customCategories]);

  // Peak Spending Day insight
  const peakSpendingDay = useMemo(() => {
    if (!filteredExpenses || filteredExpenses.length === 0) return null;
    const dayTotals: Record<string, number> = {};
    filteredExpenses.forEach((e) => {
      const dayName = new Date(e.date).toLocaleDateString('en-IN', { weekday: 'long' });
      dayTotals[dayName] = (dayTotals[dayName] || 0) + e.amount;
    });
    let topDay = '';
    let maxSpent = 0;
    Object.entries(dayTotals).forEach(([day, amt]) => {
      if (amt > maxSpent) {
        maxSpent = amt;
        topDay = day;
      }
    });
    if (maxSpent === 0) return null;
    const pctOfDay = activeSpent > 0 ? ((maxSpent / activeSpent) * 100).toFixed(0) : '0';
    return {
      dayName: topDay,
      amount: maxSpent,
      percentage: pctOfDay,
    };
  }, [filteredExpenses, activeSpent]);

  // Monthly Spending Projection insight
  const projectedMonthlySpend = useMemo(() => {
    if (timeframe !== 'month' || activeSpent === 0) return null;
    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const currentDay = now.getDate();
    if (currentDay === 0) return null;
    const dailyRate = activeSpent / currentDay;
    const projected = dailyRate * daysInMonth;
    return {
      dailyRate: dailyRate.toFixed(0),
      projected: projected.toFixed(0),
      daysLeft: daysInMonth - currentDay,
    };
  }, [timeframe, activeSpent]);

  // Compute pie chart slices for category distribution
  const pieChartData = useMemo(() => {
    if (!activeCategorySpent || activeCategorySpent.length === 0 || activeSpent === 0) return [];
    return activeCategorySpent.map((item) => {
      const visuals = getCategoryVisuals(item.category, customCategories);
      return {
        value: item.amount,
        color: visuals.color || PURPLE_PRIMARY,
        text: item.category,
      };
    });
  }, [activeCategorySpent, activeSpent, customCategories]);

  // Format dates for header subtitle
  const formatPeriodLabel = () => {
    if (!startDate || !endDate) return '';
    if (timeframe === 'all') return 'All Time';
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

  const chartWidth = screenWidth - 72;

  return (
    <View style={[localStyles.container, isDark && localStyles.containerDark]}>
      {/* Top App Bar: Left-Aligned Large Title & Right AI Icon */}
      <View
        style={[
          localStyles.headerContainer,
          isDark && localStyles.headerContainerDark,
          { paddingTop: insets.top + 10 },
        ]}
      >
        <View style={localStyles.headerRow}>
          <View style={localStyles.headerLeftRow}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={localStyles.headerBackBtn}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={24} color={isDark ? '#F9FAFB' : COLORS.onSurface} />
            </TouchableOpacity>
            <Text style={[localStyles.headerTitleLeft, isDark && localStyles.headerTitleLeftDark]}>
              Personal Analytics
            </Text>
          </View>

          <TouchableOpacity style={localStyles.aiIconBtn} activeOpacity={0.7}>
            <MaterialIcons
              name="auto-awesome"
              size={26}
              color={isDark ? '#A5B4FC' : COLORS.secondary}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[globalStyles.scrollContent, { paddingBottom: 60 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Unified Control Header: Date Range Text on Left, Timeframe Dropdown on Right */}
        <View style={localStyles.controlHeaderRow}>
          {/* Left Side: Light Purple Shade Box Badge */}
          <View style={[localStyles.purpleDateBox, isDark && localStyles.purpleDateBoxDark]}>
            <Ionicons
              name="calendar-outline"
              size={14}
              color={isDark ? '#A5B4FC' : COLORS.secondary}
            />
            <Text style={[localStyles.purpleDateBoxText, isDark && { color: '#A5B4FC' }]}>
              {formatPeriodLabel()}
            </Text>
          </View>

          {/* Right Side: Compact Timeframe Dropdown */}
          <TouchableOpacity
            style={[localStyles.rightDropdownBtn, isDark && localStyles.rightDropdownBtnDark]}
            onPress={() => setIsTimeframeDropdownOpen(!isTimeframeDropdownOpen)}
            activeOpacity={0.8}
          >
            <Text style={[localStyles.rightDropdownText, isDark && { color: '#A5B4FC' }]}>
              {getDynamicTimeframeLabel()}
            </Text>
            <Ionicons
              name={isTimeframeDropdownOpen ? 'chevron-up' : 'chevron-down'}
              size={13}
              color={isDark ? '#A5B4FC' : COLORS.secondary}
            />
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <SpentAnalyticsSkeleton />
        ) : isError || !data || !firstPage ? (
          <ErrorView message="Failed to load personal analytics" onRetry={refetch} />
        ) : (
          <>
            {/* Ultra-Premium Glassmorphic Hero Analytics Card */}
            <LinearGradient
              colors={['#2e1065', '#4c1d95', '#6b21a8']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={localStyles.heroGradientCard}
            >
              {/* Decorative Background Orbs */}
              <View style={localStyles.orb1} />
              <View style={localStyles.orb2} />

              <View style={localStyles.heroHeaderRow}>
                <View style={localStyles.heroTagBadge}>
                  <Ionicons name="sparkles" size={12} color="#c084fc" />
                  <Text style={localStyles.heroTagText}>PERSONAL SPENDING</Text>
                </View>

                {prevSpent > 0 && (
                  <View
                    style={[
                      localStyles.trendBadge,
                      {
                        backgroundColor: spendingIncreased
                          ? 'rgba(239, 68, 68, 0.25)'
                          : 'rgba(52, 211, 153, 0.25)',
                      },
                    ]}
                  >
                    <Ionicons
                      name={spendingIncreased ? 'trending-up-sharp' : 'trending-down-sharp'}
                      size={14}
                      color={spendingIncreased ? '#fca5a5' : '#6ee7b7'}
                    />
                    <Text
                      style={[
                        localStyles.trendText,
                        { color: spendingIncreased ? '#fca5a5' : '#6ee7b7' },
                      ]}
                    >
                      {spendingIncreased ? '+' : ''}
                      {percentChange.toFixed(1)}%
                    </Text>
                  </View>
                )}
              </View>

              {/* Amount Display */}
              <View style={localStyles.heroAmountContainer}>
                <Text style={localStyles.heroCurrencySymbol}>{CURRENCY_SYMBOL}</Text>
                <Text style={localStyles.heroAmountText}>
                  {activeSpent.toLocaleString('en-IN', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </Text>
              </View>

              {/* Comparison Subtitle */}
              {prevSpent > 0 ? (
                <Text style={localStyles.heroComparisonText}>
                  {spendingIncreased ? 'Spent ' : 'Saved '}
                  <Text style={{ fontWeight: '800', color: '#ffffff' }}>
                    {CURRENCY_SYMBOL}
                    {Math.abs(activeSpent - prevSpent).toFixed(2)}
                  </Text>{' '}
                  vs previous {timeframe} ({CURRENCY_SYMBOL}
                  {prevSpent.toFixed(0)})
                </Text>
              ) : (
                <Text style={localStyles.heroComparisonText}>
                  First tracked transactions for this {timeframe}
                </Text>
              )}

              {/* Quick Stat Bar inside Hero */}
              <View style={localStyles.heroStatsDivider} />

              <View style={localStyles.heroStatsGrid}>
                <View style={localStyles.heroStatCol}>
                  <Text style={localStyles.heroStatLabel}>DAILY PACE</Text>
                  <Text style={localStyles.heroStatValue}>
                    {CURRENCY_SYMBOL}
                    {dailyVelocity.toFixed(0)}
                    <Text style={localStyles.heroStatUnit}>/day</Text>
                  </Text>
                </View>

                <View style={localStyles.heroStatDividerCol} />

                <View style={localStyles.heroStatCol}>
                  <Text style={localStyles.heroStatLabel}>AVG ENTRY</Text>
                  <Text style={localStyles.heroStatValue}>
                    {CURRENCY_SYMBOL}
                    {avgExpense.toFixed(0)}
                  </Text>
                </View>

                <View style={localStyles.heroStatDividerCol} />

                <View style={localStyles.heroStatCol}>
                  <Text style={localStyles.heroStatLabel}>TRANSACTIONS</Text>
                  <Text style={localStyles.heroStatValue}>{transactionCount}</Text>
                </View>
              </View>
            </LinearGradient>

            {/* Smart Personal Insights 2-Column Grid */}
            {(topCategoryInsight ||
              topExpense ||
              mostFrequentCategory ||
              peakSpendingDay ||
              projectedMonthlySpend) && (
              <View style={{ marginBottom: 20 }}>
                <Text style={[localStyles.streamSectionTitle, isDark && { color: '#F9FAFB' }]}>
                  Spending Highlights
                </Text>

                <View style={localStyles.highlightGrid}>
                  {topCategoryInsight && (
                    <View style={[localStyles.gridHighlightCard, isDark && localStyles.cardDark]}>
                      <View style={localStyles.gridCardHeader}>
                        <View
                          style={[
                            localStyles.gridIconCircle,
                            { backgroundColor: topCategoryInsight.visuals.bg },
                          ]}
                        >
                          {topCategoryInsight.visuals.lib === 'Ionicons' ? (
                            <Ionicons
                              name={topCategoryInsight.visuals.icon as never}
                              size={16}
                              color={topCategoryInsight.visuals.color}
                            />
                          ) : (
                            <MaterialIcons
                              name={topCategoryInsight.visuals.icon as never}
                              size={16}
                              color={topCategoryInsight.visuals.color}
                            />
                          )}
                        </View>
                        <View
                          style={[
                            localStyles.gridBadge,
                            isDark && { backgroundColor: 'rgba(165, 180, 252, 0.2)' },
                          ]}
                        >
                          <Text style={[localStyles.gridBadgeText, isDark && { color: '#A5B4FC' }]}>
                            {topCategoryInsight.percentage}%
                          </Text>
                        </View>
                      </View>
                      <Text style={[localStyles.gridCardLabel, isDark && { color: '#9CA3AF' }]}>
                        Top Driver
                      </Text>
                      <Text
                        style={[localStyles.gridCardValue, isDark && { color: '#F9FAFB' }]}
                        numberOfLines={1}
                      >
                        {topCategoryInsight.name}
                      </Text>
                      <Text
                        style={[localStyles.gridCardSub, isDark && { color: '#9CA3AF' }]}
                        numberOfLines={1}
                      >
                        {CURRENCY_SYMBOL}
                        {topCategoryInsight.amount.toFixed(0)} total
                      </Text>
                    </View>
                  )}

                  {topExpense && (
                    <View style={[localStyles.gridHighlightCard, isDark && localStyles.cardDark]}>
                      <View style={localStyles.gridCardHeader}>
                        <View style={[localStyles.gridIconCircle, { backgroundColor: '#fee2e2' }]}>
                          <Ionicons name="flame-outline" size={16} color="#dc2626" />
                        </View>
                        <View style={[localStyles.gridBadge, { backgroundColor: '#fee2e2' }]}>
                          <Text style={[localStyles.gridBadgeText, { color: '#dc2626' }]}>
                            Peak
                          </Text>
                        </View>
                      </View>
                      <Text style={[localStyles.gridCardLabel, isDark && { color: '#9CA3AF' }]}>
                        Largest Expense
                      </Text>
                      <Text
                        style={[localStyles.gridCardValue, isDark && { color: '#F9FAFB' }]}
                        numberOfLines={1}
                      >
                        {topExpense.title}
                      </Text>
                      <Text
                        style={[localStyles.gridCardSub, isDark && { color: '#9CA3AF' }]}
                        numberOfLines={1}
                      >
                        {CURRENCY_SYMBOL}
                        {topExpense.amount.toFixed(0)}
                      </Text>
                    </View>
                  )}

                  {mostFrequentCategory && (
                    <View style={[localStyles.gridHighlightCard, isDark && localStyles.cardDark]}>
                      <View style={localStyles.gridCardHeader}>
                        <View style={[localStyles.gridIconCircle, { backgroundColor: '#d1fae5' }]}>
                          <Ionicons name="repeat-outline" size={16} color="#059669" />
                        </View>
                        <View style={[localStyles.gridBadge, { backgroundColor: '#d1fae5' }]}>
                          <Text style={[localStyles.gridBadgeText, { color: '#059669' }]}>
                            {mostFrequentCategory.count}x
                          </Text>
                        </View>
                      </View>
                      <Text style={[localStyles.gridCardLabel, isDark && { color: '#9CA3AF' }]}>
                        Top Habit
                      </Text>
                      <Text
                        style={[localStyles.gridCardValue, isDark && { color: '#F9FAFB' }]}
                        numberOfLines={1}
                      >
                        {mostFrequentCategory.name}
                      </Text>
                      <Text
                        style={[localStyles.gridCardSub, isDark && { color: '#9CA3AF' }]}
                        numberOfLines={1}
                      >
                        {mostFrequentCategory.count} purchases
                      </Text>
                    </View>
                  )}

                  {peakSpendingDay && (
                    <View style={[localStyles.gridHighlightCard, isDark && localStyles.cardDark]}>
                      <View style={localStyles.gridCardHeader}>
                        <View style={[localStyles.gridIconCircle, { backgroundColor: '#fef3c7' }]}>
                          <Ionicons name="calendar-sharp" size={16} color="#d97706" />
                        </View>
                        <View style={[localStyles.gridBadge, { backgroundColor: '#fef3c7' }]}>
                          <Text style={[localStyles.gridBadgeText, { color: '#d97706' }]}>
                            {peakSpendingDay.percentage}%
                          </Text>
                        </View>
                      </View>
                      <Text style={[localStyles.gridCardLabel, isDark && { color: '#9CA3AF' }]}>
                        Busiest Day
                      </Text>
                      <Text
                        style={[localStyles.gridCardValue, isDark && { color: '#F9FAFB' }]}
                        numberOfLines={1}
                      >
                        {peakSpendingDay.dayName}s
                      </Text>
                      <Text
                        style={[localStyles.gridCardSub, isDark && { color: '#9CA3AF' }]}
                        numberOfLines={1}
                      >
                        {CURRENCY_SYMBOL}
                        {peakSpendingDay.amount.toFixed(0)} spent
                      </Text>
                    </View>
                  )}

                  {projectedMonthlySpend && (
                    <View
                      style={[localStyles.gridHighlightCardFull, isDark && localStyles.cardDark]}
                    >
                      <View style={localStyles.gridCardHeader}>
                        <View style={[localStyles.gridIconCircle, { backgroundColor: '#dbeafe' }]}>
                          <Ionicons name="trending-up-outline" size={16} color="#2563eb" />
                        </View>
                        <View style={[localStyles.gridBadge, { backgroundColor: '#dbeafe' }]}>
                          <Text style={[localStyles.gridBadgeText, { color: '#2563eb' }]}>
                            ~{CURRENCY_SYMBOL}
                            {projectedMonthlySpend.projected}
                          </Text>
                        </View>
                      </View>
                      <Text style={[localStyles.gridCardLabel, isDark && { color: '#9CA3AF' }]}>
                        Monthly Spend Forecast
                      </Text>
                      <Text style={[localStyles.gridCardSub, isDark && { color: '#9CA3AF' }]}>
                        Current Pace: {CURRENCY_SYMBOL}
                        {projectedMonthlySpend.dailyRate}/day ({projectedMonthlySpend.daysLeft} days
                        remaining)
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            )}

            {/* Spending Trend High-Definition Chart */}
            <SpendingTrendChart
              activeSpent={activeSpent}
              timeframe={apiTimeframe as 'today' | 'week' | 'month' | 'year'}
              activeChartData={activeChartData}
              chartWidth={chartWidth}
              themeColor={isDark ? '#818CF8' : PURPLE_PRIMARY}
            />

            {/* Category Breakdown with Rounded Progress Bars */}
            <View style={[localStyles.categoryCard, isDark && localStyles.cardDark]}>
              <View style={localStyles.categoryCardHeader}>
                <View>
                  <Text style={[localStyles.categoryCardTitle, isDark && { color: '#F9FAFB' }]}>
                    Category Breakdown
                  </Text>
                  <Text style={[localStyles.categoryCardSub, isDark && { color: '#9CA3AF' }]}>
                    Distribution across personal categories
                  </Text>
                </View>
                <View
                  style={[
                    localStyles.categoryCountBadge,
                    isDark && { backgroundColor: 'rgba(255, 255, 255, 0.08)' },
                  ]}
                >
                  <Text style={[localStyles.categoryCountText, isDark && { color: '#9CA3AF' }]}>
                    {activeCategorySpent.length} Categories
                  </Text>
                </View>
              </View>

              {activeCategorySpent.length === 0 ? (
                <View style={localStyles.emptyCategoryState}>
                  <Ionicons
                    name="pie-chart-outline"
                    size={32}
                    color={isDark ? '#9CA3AF' : COLORS.outlineVariant}
                  />
                  <Text style={[localStyles.emptyCategoryText, isDark && { color: '#9CA3AF' }]}>
                    No category breakdown available
                  </Text>
                </View>
              ) : (
                <View>
                  {/* Category Donut Pie Chart */}
                  <View
                    style={[
                      localStyles.pieChartContainer,
                      isDark && { borderBottomColor: 'rgba(255, 255, 255, 0.08)' },
                    ]}
                  >
                    <PieChart
                      data={pieChartData}
                      donut
                      radius={68}
                      innerRadius={48}
                      innerCircleColor={isDark ? '#101917' : COLORS.surface}
                      centerLabelComponent={() => (
                        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                          <Text
                            style={[localStyles.pieCenterLabel, isDark && { color: '#9CA3AF' }]}
                          >
                            TOTAL
                          </Text>
                          <Text
                            style={[localStyles.pieCenterValue, isDark && { color: '#F9FAFB' }]}
                          >
                            {CURRENCY_SYMBOL}
                            {activeSpent > 9999
                              ? `${(activeSpent / 1000).toFixed(1)}k`
                              : activeSpent.toFixed(0)}
                          </Text>
                        </View>
                      )}
                    />
                  </View>

                  <View style={{ gap: 14, marginTop: 16 }}>
                    {activeCategorySpent.map((item) => {
                      const pct = activeSpent > 0 ? (item.amount / activeSpent) * 100 : 0;
                      const visuals = getCategoryVisuals(item.category, customCategories);

                      return (
                        <View key={item.category} style={localStyles.categoryRowItem}>
                          <View
                            style={[
                              localStyles.categoryIconCircle,
                              { backgroundColor: visuals.bg },
                            ]}
                          >
                            {visuals.lib === 'Ionicons' ? (
                              <Ionicons
                                name={visuals.icon as never}
                                size={16}
                                color={visuals.color}
                              />
                            ) : (
                              <MaterialIcons
                                name={visuals.icon as never}
                                size={16}
                                color={visuals.color}
                              />
                            )}
                          </View>

                          <View style={{ flex: 1 }}>
                            <View style={localStyles.categoryMetaRow}>
                              <Text
                                style={[
                                  localStyles.categoryNameText,
                                  isDark && { color: '#F9FAFB' },
                                ]}
                              >
                                {item.category}
                              </Text>
                              <Text
                                style={[
                                  localStyles.categoryAmountText,
                                  isDark && { color: '#F9FAFB' },
                                ]}
                              >
                                {CURRENCY_SYMBOL}
                                {item.amount.toFixed(2)}
                              </Text>
                            </View>

                            {/* Sleek Progress Track */}
                            <View
                              style={[
                                localStyles.progressTrackBg,
                                isDark && { backgroundColor: 'rgba(255, 255, 255, 0.08)' },
                              ]}
                            >
                              <View
                                style={[
                                  localStyles.progressTrackFill,
                                  {
                                    width: `${Math.min(100, Math.max(4, pct))}%`,
                                    backgroundColor:
                                      visuals.color || (isDark ? '#818CF8' : PURPLE_PRIMARY),
                                  },
                                ]}
                              />
                            </View>

                            <Text
                              style={[localStyles.categoryPctText, isDark && { color: '#9CA3AF' }]}
                            >
                              {pct.toFixed(1)}% of total personal spend
                            </Text>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                </View>
              )}
            </View>

            {/* Personal Expenses Stream */}
            <View style={{ marginTop: 12 }}>
              <Text style={[localStyles.streamSectionTitle, isDark && { color: '#F9FAFB' }]}>
                Recent Personal Transactions
              </Text>
              <AnalyticsExpensesList
                filteredExpenses={filteredExpenses}
                currentUserId={me?.id}
                hasNextPage={!!hasNextPage}
                isFetchingNextPage={isFetchingNextPage}
                onLoadMore={fetchNextPage}
              />
            </View>
          </>
        )}
      </ScrollView>

      {/* Reusable Floating Positioned Overlay Menu */}
      <FloatingDropdownMenu
        visible={isTimeframeDropdownOpen}
        onClose={() => setIsTimeframeDropdownOpen(false)}
        title="Timeframe Options"
        options={TIMEFRAME_OPTIONS}
        topOffset={insets.top + 70}
        rightOffset={20}
        variant={isDark ? 'dark' : 'light'}
        accentColor={isDark ? '#818CF8' : COLORS.secondary}
        isSelected={(opt) => {
          if (opt.value === 'today') return timeframe === 'today' && isTodayDate(refDate);
          if (opt.value === 'month') return timeframe === 'month' && isCurrentMonth(refDate);
          if (opt.value === 'last_month') return timeframe === 'month' && isLastMonth(refDate);
          if (opt.value === 'custom_month')
            return timeframe === 'month' && !isCurrentMonth(refDate) && !isLastMonth(refDate);
          if (opt.value === 'custom_year')
            return timeframe === 'year' && !refDate.startsWith(new Date().getFullYear().toString());
          if (opt.value === 'custom_date') return timeframe === 'today' && !isTodayDate(refDate);
          return timeframe === opt.value;
        }}
        onSelect={(opt) => {
          if (opt.value === 'last_month') {
            setRefDate(getLastMonthString());
            setTimeframe('month');
          } else if (
            opt.value.includes('-') &&
            opt.value.split('-').length === 3 &&
            !opt.value.startsWith('month-')
          ) {
            setRefDate(opt.value);
            setTimeframe('today');
          } else if (opt.value.startsWith('month-')) {
            const parts = opt.value.replace('month-', '').split('-');
            const y = parts[0];
            const m = parts[1].padStart(2, '0');
            setRefDate(`${y}-${m}-01`);
            setTimeframe('month');
          } else if (opt.value.startsWith('year-')) {
            const yearStr = opt.value.replace('year-', '');
            setRefDate(`${yearStr}-01-01`);
            setTimeframe('year');
          } else if (
            opt.value === 'custom_month' ||
            opt.value === 'custom_year' ||
            opt.value === 'custom_date'
          ) {
            // Handled inside sub-views of FloatingDropdownMenu
          } else {
            setTimeframe(opt.value as typeof timeframe);
            setRefDate(getTodayString());
          }
        }}
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
          exportHook.executeExport(filteredExpenses, me?.name || me?.email || 'User', 'personal')
        }
        variant={isDark ? 'dark' : 'light'}
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
    </View>
  );
}

const localStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  containerDark: {
    backgroundColor: '#08110F',
  },
  headerContainer: {
    backgroundColor: COLORS.background,
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceContainerLow,
  },
  headerContainerDark: {
    backgroundColor: '#08110F',
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerBackBtn: {
    padding: 4,
  },
  headerTitleLeft: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.onSurface,
    letterSpacing: -0.5,
  },
  headerTitleLeftDark: {
    color: '#F9FAFB',
  },
  aiIconBtn: {
    padding: 6,
    borderRadius: 8,
  },
  controlHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  purpleDateBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f3e8ff',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9d5ff',
  },
  purpleDateBoxDark: {
    backgroundColor: 'rgba(165, 180, 252, 0.15)',
    borderColor: 'rgba(165, 180, 252, 0.25)',
  },
  purpleDateBoxText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: COLORS.secondary,
  },
  rightDropdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.secondaryFixed + '40',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.secondaryFixed,
  },
  rightDropdownBtnDark: {
    backgroundColor: 'rgba(165, 180, 252, 0.2)',
    borderColor: '#818CF8',
  },
  rightDropdownText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: COLORS.secondary,
  },
  cardDark: {
    backgroundColor: '#101917',
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  heroGradientCard: {
    borderRadius: 28,
    padding: 24,
    marginBottom: 20,
    position: 'relative',
    overflow: 'hidden',
    elevation: 8,
    shadowColor: PURPLE_PRIMARY,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
  },
  orb1: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(192, 132, 252, 0.15)',
    top: -40,
    right: -40,
  },
  orb2: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    bottom: -20,
    left: -20,
  },
  heroHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  heroTagBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
  },
  heroTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#e9d5ff',
    letterSpacing: 0.8,
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  trendText: {
    fontSize: 12,
    fontWeight: '800',
  },
  heroAmountContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  heroCurrencySymbol: {
    fontSize: 24,
    fontWeight: '800',
    color: '#c084fc',
    marginTop: 4,
    marginRight: 4,
  },
  heroAmountText: {
    fontSize: 38,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -1,
  },
  heroComparisonText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 18,
    fontWeight: '500',
  },
  heroStatsDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    marginVertical: 18,
  },
  heroStatsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroStatCol: {
    flex: 1,
    alignItems: 'center',
  },
  heroStatLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#c084fc',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  heroStatValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
  },
  heroStatUnit: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '600',
  },
  heroStatDividerCol: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  highlightGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  gridHighlightCard: {
    width: '48%',
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainer,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
  },
  gridHighlightCardFull: {
    width: '100%',
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainer,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
  },
  gridCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  gridIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridBadge: {
    backgroundColor: '#f3e8ff',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  gridBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: PURPLE_PRIMARY,
  },
  gridCardLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.outline,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  gridCardValue: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.onSurface,
    marginBottom: 2,
  },
  gridCardSub: {
    fontSize: 11.5,
    fontWeight: '500',
    color: COLORS.onSurfaceVariant,
  },
  categoryCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainer,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
  },
  categoryCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  categoryCardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.onSurface,
    letterSpacing: -0.3,
  },
  categoryCardSub: {
    fontSize: 11.5,
    color: COLORS.outline,
    fontWeight: '500',
    marginTop: 2,
  },
  categoryCountBadge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  categoryCountText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.onSurfaceVariant,
  },
  pieChartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceContainerLow,
    marginBottom: 8,
  },
  pieCenterLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    color: COLORS.outline,
    letterSpacing: 0.5,
  },
  pieCenterValue: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.onSurface,
  },
  emptyCategoryState: {
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyCategoryText: {
    fontSize: 13,
    color: COLORS.outline,
    fontWeight: '600',
  },
  categoryRowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  categoryIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  categoryNameText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  categoryAmountText: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.onSurface,
  },
  progressTrackBg: {
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#f1f5f9',
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressTrackFill: {
    height: '100%',
    borderRadius: 3.5,
  },
  categoryPctText: {
    fontSize: 11,
    color: COLORS.outline,
    fontWeight: '500',
  },
  streamSectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.onSurface,
    letterSpacing: -0.3,
    marginBottom: 12,
  },
});
