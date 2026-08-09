import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { LineChart, BarChart, PieChart } from 'react-native-gifted-charts';
import { useIncomes, useExpensesSummary, type Income } from '@workspace/api';
import { globalStyles } from '../../../styles/globalStyles';
import { ErrorView } from '../../../components/ErrorView';
import { COLORS, CURRENCY_SYMBOL } from '../../../constants/theme';
import { useTheme } from '../../../context/ThemeContext';
import { useExport } from '../../../hooks/useExport';
import { ExportModalBottomSheet } from '../../../components/ExportModalBottomSheet';
import { ExportProgressAndSuccessModal } from '../../../components/ExportProgressAndSuccessModal';
import { BottomSheetModal } from '../../../components/BottomSheetModal';
import { DatePickerModal } from '../../../components/DatePickerModal';
import { MonthPickerModal } from '../../../components/MonthPickerModal';
import { hapticFeedback } from '../../../utils/haptics';

const screenWidth = Dimensions.get('window').width;

const SOURCE_COLORS: Record<string, { main: string; bg: string; icon: string }> = {
  Salary: { main: '#10B981', bg: '#D1FAE5', icon: 'cash-outline' },
  Freelance: { main: '#8B5CF6', bg: '#EDE9FE', icon: 'laptop-outline' },
  Investments: { main: '#3B82F6', bg: '#DBEAFE', icon: 'trending-up-outline' },
  Gift: { main: '#EC4899', bg: '#FCE7F3', icon: 'gift-outline' },
  Business: { main: '#F59E0B', bg: '#FEF3C7', icon: 'briefcase-outline' },
  Other: { main: '#6B7280', bg: '#F3F4F6', icon: 'wallet-outline' },
};

const TIMEFRAME_OPTIONS = [
  { label: 'Today', value: 'today', icon: 'today-outline' },
  { label: '7 Days', value: 'week', icon: 'time-outline' },
  { label: 'This Month', value: 'month', icon: 'calendar-number-outline' },
  { label: 'This Year', value: 'year', icon: 'infinite-outline' },
  { label: 'All Time', value: 'all', icon: 'globe-outline' },
  { label: 'Select Month', value: 'custom_month', icon: 'calendar-outline' },
  { label: 'Select Year', value: 'custom_year', icon: 'ribbon-outline' },
  { label: 'Choose Date', value: 'custom_date', icon: 'create-outline' },
] as const;

