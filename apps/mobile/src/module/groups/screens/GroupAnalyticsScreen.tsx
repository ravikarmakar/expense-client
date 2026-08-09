import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LineChart, BarChart, PieChart } from 'react-native-gifted-charts';
import { TopAppBar } from '../../../components/TopAppBar';
import { COLORS, CURRENCY_SYMBOL } from '../../../constants/theme';
import { getCategoryVisuals } from '../../../constants/categories';
import { useGroupDetailAnalytics, useCategories } from '@workspace/api';
import { globalStyles } from '../../../styles/globalStyles';
import { ErrorView } from '../../../components/ErrorView';
import { useRouteParams, idParamSchema } from '../../../hooks/useRouteParams';
import { analyticsStyles as styles } from '../styles/group.styles';
import { GroupAnalyticsContentSkeleton } from '../components/group-details/GroupAnalyticsContentSkeleton';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../context/ThemeContext';
import { AppBackground } from '../../../components/AppBackground';
import { FloatingDropdownMenu } from '../../../components/FloatingDropdownMenu';

const screenWidth = Dimensions.get('window').width;

const TIMEFRAME_OPTIONS = [
  { label: 'Today', value: 'today', icon: 'today-outline' },
  { label: '7 Days', value: 'week', icon: 'time-outline' },
  { label: 'This Month', value: 'month', icon: 'calendar-number-outline' },
  { label: 'This Year', value: 'year', icon: 'infinite-outline' },
  { label: 'All Time', value: 'all', icon: 'globe-outline' },
  { label: 'Select Month', value: 'custom_month', icon: 'calendar-outline', subMenuType: 'month' },
  { label: 'Select Year', value: 'custom_year', icon: 'ribbon-outline', subMenuType: 'year' },
  { label: 'Choose Date', value: 'custom_date', icon: 'create-outline', subMenuType: 'date' },
] as const;

const PALETTE = [
  '#FF6B6B',
  '#4D96FF',
  '#6BCB77',
  '#FFD93D',
  '#B388FF',
  '#FF8A80',
  '#00E676',
  '#E040FB',
  '#00B0FF',
  '#FF9100',
  '#FF3D00',
  '#4CAF50',
];

const DARK_PALETTE = [
  '#34D399', // Emerald
  '#38BDF8', // Sky Blue
  '#FBBF24', // Amber
  '#C084FC', // Purple
  '#F87171', // Rose
  '#FB923C', // Orange
  '#2DD4BF', // Teal
  '#A7F3D0', // Light Mint
];

