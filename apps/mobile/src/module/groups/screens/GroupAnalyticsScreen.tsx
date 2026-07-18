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

const screenWidth = Dimensions.get('window').width;

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

export default function GroupAnalyticsScreen() {
  const router = useRouter();
  const { id } = useRouteParams(idParamSchema);
  const [timeframe, setTimeframe] = useState<'today' | 'week' | 'month' | 'year'>('month');

  // Local reference date formatted to YYYY-MM-DD
  const getTodayString = () => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const [refDate] = useState<string>(getTodayString());
  const {
    data: analytics,
    isLoading,
    isError,
    refetch,
  } = useGroupDetailAnalytics(id, timeframe, refDate);

  const { data: categoriesData } = useCategories();
  const customCategories = categoriesData?.custom || [];

  const aggregatedData = useMemo(() => {
    if (!analytics) return null;

    const { totalGroupSpent, history, memberSpent, comparison } = analytics;

    // Calculate percent change vs previous period
    const prevSpent = comparison.totalSpent;
    let percentChange = 0;
    let spendingIncreased = false;
    if (prevSpent > 0) {
      percentChange = ((totalGroupSpent - prevSpent) / prevSpent) * 100;
      spendingIncreased = percentChange > 0;
    }

    // Format history data for gifted-charts
    const activeChartData = history.map((hl) => ({
      value: hl.amount,
      label: hl.label,
    }));

    // Format member spending for PieChart
    const pieData = memberSpent
      .map((member, index) => {
        const color = PALETTE[index % PALETTE.length] || COLORS.primary;
        return {
          value: member.amount,
          color: color,
          text: member.amount > 0 ? `${member.percentage.toFixed(0)}%` : '',
          focused: index === 0,
          name: member.name,
        };
      })
      .filter((p) => p.value > 0);

    return {
      percentChange,
      spendingIncreased,
      activeChartData,
      pieData,
      prevSpent,
    };
  }, [analytics]);

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
  const prevSpent = aggregatedData?.prevSpent ?? 0;

  // Format dates for subtitle display
  const formatPeriodLabel = () => {
    if (!startDate) return '—';
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

  return (
    <View style={styles.container}>
      {/* ── Always-visible Header ── */}
      <TopAppBar
        title={isLoading ? 'Analytics' : `${groupEmoji} ${groupName} Analytics`}
        showBack={true}
        onBack={() => router.back()}
      />

      <ScrollView
        contentContainerStyle={globalStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Always-visible Timeframe Tabs ── */}
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

        {/* ── Skeleton while loading / Real content when ready ── */}
        {isLoading ? (
          <GroupAnalyticsContentSkeleton />
        ) : (
          <>
            {/* Date Range Subtitle */}
            <Text style={styles.periodLabel}>{formatPeriodLabel()}</Text>

            {/* Group Spending Hero Card */}
            <View style={styles.heroCard}>
              <View style={styles.heroCardMain}>
                <View>
                  <Text style={styles.heroLabel}>Total Group Spent</Text>
                  <Text style={styles.heroAmount}>
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
                    {Math.abs(totalGroupSpent - prevSpent).toFixed(2)}
                  </Text>{' '}
                  compared to previous {timeframe} ({CURRENCY_SYMBOL}
                  {prevSpent.toFixed(0)})
                </Text>
              ) : (
                <Text style={styles.comparisonSubtext}>
                  No group spending history for previous {timeframe}
                </Text>
              )}

              <View style={styles.balanceDivider} />

              {/* User Specific Share Breakdown */}
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
            </View>

            {/* Visual Trend Chart */}
            <View style={styles.sectionContainer}>
              <Text style={globalStyles.sectionTitle}>Spending Trend</Text>
              <View style={styles.chartCard}>
                {totalGroupSpent === 0 ? (
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

            {/* Member Spending Pie Chart & Legend */}
            <View style={styles.sectionContainer}>
              <Text style={globalStyles.sectionTitle}>Expenses by Member</Text>
              <View style={styles.chartCard}>
                {pieData.length === 0 ? (
                  <View style={styles.emptyChartContainer}>
                    <Ionicons name="people-outline" size={32} color={COLORS.outlineVariant} />
                    <Text style={styles.emptyChartText}>No member payments recorded</Text>
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
                      innerCircleColor={COLORS.surface}
                      centerLabelComponent={() => (
                        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                          <Text
                            style={{ fontSize: 18, fontWeight: '800', color: COLORS.onSurface }}
                          >
                            {pieData.length}
                          </Text>
                          <Text style={{ fontSize: 10, color: COLORS.outline }}>Payers</Text>
                        </View>
                      )}
                    />

                    <View style={styles.legendContainer}>
                      {memberSpent.map((member, index) => {
                        const color = PALETTE[index % PALETTE.length] || COLORS.primary;
                        return (
                          <View key={member.userId} style={styles.legendRow}>
                            <View style={[styles.legendIndicator, { backgroundColor: color }]} />
                            <Text style={styles.legendName} numberOfLines={1}>
                              {member.name}
                            </Text>
                            <Text style={styles.legendAmount}>
                              {CURRENCY_SYMBOL}
                              {member.amount.toFixed(0)}
                            </Text>
                          </View>
                        );
                      })}
                    </View>
                  </View>
                )}
              </View>
            </View>

            {/* Category Spent Breakdown */}
            <View style={styles.sectionContainer}>
              <Text style={globalStyles.sectionTitle}>Spending by Category</Text>
              <View style={styles.categoryCard}>
                {categorySpent.length === 0 ? (
                  <Text style={styles.noDataText}>No categories to display</Text>
                ) : (
                  <View style={styles.listViewContainer}>
                    {categorySpent.map((item) => {
                      const config = getCategoryVisuals(item.category, customCategories);
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

            {/* User visual balance breakdown */}
            <View style={[styles.sectionContainer, { marginBottom: 30 }]}>
              <Text style={globalStyles.sectionTitle}>My Share Progress</Text>
              <View style={styles.categoryCard}>
                <View style={styles.progressContainer}>
                  <View style={styles.progressBarWrapper}>
                    {totalCalculated > 0 ? (
                      <>
                        <View
                          style={[
                            styles.progressSegment,
                            {
                              flex: paymentProgress,
                              backgroundColor: COLORS.primaryContainer,
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
                              backgroundColor: COLORS.error,
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
                            backgroundColor: 'rgba(0,0,0,0.05)',
                            borderRadius: 4,
                          },
                        ]}
                      />
                    )}
                  </View>
                  <View style={styles.progressLabels}>
                    <Text
                      style={[styles.progressIndicatorLabel, { color: COLORS.primaryContainer }]}
                    >
                      ● My Paid ({totalCalculated > 0 ? Math.round(paymentProgress * 100) : 0}%)
                    </Text>
                    <Text style={[styles.progressIndicatorLabel, { color: COLORS.error }]}>
                      ● My Share ({totalCalculated > 0 ? Math.round(shareProgress * 100) : 0}%)
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}
