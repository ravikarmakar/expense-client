import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { LineChart, BarChart, PieChart } from 'react-native-gifted-charts';
import {
  useExpenses,
  useIncomes,
  useSettlements,
  useCategories,
  type Income,
  type Settlement,
} from '@workspace/api';
import { globalStyles } from '../../../styles/globalStyles';
import { COLORS, CURRENCY_SYMBOL } from '../../../constants/theme';
import { useTheme } from '../../../context/ThemeContext';
import { getCategoryVisuals } from '../../../constants/categories';
import { BottomSheetModal } from '../../../components/BottomSheetModal';
import { DatePickerModal } from '../../../components/DatePickerModal';
import { MonthPickerModal } from '../../../components/MonthPickerModal';
import { hapticFeedback } from '../../../utils/haptics';

const screenWidth = Dimensions.get('window').width;

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

export default function ActivityAnalyticsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();

  const getTodayString = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  type Timeframe =
    | 'today'
    | 'week'
    | 'month'
    | 'year'
    | 'all'
    | 'custom_month'
    | 'custom_year'
    | 'custom_date';
  const [timeframe, setTimeframe] = useState<Timeframe>('month');
  const [refDate, setRefDate] = useState<string>(getTodayString());
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);
  const [isYearPickerOpen, setIsYearPickerOpen] = useState(false);
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');

  const currentYear = new Date().getFullYear();
  const yearOptions = useMemo(() => {
    const list = [];
    for (let y = 2000; y <= 2100; y++) list.push(y);
    return list;
  }, []);

  // ── Data hooks ──
  const { data: expensesData, isLoading: expLoading } = useExpenses({ limit: 100 });
  const { data: incomeData, isLoading: incLoading } = useIncomes();
  const { data: settlementData, isLoading: setLoading } = useSettlements();
  const { data: categoriesData } = useCategories();
  const customCategories = useMemo(() => categoriesData?.custom || [], [categoriesData]);

  const allExpenses = useMemo(
    () => expensesData?.pages?.flatMap((p) => p.expenses) ?? [],
    [expensesData]
  );
  const allIncomes: Income[] = useMemo(() => incomeData?.incomes ?? [], [incomeData]);
  const allSettlements: Settlement[] = useMemo(
    () => settlementData?.settlements ?? [],
    [settlementData]
  );

  const isLoading = expLoading || incLoading || setLoading;

  // ── Dynamic label ──
  const getDynamicTimeframeLabel = () => {
    const todayStr = getTodayString();
    if (refDate && refDate !== todayStr) {
      const parts = refDate.split('-').map(Number);
      if (parts.length >= 1 && !isNaN(parts[0])) {
        if (timeframe === 'custom_year') return `Year ${parts[0]}`;
        if (parts.length === 3 && !isNaN(parts[1]) && !isNaN(parts[2])) {
          const refObj = new Date(parts[0], parts[1] - 1, parts[2]);
          if (timeframe === 'month' || timeframe === 'custom_month')
            return refObj.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
          if (timeframe === 'today' || timeframe === 'custom_date')
            return refObj.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
          if (timeframe === 'year') return `Year ${parts[0]}`;
        }
      }
    }
    if (timeframe === 'today') return 'Today';
    if (timeframe === 'week') return '7 Days';
    if (timeframe === 'month') return 'This Month';
    if (timeframe === 'year') return 'This Year';
    if (timeframe === 'all') return 'All Time';
    if (timeframe === 'custom_year') return `Year ${refDate?.split('-')[0] || currentYear}`;
    return 'This Month';
  };

  // ── Filter by timeframe ──
  const filterByTimeframe = (dateStr: string) => {
    const d = new Date(dateStr);
    const parts = refDate ? refDate.split('-').map(Number) : [];
    const refYear = parts[0] || new Date().getFullYear();
    const refMonth = parts[1] ? parts[1] - 1 : new Date().getMonth();
    const refDay = parts[2] || new Date().getDate();

    if (timeframe === 'all') {
      return true;
    }
    if (timeframe === 'today' || timeframe === 'custom_date') {
      return d.getFullYear() === refYear && d.getMonth() === refMonth && d.getDate() === refDay;
    }
    if (timeframe === 'week') {
      const target = new Date(refYear, refMonth, refDay);
      const ago = new Date(target.getTime() - 7 * 86400000);
      return d >= ago && d <= target;
    }
    if (timeframe === 'month' || timeframe === 'custom_month') {
      return d.getMonth() === refMonth && d.getFullYear() === refYear;
    }
    if (timeframe === 'year' || timeframe === 'custom_year') {
      return d.getFullYear() === refYear;
    }
    return true;
  };

  const filteredExpenses = useMemo(
    () => allExpenses.filter((e) => filterByTimeframe(e.date)),
    [allExpenses, timeframe, refDate]
  );
  const filteredIncomes = useMemo(
    () => allIncomes.filter((i) => filterByTimeframe(i.date || i.createdAt)),
    [allIncomes, timeframe, refDate]
  );
  const filteredSettlements = useMemo(
    () => allSettlements.filter((s) => filterByTimeframe(s.createdAt)),
    [allSettlements, timeframe, refDate]
  );

  // ── Aggregate metrics ──
  const totalSpent = useMemo(
    () => filteredExpenses.reduce((s, e) => s + e.amount, 0),
    [filteredExpenses]
  );
  const totalEarned = useMemo(
    () => filteredIncomes.reduce((s, i) => s + i.amount, 0),
    [filteredIncomes]
  );
  const totalSettled = useMemo(
    () => filteredSettlements.reduce((s, st) => s + st.amount, 0),
    [filteredSettlements]
  );
  const netCashFlow = totalEarned - totalSpent;
  const totalTransactions =
    filteredExpenses.length + filteredIncomes.length + filteredSettlements.length;

  const daysInPeriod = useMemo(() => {
    if (timeframe === 'today' || timeframe === 'custom_date') return 1;
    if (timeframe === 'week') return 7;
    if (timeframe === 'month' || timeframe === 'custom_month') return new Date().getDate();
    if (timeframe === 'year' || timeframe === 'custom_year') return 365;
    if (timeframe === 'all') return 365 * 5;
    return 30;
  }, [timeframe]);

  const avgDailySpend = totalTransactions > 0 ? totalSpent / Math.max(1, daysInPeriod) : 0;
  const avgDailyIncome = totalTransactions > 0 ? totalEarned / Math.max(1, daysInPeriod) : 0;
  const expenseToIncomeRatio = totalEarned > 0 ? (totalSpent / totalEarned) * 100 : 0;
  const savingsRate =
    totalEarned > 0 ? Math.max(0, ((totalEarned - totalSpent) / totalEarned) * 100) : 0;

  // ── Pro Metrics ──
  const personalSpent = useMemo(
    () => filteredExpenses.filter((e) => !e.groupId).reduce((s, e) => s + e.amount, 0),
    [filteredExpenses]
  );
  const groupSharedSpent = useMemo(
    () => filteredExpenses.filter((e) => !!e.groupId).reduce((s, e) => s + e.amount, 0),
    [filteredExpenses]
  );

  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
  const currentDayOfMonth = new Date().getDate();
  const remainingDaysInMonth = Math.max(1, daysInMonth - currentDayOfMonth);

  const projectedMonthlySpendPace =
    currentDayOfMonth > 0 ? (totalSpent / currentDayOfMonth) * daysInMonth : 0;
  const projectedMonthlySavingsPace =
    totalEarned > 0
      ? Math.max(0, (totalEarned / currentDayOfMonth) * daysInMonth - projectedMonthlySpendPace)
      : 0;

  const financialHealthScore = useMemo(() => {
    if (totalEarned === 0 && totalSpent === 0) return 82;
    let score = 85;
    if (totalEarned > 0) {
      const ratio = totalSpent / totalEarned;
      if (ratio <= 0.4) score += 10;
      else if (ratio <= 0.65) score += 5;
      else if (ratio > 1.0) score -= 25;
      else score -= 10;
    }
    return Math.min(99, Math.max(35, score));
  }, [totalSpent, totalEarned]);

  // ── Donut data ──
  const donutData = useMemo(() => {
    const data = [];
    if (totalSpent > 0) data.push({ value: totalSpent, color: '#EF4444', text: 'Expenses' });
    if (totalEarned > 0) data.push({ value: totalEarned, color: '#10B981', text: 'Income' });
    if (totalSettled > 0) data.push({ value: totalSettled, color: '#8B5CF6', text: 'Settlements' });
    if (data.length === 0) data.push({ value: 1, color: '#D1D5DB', text: 'No Data' });
    return data;
  }, [totalSpent, totalEarned, totalSettled]);

  // ── Trend chart data ──
  const trendData = useMemo(() => {
    if (timeframe === 'all') {
      const yearMap: Record<string, number> = {};
      const incMap: Record<string, number> = {};
      const currentY = new Date().getFullYear();
      const startY = currentY - 4;
      const years: string[] = [];
      for (let y = startY; y <= currentY; y++) {
        const yStr = String(y);
        years.push(yStr);
        yearMap[yStr] = 0;
        incMap[yStr] = 0;
      }
      filteredExpenses.forEach((e) => {
        const y = String(new Date(e.date).getFullYear());
        if (yearMap[y] !== undefined) yearMap[y] += e.amount;
      });
      filteredIncomes.forEach((i) => {
        const y = String(new Date(i.date || i.createdAt).getFullYear());
        if (incMap[y] !== undefined) incMap[y] += i.amount;
      });
      return {
        expenseData: years.map((y) => ({ label: y, value: yearMap[y] })),
        incomeData: years.map((y) => ({ label: y, value: incMap[y] })),
      };
    } else if (timeframe === 'year' || timeframe === 'custom_year') {
      const months = [
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
      const expMap: Record<string, number> = {};
      const incMap: Record<string, number> = {};
      months.forEach((m) => {
        expMap[m] = 0;
        incMap[m] = 0;
      });
      filteredExpenses.forEach((e) => {
        const k = months[new Date(e.date).getMonth()];
        expMap[k] += e.amount;
      });
      filteredIncomes.forEach((i) => {
        const k = months[new Date(i.date || i.createdAt).getMonth()];
        incMap[k] += i.amount;
      });
      return {
        expenseData: months.map((m) => ({ label: m, value: expMap[m] })),
        incomeData: months.map((m) => ({ label: m, value: incMap[m] })),
      };
    } else {
      const dayLabels: string[] = [];
      const expMap: Record<string, number> = {};
      const incMap: Record<string, number> = {};
      const numDays = timeframe === 'week' ? 7 : 7;
      const now = new Date();
      for (let i = numDays - 1; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 86400000);
        const label = d.toLocaleDateString('en-IN', { weekday: 'short' });
        dayLabels.push(label);
        expMap[label] = 0;
        incMap[label] = 0;
      }
      filteredExpenses.forEach((e) => {
        const k = new Date(e.date).toLocaleDateString('en-IN', { weekday: 'short' });
        if (expMap[k] !== undefined) expMap[k] += e.amount;
      });
      filteredIncomes.forEach((i) => {
        const k = new Date(i.date || i.createdAt).toLocaleDateString('en-IN', { weekday: 'short' });
        if (incMap[k] !== undefined) incMap[k] += i.amount;
      });
      return {
        expenseData: dayLabels.map((l) => ({ label: l, value: expMap[l] })),
        incomeData: dayLabels.map((l) => ({ label: l, value: incMap[l] })),
      };
    }
  }, [filteredExpenses, filteredIncomes, timeframe]);

  const maxChartVal = useMemo(() => {
    const allVals = [
      ...trendData.expenseData.map((d) => d.value),
      ...trendData.incomeData.map((d) => d.value),
    ];
    const max = Math.max(...allVals, 0);
    return max > 0 ? max * 1.2 : 100;
  }, [trendData]);

  const groupedBarData = useMemo(() => {
    const list: Array<{
      value: number;
      label?: string;
      spacing?: number;
      labelWidth?: number;
      frontColor: string;
    }> = [];
    trendData.expenseData.forEach((exp, idx) => {
      const inc = trendData.incomeData[idx];
      list.push({
        value: exp.value,
        label: exp.label,
        spacing: 2,
        labelWidth: 30,
        frontColor: '#EF4444',
      });
      list.push({
        value: inc ? inc.value : 0,
        frontColor: '#10B981',
      });
    });
    return list;
  }, [trendData]);

  // ── Day of Week Heatmap Chart Data ──
  const dayOfWeekData = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const expMap: Record<string, number> = {
      Mon: 0,
      Tue: 0,
      Wed: 0,
      Thu: 0,
      Fri: 0,
      Sat: 0,
      Sun: 0,
    };
    filteredExpenses.forEach((e) => {
      const day = new Date(e.date).toLocaleDateString('en-IN', { weekday: 'short' });
      if (expMap[day] !== undefined) expMap[day] += e.amount;
    });

    const maxVal = Math.max(...Object.values(expMap), 0);

    return days.map((d) => {
      const val = expMap[d];
      const isPeak = val === maxVal && val > 0;
      return {
        label: d,
        value: val,
        frontColor: isPeak
          ? '#EF4444'
          : val > 0
            ? '#10B981'
            : isDark
              ? 'rgba(255,255,255,0.1)'
              : '#E5E7EB',
      };
    });
  }, [filteredExpenses, isDark]);

  const peakDayName = useMemo(() => {
    let top = 'None';
    let max = 0;
    dayOfWeekData.forEach((d) => {
      if (d.value > max) {
        max = d.value;
        top = d.label;
      }
    });
    return top;
  }, [dayOfWeekData]);

  // ── Category breakdown ──
  const categoryBreakdown = useMemo(() => {
    if (totalSpent === 0) return [];
    const map: Record<string, number> = {};
    filteredExpenses.forEach((e) => {
      const c = e.category || 'Other';
      map[c] = (map[c] || 0) + e.amount;
    });
    return Object.entries(map)
      .map(([category, amount]) => ({ category, amount, pct: (amount / totalSpent) * 100 }))
      .sort((a, b) => b.amount - a.amount);
  }, [filteredExpenses, totalSpent]);

  // ── Insight cards data ──
  const highestSpendDay = useMemo(() => {
    if (filteredExpenses.length === 0) return null;
    const dayMap: Record<string, number> = {};
    filteredExpenses.forEach((e) => {
      const day = new Date(e.date).toLocaleDateString('en-IN', { weekday: 'long' });
      dayMap[day] = (dayMap[day] || 0) + e.amount;
    });
    let top = '';
    let max = 0;
    Object.entries(dayMap).forEach(([d, a]) => {
      if (a > max) {
        max = a;
        top = d;
      }
    });
    return top ? { day: top, amount: max } : null;
  }, [filteredExpenses]);

  const highestEarnDay = useMemo(() => {
    if (filteredIncomes.length === 0) return null;
    const dayMap: Record<string, number> = {};
    filteredIncomes.forEach((i) => {
      const day = new Date(i.date || i.createdAt).toLocaleDateString('en-IN', { weekday: 'long' });
      dayMap[day] = (dayMap[day] || 0) + i.amount;
    });
    let top = '';
    let max = 0;
    Object.entries(dayMap).forEach(([d, a]) => {
      if (a > max) {
        max = a;
        top = d;
      }
    });
    return top ? { day: top, amount: max } : null;
  }, [filteredIncomes]);

  const biggestExpense = useMemo(() => {
    if (filteredExpenses.length === 0) return null;
    return [...filteredExpenses].sort((a, b) => b.amount - a.amount)[0];
  }, [filteredExpenses]);

  const biggestIncome = useMemo(() => {
    if (filteredIncomes.length === 0) return null;
    return [...filteredIncomes].sort((a, b) => b.amount - a.amount)[0];
  }, [filteredIncomes]);

  const topCategory = categoryBreakdown[0] || null;

  const chartWidth = screenWidth - 72;

  const handleSelectTimeframeOption = (val: string) => {
    hapticFeedback.selection();
    if (val === 'custom_date') {
      setIsDatePickerOpen(true);
    } else if (val === 'custom_month') {
      setIsMonthPickerOpen(true);
    } else if (val === 'custom_year') {
      setIsYearPickerOpen(true);
    } else {
      setTimeframe(val as Timeframe);
      setRefDate(getTodayString());
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
              Activity Insights
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.aiHeaderBtn, isDark && styles.aiHeaderBtnDark]}
            onPress={() => hapticFeedback.selection()}
            activeOpacity={0.7}
          >
            <Ionicons name="sparkles" size={18} color={isDark ? '#34D399' : '#059669'} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[globalStyles.scrollContent, { paddingTop: 4, paddingBottom: 60 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Timeframe Pill Bar ── */}
        <View style={styles.timeframeBarContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.timeframePillRow}
          >
            {TIMEFRAME_OPTIONS.map((opt) => {
              const isSelected =
                opt.value === timeframe ||
                (opt.value === 'custom_date' && timeframe === 'custom_date') ||
                (opt.value === 'custom_month' && timeframe === 'custom_month') ||
                (opt.value === 'custom_year' && timeframe === 'custom_year');
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
                    {opt.value === timeframe &&
                    (timeframe === 'custom_date' ||
                      timeframe === 'custom_month' ||
                      timeframe === 'custom_year')
                      ? getDynamicTimeframeLabel()
                      : opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#059669" />
            <Text style={[styles.loadingText, isDark && styles.loadingTextDark]}>
              Crunching your financial data...
            </Text>
          </View>
        ) : (
          <>
            {/* ── 1. Hero Financial Overview Gradient Card ── */}
            <LinearGradient
              colors={
                isDark ? ['#05251C', '#0B382C', '#044E39'] : ['#005237', '#006948', '#059669']
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroCard}
            >
              <View style={styles.heroBadgeRow}>
                <View style={styles.heroTag}>
                  <Ionicons name="analytics" size={13} color={isDark ? '#10B981' : '#85f8c4'} />
                  <Text style={[styles.heroTagText, !isDark && { color: '#85f8c4' }]}>
                    FINANCIAL OVERVIEW
                  </Text>
                </View>
                <View style={styles.heroTimeframeBadge}>
                  <Text style={styles.heroTimeframeText}>{getDynamicTimeframeLabel()}</Text>
                </View>
              </View>

              <View style={styles.heroAmountRow}>
                <Text style={styles.heroCurrency}>{CURRENCY_SYMBOL}</Text>
                <Text style={styles.heroAmount}>
                  {Math.abs(netCashFlow).toLocaleString('en-IN', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </Text>
              </View>
              <Text style={styles.heroSubText}>
                {netCashFlow >= 0 ? '↑ Net Positive Cash Flow' : '↓ Net Negative Cash Flow'} •{' '}
                {totalTransactions} transactions
              </Text>

              <View style={styles.heroDivider} />

              <View style={styles.heroStatsRow}>
                <View style={styles.heroStatCol}>
                  <Text style={styles.heroStatLabel}>EARNED</Text>
                  <Text style={[styles.heroStatValue, { color: isDark ? '#10B981' : '#85f8c4' }]}>
                    +{CURRENCY_SYMBOL}
                    {totalEarned.toFixed(0)}
                  </Text>
                </View>
                <View style={styles.heroStatColDivider} />
                <View style={styles.heroStatCol}>
                  <Text style={styles.heroStatLabel}>SPENT</Text>
                  <Text style={[styles.heroStatValue, { color: isDark ? '#EF4444' : '#ffb4ab' }]}>
                    -{CURRENCY_SYMBOL}
                    {totalSpent.toFixed(0)}
                  </Text>
                </View>
                <View style={styles.heroStatColDivider} />
                <View style={styles.heroStatCol}>
                  <Text style={styles.heroStatLabel}>SETTLED</Text>
                  <Text style={[styles.heroStatValue, { color: '#C4B5FD' }]}>
                    {CURRENCY_SYMBOL}
                    {totalSettled.toFixed(0)}
                  </Text>
                </View>
              </View>
            </LinearGradient>

            {/* ── 2. AI Financial Health & Risk Index (PRO) ── */}
            <View style={[styles.proCard, isDark && styles.proCardDark]}>
              <View style={styles.proCardHeader}>
                <View style={styles.proCardHeaderLeft}>
                  <View style={styles.proIconBg}>
                    <Ionicons name="shield-checkmark" size={16} color="#059669" />
                  </View>
                  <View>
                    <Text style={[styles.proCardTitle, isDark && styles.proCardTitleDark]}>
                      Financial Health Index
                    </Text>
                    <Text style={[styles.proCardSub, isDark && styles.proCardSubDark]}>
                      AI Cash Flow & Stability Audit
                    </Text>
                  </View>
                </View>
                <View style={styles.proBadge}>
                  <Ionicons name="ribbon" size={12} color="#047857" />
                  <Text style={styles.proBadgeText}>PRO</Text>
                </View>
              </View>

              <View style={styles.proHealthScoreRow}>
                <View style={styles.healthScoreBig}>
                  <Text style={styles.healthScoreNum}>{financialHealthScore}</Text>
                  <Text style={styles.healthScoreMax}>/100</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.healthScoreStatus,
                      {
                        color:
                          financialHealthScore >= 80
                            ? '#059669'
                            : financialHealthScore >= 60
                              ? '#D97706'
                              : '#DC2626',
                      },
                    ]}
                  >
                    {financialHealthScore >= 80
                      ? '✓ Excellent Financial Balance'
                      : financialHealthScore >= 60
                        ? '⚠ Moderate Variance'
                        : '⚡ High Spending Risk'}
                  </Text>
                  <View style={styles.healthProgressTrack}>
                    <View
                      style={[
                        styles.healthProgressFill,
                        {
                          width: `${financialHealthScore}%`,
                          backgroundColor:
                            financialHealthScore >= 80
                              ? '#10B981'
                              : financialHealthScore >= 60
                                ? '#F59E0B'
                                : '#EF4444',
                        },
                      ]}
                    />
                  </View>
                  <Text style={[styles.healthAdviceText, isDark && { color: '#9CA3AF' }]}>
                    {savingsRate > 25
                      ? 'Your cash flow is strong. Consider moving surplus funds to savings.'
                      : 'High expense velocity detected. Keep eye on recurring daily bills.'}
                  </Text>
                </View>
              </View>
            </View>

            {/* ── 2B. Advanced Day-of-Week Spending Pattern Chart ── */}
            <View style={[styles.chartCard, isDark && styles.chartCardDark]}>
              <View style={styles.chartHeader}>
                <View>
                  <Text style={[styles.chartTitle, isDark && styles.chartTitleDark]}>
                    Day-of-Week Spending Pattern
                  </Text>
                  <Text style={[styles.chartSub, isDark && styles.chartSubDark]}>
                    Highest spend velocity on{' '}
                    <Text style={{ fontWeight: '900', color: '#EF4444' }}>{peakDayName}s</Text>
                  </Text>
                </View>
                <View style={[styles.savingsBadge, { backgroundColor: '#FEE2E2' }]}>
                  <Text style={[styles.savingsBadgeText, { color: '#991B1B' }]}>Velocity</Text>
                </View>
              </View>

              <View style={{ paddingTop: 12, alignItems: 'center' }}>
                <BarChart
                  data={dayOfWeekData}
                  barWidth={22}
                  spacing={16}
                  initialSpacing={12}
                  height={150}
                  roundedTop
                  noOfSections={3}
                  yAxisThickness={0}
                  xAxisThickness={1}
                  xAxisColor={isDark ? 'rgba(255,255,255,0.1)' : '#E5E7EB'}
                  rulesColor={isDark ? 'rgba(255,255,255,0.06)' : '#F3F4F6'}
                  rulesType="dashed"
                  yAxisTextStyle={{ color: isDark ? '#9CA3AF' : '#6B7280', fontSize: 10 }}
                  xAxisLabelTextStyle={{
                    color: isDark ? '#9CA3AF' : '#6B7280',
                    fontSize: 11,
                    fontWeight: '800',
                  }}
                />
              </View>
            </View>

            {/* ── 3. Cash Flow Balance Bar ── */}
            {(totalSpent > 0 || totalEarned > 0) && (
              <View style={[styles.cashFlowCard, isDark && styles.cashFlowCardDark]}>
                <View style={styles.cashFlowHeader}>
                  <Text style={[styles.cashFlowTitle, isDark && styles.cashFlowTitleDark]}>
                    Cash Flow Balance
                  </Text>
                  <View
                    style={[
                      styles.savingsBadge,
                      {
                        backgroundColor:
                          savingsRate >= 50 ? '#D1FAE5' : savingsRate > 0 ? '#FEF3C7' : '#FEE2E2',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.savingsBadgeText,
                        {
                          color:
                            savingsRate >= 50 ? '#065F46' : savingsRate > 0 ? '#92400E' : '#991B1B',
                        },
                      ]}
                    >
                      {savingsRate.toFixed(0)}% Saved
                    </Text>
                  </View>
                </View>
                <View style={styles.cashFlowBar}>
                  <View
                    style={[
                      styles.cashFlowFillIncome,
                      {
                        width: `${totalEarned > 0 ? Math.min(100, (totalEarned / (totalEarned + totalSpent)) * 100) : 50}%`,
                      },
                    ]}
                  />
                  <View
                    style={[
                      styles.cashFlowFillExpense,
                      {
                        width: `${totalSpent > 0 ? Math.min(100, (totalSpent / (totalEarned + totalSpent)) * 100) : 50}%`,
                      },
                    ]}
                  />
                </View>
                <View style={styles.cashFlowLegendRow}>
                  <View style={styles.cashFlowLegendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
                    <Text style={[styles.cashFlowLegendText, isDark && { color: '#9CA3AF' }]}>
                      Income ({CURRENCY_SYMBOL}
                      {totalEarned.toLocaleString('en-IN')})
                    </Text>
                  </View>
                  <View style={styles.cashFlowLegendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
                    <Text style={[styles.cashFlowLegendText, isDark && { color: '#9CA3AF' }]}>
                      Expenses ({CURRENCY_SYMBOL}
                      {totalSpent.toLocaleString('en-IN')})
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* ── 4. Personal vs Group Expense Split (PRO) ── */}
            {totalSpent > 0 && (
              <View style={[styles.proCard, isDark && styles.proCardDark]}>
                <View style={styles.proCardHeader}>
                  <View style={styles.proCardHeaderLeft}>
                    <View style={[styles.proIconBg, { backgroundColor: '#E0E7FF' }]}>
                      <Ionicons name="pie-chart" size={16} color="#4F46E5" />
                    </View>
                    <View>
                      <Text style={[styles.proCardTitle, isDark && styles.proCardTitleDark]}>
                        Personal vs Group Split
                      </Text>
                      <Text style={[styles.proCardSub, isDark && styles.proCardSubDark]}>
                        Shared vs Solo expenditure
                      </Text>
                    </View>
                  </View>
                  <View style={styles.proBadge}>
                    <Ionicons name="ribbon" size={12} color="#047857" />
                    <Text style={styles.proBadgeText}>PRO</Text>
                  </View>
                </View>

                <View style={styles.splitRatioBar}>
                  <View
                    style={[
                      styles.splitBarPersonal,
                      {
                        width: `${personalSpent > 0 ? Math.min(100, (personalSpent / totalSpent) * 100) : 50}%`,
                      },
                    ]}
                  />
                  <View
                    style={[
                      styles.splitBarGroup,
                      {
                        width: `${groupSharedSpent > 0 ? Math.min(100, (groupSharedSpent / totalSpent) * 100) : 50}%`,
                      },
                    ]}
                  />
                </View>

                <View style={styles.splitRatioLegend}>
                  <View style={styles.splitLegendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#059669' }]} />
                    <Text style={[styles.splitLegendLabel, isDark && { color: '#D1D5DB' }]}>
                      Solo: {CURRENCY_SYMBOL}
                      {personalSpent.toLocaleString('en-IN')} (
                      {totalSpent > 0 ? ((personalSpent / totalSpent) * 100).toFixed(0) : 0}%)
                    </Text>
                  </View>
                  <View style={styles.splitLegendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#6366F1' }]} />
                    <Text style={[styles.splitLegendLabel, isDark && { color: '#D1D5DB' }]}>
                      Group: {CURRENCY_SYMBOL}
                      {groupSharedSpent.toLocaleString('en-IN')} (
                      {totalSpent > 0 ? ((groupSharedSpent / totalSpent) * 100).toFixed(0) : 0}%)
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* ── 5. Monthly Forecast & Pace (PRO) ── */}
            <View style={[styles.proCard, isDark && styles.proCardDark]}>
              <View style={styles.proCardHeader}>
                <View style={styles.proCardHeaderLeft}>
                  <View style={[styles.proIconBg, { backgroundColor: '#FEF3C7' }]}>
                    <Ionicons name="trending-up" size={16} color="#D97706" />
                  </View>
                  <View>
                    <Text style={[styles.proCardTitle, isDark && styles.proCardTitleDark]}>
                      Monthly Forecast & Pace
                    </Text>
                    <Text style={[styles.proCardSub, isDark && styles.proCardSubDark]}>
                      Predictive month-end projections
                    </Text>
                  </View>
                </View>
                <View style={styles.proBadge}>
                  <Ionicons name="ribbon" size={12} color="#047857" />
                  <Text style={styles.proBadgeText}>PRO</Text>
                </View>
              </View>

              <View style={styles.forecastGrid}>
                <View style={[styles.forecastCol, isDark && styles.forecastColDark]}>
                  <Text style={styles.forecastColLabel}>PROJECTED SPEND</Text>
                  <Text style={[styles.forecastColValue, { color: '#EF4444' }]}>
                    {CURRENCY_SYMBOL}
                    {projectedMonthlySpendPace.toFixed(0)}
                  </Text>
                  <Text style={styles.forecastColSub}>{remainingDaysInMonth} days remaining</Text>
                </View>
                <View style={[styles.forecastCol, isDark && styles.forecastColDark]}>
                  <Text style={styles.forecastColLabel}>PROJECTED SAVINGS</Text>
                  <Text style={[styles.forecastColValue, { color: '#10B981' }]}>
                    +{CURRENCY_SYMBOL}
                    {projectedMonthlySavingsPace.toFixed(0)}
                  </Text>
                  <Text style={styles.forecastColSub}>estimated balance</Text>
                </View>
              </View>
            </View>

            {/* ── Activity Composition Donut ── */}
            <View style={[styles.chartCard, isDark && styles.chartCardDark]}>
              <View style={styles.chartHeader}>
                <View>
                  <Text style={[styles.chartTitle, isDark && styles.chartTitleDark]}>
                    Activity Composition
                  </Text>
                  <Text style={[styles.chartSub, isDark && styles.chartSubDark]}>
                    Breakdown by transaction type
                  </Text>
                </View>
              </View>
              <View style={styles.donutContainer}>
                <PieChart
                  data={donutData}
                  donut
                  radius={74}
                  innerRadius={52}
                  innerCircleColor={isDark ? '#131620' : '#ffffff'}
                  centerLabelComponent={() => (
                    <View style={{ alignItems: 'center' }}>
                      <Text style={{ fontSize: 10, fontWeight: '800', color: '#6B7280' }}>
                        TOTAL
                      </Text>
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: '900',
                          color: isDark ? '#34D399' : '#059669',
                        }}
                      >
                        {totalTransactions}
                      </Text>
                      <Text style={{ fontSize: 9, fontWeight: '600', color: '#9CA3AF' }}>
                        transactions
                      </Text>
                    </View>
                  )}
                />
                <View style={styles.donutLegend}>
                  {[
                    {
                      label: 'Expenses',
                      count: filteredExpenses.length,
                      total: totalSpent,
                      color: '#EF4444',
                    },
                    {
                      label: 'Income',
                      count: filteredIncomes.length,
                      total: totalEarned,
                      color: '#10B981',
                    },
                    {
                      label: 'Settlements',
                      count: filteredSettlements.length,
                      total: totalSettled,
                      color: '#8B5CF6',
                    },
                  ].map((item) => (
                    <View key={item.label} style={styles.donutLegendRow}>
                      <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                      <Text style={[styles.donutLegendText, isDark && { color: '#D1D5DB' }]}>
                        {item.label}: {item.count} ({CURRENCY_SYMBOL}
                        {item.total.toLocaleString('en-IN')})
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>

            {/* ── Spending vs Income Trend Chart ── */}
            <View style={[styles.chartCard, isDark && styles.chartCardDark]}>
              <View style={styles.chartHeader}>
                <View>
                  <Text style={[styles.chartTitle, isDark && styles.chartTitleDark]}>
                    Spending vs Income Trend
                  </Text>
                  <Text style={[styles.chartSub, isDark && styles.chartSubDark]}>
                    Dual-line comparative overview
                  </Text>
                </View>
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
                      color={chartType === 'line' ? '#059669' : isDark ? '#9CA3AF' : COLORS.outline}
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
                      color={chartType === 'bar' ? '#059669' : isDark ? '#9CA3AF' : COLORS.outline}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {totalTransactions === 0 ? (
                <View style={styles.emptyChartState}>
                  <Ionicons
                    name="bar-chart-outline"
                    size={38}
                    color={isDark ? '#4B5563' : '#9CA3AF'}
                  />
                  <Text style={[styles.emptyChartTitle, isDark && { color: '#9CA3AF' }]}>
                    No activity data for {getDynamicTimeframeLabel()}
                  </Text>
                </View>
              ) : chartType === 'bar' ? (
                <View style={{ paddingTop: 10, alignItems: 'center' }}>
                  <BarChart
                    data={groupedBarData}
                    barWidth={12}
                    spacing={20}
                    initialSpacing={12}
                    height={200}
                    roundedTop
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
                    data={trendData.expenseData}
                    data2={trendData.incomeData}
                    width={chartWidth}
                    height={200}
                    areaChart
                    thickness={3}
                    color1="#EF4444"
                    color2="#10B981"
                    startFillColor1="#EF4444"
                    endFillColor1="#EF4444"
                    startOpacity1={0.25}
                    endOpacity1={0.02}
                    startFillColor2="#10B981"
                    endFillColor2="#10B981"
                    startOpacity2={0.25}
                    endOpacity2={0.02}
                    curved
                    noOfSections={4}
                    yAxisThickness={0}
                    xAxisThickness={1}
                    xAxisColor={isDark ? 'rgba(255,255,255,0.1)' : '#E5E7EB'}
                    rulesColor={isDark ? 'rgba(255,255,255,0.06)' : '#F3F4F6'}
                    rulesType="dashed"
                    spacing={(chartWidth - 20) / Math.max(1, trendData.expenseData.length - 1)}
                    initialSpacing={10}
                    dataPointsColor1="#EF4444"
                    dataPointsColor2="#10B981"
                    dataPointsRadius={4}
                    xAxisLabelTextStyle={{
                      color: isDark ? '#9CA3AF' : '#6B7280',
                      fontSize: 10,
                      fontWeight: '700',
                    }}
                    yAxisTextStyle={{ color: isDark ? '#9CA3AF' : '#6B7280', fontSize: 10 }}
                    maxValue={maxChartVal}
                  />
                  <View style={styles.trendLegendRow}>
                    <View style={styles.trendLegendItem}>
                      <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
                      <Text style={[styles.trendLegendText, isDark && { color: '#9CA3AF' }]}>
                        Expenses
                      </Text>
                    </View>
                    <View style={styles.trendLegendItem}>
                      <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
                      <Text style={[styles.trendLegendText, isDark && { color: '#9CA3AF' }]}>
                        Income
                      </Text>
                    </View>
                  </View>
                </View>
              )}
            </View>

            {/* ── Quick Insights Grid ── */}
            <View style={styles.sectionMargin}>
              <View style={styles.insightGrid}>
                {/* Expense-to-Income Ratio */}
                <View style={[styles.insightCard, isDark && styles.insightCardDark]}>
                  <View style={styles.insightHeader}>
                    <View style={[styles.insightIconBg, { backgroundColor: '#D1FAE5' }]}>
                      <Ionicons name="git-compare-outline" size={16} color="#059669" />
                    </View>
                    <View
                      style={[
                        styles.insightBadge,
                        { backgroundColor: expenseToIncomeRatio <= 70 ? '#D1FAE5' : '#FEE2E2' },
                      ]}
                    >
                      <Text
                        style={[
                          styles.insightBadgeText,
                          { color: expenseToIncomeRatio <= 70 ? '#065F46' : '#991B1B' },
                        ]}
                      >
                        {expenseToIncomeRatio.toFixed(0)}%
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.insightLabel, isDark && styles.insightLabelDark]}>
                    Expense/Income Ratio
                  </Text>
                  <Text
                    style={[styles.insightValue, isDark && styles.insightValueDark]}
                    numberOfLines={1}
                  >
                    {expenseToIncomeRatio <= 70
                      ? 'Healthy'
                      : expenseToIncomeRatio <= 100
                        ? 'Caution'
                        : 'Overspending'}
                  </Text>
                  <Text style={[styles.insightSub, { color: '#059669' }]}>
                    {savingsRate.toFixed(0)}% savings rate
                  </Text>
                </View>

                {/* Avg Daily Spend */}
                <View style={[styles.insightCard, isDark && styles.insightCardDark]}>
                  <View style={styles.insightHeader}>
                    <View style={[styles.insightIconBg, { backgroundColor: '#FEE2E2' }]}>
                      <Ionicons name="flame-outline" size={16} color="#EF4444" />
                    </View>
                  </View>
                  <Text style={[styles.insightLabel, isDark && styles.insightLabelDark]}>
                    Avg Daily Spend
                  </Text>
                  <Text
                    style={[styles.insightValue, isDark && styles.insightValueDark]}
                    numberOfLines={1}
                  >
                    {CURRENCY_SYMBOL}
                    {avgDailySpend.toFixed(0)}
                  </Text>
                  <Text style={[styles.insightSub, { color: '#EF4444' }]}>per day</Text>
                </View>

                {/* Avg Daily Income */}
                <View style={[styles.insightCard, isDark && styles.insightCardDark]}>
                  <View style={styles.insightHeader}>
                    <View style={[styles.insightIconBg, { backgroundColor: '#D1FAE5' }]}>
                      <Ionicons name="pulse-outline" size={16} color="#10B981" />
                    </View>
                  </View>
                  <Text style={[styles.insightLabel, isDark && styles.insightLabelDark]}>
                    Avg Daily Income
                  </Text>
                  <Text
                    style={[styles.insightValue, isDark && styles.insightValueDark]}
                    numberOfLines={1}
                  >
                    {CURRENCY_SYMBOL}
                    {avgDailyIncome.toFixed(0)}
                  </Text>
                  <Text style={[styles.insightSub, { color: '#10B981' }]}>per day</Text>
                </View>

                {/* Highest Spend Day */}
                {highestSpendDay && (
                  <View style={[styles.insightCard, isDark && styles.insightCardDark]}>
                    <View style={styles.insightHeader}>
                      <View style={[styles.insightIconBg, { backgroundColor: '#FEF3C7' }]}>
                        <Ionicons name="calendar-sharp" size={16} color="#D97706" />
                      </View>
                    </View>
                    <Text style={[styles.insightLabel, isDark && styles.insightLabelDark]}>
                      Top Spend Day
                    </Text>
                    <Text
                      style={[styles.insightValue, isDark && styles.insightValueDark]}
                      numberOfLines={1}
                    >
                      {highestSpendDay.day}s
                    </Text>
                    <Text style={[styles.insightSub, { color: '#D97706' }]}>
                      {CURRENCY_SYMBOL}
                      {highestSpendDay.amount.toLocaleString('en-IN')}
                    </Text>
                  </View>
                )}

                {/* Highest Earn Day */}
                {highestEarnDay && (
                  <View style={[styles.insightCard, isDark && styles.insightCardDark]}>
                    <View style={styles.insightHeader}>
                      <View style={[styles.insightIconBg, { backgroundColor: '#D1FAE5' }]}>
                        <Ionicons name="calendar-outline" size={16} color="#10B981" />
                      </View>
                    </View>
                    <Text style={[styles.insightLabel, isDark && styles.insightLabelDark]}>
                      Top Earn Day
                    </Text>
                    <Text
                      style={[styles.insightValue, isDark && styles.insightValueDark]}
                      numberOfLines={1}
                    >
                      {highestEarnDay.day}s
                    </Text>
                    <Text style={[styles.insightSub, { color: '#10B981' }]}>
                      {CURRENCY_SYMBOL}
                      {highestEarnDay.amount.toLocaleString('en-IN')}
                    </Text>
                  </View>
                )}

                {/* Biggest Single Expense */}
                {biggestExpense && (
                  <View style={[styles.insightCard, isDark && styles.insightCardDark]}>
                    <View style={styles.insightHeader}>
                      <View style={[styles.insightIconBg, { backgroundColor: '#FEE2E2' }]}>
                        <Ionicons name="arrow-up-circle-outline" size={16} color="#EF4444" />
                      </View>
                      <View style={[styles.insightBadge, { backgroundColor: '#FEE2E2' }]}>
                        <Text style={[styles.insightBadgeText, { color: '#991B1B' }]}>Peak</Text>
                      </View>
                    </View>
                    <Text style={[styles.insightLabel, isDark && styles.insightLabelDark]}>
                      Biggest Expense
                    </Text>
                    <Text
                      style={[styles.insightValue, isDark && styles.insightValueDark]}
                      numberOfLines={1}
                    >
                      {biggestExpense.title}
                    </Text>
                    <Text style={[styles.insightSub, { color: '#EF4444' }]}>
                      {CURRENCY_SYMBOL}
                      {biggestExpense.amount.toLocaleString('en-IN')}
                    </Text>
                  </View>
                )}

                {/* Biggest Single Income */}
                {biggestIncome && (
                  <View style={[styles.insightCard, isDark && styles.insightCardDark]}>
                    <View style={styles.insightHeader}>
                      <View style={[styles.insightIconBg, { backgroundColor: '#D1FAE5' }]}>
                        <Ionicons name="arrow-down-circle-outline" size={16} color="#10B981" />
                      </View>
                      <View style={[styles.insightBadge, { backgroundColor: '#D1FAE5' }]}>
                        <Text style={[styles.insightBadgeText, { color: '#065F46' }]}>Peak</Text>
                      </View>
                    </View>
                    <Text style={[styles.insightLabel, isDark && styles.insightLabelDark]}>
                      Biggest Income
                    </Text>
                    <Text
                      style={[styles.insightValue, isDark && styles.insightValueDark]}
                      numberOfLines={1}
                    >
                      {biggestIncome.notes || biggestIncome.source}
                    </Text>
                    <Text style={[styles.insightSub, { color: '#10B981' }]}>
                      {CURRENCY_SYMBOL}
                      {biggestIncome.amount.toLocaleString('en-IN')}
                    </Text>
                  </View>
                )}

                {/* Most Active Category */}
                {topCategory && (
                  <View style={[styles.insightCard, isDark && styles.insightCardDark]}>
                    <View style={styles.insightHeader}>
                      <View style={[styles.insightIconBg, { backgroundColor: '#DBEAFE' }]}>
                        <Ionicons name="layers-outline" size={16} color="#3B82F6" />
                      </View>
                      <View style={[styles.insightBadge, { backgroundColor: '#DBEAFE' }]}>
                        <Text style={[styles.insightBadgeText, { color: '#1D4ED8' }]}>
                          {topCategory.pct.toFixed(0)}%
                        </Text>
                      </View>
                    </View>
                    <Text style={[styles.insightLabel, isDark && styles.insightLabelDark]}>
                      Top Category
                    </Text>
                    <Text
                      style={[styles.insightValue, isDark && styles.insightValueDark]}
                      numberOfLines={1}
                    >
                      {topCategory.category}
                    </Text>
                    <Text style={[styles.insightSub, { color: '#3B82F6' }]}>
                      {CURRENCY_SYMBOL}
                      {topCategory.amount.toLocaleString('en-IN')}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* ── Top Spending Categories ── */}
            {categoryBreakdown.length > 0 && (
              <View style={[styles.categoryCard, isDark && styles.categoryCardDark]}>
                <View style={styles.categoryHeader}>
                  <View>
                    <Text style={[styles.categoryTitle, isDark && styles.categoryTitleDark]}>
                      Spending by Category
                    </Text>
                    <Text style={[styles.categorySub, isDark && styles.categorySubDark]}>
                      Ranked expense distribution
                    </Text>
                  </View>
                  <View style={styles.categoryCountBadge}>
                    <Text style={styles.categoryCountText}>
                      {categoryBreakdown.length} Categories
                    </Text>
                  </View>
                </View>
                {categoryBreakdown.map((item) => {
                  const vis = getCategoryVisuals(item.category, customCategories);
                  return (
                    <View key={item.category} style={styles.categoryRow}>
                      <View style={[styles.categoryIconCircle, { backgroundColor: vis.bg }]}>
                        {vis.lib === 'Ionicons' ? (
                          <Ionicons
                            name={(vis.icon || 'pricetag-outline') as never}
                            size={16}
                            color={vis.color}
                          />
                        ) : (
                          <MaterialIcons
                            name={(vis.icon || 'label') as never}
                            size={16}
                            color={vis.color}
                          />
                        )}
                      </View>
                      <View style={{ flex: 1 }}>
                        <View style={styles.categoryMetaRow}>
                          <Text style={[styles.categoryName, isDark && styles.categoryNameDark]}>
                            {item.category}
                          </Text>
                          <Text
                            style={[styles.categoryAmount, isDark && styles.categoryAmountDark]}
                          >
                            {CURRENCY_SYMBOL}
                            {item.amount.toLocaleString('en-IN')}
                          </Text>
                        </View>
                        <View style={styles.categoryProgressTrack}>
                          <View
                            style={[
                              styles.categoryProgressFill,
                              {
                                width: `${Math.min(100, Math.max(5, item.pct))}%`,
                                backgroundColor: vis.color,
                              },
                            ]}
                          />
                        </View>
                        <Text style={[styles.categoryPctText, isDark && { color: '#9CA3AF' }]}>
                          {item.pct.toFixed(1)}% of total spending
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* ── Modals ── */}
      <DatePickerModal
        visible={isDatePickerOpen}
        onClose={() => setIsDatePickerOpen(false)}
        selectedDate={refDate}
        onSelectDate={(d: string) => {
          setRefDate(d);
          setTimeframe('custom_date');
        }}
      />
      <MonthPickerModal
        visible={isMonthPickerOpen}
        onClose={() => setIsMonthPickerOpen(false)}
        selectedDate={refDate}
        onSelectMonth={(d: string) => {
          setRefDate(d);
          setTimeframe('custom_month');
        }}
      />
      <BottomSheetModal
        visible={isYearPickerOpen}
        onClose={() => setIsYearPickerOpen(false)}
        title="Select Year"
        description={`Choose a year from 2000 to ${currentYear}`}
        variant={isDark ? 'dark' : 'light'}
      >
        <ScrollView style={{ maxHeight: 340 }} showsVerticalScrollIndicator>
          <View style={styles.yearGridContainer}>
            {yearOptions.map((year) => {
              const isFuture = year > currentYear;
              const isSelected = refDate.startsWith(year.toString()) && timeframe === 'custom_year';
              return (
                <TouchableOpacity
                  key={year}
                  disabled={isFuture}
                  style={[
                    styles.yearChip,
                    isDark && styles.yearChipDark,
                    isFuture && { opacity: 0.3 },
                    isSelected && styles.yearChipActive,
                  ]}
                  onPress={() => {
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
                      isFuture && { color: isDark ? '#4B5563' : COLORS.outline },
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  containerDark: { backgroundColor: '#0F0D1A' },
  headerContainer: {
    paddingHorizontal: 16,
    paddingBottom: 14,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerContainerDark: { backgroundColor: '#0F0D1A', borderBottomColor: 'rgba(255,255,255,0.08)' },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 48,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: COLORS.onSurface },
  headerTitleDark: { color: '#ffffff' },
  aiHeaderBtn: { padding: 8, borderRadius: 12, backgroundColor: '#D1FAE5' },
  aiHeaderBtnDark: { backgroundColor: 'rgba(16,185,129,0.2)' },
  timeframeBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
    marginBottom: 10,
  },
  timeframePillRow: { gap: 8 },
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
  timeframePillDark: { backgroundColor: '#1A1730', borderColor: 'rgba(255,255,255,0.08)' },
  timeframePillActive: { backgroundColor: '#059669', borderColor: '#059669' },
  timeframePillText: { fontSize: 12, fontWeight: '700', color: '#6B7280' },
  timeframePillTextDark: { color: '#9CA3AF' },
  timeframePillTextActive: { color: '#ffffff' },
  loadingContainer: { paddingVertical: 60, alignItems: 'center', gap: 12 },
  loadingText: { fontSize: 14, color: '#6B7280' },
  loadingTextDark: { color: '#9CA3AF' },
  heroCard: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    elevation: 8,
    shadowColor: '#059669',
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
  heroTag: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  heroTagText: { fontSize: 11, fontWeight: '800', color: '#A7F3D0', letterSpacing: 0.8 },
  heroTimeframeBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  heroTimeframeText: { fontSize: 11, fontWeight: '700', color: '#ffffff' },
  heroAmountRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4, marginBottom: 4 },
  heroCurrency: { fontSize: 24, fontWeight: '700', color: '#ffffff' },
  heroAmount: { fontSize: 34, fontWeight: '900', color: '#ffffff', letterSpacing: -0.5 },
  heroSubText: { fontSize: 12, color: 'rgba(255,255,255,0.8)' },
  heroDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginVertical: 16 },
  heroStatsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  heroStatCol: { alignItems: 'center', flex: 1 },
  heroStatColDivider: { width: 1, height: 24, backgroundColor: 'rgba(255,255,255,0.2)' },
  heroStatLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  heroStatValue: { fontSize: 14, fontWeight: '800', color: '#ffffff' },
  cashFlowCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cashFlowCardDark: { backgroundColor: '#131620', borderColor: 'rgba(255,255,255,0.08)' },
  cashFlowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cashFlowTitle: { fontSize: 14, fontWeight: '800', color: COLORS.onSurface },
  cashFlowTitleDark: { color: '#ffffff' },
  savingsBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  savingsBadgeText: { fontSize: 11, fontWeight: '800' },
  cashFlowBar: {
    flexDirection: 'row',
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 10,
  },
  cashFlowFillIncome: {
    height: '100%',
    backgroundColor: '#10B981',
    borderTopLeftRadius: 5,
    borderBottomLeftRadius: 5,
  },
  cashFlowFillExpense: {
    height: '100%',
    backgroundColor: '#EF4444',
    borderTopRightRadius: 5,
    borderBottomRightRadius: 5,
  },
  cashFlowLegendRow: { flexDirection: 'row', justifyContent: 'space-between' },
  cashFlowLegendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  cashFlowLegendText: { fontSize: 11, color: '#6B7280', fontWeight: '600' },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  chartCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  chartCardDark: { backgroundColor: '#131620', borderColor: 'rgba(255,255,255,0.08)' },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  chartTitle: { fontSize: 16, fontWeight: '800', color: COLORS.onSurface },
  chartTitleDark: { color: '#ffffff' },
  chartSub: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  chartSubDark: { color: '#9CA3AF' },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    padding: 3,
    borderRadius: 12,
    gap: 2,
  },
  toggleContainerDark: { backgroundColor: 'rgba(255,255,255,0.08)' },
  toggleBtn: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  toggleBtnActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  donutContainer: { alignItems: 'center', paddingVertical: 10, gap: 16 },
  donutLegend: { gap: 8 },
  donutLegendRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  donutLegendText: { fontSize: 12, fontWeight: '600', color: '#374151' },
  trendLegendRow: { flexDirection: 'row', justifyContent: 'center', gap: 20, marginTop: 12 },
  trendLegendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  trendLegendText: { fontSize: 11, fontWeight: '600', color: '#6B7280' },
  emptyChartState: { paddingVertical: 40, alignItems: 'center', gap: 8 },
  emptyChartTitle: { fontSize: 13, fontWeight: '600', color: '#6B7280' },
  sectionMargin: { marginBottom: 16 },
  sectionHeading: { fontSize: 16, fontWeight: '800', color: COLORS.onSurface, marginBottom: 12 },
  sectionHeadingDark: { color: '#ffffff' },
  insightGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
  },
  insightCard: {
    width: '48.2%',
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  insightCardDark: { backgroundColor: '#131620', borderColor: 'rgba(255,255,255,0.08)' },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  insightIconBg: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  insightBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  insightBadgeText: { fontSize: 10, fontWeight: '800', color: '#D97706' },
  insightLabel: { fontSize: 11, fontWeight: '600', color: '#6B7280', marginBottom: 2 },
  insightLabelDark: { color: '#9CA3AF' },
  insightValue: { fontSize: 15, fontWeight: '800', color: COLORS.onSurface },
  insightValueDark: { color: '#ffffff' },
  insightSub: { fontSize: 11, fontWeight: '700', marginTop: 2 },
  categoryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  categoryCardDark: { backgroundColor: '#131620', borderColor: 'rgba(255,255,255,0.08)' },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  categoryTitle: { fontSize: 16, fontWeight: '800', color: COLORS.onSurface },
  categoryTitleDark: { color: '#ffffff' },
  categorySub: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  categorySubDark: { color: '#9CA3AF' },
  categoryCountBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryCountText: { fontSize: 11, fontWeight: '700', color: '#047857' },
  categoryRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  categoryIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  categoryName: { fontSize: 14, fontWeight: '700', color: COLORS.onSurface },
  categoryNameDark: { color: '#ffffff' },
  categoryAmount: { fontSize: 14, fontWeight: '800', color: '#EF4444' },
  categoryAmountDark: { color: '#F87171' },
  categoryProgressTrack: {
    height: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  categoryProgressFill: { height: '100%', borderRadius: 3 },
  categoryPctText: { fontSize: 11, color: '#6B7280' },
  feedHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  feedCountText: { fontSize: 12, fontWeight: '700', color: '#059669' },
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
  searchBoxDark: { backgroundColor: '#131620', borderColor: 'rgba(255,255,255,0.08)' },
  searchInput: { flex: 1, fontSize: 13, color: COLORS.onSurface },
  filterChipsRow: { gap: 8, marginBottom: 12 },
  chipBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  chipBtnDark: { backgroundColor: '#1A1730', borderColor: 'rgba(255,255,255,0.08)' },
  chipBtnActive: { backgroundColor: '#059669', borderColor: '#059669' },
  chipText: { fontSize: 12, fontWeight: '700', color: '#6B7280' },
  chipTextDark: { color: '#9CA3AF' },
  chipTextActive: { color: '#ffffff' },
  emptyFeedBox: { paddingVertical: 24, alignItems: 'center' },
  emptyFeedText: { fontSize: 12, color: '#6B7280' },
  feedRow: {
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
  feedRowDark: { backgroundColor: '#131620', borderColor: 'rgba(255,255,255,0.08)' },
  feedIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  feedTitle: { fontSize: 14, fontWeight: '700', color: COLORS.onSurface },
  feedTitleDark: { color: '#ffffff' },
  feedSub: { fontSize: 11, color: '#6B7280', marginTop: 2 },
  feedAmount: { fontSize: 15, fontWeight: '800' },
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
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderColor: 'rgba(255,255,255,0.08)',
  },
  yearChipActive: { backgroundColor: '#059669', borderColor: '#059669' },
  yearChipText: { fontSize: 15, fontWeight: '700', color: COLORS.onSurface },
  yearChipTextDark: { color: '#ffffff' },
  yearChipTextActive: { color: '#ffffff', fontWeight: '800' },
  proCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  proCardDark: { backgroundColor: '#131620', borderColor: 'rgba(255,255,255,0.08)' },
  proCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  proCardHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  proIconBg: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  proCardTitle: { fontSize: 15, fontWeight: '800', color: COLORS.onSurface },
  proCardTitleDark: { color: '#ffffff' },
  proCardSub: { fontSize: 11, color: '#6B7280', marginTop: 1 },
  proCardSubDark: { color: '#9CA3AF' },
  proBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  proBadgeText: { fontSize: 10, fontWeight: '900', color: '#047857', letterSpacing: 0.5 },
  proHealthScoreRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  healthScoreBig: {
    flexDirection: 'row',
    alignItems: 'baseline',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  healthScoreNum: { fontSize: 24, fontWeight: '900', color: '#059669' },
  healthScoreMax: { fontSize: 11, fontWeight: '700', color: '#047857' },
  healthScoreStatus: { fontSize: 12, fontWeight: '800', marginBottom: 4 },
  healthProgressTrack: {
    height: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  healthProgressFill: { height: '100%', borderRadius: 3 },
  healthAdviceText: { fontSize: 11, color: '#6B7280', lineHeight: 15 },
  splitRatioBar: {
    flexDirection: 'row',
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 12,
  },
  splitBarPersonal: {
    height: '100%',
    backgroundColor: '#059669',
    borderTopLeftRadius: 5,
    borderBottomLeftRadius: 5,
  },
  splitBarGroup: {
    height: '100%',
    backgroundColor: '#6366F1',
    borderTopRightRadius: 5,
    borderBottomRightRadius: 5,
  },
  splitRatioLegend: { flexDirection: 'row', justifyContent: 'space-between' },
  splitLegendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  splitLegendLabel: { fontSize: 11, fontWeight: '600', color: '#4B5563' },
  forecastGrid: { flexDirection: 'row', gap: 10 },
  forecastCol: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  forecastColDark: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderColor: 'rgba(255,255,255,0.06)',
  },
  forecastColLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#6B7280',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  forecastColValue: { fontSize: 17, fontWeight: '900' },
  forecastColSub: { fontSize: 10, color: '#9CA3AF', marginTop: 2 },
});