export default function GroupAnalyticsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useRouteParams(idParamSchema);
  const { isDark } = useTheme();
  const variant = isDark ? 'dark' : 'light';
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

  // Local reference date formatted to YYYY-MM-DD
  const getTodayString = () => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
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
    if (timeframe === 'month') return 'This Month';
    if (timeframe === 'year') return 'This Year';
    if (timeframe === 'all') return 'All Time';
    if (timeframe === 'custom_year') {
      const yr = refDate ? refDate.split('-')[0] : new Date().getFullYear();
      return `Year ${yr}`;
    }
    return 'This Month';
  };

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

  const {
    data: analytics,
    isLoading,
    isError,
    refetch,
  } = useGroupDetailAnalytics(id, apiTimeframe, refDate);

  const { data: categoriesData } = useCategories();
  const customCategories = categoriesData?.custom || [];

  const aggregatedData = useMemo(() => {
    if (!analytics) return null;

    const { totalGroupSpent, history, memberSpent, comparison } = analytics;
    const themeColor = isDark ? '#34D399' : COLORS.primary;
    const currentPalette = isDark ? DARK_PALETTE : PALETTE;

    // Calculate percent change vs previous period
    const prevSpent = comparison.totalSpent;
    let percentChange = 0;
    let spendingIncreased = false;
    if (prevSpent > 0) {
      percentChange = ((totalGroupSpent - prevSpent) / prevSpent) * 100;
      spendingIncreased = percentChange > 0;
    }

    // Format history data for gifted-charts with explicit frontColor for high visibility
    const activeChartData = history.map((hl) => ({
      value: hl.amount,
      label: hl.label,
      frontColor: themeColor,
    }));

    // Format member spending for PieChart
    const pieData = memberSpent
      .map((member, index) => {
        const color = currentPalette[index % currentPalette.length];
        return {
          value: member.amount,
          color: color,
          text: member.amount > 0 ? `${member.percentage.toFixed(0)}%` : '',
          focused: index === 0,
          name: member.name,
        };
      })
      .filter((p) => p.value > 0);

    // Format category spending for Donut PieChart
    const categoryPieData = (analytics.categorySpent || [])
      .map((item, index) => {
        const config = getCategoryVisuals(item.category, customCategories);
        return {
          value: item.amount,
          color: isDark
            ? config.color === COLORS.primary
              ? '#34D399'
              : config.color
            : config.color || PALETTE[index % PALETTE.length],
          text: item.percentage > 12 ? `${item.percentage.toFixed(0)}%` : '',
        };
      })
      .filter((p) => p.value > 0);

    // Advanced Metrics Calculations
    const daysCount = history.length || 1;
    const dailyAvg = totalGroupSpent / Math.max(1, daysCount);

    let peakDay = { amount: 0, label: 'N/A' };
    history.forEach((h) => {
      if (h.amount > peakDay.amount) {
        peakDay = { amount: h.amount, label: h.label };
      }
    });

    let topSpender = { name: 'None', amount: 0, percentage: 0 };
    memberSpent.forEach((m) => {
      if (m.amount > topSpender.amount) {
        topSpender = { name: m.name, amount: m.amount, percentage: m.percentage };
      }
    });

    const topCategoryObj = analytics.categorySpent.length > 0 ? analytics.categorySpent[0] : null;
    const netBalance = (analytics.myPayments ?? 0) - (analytics.myShare ?? 0);

    // Format multi-line dataSet per member with vibrant palette
    const memberDataSet = memberSpent.slice(0, 5).map((member, index) => {
      const color = currentPalette[index % currentPalette.length];
      const ratio = (member.percentage || 0) / 100;
      return {
        data: history.map((hl) => ({
          value: Math.round((hl.amount || 0) * ratio),
          label: hl.label,
        })),
        color: color,
        dataPointsColor: color,
        thickness: 2.5,
        strokeDashArray: [0],
        textColor: isDark ? '#F9FAFB' : COLORS.onSurface,
      };
    });

    return {
      percentChange,
      spendingIncreased,
      activeChartData,
      pieData,
      categoryPieData,
      memberDataSet,
      prevSpent,
      dailyAvg,
      peakDay,
      topSpender,
      topCategoryObj,
      netBalance,
    };
  }, [analytics, isDark, customCategories]);

  if (isError) {
    return <ErrorView message="Failed to load group analytics data" onRetry={refetch} />;
  }

  // Safe fallback values while loading (analytics may be undefined)
  const groupName = analytics?.groupName ?? '';
  const groupEmoji = analytics?.groupEmoji ?? '';
  const startDate = analytics?.startDate ?? '';
  const endDate = analytics?.endDate ?? '';
  const totalGroupSpent = analytics?.totalGroupSpent ?? 0;
  const myPayments = analytics?.myPayments ?? 0;
  const myShare = analytics?.myShare ?? 0;
  const categorySpent = analytics?.categorySpent ?? [];
  const memberSpent = analytics?.memberSpent ?? [];
  const percentChange = aggregatedData?.percentChange ?? 0;
  const spendingIncreased = aggregatedData?.spendingIncreased ?? false;
  const activeChartData = aggregatedData?.activeChartData ?? [];
  const pieData = aggregatedData?.pieData ?? [];
  const categoryPieData = aggregatedData?.categoryPieData ?? [];
  const memberDataSet = aggregatedData?.memberDataSet ?? [];
  const prevSpent = aggregatedData?.prevSpent ?? 0;
  const dailyAvg = aggregatedData?.dailyAvg ?? 0;
  const peakDay = aggregatedData?.peakDay ?? { amount: 0, label: 'N/A' };
  const topSpender = aggregatedData?.topSpender ?? { name: 'None', amount: 0, percentage: 0 };
  const topCategoryObj = aggregatedData?.topCategoryObj ?? null;
  const netBalance = aggregatedData?.netBalance ?? 0;

  // Format dates for subtitle display
  const formatPeriodLabel = () => {
    if (!startDate) return '—';
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
  const totalCalculated = myPayments + myShare;
  const paymentProgress = totalCalculated > 0 ? myPayments / totalCalculated : 0;
  const shareProgress = totalCalculated > 0 ? myShare / totalCalculated : 0;

  const chartThemeColor = isDark ? '#34D399' : COLORS.primary;

  return (
    <AppBackground style={styles.container}>
      {/* ── Always-visible Header ── */}
      <TopAppBar
        title={isLoading ? 'Analytics' : `${groupEmoji} ${groupName}`}
        showBack={true}
        onBack={() => router.back()}
        variant={variant}
        rightActions={
          <TouchableOpacity style={{ padding: 6 }} activeOpacity={0.7}>
            <MaterialIcons
              name="auto-awesome"
              size={26}
              color={isDark ? '#34D399' : COLORS.primary}
            />
          </TouchableOpacity>
        }
      />

      <ScrollView
        contentContainerStyle={globalStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Control Header Row (Date Box Badge on Left, Timeframe Dropdown Trigger on Right) ── */}
        <View style={styles.controlHeaderRow}>
          <View style={[styles.dateBox, isDark && styles.dateBoxDark]}>
            <Ionicons
              name="calendar-outline"
              size={14}
              color={isDark ? '#34D399' : COLORS.primary}
            />
            <Text style={[styles.dateBoxText, isDark && { color: '#34D399' }]}>
              {formatPeriodLabel()}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.rightDropdownBtn, isDark && styles.rightDropdownBtnDark]}
            onPress={() => setIsTimeframeDropdownOpen(!isTimeframeDropdownOpen)}
            activeOpacity={0.8}
          >
            <Text style={[styles.rightDropdownText, isDark && { color: '#34D399' }]}>
              {getDynamicTimeframeLabel()}
            </Text>
            <Ionicons
              name={isTimeframeDropdownOpen ? 'chevron-up' : 'chevron-down'}
              size={13}
              color={isDark ? '#34D399' : COLORS.primary}
            />
          </TouchableOpacity>
        </View>

        {/* ── Skeleton while loading / Real content when ready ── */}
        {isLoading ? (
          <GroupAnalyticsContentSkeleton />
        ) : (
          <>
            {/* Group Spending Hero Card */}
            <View
              style={[
                styles.heroCard,
                isDark && { backgroundColor: '#101917', borderColor: 'rgba(255, 255, 255, 0.08)' },
              ]}
            >
              <View style={styles.heroCardMain}>
                <View>
                  <Text style={[styles.heroLabel, isDark && { color: '#9CA3AF' }]}>
                    Total Group Spent
                  </Text>
                  <Text style={[styles.heroAmount, isDark && { color: '#F9FAFB' }]}>
                    {CURRENCY_SYMBOL}
                    {totalGroupSpent.toFixed(2)}
                  </Text>
                </View>
                {prevSpent > 0 ? (
                  <View
                    style={[
                      styles.trendBadge,
                      {
                        backgroundColor: spendingIncreased
                          ? isDark
                            ? 'rgba(248, 113, 113, 0.15)'
                            : COLORS.errorContainer
                          : isDark
                            ? 'rgba(52, 211, 153, 0.15)'
                            : 'rgba(27, 94, 32, 0.1)',
                      },
                    ]}
                  >
                    <Ionicons
                      name={spendingIncreased ? 'trending-up' : 'trending-down'}
                      size={14}
                      color={
                        spendingIncreased
                          ? isDark
                            ? '#F87171'
                            : COLORS.error
                          : isDark
                            ? '#34D399'
                            : '#1b5e20'
                      }
                    />
                    <Text
                      style={[
                        styles.trendText,
                        {
                          color: spendingIncreased
                            ? isDark
                              ? '#F87171'
                              : COLORS.error
                            : isDark
                              ? '#34D399'
                              : '#1b5e20',
                        },
                      ]}
                    >
                      {Math.abs(percentChange).toFixed(1)}%
                    </Text>
                  </View>
                ) : null}
              </View>

              {prevSpent > 0 ? (
                <Text style={[styles.comparisonSubtext, isDark && { color: '#9CA3AF' }]}>
                  {spendingIncreased ? 'Spent ' : 'Saved '}
                  <Text style={{ fontWeight: '700', color: isDark ? '#F9FAFB' : undefined }}>
                    {CURRENCY_SYMBOL}
                    {Math.abs(totalGroupSpent - prevSpent).toFixed(2)}
                  </Text>{' '}
                  compared to previous {timeframe} ({CURRENCY_SYMBOL}
                  {prevSpent.toFixed(0)})
                </Text>
              ) : (
                <Text style={[styles.comparisonSubtext, isDark && { color: '#9CA3AF' }]}>
                  No group spending history for previous {timeframe}
                </Text>
              )}

              <View
                style={[
                  styles.balanceDivider,
                  isDark && { backgroundColor: 'rgba(255, 255, 255, 0.08)' },
                ]}
              />

              {/* User Specific Share Breakdown */}
              <View style={styles.breakdownRow}>
                <View style={styles.breakdownCol}>
                  <View
                    style={[
                      styles.breakdownIconBg,
                      { backgroundColor: isDark ? 'rgba(52, 211, 153, 0.15)' : '#e2dfff' },
                    ]}
                  >
                    <Ionicons
                      name="card-outline"
                      size={14}
                      color={isDark ? '#34D399' : COLORS.secondary}
                    />
                  </View>
                  <View>
                    <Text style={[styles.breakdownLabel, isDark && { color: '#9CA3AF' }]}>
                      My Payments
                    </Text>
                    <Text style={[styles.breakdownAmount, isDark && { color: '#F9FAFB' }]}>
                      {CURRENCY_SYMBOL}
                      {myPayments.toFixed(2)}
                    </Text>
                  </View>
                </View>

                <View
                  style={[
                    styles.breakdownDivider,
                    isDark && { backgroundColor: 'rgba(255, 255, 255, 0.08)' },
                  ]}
                />

                <View style={styles.breakdownCol}>
                  <View
                    style={[
                      styles.breakdownIconBg,
                      { backgroundColor: isDark ? 'rgba(129, 140, 248, 0.18)' : '#e8f5e9' },
                    ]}
                  >
                    <Ionicons
                      name="pie-chart-outline"
                      size={14}
                      color={isDark ? '#818CF8' : '#2e7d32'}
                    />
                  </View>
                  <View>
                    <Text style={[styles.breakdownLabel, isDark && { color: '#9CA3AF' }]}>
                      My Share
                    </Text>
                    <Text style={[styles.breakdownAmount, isDark && { color: '#F9FAFB' }]}>
                      {CURRENCY_SYMBOL}
                      {myShare.toFixed(2)}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* ── Advanced Quick Insights 2x2 Grid ── */}
            <View style={styles.gridContainer}>
              {/* Daily Average */}
              <View style={[styles.gridCard, isDark && styles.gridCardDark]}>
                <View style={styles.gridCardHeaderRow}>
                  <View
                    style={[
                      styles.gridCardIconBg,
                      { backgroundColor: isDark ? 'rgba(251, 191, 36, 0.15)' : '#fef3c7' },
                    ]}
                  >
                    <Ionicons
                      name="flame-outline"
                      size={16}
                      color={isDark ? '#FBBF24' : '#d97706'}
                    />
                  </View>
                  <Text
                    style={[styles.gridCardTitle, isDark && { color: '#9CA3AF' }]}
                    numberOfLines={1}
                  >
                    Daily Avg
                  </Text>
                </View>
                <Text style={[styles.gridCardValue, isDark && { color: '#F9FAFB' }]}>
                  {CURRENCY_SYMBOL}
                  {dailyAvg.toFixed(0)}
                </Text>
                <Text style={[styles.gridCardSub, isDark && { color: '#9CA3AF' }]}>
                  Average per day
                </Text>
              </View>

              {/* Peak Spending */}
              <View style={[styles.gridCard, isDark && styles.gridCardDark]}>
                <View style={styles.gridCardHeaderRow}>
                  <View
                    style={[
                      styles.gridCardIconBg,
                      { backgroundColor: isDark ? 'rgba(56, 189, 248, 0.15)' : '#e0f2fe' },
                    ]}
                  >
                    <Ionicons name="trending-up" size={16} color={isDark ? '#38BDF8' : '#0284c7'} />
                  </View>
                  <Text
                    style={[styles.gridCardTitle, isDark && { color: '#9CA3AF' }]}
                    numberOfLines={1}
                  >
                    Peak Day
                  </Text>
                </View>
                <Text style={[styles.gridCardValue, isDark && { color: '#F9FAFB' }]}>
                  {CURRENCY_SYMBOL}
                  {peakDay.amount.toFixed(0)}
                </Text>
                <Text
                  style={[styles.gridCardSub, isDark && { color: '#9CA3AF' }]}
                  numberOfLines={1}
                >
                  {peakDay.label}
                </Text>
              </View>

              {/* Top Category */}
              <View style={[styles.gridCard, isDark && styles.gridCardDark]}>
                <View style={styles.gridCardHeaderRow}>
                  <View
                    style={[
                      styles.gridCardIconBg,
                      { backgroundColor: isDark ? 'rgba(168, 85, 247, 0.15)' : '#f3e8ff' },
                    ]}
                  >
                    <Ionicons
                      name="pricetag-outline"
                      size={16}
                      color={isDark ? '#C084FC' : '#7e22ce'}
                    />
                  </View>
                  <Text
                    style={[styles.gridCardTitle, isDark && { color: '#9CA3AF' }]}
                    numberOfLines={1}
                  >
                    Top Category
                  </Text>
                </View>
                <Text
                  style={[styles.gridCardValue, isDark && { color: '#F9FAFB' }]}
                  numberOfLines={1}
                >
                  {topCategoryObj ? topCategoryObj.category : 'N/A'}
                </Text>
                <Text style={[styles.gridCardSub, isDark && { color: '#9CA3AF' }]}>
                  {topCategoryObj
                    ? `${topCategoryObj.percentage.toFixed(0)}% of total`
                    : 'No expenses'}
                </Text>
              </View>

              {/* Net Group Balance */}
              <View style={[styles.gridCard, isDark && styles.gridCardDark]}>
                <View style={styles.gridCardHeaderRow}>
                  <View
                    style={[
                      styles.gridCardIconBg,
                      {
                        backgroundColor:
                          netBalance >= 0
                            ? isDark
                              ? 'rgba(52, 211, 153, 0.15)'
                              : '#e6f4ea'
                            : isDark
                              ? 'rgba(248, 113, 113, 0.15)'
                              : '#fee2e2',
                      },
                    ]}
                  >
                    <Ionicons
                      name="wallet-outline"
                      size={16}
                      color={
                        netBalance >= 0
                          ? isDark
                            ? '#34D399'
                            : '#059669'
                          : isDark
                            ? '#F87171'
                            : '#dc2626'
                      }
                    />
                  </View>
                  <Text
                    style={[styles.gridCardTitle, isDark && { color: '#9CA3AF' }]}
                    numberOfLines={1}
                  >
                    My Net Status
                  </Text>
                </View>
                <Text
                  style={[
                    styles.gridCardValue,
                    {
                      color:
                        netBalance >= 0
                          ? isDark
                            ? '#34D399'
                            : '#059669'
                          : isDark
                            ? '#F87171'
                            : '#dc2626',
                    },
                  ]}
                >
                  {netBalance >= 0 ? '+' : '-'}
                  {CURRENCY_SYMBOL}
                  {Math.abs(netBalance).toFixed(0)}
                </Text>
                <Text style={[styles.gridCardSub, isDark && { color: '#9CA3AF' }]}>
                  {netBalance >= 0 ? 'You are owed' : 'You owe to group'}
                </Text>
              </View>
            </View>

            {/* ── Top Contributor Spotlight Card ── */}
            {topSpender.amount > 0 && (
              <View style={[styles.topSpenderCard, isDark && styles.topSpenderCardDark]}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <View
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 22,
                        backgroundColor: isDark ? 'rgba(251, 191, 36, 0.15)' : '#fef3c7',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Text style={{ fontSize: 22 }}>👑</Text>
                    </View>
                    <View>
                      <Text
                        style={{
                          fontSize: 11,
                          fontWeight: '700',
                          color: isDark ? '#9CA3AF' : COLORS.outline,
                          textTransform: 'uppercase',
                          letterSpacing: 0.8,
                        }}
                      >
                        Top Payer Spotlight
                      </Text>
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: '800',
                          color: isDark ? '#F9FAFB' : COLORS.onSurface,
                          marginTop: 2,
                        }}
                      >
                        {topSpender.name}
                      </Text>
                    </View>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: '800',
                        color: isDark ? '#34D399' : COLORS.primary,
                      }}
                    >
                      {CURRENCY_SYMBOL}
                      {topSpender.amount.toFixed(0)}
                    </Text>
                    <View
                      style={{
                        backgroundColor: isDark ? 'rgba(52, 211, 153, 0.15)' : '#e6f4ea',
                        paddingHorizontal: 8,
                        paddingVertical: 3,
                        borderRadius: 8,
                        marginTop: 4,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 11,
                          fontWeight: '700',
                          color: isDark ? '#34D399' : '#059669',
                        }}
                      >
                        {topSpender.percentage.toFixed(0)}% paid
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            )}

            {/* Visual Trend Chart */}
            <View style={styles.sectionContainer}>
              <Text style={[globalStyles.sectionTitle, isDark && { color: '#F9FAFB' }]}>
                Spending Trend
              </Text>
              <View
                style={[
                  styles.chartCard,
                  isDark && {
                    backgroundColor: '#101917',
                    borderColor: 'rgba(255, 255, 255, 0.08)',
                  },
                ]}
              >
                {totalGroupSpent === 0 ? (
                  <View style={styles.emptyChartContainer}>
                    <Ionicons
                      name="bar-chart-outline"
                      size={32}
                      color={isDark ? 'rgba(255, 255, 255, 0.3)' : COLORS.outlineVariant}
                    />
                    <Text style={[styles.emptyChartText, isDark && { color: '#9CA3AF' }]}>
                      No spending record in this period
                    </Text>
                  </View>
                ) : timeframe === 'month' ? (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={{ paddingRight: 20 }}>
                      <BarChart
                        data={activeChartData}
                        barWidth={12}
                        spacing={10}
                        initialSpacing={10}
                        height={150}
                        frontColor={chartThemeColor}
                        barBorderRadius={4}
                        noOfSections={3}
                        yAxisThickness={0}
                        xAxisThickness={1}
                        xAxisColor={isDark ? 'rgba(255, 255, 255, 0.12)' : COLORS.surfaceContainer}
                        rulesColor={isDark ? 'rgba(255, 255, 255, 0.08)' : COLORS.surfaceContainer}
                        rulesType="solid"
                        yAxisTextStyle={
                          isDark ? { color: '#9CA3AF', fontSize: 9 } : styles.axisLabelText
                        }
                        xAxisLabelTextStyle={
                          isDark ? { color: '#9CA3AF', fontSize: 9 } : styles.axisLabelText
                        }
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
                    color={chartThemeColor}
                    startFillColor={chartThemeColor}
                    endFillColor={chartThemeColor}
                    startOpacity={0.4}
                    endOpacity={0.05}
                    noOfSections={3}
                    yAxisThickness={0}
                    xAxisThickness={1}
                    xAxisColor={isDark ? 'rgba(255, 255, 255, 0.12)' : COLORS.surfaceContainer}
                    rulesColor={isDark ? 'rgba(255, 255, 255, 0.08)' : COLORS.surfaceContainer}
                    rulesType="solid"
                    spacing={
                      timeframe === 'today'
                        ? (chartWidth - 20) / 5
                        : timeframe === 'week'
                          ? (chartWidth - 20) / 6
                          : (chartWidth - 20) / 11
                    }
                    initialSpacing={10}
                    dataPointsColor={chartThemeColor}
                    dataPointsRadius={4}
                    xAxisLabelTextStyle={
                      isDark ? { color: '#9CA3AF', fontSize: 9 } : styles.axisLabelText
                    }
                    yAxisTextStyle={
                      isDark ? { color: '#9CA3AF', fontSize: 9 } : styles.axisLabelText
                    }
                  />
                )}
              </View>
            </View>

            {/* Member Multi-Line Spending Comparison Chart */}
            {memberDataSet.length > 0 && totalGroupSpent > 0 && (
              <View style={styles.sectionContainer}>
                <Text style={[globalStyles.sectionTitle, isDark && { color: '#F9FAFB' }]}>
                  Member Timeline Trends
                </Text>
                <View
                  style={[
                    styles.chartCard,
                    isDark && {
                      backgroundColor: '#101917',
                      borderColor: 'rgba(255, 255, 255, 0.08)',
                    },
                  ]}
                >
                  {/* Color Legend Bar */}
                  <View
                    style={{
                      flexDirection: 'row',
                      flexWrap: 'wrap',
                      gap: 12,
                      marginBottom: 14,
                      alignSelf: 'flex-start',
                    }}
                  >
                    {memberSpent.slice(0, 5).map((member, index) => {
                      const currentPalette = isDark ? DARK_PALETTE : PALETTE;
                      const color =
                        currentPalette[index % currentPalette.length] || chartThemeColor;
                      return (
                        <View
                          key={member.userId}
                          style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
                        >
                          <View
                            style={{
                              width: 12,
                              height: 3,
                              borderRadius: 1.5,
                              backgroundColor: color,
                            }}
                          />
                          <Text
                            style={{
                              fontSize: 11,
                              fontWeight: '700',
                              color: isDark ? '#F9FAFB' : COLORS.onSurface,
                            }}
                          >
                            {member.name}
                          </Text>
                        </View>
                      );
                    })}
                  </View>

                  <View style={{ width: '100%', overflow: 'hidden', alignItems: 'center' }}>
                    <LineChart
                      dataSet={memberDataSet}
                      width={chartWidth - 20}
                      height={160}
                      thickness={2.5}
                      noOfSections={3}
                      yAxisThickness={0}
                      xAxisThickness={1}
                      xAxisColor={isDark ? 'rgba(255, 255, 255, 0.12)' : COLORS.surfaceContainer}
                      rulesColor={isDark ? 'rgba(255, 255, 255, 0.08)' : COLORS.surfaceContainer}
                      rulesType="solid"
                      spacing={
                        timeframe === 'today'
                          ? (chartWidth - 60) / 5
                          : timeframe === 'week'
                            ? (chartWidth - 60) / 6
                            : (chartWidth - 60) / 11
                      }
                      initialSpacing={10}
                      xAxisLabelTextStyle={
                        isDark ? { color: '#9CA3AF', fontSize: 9 } : styles.axisLabelText
                      }
                      yAxisTextStyle={
                        isDark ? { color: '#9CA3AF', fontSize: 9 } : styles.axisLabelText
                      }
                    />
                  </View>
                </View>
              </View>
            )}

            {/* Member Spending Pie Chart & Legend */}
            <View style={styles.sectionContainer}>
              <Text style={[globalStyles.sectionTitle, isDark && { color: '#F9FAFB' }]}>
                Expenses by Member
              </Text>
              <View
                style={[
                  styles.chartCard,
                  isDark && {
                    backgroundColor: '#101917',
                    borderColor: 'rgba(255, 255, 255, 0.08)',
                  },
                ]}
              >
                {pieData.length === 0 ? (
                  <View style={styles.emptyChartContainer}>
                    <Ionicons
                      name="people-outline"
                      size={32}
                      color={isDark ? 'rgba(255, 255, 255, 0.3)' : COLORS.outlineVariant}
                    />
                    <Text style={[styles.emptyChartText, isDark && { color: '#9CA3AF' }]}>
                      No member payments recorded
                    </Text>
                  </View>
                ) : (
                  <View style={styles.pieContainer}>
                    <PieChart
                      data={pieData}
                      donut
                      showText
                      textColor="white"
                      textSize={10}
                      radius={80}
                      innerRadius={50}
                      innerCircleColor={isDark ? '#101917' : COLORS.surface}
                      centerLabelComponent={() => (
                        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                          <Text
                            style={{
                              fontSize: 18,
                              fontWeight: '800',
                              color: isDark ? '#F9FAFB' : COLORS.onSurface,
                            }}
                          >
                            {pieData.length}
                          </Text>
                          <Text
                            style={{ fontSize: 10, color: isDark ? '#9CA3AF' : COLORS.outline }}
                          >
                            Payers
                          </Text>
                        </View>
                      )}
                    />

                    <View style={styles.legendContainer}>
                      {memberSpent.map((member, index) => {
                        const color = PALETTE[index % PALETTE.length] || chartThemeColor;
                        return (
                          <View key={member.userId} style={styles.legendRow}>
                            <View style={[styles.legendIndicator, { backgroundColor: color }]} />
                            <Text
                              style={[styles.legendName, isDark && { color: '#F9FAFB' }]}
                              numberOfLines={1}
                            >
                              {member.name}
                            </Text>
                            <Text style={[styles.legendAmount, isDark && { color: '#9CA3AF' }]}>
                              {CURRENCY_SYMBOL}
                              {member.amount.toFixed(0)}
                            </Text>
                          </View>
                        );
                      })}
                    </View>
                  </View>
                )}

                {/* Member Paid vs Fair Share Visual Bar Comparison */}
                {memberSpent.length > 0 && (
                  <View
                    style={{
                      marginTop: 20,
                      paddingTop: 16,
                      borderTopWidth: 1,
                      borderTopColor: isDark
                        ? 'rgba(255, 255, 255, 0.08)'
                        : COLORS.surfaceContainer,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: '700',
                        color: isDark ? '#9CA3AF' : COLORS.outline,
                        textTransform: 'uppercase',
                        letterSpacing: 0.8,
                        marginBottom: 12,
                      }}
                    >
                      Member Paid vs Fair Share
                    </Text>
                    {memberSpent.map((m) => {
                      const fairShare = totalGroupSpent / Math.max(1, memberSpent.length);
                      const net = m.amount - fairShare;
                      const maxVal = Math.max(m.amount, fairShare, 1);
                      const paidWidthPct = Math.min(100, Math.max(5, (m.amount / maxVal) * 100));
                      const shareWidthPct = Math.min(100, Math.max(5, (fairShare / maxVal) * 100));
                      return (
                        <View key={m.userId} style={styles.memberCompareRow}>
                          <View style={styles.memberCompareHeader}>
                            <Text
                              style={[styles.memberCompareName, isDark && { color: '#F9FAFB' }]}
                            >
                              {m.name}
                            </Text>
                            <View
                              style={[
                                styles.memberCompareNetBadge,
                                {
                                  backgroundColor:
                                    net > 0
                                      ? isDark
                                        ? 'rgba(52, 211, 153, 0.15)'
                                        : '#e6f4ea'
                                      : net < 0
                                        ? isDark
                                          ? 'rgba(248, 113, 113, 0.15)'
                                          : '#fee2e2'
                                        : isDark
                                          ? 'rgba(255, 255, 255, 0.08)'
                                          : '#f1f5f9',
                                },
                              ]}
                            >
                              <Text
                                style={[
                                  styles.memberCompareNetText,
                                  {
                                    color:
                                      net > 0
                                        ? isDark
                                          ? '#34D399'
                                          : '#059669'
                                        : net < 0
                                          ? isDark
                                            ? '#F87171'
                                            : '#dc2626'
                                          : isDark
                                            ? '#9CA3AF'
                                            : COLORS.outline,
                                  },
                                ]}
                              >
                                {net > 0
                                  ? `+${CURRENCY_SYMBOL}${net.toFixed(0)} (Owed)`
                                  : net < 0
                                    ? `-${CURRENCY_SYMBOL}${Math.abs(net).toFixed(0)} (Owes)`
                                    : `${CURRENCY_SYMBOL}0 (Settled)`}
                              </Text>
                            </View>
                          </View>
                          <View style={styles.memberCompareBars}>
                            {/* Paid Bar */}
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                              <Text
                                style={{
                                  fontSize: 10,
                                  fontWeight: '700',
                                  color: isDark ? '#34D399' : COLORS.primary,
                                  width: 32,
                                }}
                              >
                                Paid
                              </Text>
                              <View
                                style={[
                                  styles.memberBarWrapper,
                                  { flex: 1 },
                                  isDark && { backgroundColor: '#1E292B' },
                                ]}
                              >
                                <View
                                  style={[
                                    styles.memberBarFill,
                                    {
                                      width: `${paidWidthPct}%`,
                                      backgroundColor: isDark ? '#34D399' : COLORS.primary,
                                    },
                                  ]}
                                />
                              </View>
                              <Text
                                style={{
                                  fontSize: 11,
                                  fontWeight: '700',
                                  color: isDark ? '#F9FAFB' : COLORS.onSurface,
                                  width: 55,
                                  textAlign: 'right',
                                }}
                              >
                                {CURRENCY_SYMBOL}
                                {m.amount.toFixed(0)}
                              </Text>
                            </View>
                            {/* Share Bar */}
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                              <Text
                                style={{
                                  fontSize: 10,
                                  fontWeight: '700',
                                  color: isDark ? '#818CF8' : '#4f46e5',
                                  width: 32,
                                }}
                              >
                                Share
                              </Text>
                              <View
                                style={[
                                  styles.memberBarWrapper,
                                  { flex: 1 },
                                  isDark && { backgroundColor: '#1E292B' },
                                ]}
                              >
                                <View
                                  style={[
                                    styles.memberBarFill,
                                    {
                                      width: `${shareWidthPct}%`,
                                      backgroundColor: isDark ? '#818CF8' : '#4f46e5',
                                    },
                                  ]}
                                />
                              </View>
                              <Text
                                style={{
                                  fontSize: 11,
                                  fontWeight: '700',
                                  color: isDark ? '#9CA3AF' : COLORS.outline,
                                  width: 55,
                                  textAlign: 'right',
                                }}
                              >
                                {CURRENCY_SYMBOL}
                                {fairShare.toFixed(0)}
                              </Text>
                            </View>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                )}
              </View>
            </View>

            {/* Category Spent Breakdown */}
            <View style={styles.sectionContainer}>
              <Text style={[globalStyles.sectionTitle, isDark && { color: '#F9FAFB' }]}>
                Spending by Category
              </Text>
              <View
                style={[
                  styles.categoryCard,
                  isDark && {
                    backgroundColor: '#101917',
                    borderColor: 'rgba(255, 255, 255, 0.08)',
                  },
                ]}
              >
                {categorySpent.length === 0 ? (
                  <Text style={[styles.noDataText, isDark && { color: '#9CA3AF' }]}>
                    No categories to display
                  </Text>
                ) : (
                  <View style={styles.listViewContainer}>
                    {/* Category Distribution Donut Chart */}
                    {categoryPieData.length > 0 && (
                      <View
                        style={{
                          alignItems: 'center',
                          marginBottom: 20,
                          paddingTop: 6,
                          paddingBottom: 18,
                          borderBottomWidth: 1,
                          borderBottomColor: isDark
                            ? 'rgba(255, 255, 255, 0.08)'
                            : COLORS.surfaceContainer,
                        }}
                      >
                        <PieChart
                          data={categoryPieData}
                          donut
                          showText
                          textColor="white"
                          textSize={10}
                          radius={75}
                          innerRadius={45}
                          innerCircleColor={isDark ? '#101917' : COLORS.surface}
                          centerLabelComponent={() => (
                            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                              <Text
                                style={{
                                  fontSize: 16,
                                  fontWeight: '800',
                                  color: isDark ? '#F9FAFB' : COLORS.onSurface,
                                }}
                              >
                                {categorySpent.length}
                              </Text>
                              <Text
                                style={{ fontSize: 10, color: isDark ? '#9CA3AF' : COLORS.outline }}
                              >
                                Categories
                              </Text>
                            </View>
                          )}
                        />
                      </View>
                    )}

                    {categorySpent.map((item) => {
                      const config = getCategoryVisuals(item.category, customCategories);
                      return (
                        <View key={item.category} style={styles.categoryRow}>
                          <View style={styles.categoryHeader}>
                            <View style={styles.categoryInfo}>
                              <View
                                style={[
                                  styles.categoryIconBg,
                                  { backgroundColor: isDark ? `${config.color}25` : config.bg },
                                ]}
                              >
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
                              <Text style={[styles.categoryName, isDark && { color: '#F9FAFB' }]}>
                                {item.category}
                              </Text>
                              <Text
                                style={[styles.categoryPercentage, isDark && { color: '#9CA3AF' }]}
                              >
                                {item.percentage.toFixed(0)}%
                              </Text>
                            </View>
                            <Text
                              style={[styles.categoryAmountText, isDark && { color: '#F9FAFB' }]}
                            >
                              {CURRENCY_SYMBOL}
                              {item.amount.toFixed(2)}
                            </Text>
                          </View>
                          <View
                            style={[
                              styles.categoryProgressTrack,
                              isDark && { backgroundColor: '#1E292B' },
                            ]}
                          >
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

            {/* User visual balance breakdown */}
            <View style={[styles.sectionContainer, { marginBottom: 30 }]}>
              <Text style={[globalStyles.sectionTitle, isDark && { color: '#F9FAFB' }]}>
                My Share Progress
              </Text>
              <View
                style={[
                  styles.categoryCard,
                  isDark && {
                    backgroundColor: '#101917',
                    borderColor: 'rgba(255, 255, 255, 0.08)',
                  },
                ]}
              >
                <View style={styles.progressContainer}>
                  <View
                    style={[styles.progressBarWrapper, isDark && { backgroundColor: '#1E292B' }]}
                  >
                    {totalCalculated > 0 ? (
                      <>
                        <View
                          style={[
                            styles.progressSegment,
                            {
                              flex: paymentProgress,
                              backgroundColor: isDark ? '#34D399' : COLORS.primaryContainer,
                              borderTopLeftRadius: 4,
                              borderBottomLeftRadius: 4,
                            },
                          ]}
                        />
                        <View
                          style={[
                            styles.progressSegment,
                            {
                              flex: shareProgress,
                              backgroundColor: isDark ? '#F87171' : COLORS.error,
                              borderTopRightRadius: 4,
                              borderBottomRightRadius: 4,
                            },
                          ]}
                        />
                      </>
                    ) : (
                      <View
                        style={[
                          styles.progressSegment,
                          {
                            flex: 1,
                            backgroundColor: isDark ? '#1E292B' : 'rgba(0,0,0,0.05)',
                            borderRadius: 4,
                          },
                        ]}
                      />
                    )}
                  </View>
                  <View style={styles.progressLabels}>
                    <Text
                      style={[
                        styles.progressIndicatorLabel,
                        { color: isDark ? '#34D399' : COLORS.primaryContainer },
                      ]}
                    >
                      ● My Paid ({totalCalculated > 0 ? Math.round(paymentProgress * 100) : 0}%)
                    </Text>
                    <Text
                      style={[
                        styles.progressIndicatorLabel,
                        { color: isDark ? '#F87171' : COLORS.error },
                      ]}
                    >
                      ● My Share ({totalCalculated > 0 ? Math.round(shareProgress * 100) : 0}%)
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* ── Smart Group Insights Section ── */}
            <View style={[styles.sectionContainer, { marginBottom: 30 }]}>
              <Text style={[globalStyles.sectionTitle, isDark && { color: '#F9FAFB' }]}>
                Smart Group Insights
              </Text>
              <View style={[styles.insightCard, isDark && styles.insightCardDark]}>
                {/* Insight 1: Dominant Category */}
                <View style={styles.insightRow}>
                  <View
                    style={[
                      styles.insightIconBg,
                      { backgroundColor: isDark ? 'rgba(168, 85, 247, 0.15)' : '#f3e8ff' },
                    ]}
                  >
                    <Ionicons
                      name="bulb-outline"
                      size={18}
                      color={isDark ? '#C084FC' : '#7e22ce'}
                    />
                  </View>
                  <Text style={[styles.insightText, isDark && { color: '#F9FAFB' }]}>
                    {topCategoryObj
                      ? `${topCategoryObj.category} is the group's top expense category (${topCategoryObj.percentage.toFixed(0)}% of total).`
                      : 'No category spending recorded yet.'}
                  </Text>
                </View>

                {/* Insight 2: Payment Leader */}
                <View style={styles.insightRow}>
                  <View
                    style={[
                      styles.insightIconBg,
                      { backgroundColor: isDark ? 'rgba(52, 211, 153, 0.15)' : '#e6f4ea' },
                    ]}
                  >
                    <Ionicons
                      name="flash-outline"
                      size={18}
                      color={isDark ? '#34D399' : '#059669'}
                    />
                  </View>
                  <Text style={[styles.insightText, isDark && { color: '#F9FAFB' }]}>
                    {topSpender.amount > 0
                      ? `${topSpender.name} funded ${topSpender.percentage.toFixed(0)}% (${CURRENCY_SYMBOL}${topSpender.amount.toFixed(0)}) of group payments.`
                      : 'No member payments recorded.'}
                  </Text>
                </View>

                {/* Insight 3: Trend vs Prev Period */}
                <View style={[styles.insightRow, { marginBottom: 0 }]}>
                  <View
                    style={[
                      styles.insightIconBg,
                      { backgroundColor: isDark ? 'rgba(56, 189, 248, 0.15)' : '#e0f2fe' },
                    ]}
                  >
                    <Ionicons
                      name="stats-chart-outline"
                      size={18}
                      color={isDark ? '#38BDF8' : '#0284c7'}
                    />
                  </View>
                  <Text style={[styles.insightText, isDark && { color: '#F9FAFB' }]}>
                    {prevSpent > 0
                      ? spendingIncreased
                        ? `Group spending increased by ${Math.abs(percentChange).toFixed(1)}% vs previous period.`
                        : `Group spending dropped by ${Math.abs(percentChange).toFixed(1)}% vs previous period.`
                      : `Daily average group spend is ${CURRENCY_SYMBOL}${dailyAvg.toFixed(0)}.`}
                  </Text>
                </View>
              </View>
            </View>
          </>
        )}
      </ScrollView>

      {/* Floating Dropdown Menu Overlay */}
      <FloatingDropdownMenu
        visible={isTimeframeDropdownOpen}
        onClose={() => setIsTimeframeDropdownOpen(false)}
        title="Timeframe Options"
        options={TIMEFRAME_OPTIONS}
        topOffset={insets.top + 70}
        rightOffset={20}
        variant={isDark ? 'dark' : 'light'}
        accentColor={isDark ? '#34D399' : COLORS.primary}
        isSelected={(opt) => {
          if (opt.value === 'today') return timeframe === 'today' && isTodayDate(refDate);
          if (opt.value === 'month') return timeframe === 'month' && isCurrentMonth(refDate);
          if (opt.value === 'custom_month')
            return timeframe === 'month' && !isCurrentMonth(refDate);
          if (opt.value === 'custom_year')
            return timeframe === 'year' && !refDate.startsWith(new Date().getFullYear().toString());
          if (opt.value === 'custom_date') return timeframe === 'today' && !isTodayDate(refDate);
          return timeframe === opt.value;
        }}
        onSelect={(opt) => {
          if (
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
    </AppBackground>
  );
}