export default function IncomeAnalyticsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const exportHook = useExport();

  const getTodayString = () => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const [timeframe, setTimeframe] = useState<
    'today' | 'week' | 'month' | 'year' | 'all' | 'custom_month' | 'custom_year' | 'custom_date'
  >('month');
  const [refDate, setRefDate] = useState<string>(getTodayString());
  const [isTimeframeModalOpen, setIsTimeframeModalOpen] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);
  const [isYearPickerOpen, setIsYearPickerOpen] = useState(false);
  const [chartType, setChartType] = useState<'line' | 'bar' | 'donut'>('line');
  const [selectedSourceFilter, setSelectedSourceFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [monthlyGoal, setMonthlyGoal] = useState<number>(100000);
  const [goalModalVisible, setGoalModalVisible] = useState(false);
  const [goalInput, setGoalInput] = useState('100000');

  const { data, isLoading, isError, refetch } = useIncomes();
  const { data: summaryData } = useExpensesSummary();

  const incomes: Income[] = useMemo(() => data?.incomes ?? [], [data]);

  const currentYear = new Date().getFullYear();

  // Generate Year options from 2000 to 2100
  const yearOptions = useMemo(() => {
    const list = [];
    for (let y = 2000; y <= 2100; y++) {
      list.push(y);
    }
    return list;
  }, []);

  // Dynamic Timeframe Label
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
          if (timeframe === 'month' || timeframe === 'custom_month') {
            return refObj.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
          }
          if (timeframe === 'today' || timeframe === 'custom_date') {
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

  // Filter incomes by chosen timeframe & refDate
  const filteredIncomes = useMemo(() => {
    if (!incomes || incomes.length === 0) return [];
    const now = new Date();

    const parts = refDate ? refDate.split('-').map(Number) : [];
    const refYear = parts[0] || now.getFullYear();
    const refMonth = parts[1] ? parts[1] - 1 : now.getMonth();
    const refDay = parts[2] || now.getDate();

    return incomes.filter((i: Income) => {
      const d = new Date(i.date || i.createdAt);
      if (timeframe === 'all') {
        return true;
      }
      if (timeframe === 'today' || timeframe === 'custom_date') {
        return d.getFullYear() === refYear && d.getMonth() === refMonth && d.getDate() === refDay;
      }
      if (timeframe === 'week') {
        const targetDate = new Date(refYear, refMonth, refDay);
        const sevenDaysAgo = new Date(targetDate.getTime() - 7 * 24 * 60 * 60 * 1000);
        return d >= sevenDaysAgo && d <= targetDate;
      }
      if (timeframe === 'month' || timeframe === 'custom_month') {
        return d.getMonth() === refMonth && d.getFullYear() === refYear;
      }
      if (timeframe === 'year' || timeframe === 'custom_year') {
        return d.getFullYear() === refYear;
      }
      return true;
    });
  }, [incomes, timeframe, refDate]);

  // Aggregate metrics
  const totalIncome = useMemo(
    () => filteredIncomes.reduce((sum: number, i: Income) => sum + i.amount, 0),
    [filteredIncomes]
  );

  const count = filteredIncomes.length;
  const avgIncome = count > 0 ? totalIncome / count : 0;

  const daysInPeriod = useMemo(() => {
    if (timeframe === 'today' || timeframe === 'custom_date') return 1;
    if (timeframe === 'week') return 7;
    if (timeframe === 'month' || timeframe === 'custom_month') return new Date().getDate();
    if (timeframe === 'year' || timeframe === 'custom_year') return 365;
    if (timeframe === 'all') return 365 * 5;
    return 30;
  }, [timeframe]);

  const dailyVelocity = count > 0 ? totalIncome / Math.max(1, daysInPeriod) : 0;

  // Goal Progress
  const goalProgressPct = Math.min(100, (totalIncome / Math.max(1, monthlyGoal)) * 100);
  const goalRemaining = Math.max(0, monthlyGoal - totalIncome);

  // Total spent comparison for Cash Retention Rate
  const totalSpent = summaryData?.totalSpent ?? 0;
  const netSavings = totalIncome - totalSpent;
  const retentionRate =
    totalIncome > 0 ? Math.max(0, ((totalIncome - totalSpent) / totalIncome) * 100) : 0;

  // EOM Income Forecast
  const projectedEOM = useMemo(() => {
    if ((timeframe !== 'month' && timeframe !== 'custom_month') || totalIncome === 0) return null;
    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const currentDay = now.getDate();
    if (currentDay === 0) return null;

    const projected = (totalIncome / currentDay) * daysInMonth;
    return {
      projected: projected.toFixed(0),
      daysLeft: daysInMonth - currentDay,
    };
  }, [timeframe, totalIncome]);

  // Payment Method Breakdown
  const methodBreakdown = useMemo(() => {
    if (filteredIncomes.length === 0) return [];
    const map: Record<string, number> = {};
    filteredIncomes.forEach((i: Income) => {
      const m = i.paymentMethod || 'Bank Transfer';
      map[m] = (map[m] || 0) + i.amount;
    });

    return Object.entries(map)
      .map(([method, amount]) => ({
        method,
        amount,
        pct: totalIncome > 0 ? (amount / totalIncome) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [filteredIncomes, totalIncome]);

  // Highest income entry
  const topEntry = useMemo(() => {
    if (filteredIncomes.length === 0) return null;
    return [...filteredIncomes].sort((a: Income, b: Income) => b.amount - a.amount)[0];
  }, [filteredIncomes]);

  // Breakdown by Source
  const sourceBreakdown = useMemo(() => {
    if (totalIncome === 0) return [];
    const map: Record<string, number> = {};
    filteredIncomes.forEach((i: Income) => {
      const src = i.source || 'Other';
      map[src] = (map[src] || 0) + i.amount;
    });

    return Object.entries(map)
      .map(([source, amount]) => ({
        source,
        amount,
        percentage: (amount / totalIncome) * 100,
        visual: SOURCE_COLORS[source] || SOURCE_COLORS.Other,
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [filteredIncomes, totalIncome]);

  const topSource = sourceBreakdown[0] || null;

  // Day of Week Distribution
  const busiestDay = useMemo(() => {
    if (filteredIncomes.length === 0) return null;
    const dayMap: Record<string, number> = {};
    filteredIncomes.forEach((i: Income) => {
      const day = new Date(i.date || i.createdAt).toLocaleDateString('en-IN', { weekday: 'long' });
      dayMap[day] = (dayMap[day] || 0) + i.amount;
    });

    let topDay = '';
    let max = 0;
    Object.entries(dayMap).forEach(([day, amt]) => {
      if (amt > max) {
        max = amt;
        topDay = day;
      }
    });

    if (!topDay) return null;
    return {
      dayName: topDay,
      amount: max,
      pct: totalIncome > 0 ? ((max / totalIncome) * 100).toFixed(0) : '0',
    };
  }, [filteredIncomes, totalIncome]);

  // Dynamic AI Smart Tip
  const aiTip = useMemo(() => {
    if (totalIncome === 0) {
      return 'Log your recurring or one-time income to start tracking your cash velocity and retention!';
    }
    if (topSource && topSource.percentage > 60) {
      return `${topSource.source} provides ${topSource.percentage.toFixed(0)}% of your revenue. Building secondary streams boosts long-term stability.`;
    }
    if (goalProgressPct >= 100) {
      return `🎉 Congratulations! You have exceeded your target goal of ${CURRENCY_SYMBOL}${monthlyGoal.toLocaleString('en-IN')}!`;
    }
    return `You have achieved ${goalProgressPct.toFixed(0)}% of your monthly target. Keep up the momentum!`;
  }, [totalIncome, topSource, goalProgressPct, monthlyGoal]);

  // Pie chart donut slices
  const donutData = useMemo(() => {
    if (sourceBreakdown.length === 0) return [];
    return sourceBreakdown.map((item) => ({
      value: item.amount,
      color: item.visual.main,
      text: item.source,
    }));
  }, [sourceBreakdown]);

  // Gifted-charts Line / Bar Data
  const trendChartData = useMemo(() => {
    if (filteredIncomes.length === 0) return [];

    if (timeframe === 'all') {
      const yearMap: Record<string, number> = {};
      const currentY = new Date().getFullYear();
      const startY = currentY - 4;
      const years: string[] = [];
      for (let y = startY; y <= currentY; y++) {
        const yStr = String(y);
        years.push(yStr);
        yearMap[yStr] = 0;
      }
      filteredIncomes.forEach((i: Income) => {
        const y = String(new Date(i.date || i.createdAt).getFullYear());
        if (yearMap[y] !== undefined) {
          yearMap[y] += i.amount;
        }
      });
      return years.map((y) => ({ label: y, value: yearMap[y] }));
    } else if (timeframe === 'year' || timeframe === 'custom_year') {
      const monthMap: Record<string, number> = {};
      const monthNames = [
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
      ];

      filteredIncomes.forEach((i: Income) => {
        const d = new Date(i.date || i.createdAt);
        const key = monthNames[d.getMonth()];
        monthMap[key] = (monthMap[key] || 0) + i.amount;
      });

      return monthNames.map((m) => ({
        label: m,
        value: monthMap[m] || 0,
      }));
    } else {
      const dayMap: Record<string, number> = {};
      const now = new Date();
      const numDays = 7;

      for (let i = numDays - 1; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const label = d.toLocaleDateString('en-IN', { weekday: 'short' });
        dayMap[label] = 0;
      }

      filteredIncomes.forEach((i: Income) => {
        const d = new Date(i.date || i.createdAt);
        const label = d.toLocaleDateString('en-IN', { weekday: 'short' });
        if (dayMap[label] !== undefined) {
          dayMap[label] += i.amount;
        }
      });

      return Object.entries(dayMap).map(([label, value]) => ({ label, value }));
    }
  }, [filteredIncomes, timeframe]);

  const maxChartVal = useMemo(() => {
    if (trendChartData.length === 0) return 100;
    const max = Math.max(...trendChartData.map((d) => d.value));
    return max > 0 ? max * 1.2 : 100;
  }, [trendChartData]);

  // Feed list filtered by source tab & search query
  const feedList = useMemo(() => {
    let list = [...filteredIncomes];
    if (selectedSourceFilter !== 'All') {
      list = list.filter((i) => i.source === selectedSourceFilter);
    }
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(
        (i) =>
          (i.source && i.source.toLowerCase().includes(q)) ||
          (i.notes && i.notes.toLowerCase().includes(q)) ||
          i.amount.toString().includes(q)
      );
    }
    return list;
  }, [filteredIncomes, selectedSourceFilter, searchQuery]);

  const chartWidth = screenWidth - 72;

  const handleSaveGoal = () => {
    const parsed = parseFloat(goalInput);
    if (!isNaN(parsed) && parsed > 0) {
      setMonthlyGoal(parsed);
    }
    setGoalModalVisible(false);
  };

  const handleSelectTimeframeOption = (val: string) => {
    hapticFeedback.selection();
    if (val === 'custom_date') {
      setIsTimeframeModalOpen(false);
      setTimeout(() => setIsDatePickerOpen(true), 300);
    } else if (val === 'custom_month') {
      setIsTimeframeModalOpen(false);
      setTimeout(() => setIsMonthPickerOpen(true), 300);
    } else if (val === 'custom_year') {
      setIsTimeframeModalOpen(false);
      setTimeout(() => setIsYearPickerOpen(true), 300);
    } else {
      setTimeframe(val as never);
      setRefDate(getTodayString());
      setIsTimeframeModalOpen(false);
    }
  };

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      {/* ── Top Header ── */}
      <View
        style={[
          styles.headerContainer,
          isDark && styles.headerContainerDark,
          { paddingTop: insets.top + 12 },
        ]}
      >
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backBtn}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={24} color={isDark ? '#F9FAFB' : COLORS.onSurface} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, isDark && styles.headerTitleDark]}>
              Income Analytics
            </Text>
          </View>

          <View style={styles.headerRight}>
            <TouchableOpacity
              style={[styles.aiHeaderBtn, isDark && styles.aiHeaderBtnDark]}
              onPress={() => {
                hapticFeedback.selection();
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="sparkles" size={18} color={isDark ? '#34D399' : '#059669'} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[globalStyles.scrollContent, { paddingTop: 4, paddingBottom: 60 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Advanced Timeframe Pill Selector Bar ── */}
        <View style={styles.timeframeBarContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.timeframePillRow}
          >
            {TIMEFRAME_OPTIONS.map((opt) => {
              const isSelected =
                (opt.value === 'custom_date' && timeframe === 'custom_date') ||
                (opt.value === 'custom_month' && timeframe === 'custom_month') ||
                (opt.value === 'custom_year' && timeframe === 'custom_year') ||
                (timeframe === opt.value &&
                  timeframe !== 'custom_date' &&
                  timeframe !== 'custom_month' &&
                  timeframe !== 'custom_year');

              return (
                <TouchableOpacity
                  key={opt.value}
                  style={[
                    styles.timeframePill,
                    isDark && styles.timeframePillDark,
                    isSelected && styles.timeframePillActive,
                  ]}
                  onPress={() => handleSelectTimeframeOption(opt.value)}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={opt.icon as never}
                    size={14}
                    color={isSelected ? '#ffffff' : isDark ? '#9CA3AF' : COLORS.outline}
                  />
                  <Text
                    style={[
                      styles.timeframePillText,
                      isDark && styles.timeframePillTextDark,
                      isSelected && styles.timeframePillTextActive,
                    ]}
                  >
                    {opt.value === 'custom_date' && timeframe === 'custom_date'
                      ? refDate
                      : (opt.value === 'custom_month' && timeframe === 'custom_month') ||
                          (opt.value === 'custom_year' && timeframe === 'custom_year')
                        ? getDynamicTimeframeLabel()
                        : opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <TouchableOpacity
            style={[styles.timeframeDropdownBtn, isDark && styles.timeframeDropdownBtnDark]}
            onPress={() => {
              hapticFeedback.selection();
              setIsTimeframeModalOpen(true);
            }}
            activeOpacity={0.8}
          >
            <Ionicons name="filter-outline" size={16} color={isDark ? '#34D399' : COLORS.primary} />
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#10B981" />
            <Text style={[styles.loadingText, isDark && styles.loadingTextDark]}>
              Calculating income metrics...
            </Text>
          </View>
        ) : isError ? (
          <ErrorView message="Failed to load income analytics" onRetry={refetch} />
        ) : (
          <>
            {/* ── Hero Emerald Gradient Card ── */}
            <LinearGradient
              colors={
                isDark ? ['#064e3b', '#047857', '#059669'] : ['#059669', '#10b981', '#34d399']
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroCard}
            >
              <View style={styles.heroBadgeRow}>
                <View style={styles.heroTag}>
                  <Ionicons name="trending-up" size={13} color="#D1FAE5" />
                  <Text style={styles.heroTagText}>TOTAL INCOME INFLOW</Text>
                </View>
                <View style={styles.heroTimeframeBadge}>
                  <Text style={styles.heroTimeframeText}>{getDynamicTimeframeLabel()}</Text>
                </View>
              </View>

              <View style={styles.heroAmountRow}>
                <Text style={styles.heroCurrency}>{CURRENCY_SYMBOL}</Text>
                <Text style={styles.heroAmount}>
                  {totalIncome.toLocaleString('en-IN', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </Text>
              </View>

              <Text style={styles.heroSubText}>
                {count} income {count === 1 ? 'transaction' : 'transactions'} recorded in this
                period
              </Text>

              <View style={styles.heroDivider} />

              <View style={styles.heroStatsRow}>
                <View style={styles.heroStatCol}>
                  <Text style={styles.heroStatLabel}>AVG ENTRY</Text>
                  <Text style={styles.heroStatValue}>
                    {CURRENCY_SYMBOL}
                    {avgIncome.toFixed(0)}
                  </Text>
                </View>
                <View style={styles.heroStatColDivider} />
                <View style={styles.heroStatCol}>
                  <Text style={styles.heroStatLabel}>DAILY INFLOW</Text>
                  <Text style={styles.heroStatValue}>
                    {CURRENCY_SYMBOL}
                    {dailyVelocity.toFixed(0)}/day
                  </Text>
                </View>
                <View style={styles.heroStatColDivider} />
                <View style={styles.heroStatCol}>
                  <Text style={styles.heroStatLabel}>ENTRIES</Text>
                  <Text style={styles.heroStatValue}>{count}</Text>
                </View>
              </View>
            </LinearGradient>

            {/* ── AI Smart Advisor Tip Card ── */}
            <View style={[styles.aiTipCard, isDark && styles.aiTipCardDark]}>
              <View style={styles.aiTipHeader}>
                <Ionicons name="bulb-outline" size={18} color="#10B981" />
                <Text style={[styles.aiTipTitle, isDark && styles.aiTipTitleDark]}>
                  AI Financial Insight
                </Text>
              </View>
              <Text style={[styles.aiTipBody, isDark && styles.aiTipBodyDark]}>{aiTip}</Text>
            </View>

            {/* ── Income Goal Target Progress Tracker Card ── */}
            <View style={[styles.goalCard, isDark && styles.goalCardDark]}>
              <View style={styles.goalHeaderRow}>
                <View>
                  <Text style={[styles.goalTitle, isDark && styles.goalTitleDark]}>
                    Income Target Goal
                  </Text>
                  <Text style={[styles.goalSub, isDark && styles.goalSubDark]}>
                    Target: {CURRENCY_SYMBOL}
                    {monthlyGoal.toLocaleString('en-IN')}
                  </Text>
                </View>
                <TouchableOpacity
                  style={[styles.editGoalBtn, isDark && styles.editGoalBtnDark]}
                  onPress={() => {
                    setGoalInput(monthlyGoal.toString());
                    setGoalModalVisible(true);
                  }}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name="create-outline"
                    size={13}
                    color={isDark ? '#34D399' : COLORS.primary}
                  />
                  <Text style={[styles.editGoalBtnText, isDark && styles.editGoalBtnTextDark]}>
                    Set Goal
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.goalProgressTrack}>
                <View style={[styles.goalProgressFill, { width: `${goalProgressPct}%` }]} />
              </View>

              <View style={styles.goalMetaRow}>
                <Text style={styles.goalMetaText}>{goalProgressPct.toFixed(0)}% Achieved</Text>
                <Text style={styles.goalMetaText}>
                  {goalRemaining > 0
                    ? `${CURRENCY_SYMBOL}${goalRemaining.toLocaleString('en-IN')} to go`
                    : 'Target Met! 🎉'}
                </Text>
              </View>
            </View>

            {/* ── Financial Health & Cash Retention Gauge Card ── */}
            {totalIncome > 0 && (
              <View style={[styles.healthCard, isDark && styles.healthCardDark]}>
                <View style={styles.healthHeader}>
                  <View style={styles.healthTitleRow}>
                    <View style={styles.healthIconCircle}>
                      <Ionicons name="shield-checkmark" size={18} color="#10B981" />
                    </View>
                    <View>
                      <Text style={[styles.healthTitle, isDark && styles.healthTitleDark]}>
                        Cash Retention Velocity
                      </Text>
                      <Text style={[styles.healthSub, isDark && styles.healthSubDark]}>
                        Income retained after total spent ({retentionRate.toFixed(0)}%)
                      </Text>
                    </View>
                  </View>
                  <View style={styles.retentionBadge}>
                    <Text style={styles.retentionBadgeText}>{retentionRate.toFixed(0)}% Saved</Text>
                  </View>
                </View>

                {/* Progress bar comparing Inflow vs Outflow */}
                <View style={styles.retentionTrack}>
                  <View
                    style={[styles.retentionFill, { width: `${Math.min(100, retentionRate)}%` }]}
                  />
                </View>

                <View style={styles.retentionMetricsRow}>
                  <Text style={styles.retentionMetaText}>
                    Inflow:{' '}
                    <Text style={{ color: '#10B981', fontWeight: '800' }}>
                      +{CURRENCY_SYMBOL}
                      {totalIncome.toFixed(0)}
                    </Text>
                  </Text>
                  <Text style={styles.retentionMetaText}>
                    Spent:{' '}
                    <Text style={{ color: '#EF4444', fontWeight: '800' }}>
                      -{CURRENCY_SYMBOL}
                      {totalSpent.toFixed(0)}
                    </Text>
                  </Text>
                  <Text style={styles.retentionMetaText}>
                    Net:{' '}
                    <Text
                      style={{ color: netSavings >= 0 ? '#10B981' : '#EF4444', fontWeight: '800' }}
                    >
                      {netSavings >= 0 ? '+' : ''}
                      {CURRENCY_SYMBOL}
                      {netSavings.toFixed(0)}
                    </Text>
                  </Text>
                </View>
              </View>
            )}

            {/* ── Advanced Multi-View Interactive Chart Card ── */}
            <View style={[styles.chartCard, isDark && styles.chartCardDark]}>
              <View style={styles.chartHeader}>
                <View>
                  <Text style={[styles.chartTitle, isDark && styles.chartTitleDark]}>
                    Income Performance Chart
                  </Text>
                  <Text style={[styles.chartSub, isDark && styles.chartSubDark]}>
                    Interactive trend & distribution view
                  </Text>
                </View>

                {/* View Switcher: Line | Bars | Donut */}
                <View style={[styles.toggleContainer, isDark && styles.toggleContainerDark]}>
                  <TouchableOpacity
                    style={[styles.toggleBtn, chartType === 'line' && styles.toggleBtnActive]}
                    onPress={() => {
                      hapticFeedback.selection();
                      setChartType('line');
                    }}
                    activeOpacity={0.75}
                  >
                    <Ionicons
                      name="stats-chart"
                      size={13}
                      color={chartType === 'line' ? '#10B981' : isDark ? '#9CA3AF' : COLORS.outline}
                    />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.toggleBtn, chartType === 'bar' && styles.toggleBtnActive]}
                    onPress={() => {
                      hapticFeedback.selection();
                      setChartType('bar');
                    }}
                    activeOpacity={0.75}
                  >
                    <Ionicons
                      name="bar-chart"
                      size={13}
                      color={chartType === 'bar' ? '#10B981' : isDark ? '#9CA3AF' : COLORS.outline}
                    />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.toggleBtn, chartType === 'donut' && styles.toggleBtnActive]}
                    onPress={() => {
                      hapticFeedback.selection();
                      setChartType('donut');
                    }}
                    activeOpacity={0.75}
                  >
                    <Ionicons
                      name="pie-chart"
                      size={13}
                      color={
                        chartType === 'donut' ? '#10B981' : isDark ? '#9CA3AF' : COLORS.outline
                      }
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {totalIncome === 0 || trendChartData.length === 0 ? (
                <View style={styles.emptyChartState}>
                  <Ionicons
                    name="bar-chart-outline"
                    size={38}
                    color={isDark ? '#4B5563' : '#9CA3AF'}
                  />
                  <Text style={[styles.emptyChartTitle, isDark && styles.emptyChartTitleDark]}>
                    No income data recorded for {getDynamicTimeframeLabel()}
                  </Text>
                </View>
              ) : chartType === 'donut' ? (
                <View style={styles.donutContainer}>
                  <PieChart
                    data={donutData}
                    donut
                    radius={74}
                    innerRadius={52}
                    innerCircleColor={isDark ? '#131D1A' : '#ffffff'}
                    centerLabelComponent={() => (
                      <View style={{ alignItems: 'center' }}>
                        <Text style={{ fontSize: 10, fontWeight: '800', color: '#6B7280' }}>
                          INFLOW
                        </Text>
                        <Text style={{ fontSize: 15, fontWeight: '900', color: '#10B981' }}>
                          {CURRENCY_SYMBOL}
                          {totalIncome > 9999
                            ? `${(totalIncome / 1000).toFixed(1)}k`
                            : totalIncome.toFixed(0)}
                        </Text>
                      </View>
                    )}
                  />
                  <View style={styles.donutLegend}>
                    {sourceBreakdown.map((s) => (
                      <View key={s.source} style={styles.legendRow}>
                        <View style={[styles.legendDot, { backgroundColor: s.visual.main }]} />
                        <Text style={[styles.legendText, isDark && styles.legendTextDark]}>
                          {s.source} ({s.percentage.toFixed(0)}%)
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              ) : chartType === 'bar' ? (
                <View style={{ paddingTop: 10, alignItems: 'center' }}>
                  <BarChart
                    data={trendChartData}
                    barWidth={18}
                    spacing={16}
                    initialSpacing={12}
                    height={200}
                    color="#10B981"
                    showGradient={true}
                    gradientColor="rgba(16, 185, 129, 0.3)"
                    frontColor="#10B981"
                    roundedTop={true}
                    noOfSections={4}
                    yAxisThickness={0}
                    xAxisThickness={1}
                    xAxisColor={isDark ? 'rgba(255,255,255,0.1)' : '#E5E7EB'}
                    rulesColor={isDark ? 'rgba(255,255,255,0.06)' : '#F3F4F6'}
                    rulesType="dashed"
                    yAxisTextStyle={{ color: isDark ? '#9CA3AF' : '#6B7280', fontSize: 10 }}
                    xAxisLabelTextStyle={{
                      color: isDark ? '#9CA3AF' : '#6B7280',
                      fontSize: 10,
                      fontWeight: '700',
                    }}
                    maxValue={maxChartVal}
                  />
                </View>
              ) : (
                <View style={{ paddingTop: 10, alignItems: 'center' }}>
                  <LineChart
                    data={trendChartData}
                    width={chartWidth}
                    height={200}
                    areaChart
                    thickness={3.5}
                    color="#10B981"
                    startFillColor="#10B981"
                    endFillColor="#10B981"
                    startOpacity={0.35}
                    endOpacity={0.03}
                    curved={true}
                    noOfSections={4}
                    yAxisThickness={0}
                    xAxisThickness={1}
                    xAxisColor={isDark ? 'rgba(255,255,255,0.1)' : '#E5E7EB'}
                    rulesColor={isDark ? 'rgba(255,255,255,0.06)' : '#F3F4F6'}
                    rulesType="dashed"
                    spacing={(chartWidth - 20) / Math.max(1, trendChartData.length - 1)}
                    initialSpacing={10}
                    dataPointsColor="#10B981"
                    dataPointsRadius={4}
                    xAxisLabelTextStyle={{
                      color: isDark ? '#9CA3AF' : '#6B7280',
                      fontSize: 10,
                      fontWeight: '700',
                    }}
                    yAxisTextStyle={{ color: isDark ? '#9CA3AF' : '#6B7280', fontSize: 10 }}
                    maxValue={maxChartVal}
                  />
                </View>
              )}
            </View>

            {/* ── Forecast & Insights Grid ── */}
            <View style={styles.sectionMargin}>
              <View style={styles.highlightGrid}>
                {projectedEOM && (
                  <View style={[styles.highlightCard, isDark && styles.highlightCardDark]}>
                    <View style={styles.highlightHeader}>
                      <View style={[styles.highlightIconBg, { backgroundColor: '#DBEAFE' }]}>
                        <Ionicons name="compass-outline" size={16} color="#3B82F6" />
                      </View>
                      <View style={[styles.highlightBadge, { backgroundColor: '#DBEAFE' }]}>
                        <Text style={[styles.highlightBadgeText, { color: '#1D4ED8' }]}>
                          {projectedEOM.daysLeft}d left
                        </Text>
                      </View>
                    </View>
                    <Text style={[styles.highlightLabel, isDark && styles.highlightLabelDark]}>
                      Month Forecast
                    </Text>
                    <Text
                      style={[styles.highlightValue, isDark && styles.highlightValueDark]}
                      numberOfLines={1}
                    >
                      {CURRENCY_SYMBOL}
                      {Number(projectedEOM.projected).toLocaleString('en-IN')}
                    </Text>
                    <Text style={[styles.highlightSub, { color: '#3B82F6' }]}>
                      Estimated pace total
                    </Text>
                  </View>
                )}

                {topSource && (
                  <View style={[styles.highlightCard, isDark && styles.highlightCardDark]}>
                    <View style={styles.highlightHeader}>
                      <View
                        style={[styles.highlightIconBg, { backgroundColor: topSource.visual.bg }]}
                      >
                        <Ionicons
                          name={topSource.visual.icon as never}
                          size={16}
                          color={topSource.visual.main}
                        />
                      </View>
                      <View style={styles.highlightBadge}>
                        <Text style={styles.highlightBadgeText}>
                          {topSource.percentage.toFixed(0)}%
                        </Text>
                      </View>
                    </View>
                    <Text style={[styles.highlightLabel, isDark && styles.highlightLabelDark]}>
                      Top Source
                    </Text>
                    <Text
                      style={[styles.highlightValue, isDark && styles.highlightValueDark]}
                      numberOfLines={1}
                    >
                      {topSource.source}
                    </Text>
                    <Text style={styles.highlightSub}>
                      {CURRENCY_SYMBOL}
                      {topSource.amount.toLocaleString('en-IN')} total
                    </Text>
                  </View>
                )}

                {topEntry && (
                  <View style={[styles.highlightCard, isDark && styles.highlightCardDark]}>
                    <View style={styles.highlightHeader}>
                      <View style={[styles.highlightIconBg, { backgroundColor: '#D1FAE5' }]}>
                        <Ionicons name="sparkles" size={16} color="#10B981" />
                      </View>
                      <View style={[styles.highlightBadge, { backgroundColor: '#D1FAE5' }]}>
                        <Text style={[styles.highlightBadgeText, { color: '#059669' }]}>Peak</Text>
                      </View>
                    </View>
                    <Text style={[styles.highlightLabel, isDark && styles.highlightLabelDark]}>
                      Largest Entry
                    </Text>
                    <Text
                      style={[styles.highlightValue, isDark && styles.highlightValueDark]}
                      numberOfLines={1}
                    >
                      {topEntry.notes || topEntry.source}
                    </Text>
                    <Text style={styles.highlightSub}>
                      {CURRENCY_SYMBOL}
                      {topEntry.amount.toLocaleString('en-IN')}
                    </Text>
                  </View>
                )}

                {busiestDay && (
                  <View style={[styles.highlightCard, isDark && styles.highlightCardDark]}>
                    <View style={styles.highlightHeader}>
                      <View style={[styles.highlightIconBg, { backgroundColor: '#FEF3C7' }]}>
                        <Ionicons name="calendar-sharp" size={16} color="#D97706" />
                      </View>
                      <View style={[styles.highlightBadge, { backgroundColor: '#FEF3C7' }]}>
                        <Text style={[styles.highlightBadgeText, { color: '#D97706' }]}>
                          {busiestDay.pct}%
                        </Text>
                      </View>
                    </View>
                    <Text style={[styles.highlightLabel, isDark && styles.highlightLabelDark]}>
                      Busiest Inflow Day
                    </Text>
                    <Text
                      style={[styles.highlightValue, isDark && styles.highlightValueDark]}
                      numberOfLines={1}
                    >
                      {busiestDay.dayName}s
                    </Text>
                    <Text style={[styles.highlightSub, { color: '#D97706' }]}>
                      {CURRENCY_SYMBOL}
                      {busiestDay.amount.toLocaleString('en-IN')}
                    </Text>
                  </View>
                )}

                {methodBreakdown.length > 0 && (
                  <View style={[styles.highlightCard, isDark && styles.highlightCardDark]}>
                    <View style={styles.highlightHeader}>
                      <View style={[styles.highlightIconBg, { backgroundColor: '#EDE9FE' }]}>
                        <Ionicons name="card-outline" size={16} color="#8B5CF6" />
                      </View>
                      <View style={[styles.highlightBadge, { backgroundColor: '#EDE9FE' }]}>
                        <Text style={[styles.highlightBadgeText, { color: '#6D28D9' }]}>
                          {methodBreakdown[0].pct.toFixed(0)}%
                        </Text>
                      </View>
                    </View>
                    <Text style={[styles.highlightLabel, isDark && styles.highlightLabelDark]}>
                      Top Payment Method
                    </Text>
                    <Text
                      style={[styles.highlightValue, isDark && styles.highlightValueDark]}
                      numberOfLines={1}
                    >
                      {methodBreakdown[0].method}
                    </Text>
                    <Text style={[styles.highlightSub, { color: '#8B5CF6' }]}>
                      {CURRENCY_SYMBOL}
                      {methodBreakdown[0].amount.toLocaleString('en-IN')}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* ── Source Breakdown Progress Bars ── */}
            <View style={[styles.sourceCard, isDark && styles.sourceCardDark]}>
              <View style={styles.sourceCardHeader}>
                <View>
                  <Text style={[styles.sourceCardTitle, isDark && styles.sourceCardTitleDark]}>
                    Source Distribution
                  </Text>
                  <Text style={[styles.sourceCardSub, isDark && styles.sourceCardSubDark]}>
                    Breakdown by income category
                  </Text>
                </View>
                <View style={styles.sourceCountBadge}>
                  <Text style={styles.sourceCountText}>{sourceBreakdown.length} Sources</Text>
                </View>
              </View>

              {sourceBreakdown.length === 0 ? (
                <Text style={[styles.emptyText, isDark && styles.emptyTextDark]}>
                  No source data available
                </Text>
              ) : (
                <View style={styles.sourceList}>
                  {sourceBreakdown.map((item) => (
                    <View key={item.source} style={styles.sourceRow}>
                      <View style={[styles.sourceIconCircle, { backgroundColor: item.visual.bg }]}>
                        <Ionicons
                          name={item.visual.icon as never}
                          size={16}
                          color={item.visual.main}
                        />
                      </View>

                      <View style={{ flex: 1 }}>
                        <View style={styles.sourceMetaRow}>
                          <Text style={[styles.sourceName, isDark && styles.sourceNameDark]}>
                            {item.source}
                          </Text>
                          <Text style={[styles.sourceAmount, isDark && styles.sourceAmountDark]}>
                            {CURRENCY_SYMBOL}
                            {item.amount.toLocaleString('en-IN')}
                          </Text>
                        </View>

                        <View style={styles.progressTrack}>
                          <View
                            style={[
                              styles.progressFill,
                              {
                                width: `${Math.min(100, Math.max(5, item.percentage))}%`,
                                backgroundColor: item.visual.main,
                              },
                            ]}
                          />
                        </View>

                        <Text style={[styles.sourcePctText, isDark && styles.sourcePctTextDark]}>
                          {item.percentage.toFixed(1)}% of total income
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* ── Recent Period Incomes Stream with Search & Filter Chips ── */}
            <View style={styles.sectionMargin}>
              <View style={styles.streamHeaderRow}>
                <Text
                  style={[
                    styles.sectionHeading,
                    isDark && styles.sectionHeadingDark,
                    { marginBottom: 0 },
                  ]}
                >
                  Recent Income Transactions
                </Text>
                <TouchableOpacity
                  onPress={() => router.push('/income-history')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.seeAllLink}>View All ({filteredIncomes.length})</Text>
                </TouchableOpacity>
              </View>

              {/* Instant Search Bar */}
              <View style={[styles.searchBox, isDark && styles.searchBoxDark]}>
                <Ionicons
                  name="search-outline"
                  size={18}
                  color={isDark ? '#9CA3AF' : COLORS.outline}
                />
                <TextInput
                  style={[styles.searchInput, isDark && { color: '#ffffff' }]}
                  placeholder="Search recent incomes..."
                  placeholderTextColor={isDark ? '#9CA3AF' : COLORS.outline}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery('')}>
                    <Ionicons
                      name="close-circle"
                      size={16}
                      color={isDark ? '#9CA3AF' : COLORS.outline}
                    />
                  </TouchableOpacity>
                )}
              </View>

              {/* Source Filter Chips */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterChipsRow}
              >
                {['All', ...sourceBreakdown.map((s) => s.source)].map((src) => {
                  const isSelected = selectedSourceFilter === src;
                  return (
                    <TouchableOpacity
                      key={src}
                      style={[
                        styles.chipBtn,
                        isDark && styles.chipBtnDark,
                        isSelected && styles.chipBtnActive,
                      ]}
                      onPress={() => {
                        hapticFeedback.selection();
                        setSelectedSourceFilter(src);
                      }}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          isDark && styles.chipTextDark,
                          isSelected && styles.chipTextActive,
                        ]}
                      >
                        {src}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {feedList.length === 0 ? (
                <View style={styles.emptyFeedBox}>
                  <Text style={styles.emptyFeedText}>No matching income entries found</Text>
                </View>
              ) : (
                feedList.slice(0, 10).map((i: Income) => {
                  const vis = SOURCE_COLORS[i.source] || SOURCE_COLORS.Other;
                  return (
                    <View
                      key={i.id}
                      style={[styles.transactionRow, isDark && styles.transactionRowDark]}
                    >
                      <View style={[styles.transactionIconBg, { backgroundColor: vis.bg }]}>
                        <Ionicons name={vis.icon as never} size={18} color={vis.main} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={[styles.transactionTitle, isDark && styles.transactionTitleDark]}
                        >
                          {i.notes || i.source}
                        </Text>
                        <Text style={styles.transactionSub}>
                          {i.source} •{' '}
                          {new Date(i.date || i.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </Text>
                      </View>
                      <Text style={styles.transactionAmount}>
                        +{CURRENCY_SYMBOL}
                        {i.amount.toLocaleString('en-IN')}
                      </Text>
                    </View>
                  );
                })
              )}
            </View>
          </>
        )}
      </ScrollView>

      {/* Timeframe Selection BottomSheet Modal */}
      <BottomSheetModal
        visible={isTimeframeModalOpen}
        onClose={() => setIsTimeframeModalOpen(false)}
        title="Select Timeframe"
        description="Choose a period to analyze your income streams"
        variant={isDark ? 'dark' : 'light'}
      >
        <View style={styles.modalContent}>
          {TIMEFRAME_OPTIONS.map((opt) => {
            const isSelected =
              (opt.value === 'custom_date' && timeframe === 'custom_date') ||
              (opt.value === 'custom_month' && timeframe === 'custom_month') ||
              (opt.value === 'custom_year' && timeframe === 'custom_year') ||
              (timeframe === opt.value &&
                timeframe !== 'custom_date' &&
                timeframe !== 'custom_month' &&
                timeframe !== 'custom_year');

            return (
              <TouchableOpacity
                key={opt.value}
                style={[
                  styles.modalItem,
                  isDark && styles.modalItemDark,
                  isSelected && (isDark ? styles.modalItemActiveDark : styles.modalItemActiveLight),
                ]}
                onPress={() => handleSelectTimeframeOption(opt.value)}
                activeOpacity={0.7}
              >
                <View style={styles.modalItemLeft}>
                  <Ionicons
                    name={opt.icon as never}
                    size={20}
                    color={isSelected ? '#10B981' : isDark ? '#9CA3AF' : COLORS.outline}
                  />
                  <Text
                    style={[
                      styles.modalItemText,
                      isDark && styles.modalItemTextDark,
                      isSelected && { fontWeight: '700', color: '#10B981' },
                    ]}
                  >
                    {opt.label}
                  </Text>
                </View>
                {isSelected && <Ionicons name="checkmark-circle" size={20} color="#10B981" />}
              </TouchableOpacity>
            );
          })}
        </View>
      </BottomSheetModal>

      {/* Date Picker Modal */}
      <DatePickerModal
        visible={isDatePickerOpen}
        onClose={() => setIsDatePickerOpen(false)}
        selectedDate={refDate}
        onSelectDate={(newDate: string) => {
          setRefDate(newDate);
          setTimeframe('custom_date');
        }}
      />

      {/* Month Picker Modal */}
      <MonthPickerModal
        visible={isMonthPickerOpen}
        onClose={() => setIsMonthPickerOpen(false)}
        selectedDate={refDate}
        onSelectMonth={(newDateStr: string) => {
          setRefDate(newDateStr);
          setTimeframe('custom_month');
        }}
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
          <View style={styles.yearGridContainer}>
            {yearOptions.map((year) => {
              const isFutureYear = year > currentYear;
              const isSelected = refDate.startsWith(year.toString()) && timeframe === 'custom_year';
              return (
                <TouchableOpacity
                  key={year}
                  disabled={isFutureYear}
                  style={[
                    styles.yearChip,
                    isDark && styles.yearChipDark,
                    isFutureYear && {
                      opacity: 0.3,
                      backgroundColor: isDark ? '#111816' : '#F3F4F6',
                    },
                    isSelected && styles.yearChipActive,
                  ]}
                  onPress={() => {
                    if (isFutureYear) return;
                    hapticFeedback.selection();
                    setRefDate(`${year}-01-01`);
                    setTimeframe('custom_year');
                    setIsYearPickerOpen(false);
                  }}
                  activeOpacity={0.75}
                >
                  <Text
                    style={[
                      styles.yearChipText,
                      isDark && styles.yearChipTextDark,
                      isFutureYear && { color: isDark ? '#4B5563' : COLORS.outline },
                      isSelected && styles.yearChipTextActive,
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

      {/* Target Goal Modal */}
      <BottomSheetModal
        visible={goalModalVisible}
        onClose={() => setGoalModalVisible(false)}
        title="Set Target Income Goal"
        description="Specify your target monthly income goal"
        variant={isDark ? 'dark' : 'light'}
      >
        <View style={styles.goalModalBody}>
          <Text style={[styles.goalInputLabel, isDark && styles.goalInputLabelDark]}>
            Target Amount ({CURRENCY_SYMBOL})
          </Text>
          <TextInput
            style={[styles.goalInputField, isDark && styles.goalInputFieldDark]}
            keyboardType="numeric"
            value={goalInput}
            onChangeText={setGoalInput}
            placeholder="e.g. 100000"
            placeholderTextColor={isDark ? '#9CA3AF' : COLORS.outline}
          />
          <TouchableOpacity style={styles.saveGoalBtn} onPress={handleSaveGoal} activeOpacity={0.8}>
            <Text style={styles.saveGoalBtnText}>Save Goal Target</Text>
          </TouchableOpacity>
        </View>
      </BottomSheetModal>

      {/* Export Selection Modal */}
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
          exportHook.executeExport(
            filteredIncomes.map((i: Income) => ({
              id: i.id,
              title: i.notes || i.source || 'Income',
              amount: i.amount,
              category: i.source,
              date: i.date || i.createdAt,
              notes: i.notes || '',
              type: 'PERSONAL' as const,
            })),
            'User',
            'income'
          )
        }
      />

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  containerDark: {
    backgroundColor: '#101917',
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingBottom: 14,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerContainerDark: {
    backgroundColor: '#101917',
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 48,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.onSurface,
  },
  headerTitleDark: {
    color: '#ffffff',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  aiHeaderBtn: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#D1FAE5',
  },
  aiHeaderBtnDark: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  timeframeBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
    marginBottom: 10,
  },
  timeframePillRow: {
    gap: 8,
  },
  timeframePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  timeframePillDark: {
    backgroundColor: '#131D1A',
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  timeframePillActive: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  timeframePillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
  },
  timeframePillTextDark: {
    color: '#9CA3AF',
  },
  timeframePillTextActive: {
    color: '#ffffff',
  },
  timeframeDropdownBtn: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  timeframeDropdownBtnDark: {
    backgroundColor: '#131D1A',
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  loadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#6B7280',
  },
  loadingTextDark: {
    color: '#9CA3AF',
  },
  heroCard: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    elevation: 8,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  heroBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  heroTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  heroTagText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#D1FAE5',
    letterSpacing: 0.8,
  },
  heroTimeframeBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  heroTimeframeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ffffff',
  },
  heroAmountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginBottom: 4,
  },
  heroCurrency: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
  },
  heroAmount: {
    fontSize: 34,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: -0.5,
  },
  heroSubText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  heroDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginVertical: 16,
  },
  heroStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroStatCol: {
    alignItems: 'center',
    flex: 1,
  },
  heroStatColDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  heroStatLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.7)',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  heroStatValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#ffffff',
  },
  aiTipCard: {
    backgroundColor: '#ECFDF5',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  aiTipCardDark: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  aiTipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  aiTipTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#065F46',
  },
  aiTipTitleDark: {
    color: '#34D399',
  },
  aiTipBody: {
    fontSize: 12,
    color: '#047857',
    lineHeight: 18,
  },
  aiTipBodyDark: {
    color: '#A7F3D0',
  },
  goalCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  goalCardDark: {
    backgroundColor: '#131D1A',
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  goalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  goalTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.onSurface,
  },
  goalTitleDark: {
    color: '#ffffff',
  },
  goalSub: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  goalSubDark: {
    color: '#9CA3AF',
  },
  editGoalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
  },
  editGoalBtnDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  editGoalBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  editGoalBtnTextDark: {
    color: '#34D399',
  },
  goalProgressTrack: {
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  goalProgressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 4,
  },
  goalMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  goalMetaText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B7280',
  },
  healthCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  healthCardDark: {
    backgroundColor: '#131D1A',
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  healthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  healthTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  healthIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  healthTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.onSurface,
  },
  healthTitleDark: {
    color: '#ffffff',
  },
  healthSub: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 1,
  },
  healthSubDark: {
    color: '#9CA3AF',
  },
  retentionBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  retentionBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#065F46',
  },
  retentionTrack: {
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 10,
  },
  retentionFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 4,
  },
  retentionMetricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  retentionMetaText: {
    fontSize: 11,
    color: '#6B7280',
  },
  chartCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  chartCardDark: {
    backgroundColor: '#131D1A',
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.onSurface,
  },
  chartTitleDark: {
    color: '#ffffff',
  },
  chartSub: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  chartSubDark: {
    color: '#9CA3AF',
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    padding: 3,
    borderRadius: 12,
    gap: 2,
  },
  toggleContainerDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  toggleBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  toggleBtnActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  donutContainer: {
    alignItems: 'center',
    paddingVertical: 10,
    gap: 16,
  },
  donutLegend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  legendTextDark: {
    color: '#D1D5DB',
  },
  emptyChartState: {
    paddingVertical: 40,
    alignItems: 'center',
    gap: 8,
  },
  emptyChartTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  emptyChartTitleDark: {
    color: '#9CA3AF',
  },
  sectionMargin: {
    marginBottom: 16,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.onSurface,
    marginBottom: 12,
  },
  sectionHeadingDark: {
    color: '#ffffff',
  },
  highlightGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
  },
  highlightCard: {
    width: '48.2%',
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  highlightCardDark: {
    backgroundColor: '#131D1A',
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  highlightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  highlightIconBg: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  highlightBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  highlightBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#D97706',
  },
  highlightLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 2,
  },
  highlightLabelDark: {
    color: '#9CA3AF',
  },
  highlightValue: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.onSurface,
  },
  highlightValueDark: {
    color: '#ffffff',
  },
  highlightSub: {
    fontSize: 11,
    color: '#10B981',
    fontWeight: '700',
    marginTop: 2,
  },
  sourceCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sourceCardDark: {
    backgroundColor: '#131D1A',
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  sourceCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sourceCardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.onSurface,
  },
  sourceCardTitleDark: {
    color: '#ffffff',
  },
  sourceCardSub: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  sourceCardSubDark: {
    color: '#9CA3AF',
  },
  sourceCountBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  sourceCountText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#065F46',
  },
  emptyText: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    paddingVertical: 20,
  },
  emptyTextDark: {
    color: '#9CA3AF',
  },
  sourceList: {
    gap: 14,
  },
  sourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sourceIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sourceMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  sourceName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  sourceNameDark: {
    color: '#ffffff',
  },
  sourceAmount: {
    fontSize: 14,
    fontWeight: '800',
    color: '#10B981',
  },
  sourceAmountDark: {
    color: '#34D399',
  },
  progressTrack: {
    height: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  sourcePctText: {
    fontSize: 11,
    color: '#6B7280',
  },
  sourcePctTextDark: {
    color: '#9CA3AF',
  },
  streamHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  seeAllLink: {
    fontSize: 12,
    fontWeight: '700',
    color: '#10B981',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
    gap: 8,
  },
  searchBoxDark: {
    backgroundColor: '#131D1A',
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: COLORS.onSurface,
  },
  filterChipsRow: {
    gap: 8,
    marginBottom: 12,
  },
  chipBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  chipBtnDark: {
    backgroundColor: '#131D1A',
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  chipBtnActive: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
  },
  chipTextDark: {
    color: '#9CA3AF',
  },
  chipTextActive: {
    color: '#ffffff',
  },
  emptyFeedBox: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  emptyFeedText: {
    fontSize: 12,
    color: '#6B7280',
  },
  transactionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 12,
  },
  transactionRowDark: {
    backgroundColor: '#131D1A',
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  transactionIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  transactionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  transactionTitleDark: {
    color: '#ffffff',
  },
  transactionSub: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: 15,
    fontWeight: '800',
    color: '#10B981',
  },
  modalContent: {
    paddingVertical: 8,
    gap: 8,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: '#F9FAFB',
  },
  modalItemDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  modalItemActiveLight: {
    backgroundColor: '#D1FAE5',
  },
  modalItemActiveDark: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  modalItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modalItemText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.onSurface,
  },
  modalItemTextDark: {
    color: '#ffffff',
  },
  yearGridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingVertical: 12,
    justifyContent: 'space-between',
  },
  yearChip: {
    width: '30%',
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  yearChipDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  yearChipActive: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  yearChipText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  yearChipTextDark: {
    color: '#ffffff',
  },
  yearChipTextActive: {
    color: '#ffffff',
    fontWeight: '800',
  },
  goalModalBody: {
    paddingVertical: 12,
    gap: 14,
  },
  goalInputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  goalInputLabelDark: {
    color: '#ffffff',
  },
  goalInputField: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  goalInputFieldDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: 'rgba(255, 255, 255, 0.12)',
    color: '#ffffff',
  },
  saveGoalBtn: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  saveGoalBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#ffffff',
  },
});
