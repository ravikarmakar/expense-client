import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Modal,
  Pressable,
  Dimensions,
  GestureResponderEvent,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useIncomes, useDeleteIncome, type Income } from '@workspace/api';
import { COLORS, CURRENCY_SYMBOL } from '../constants/theme';
import { TopAppBar } from '../components/TopAppBar';
import { AddIncomeModal } from '../components/AddIncomeModal';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { useTheme } from '../context/ThemeContext';
import { AppBackground } from '../components/AppBackground';
import { hapticFeedback } from '../utils/haptics';
import { BottomSheetModal } from '../components/BottomSheetModal';
import { getDateRangeLabel } from '../components/ActivityOverviewChartCard';
import { getDateHeading } from '../utils/date';
import { useExport } from '../hooks/useExport';
import { ExportModalBottomSheet } from '../components/ExportModalBottomSheet';
import { ExportProgressAndSuccessModal } from '../components/ExportProgressAndSuccessModal';

const SOURCE_VISUALS: Record<string, { icon: string; color: string; bg: string; border: string }> =
  {
    Salary: {
      icon: 'cash-outline',
      color: '#10B981',
      bg: 'rgba(16, 185, 129, 0.12)',
      border: 'rgba(16, 185, 129, 0.25)',
    },
    'Parents / Family': {
      icon: 'heart-outline',
      color: '#EC4899',
      bg: 'rgba(236, 72, 153, 0.12)',
      border: 'rgba(236, 72, 153, 0.25)',
    },
    'Pocket Money': {
      icon: 'wallet-outline',
      color: '#F59E0B',
      bg: 'rgba(245, 158, 11, 0.12)',
      border: 'rgba(245, 158, 11, 0.25)',
    },
    Freelance: {
      icon: 'laptop-outline',
      color: '#3B82F6',
      bg: 'rgba(59, 130, 246, 0.12)',
      border: 'rgba(59, 130, 246, 0.25)',
    },
    Investment: {
      icon: 'trending-up-outline',
      color: '#8B5CF6',
      bg: 'rgba(139, 92, 246, 0.12)',
      border: 'rgba(139, 92, 246, 0.25)',
    },
    Bonus: {
      icon: 'gift-outline',
      color: '#06B6D4',
      bg: 'rgba(6, 182, 212, 0.12)',
      border: 'rgba(6, 182, 212, 0.25)',
    },
    Other: {
      icon: 'ellipsis-horizontal-circle-outline',
      color: '#6B7280',
      bg: 'rgba(107, 114, 128, 0.12)',
      border: 'rgba(107, 114, 128, 0.25)',
    },
  };

const SOURCE_NAMES = [
  'Salary',
  'Parents / Family',
  'Pocket Money',
  'Freelance',
  'Investment',
  'Bonus',
  'Other',
];

const PERIOD_OPTIONS = [
  { label: 'This Month', value: 'this-month', icon: 'calendar-number-outline' },
  { label: 'Last 7 Days', value: 'last-7-days', icon: 'time-outline' },
  { label: 'Last 30 Days', value: 'last-30-days', icon: 'timer-outline' },
  { label: 'Last Month', value: 'last-month', icon: 'play-back-outline' },
  { label: 'All Time', value: 'all-time', icon: 'infinite-outline' },
] as const;

const SORT_OPTIONS = [
  { label: 'Newest First', value: 'date-desc', icon: 'calendar-outline' },
  { label: 'Oldest First', value: 'date-asc', icon: 'time-outline' },
  { label: 'Amount: High to Low', value: 'amount-desc', icon: 'trending-down-outline' },
  { label: 'Amount: Low to High', value: 'amount-asc', icon: 'trending-up-outline' },
] as const;

function getSourceVisual(source: string) {
  return SOURCE_VISUALS[source] || SOURCE_VISUALS.Other;
}

function formatFullDateTime(dateStr: string) {
  try {
    const d = new Date(dateStr);
    const dateFormatted = d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
    let hours = d.getHours();
    const minutes = d.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    const timeStr = `${hours.toString().padStart(2, '0')}:${minutes} ${ampm}`;
    return `${dateFormatted}, ${timeStr}`;
  } catch {
    return dateStr;
  }
}

export default function IncomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const variant = isDark ? 'dark' : 'light';
  const exportHook = useExport();

  const { data, isLoading, isRefetching, refetch } = useIncomes();
  const deleteIncome = useDeleteIncome();

  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);
  const [actionMenuIncome, setActionMenuIncome] = useState<Income | null>(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 16 });

  // Period & Filter state (matching Personal tab)
  const [selectedDateRange, setSelectedDateRange] = useState<string>('this-month');
  const [selectedSourceFilter, setSelectedSourceFilter] = useState<string | null>(null);
  const [periodModalVisible, setPeriodModalVisible] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [pickerYear, setPickerYear] = useState<number>(new Date().getFullYear());
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'>(
    'date-desc'
  );

  const rawIncomes = data?.incomes ?? [];

  // Filter incomes by selected date range
  const periodFilteredIncomes = useMemo(() => {
    if (selectedDateRange === 'all-time') return rawIncomes;

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

    return rawIncomes.filter((item) => {
      const itemDate = new Date(item.date || item.createdAt);
      return itemDate >= start && itemDate <= end;
    });
  }, [rawIncomes, selectedDateRange]);

  // Total income in selected period
  const periodTotal = useMemo(() => {
    return periodFilteredIncomes.reduce((sum, item) => sum + item.amount, 0);
  }, [periodFilteredIncomes]);

  // All-time total income
  const allTimeTotal = useMemo(() => {
    return rawIncomes.reduce((sum, item) => sum + item.amount, 0);
  }, [rawIncomes]);

  // Source breakdown for the selected period
  const sourceTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    SOURCE_NAMES.forEach((src) => {
      totals[src] = 0;
    });

    periodFilteredIncomes.forEach((item) => {
      const src = item.source || 'Other';
      if (src in totals) {
        totals[src] += item.amount;
      } else {
        totals['Other'] = (totals['Other'] ?? 0) + item.amount;
      }
    });

    return SOURCE_NAMES.map((src) => ({
      name: src,
      amount: totals[src] ?? 0,
      visual: getSourceVisual(src),
    }));
  }, [periodFilteredIncomes]);

  // Active source amount
  const activeSourceAmount = useMemo(() => {
    if (!selectedSourceFilter) return periodTotal;
    const srcObj = sourceTotals.find((s) => s.name === selectedSourceFilter);
    return srcObj ? srcObj.amount : 0;
  }, [selectedSourceFilter, periodTotal, sourceTotals]);

  // Filtered & Sorted incomes for recent feed
  const finalFilteredIncomes = useMemo(() => {
    let list = [...periodFilteredIncomes];

    if (selectedSourceFilter) {
      if (selectedSourceFilter === 'Other') {
        list = list.filter(
          (i) => !i.source || i.source === 'Other' || !SOURCE_NAMES.includes(i.source)
        );
      } else {
        list = list.filter((i) => i.source === selectedSourceFilter);
      }
    }

    list.sort((a, b) => {
      const dateA = new Date(a.date || a.createdAt).getTime();
      const dateB = new Date(b.date || b.createdAt).getTime();
      if (sortBy === 'date-desc') return dateB - dateA;
      if (sortBy === 'date-asc') return dateA - dateB;
      if (sortBy === 'amount-desc') return b.amount - a.amount;
      if (sortBy === 'amount-asc') return a.amount - b.amount;
      return 0;
    });

    return list;
  }, [periodFilteredIncomes, selectedSourceFilter, sortBy]);

  // Dynamic hero card title label & period button text
  const periodLabelText = getDateRangeLabel(selectedDateRange);
  const cardTitleLabel = selectedSourceFilter
    ? `${selectedSourceFilter} Income (${periodLabelText})`
    : `${periodLabelText} Income`;

  const isFiltered =
    Boolean(selectedSourceFilter) || selectedDateRange !== 'this-month' || sortBy !== 'date-desc';

  // Overview stats cards
  const overviewStats = useMemo(() => {
    const count = periodFilteredIncomes.length;
    const maxVal = count > 0 ? Math.max(...periodFilteredIncomes.map((i) => i.amount)) : 0;
    const avgVal = count > 0 ? periodTotal / count : 0;

    return [
      {
        label: 'Period Income',
        value: periodTotal,
        icon: 'cash-outline' as const,
        color: '#10B981',
        iconBg: isDark ? 'rgba(16, 185, 129, 0.18)' : '#D1FAE5',
        cardBg: isDark ? 'rgba(16, 185, 129, 0.09)' : '#ECFDF5',
        borderColor: isDark ? 'rgba(16, 185, 129, 0.25)' : '#A7F3D0',
      },
      {
        label: 'Highest Entry',
        value: maxVal,
        icon: 'trophy-outline' as const,
        color: '#3B82F6',
        iconBg: isDark ? 'rgba(59, 130, 246, 0.18)' : '#DBEAFE',
        cardBg: isDark ? 'rgba(59, 130, 246, 0.09)' : '#EFF6FF',
        borderColor: isDark ? 'rgba(59, 130, 246, 0.25)' : '#BFDBFE',
      },
      {
        label: 'Total Entries',
        value: count,
        isCount: true,
        icon: 'receipt-outline' as const,
        color: '#8B5CF6',
        iconBg: isDark ? 'rgba(139, 92, 246, 0.18)' : '#EDE9FE',
        cardBg: isDark ? 'rgba(139, 92, 246, 0.09)' : '#F5F3FF',
        borderColor: isDark ? 'rgba(139, 92, 246, 0.25)' : '#DDD6FE',
      },
      {
        label: 'Avg Entry',
        value: avgVal,
        icon: 'calculator-outline' as const,
        color: '#F59E0B',
        iconBg: isDark ? 'rgba(245, 158, 11, 0.18)' : '#FEF3C7',
        cardBg: isDark ? 'rgba(245, 158, 11, 0.09)' : '#FFFBEB',
        borderColor: isDark ? 'rgba(245, 158, 11, 0.25)' : '#FDE68A',
      },
    ];
  }, [periodFilteredIncomes, periodTotal, isDark]);

  const handleMenuPress = (event: GestureResponderEvent, item: Income) => {
    hapticFeedback.selection();
    const pageY = event.nativeEvent.pageY;
    const estimatedMenuHeight = 90;
    const topPos =
      pageY + estimatedMenuHeight > Dimensions.get('window').height - 100
        ? pageY - estimatedMenuHeight - 10
        : pageY + 10;
    setMenuPosition({
      top: topPos,
      right: 20,
    });
    setActionMenuIncome(item);
  };

  const handleDelete = (id: string, source: string, amount: number) => {
    hapticFeedback.mediumImpact();
    Alert.alert(
      'Delete Income',
      `Are you sure you want to delete this ${source} entry (+${CURRENCY_SYMBOL}${amount.toFixed(2)})?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteIncome.mutate(id, {
              onSuccess: () => {
                hapticFeedback.success();
                refetch();
              },
              onError: (err) => {
                Alert.alert('Error', err.message || 'Failed to delete income.');
              },
            });
          },
        },
      ]
    );
  };

  return (
    <AppBackground style={styles.container}>
      <TopAppBar
        title="Income"
        showBack
        onBack={() => router.back()}
        variant={variant}
        rightActions={
          <View style={styles.headerRightActions}>
            {/* Analytics Icon Button */}
            <TouchableOpacity
              style={styles.topBarIconBtn}
              activeOpacity={0.7}
              onPress={() => {
                hapticFeedback.selection();
                router.push('/income-analytics');
              }}
            >
              <Ionicons
                name="bar-chart-outline"
                size={22}
                color={isDark ? '#ffffff' : COLORS.onSurface}
              />
            </TouchableOpacity>

            {/* Download / Export Icon Button */}
            <TouchableOpacity
              style={styles.topBarIconBtn}
              activeOpacity={0.7}
              onPress={() => {
                hapticFeedback.selection();
                exportHook.setExportModalVisible(true);
              }}
            >
              <Ionicons
                name="download-outline"
                size={22}
                color={isDark ? '#ffffff' : COLORS.onSurface}
              />
            </TouchableOpacity>
          </View>
        }
      />

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#10B981" />
        }
      >
        {/* Premium Hero Card (Matching Personal Tab design) */}
        <View style={styles.premiumHeroCard}>
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
              +{CURRENCY_SYMBOL}
              {activeSourceAmount.toLocaleString('en-IN', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Text>
          )}

          <View style={styles.cardFooter}>
            <Ionicons name="wallet-outline" size={14} color="rgba(255, 255, 255, 0.7)" />
            <Text style={styles.cardFooterText}>
              Total Income (All-time): {CURRENCY_SYMBOL}
              {allTimeTotal.toLocaleString('en-IN', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Text>
          </View>
        </View>

        {/* Quick Stats Grid (4 Colorful Overview Cards) */}
        {!isLoading && (
          <View style={styles.overviewSection}>
            <View style={styles.overviewGrid}>
              {overviewStats.map((stat) => (
                <View
                  key={stat.label}
                  style={[
                    styles.overviewCard,
                    {
                      backgroundColor: stat.cardBg,
                      borderColor: stat.borderColor,
                    },
                  ]}
                >
                  <View style={styles.overviewCardHeader}>
                    <View style={[styles.overviewIconBg, { backgroundColor: stat.iconBg }]}>
                      <Ionicons name={stat.icon} size={16} color={stat.color} />
                    </View>
                    <Text
                      style={[styles.overviewCardLabel, isDark && styles.overviewCardLabelDark]}
                      numberOfLines={1}
                    >
                      {stat.label}
                    </Text>
                  </View>
                  <Text style={[styles.overviewCardValue, { color: stat.color }]}>
                    {stat.isCount ? '' : `+${CURRENCY_SYMBOL}`}
                    {stat.isCount
                      ? stat.value.toString()
                      : stat.value.toLocaleString('en-IN', {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        })}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Source Breakdown Carousel (Matching Personal Tab category spending carousel) */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, isDark && { color: '#ffffff' }]}>
            Source Breakdown
          </Text>
          {selectedSourceFilter && (
            <TouchableOpacity onPress={() => setSelectedSourceFilter(null)}>
              <Text style={styles.clearFilterText}>Clear Filter</Text>
            </TouchableOpacity>
          )}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.carouselContainer}
        >
          {sourceTotals.map((src) => {
            const isSelected = selectedSourceFilter === src.name;
            return (
              <TouchableOpacity
                key={src.name}
                style={[
                  styles.sourcePill,
                  { backgroundColor: src.visual.bg, borderColor: src.visual.border },
                  isSelected && styles.sourcePillActive,
                ]}
                onPress={() => setSelectedSourceFilter(isSelected ? null : src.name)}
                activeOpacity={0.8}
              >
                <View style={styles.sourcePillLeft}>
                  <View
                    style={[
                      styles.sourceIconBg,
                      { backgroundColor: isSelected ? '#ffffff' : 'rgba(255, 255, 255, 0.7)' },
                    ]}
                  >
                    <Ionicons name={src.visual.icon as never} size={14} color={src.visual.color} />
                  </View>
                  <Text
                    style={[
                      styles.sourcePillLabel,
                      {
                        color: isSelected
                          ? '#ffffff'
                          : isDark
                            ? '#E5E7EB'
                            : COLORS.onSurfaceVariant,
                      },
                    ]}
                  >
                    {src.name}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.sourcePillAmount,
                    { color: isSelected ? '#ffffff' : src.visual.color },
                  ]}
                >
                  +{CURRENCY_SYMBOL}
                  {src.amount.toFixed(0)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Active Filters Pill Bar */}
        {isFiltered && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.activeFiltersRow}
          >
            {selectedSourceFilter && (
              <View style={[styles.activeFilterBadge, isDark && styles.activeFilterBadgeDark]}>
                <Text
                  style={[styles.activeFilterBadgeText, isDark && styles.activeFilterBadgeTextDark]}
                >
                  Source: {selectedSourceFilter}
                </Text>
                <TouchableOpacity onPress={() => setSelectedSourceFilter(null)}>
                  <Ionicons
                    name="close-circle"
                    size={14}
                    color={isDark ? '#34D399' : COLORS.secondary}
                  />
                </TouchableOpacity>
              </View>
            )}
            {selectedDateRange !== 'this-month' && (
              <View style={[styles.activeFilterBadge, isDark && styles.activeFilterBadgeDark]}>
                <Text
                  style={[styles.activeFilterBadgeText, isDark && styles.activeFilterBadgeTextDark]}
                >
                  {periodLabelText}
                </Text>
                <TouchableOpacity onPress={() => setSelectedDateRange('this-month')}>
                  <Ionicons
                    name="close-circle"
                    size={14}
                    color={isDark ? '#34D399' : COLORS.secondary}
                  />
                </TouchableOpacity>
              </View>
            )}
            {sortBy !== 'date-desc' && (
              <View style={[styles.activeFilterBadge, isDark && styles.activeFilterBadgeDark]}>
                <Text
                  style={[styles.activeFilterBadgeText, isDark && styles.activeFilterBadgeTextDark]}
                >
                  {sortBy === 'date-asc'
                    ? 'Oldest First'
                    : sortBy === 'amount-desc'
                      ? 'High to Low'
                      : 'Low to High'}
                </Text>
                <TouchableOpacity onPress={() => setSortBy('date-desc')}>
                  <Ionicons
                    name="close-circle"
                    size={14}
                    color={isDark ? '#34D399' : COLORS.secondary}
                  />
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        )}

        {/* Income History List Feed Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, isDark && { color: '#ffffff' }]}>
              Recent Income ({finalFilteredIncomes.length})
            </Text>
            <TouchableOpacity
              style={styles.seeAllBtn}
              onPress={() => router.push('/income-history')}
              activeOpacity={0.7}
            >
              <Text style={[styles.seeAllText, isDark && { color: '#34D399' }]}>View History</Text>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={isDark ? '#34D399' : COLORS.primary}
              />
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <View>
              {[1, 2, 3, 4].map((i) => (
                <View
                  key={i}
                  style={[styles.incomeRow, isDark ? styles.incomeRowDark : styles.incomeRowLight]}
                >
                  <SkeletonLoader
                    width={48}
                    height={48}
                    borderRadius={24}
                    style={{ marginRight: 14 }}
                  />
                  <View style={{ flex: 1, gap: 6 }}>
                    <SkeletonLoader width={100} height={12} borderRadius={4} />
                    <SkeletonLoader width={140} height={15} borderRadius={4} />
                    <SkeletonLoader width={110} height={12} borderRadius={4} />
                  </View>
                  <SkeletonLoader width={75} height={18} borderRadius={4} />
                </View>
              ))}
            </View>
          ) : finalFilteredIncomes.length > 0 ? (
            <View style={styles.incomeFeedList}>
              {(() => {
                let lastDateHeading = '';
                return finalFilteredIncomes.map((item) => {
                  const currentHeading = getDateHeading(item.date || item.createdAt);
                  const showHeading = currentHeading !== lastDateHeading;
                  lastDateHeading = currentHeading;
                  const visual = getSourceVisual(item.source);

                  return (
                    <React.Fragment key={item.id}>
                      {showHeading && (
                        <View
                          style={[
                            styles.dateHeaderContainer,
                            isDark && styles.dateHeaderContainerDark,
                          ]}
                        >
                          <Text
                            style={[styles.dateHeaderText, isDark && styles.dateHeaderTextDark]}
                          >
                            {currentHeading}
                          </Text>
                        </View>
                      )}
                      <View
                        style={[
                          styles.incomeRow,
                          isDark ? styles.incomeRowDark : styles.incomeRowLight,
                        ]}
                      >
                        {/* Avatar Icon */}
                        <View style={[styles.avatarCircle, { backgroundColor: visual.bg }]}>
                          <Ionicons name={visual.icon as never} size={22} color={visual.color} />
                        </View>

                        {/* Middle Info */}
                        <View style={styles.middleSection}>
                          <Text
                            style={[
                              styles.sourceSubtitle,
                              isDark && { color: 'rgba(255, 255, 255, 0.45)' },
                            ]}
                            numberOfLines={1}
                          >
                            Income • {item.source}
                            {item.paymentMethod ? ` • ${item.paymentMethod}` : ''}
                          </Text>
                          <Text
                            style={[styles.titleText, isDark && { color: '#ffffff' }]}
                            numberOfLines={1}
                          >
                            {item.notes ? item.notes : item.source}
                          </Text>
                          <Text
                            style={[
                              styles.dateText,
                              isDark && { color: 'rgba(255, 255, 255, 0.4)' },
                            ]}
                          >
                            {formatFullDateTime(item.date || item.createdAt)}
                          </Text>
                        </View>

                        {/* Right Amount & 3-Dots Menu */}
                        <View style={styles.rightSection}>
                          <Text style={styles.amountText}>
                            +{CURRENCY_SYMBOL}
                            {item.amount.toFixed(2)}
                          </Text>
                          <TouchableOpacity
                            onPress={(e) => handleMenuPress(e, item)}
                            style={styles.menuBtn}
                            activeOpacity={0.7}
                          >
                            <Ionicons
                              name="ellipsis-vertical"
                              size={18}
                              color={isDark ? 'rgba(255, 255, 255, 0.6)' : '#6B7280'}
                            />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </React.Fragment>
                  );
                });
              })()}
            </View>
          ) : (
            <View style={[styles.emptyCard, isDark && styles.emptyCardDark]}>
              <View style={styles.emptyIconBg}>
                <Ionicons name="cash-outline" size={32} color="#10B981" />
              </View>
              <Text style={[styles.emptyTitle, isDark && { color: '#ffffff' }]}>
                {isFiltered ? 'No Matching Income' : 'No Income Recorded'}
              </Text>
              <Text style={[styles.emptySub, isDark && { color: 'rgba(255, 255, 255, 0.55)' }]}>
                {isFiltered
                  ? 'No income entries match your selected source or timeframe filter.'
                  : 'Track your salary, family allowance, freelance, and bonuses here.'}
              </Text>
              {isFiltered ? (
                <TouchableOpacity
                  style={styles.emptyAddBtn}
                  onPress={() => {
                    setSelectedSourceFilter(null);
                    setSelectedDateRange('this-month');
                    setSortBy('date-desc');
                  }}
                  activeOpacity={0.8}
                >
                  <Ionicons name="refresh" size={18} color="#ffffff" />
                  <Text style={styles.emptyAddBtnText}>Clear Filters</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.emptyAddBtn}
                  onPress={() => {
                    hapticFeedback.selection();
                    setAddModalVisible(true);
                  }}
                  activeOpacity={0.8}
                >
                  <Ionicons name="add" size={18} color="#ffffff" />
                  <Text style={styles.emptyAddBtnText}>Add Your First Income</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Add / Edit Income Modal */}
      <AddIncomeModal
        visible={addModalVisible}
        onClose={() => {
          setAddModalVisible(false);
          setEditingIncome(null);
        }}
        onSuccess={refetch}
        variant={variant}
        editingIncome={editingIncome}
      />

      {/* Period Filter Modal (Matching Personal Tab modal with Year Switcher & 12 Month Grid) */}
      <BottomSheetModal
        visible={periodModalVisible}
        onClose={() => setPeriodModalVisible(false)}
        title="Filter Period"
        description="Select a timeframe or specific month to filter income"
        variant={variant}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.periodModalScroll}
        >
          {/* Presets Section */}
          <Text style={[styles.modalSectionTitle, isDark && styles.modalSectionTitleDark]}>
            Quick Presets
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.pillsContainer}
          >
            {PERIOD_OPTIONS.map((opt) => {
              const isSelected = selectedDateRange === opt.value;

              return (
                <TouchableOpacity
                  key={opt.value}
                  style={[
                    styles.pillCard,
                    isDark && styles.pillCardDark,
                    isSelected && (isDark ? styles.pillCardActiveDark : styles.pillCardActive),
                  ]}
                  activeOpacity={0.75}
                  onPress={() => {
                    setSelectedDateRange(opt.value);
                    setPeriodModalVisible(false);
                  }}
                >
                  <Ionicons
                    name={opt.icon as never}
                    size={15}
                    color={
                      isSelected
                        ? isDark
                          ? '#101917'
                          : COLORS.secondary
                        : isDark
                          ? '#9CA3AF'
                          : COLORS.outline
                    }
                  />
                  <Text
                    style={[
                      styles.pillText,
                      isDark && styles.pillTextDark,
                      isSelected && (isDark ? styles.pillTextActiveDark : styles.pillTextActive),
                    ]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Specific Month Selector */}
          <Text
            style={[
              styles.modalSectionTitle,
              isDark && styles.modalSectionTitleDark,
              { marginTop: 14 },
            ]}
          >
            Specific Month
          </Text>

          {/* Year Switcher Header */}
          <View style={[styles.yearSelectorRow, isDark && styles.yearSelectorRowDark]}>
            <TouchableOpacity onPress={() => setPickerYear((y) => y - 1)} style={styles.yearNavBtn}>
              <Ionicons
                name="chevron-back"
                size={20}
                color={isDark ? '#E5E7EB' : COLORS.onSurface}
              />
            </TouchableOpacity>
            <Text style={[styles.yearText, isDark && styles.yearTextDark]}>{pickerYear}</Text>
            <TouchableOpacity
              onPress={() => pickerYear < new Date().getFullYear() && setPickerYear((y) => y + 1)}
              disabled={pickerYear >= new Date().getFullYear()}
              style={[
                styles.yearNavBtn,
                pickerYear >= new Date().getFullYear() && { opacity: 0.3 },
              ]}
            >
              <Ionicons
                name="chevron-forward"
                size={20}
                color={
                  pickerYear >= new Date().getFullYear()
                    ? isDark
                      ? '#4B5563'
                      : COLORS.outline
                    : isDark
                      ? '#E5E7EB'
                      : COLORS.onSurface
                }
              />
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
              const isCurrentMonthNow = pickerYear === now.getFullYear() && idx === now.getMonth();
              const isFutureMonth =
                pickerYear > now.getFullYear() ||
                (pickerYear === now.getFullYear() && idx > now.getMonth());
              const isSelected =
                !isFutureMonth &&
                (selectedDateRange === monthVal ||
                  (isCurrentMonthNow && selectedDateRange === 'this-month'));

              return (
                <TouchableOpacity
                  key={mName}
                  disabled={isFutureMonth}
                  style={[
                    styles.monthGridCell,
                    isDark && styles.monthGridCellDark,
                    isFutureMonth && {
                      opacity: 0.35,
                      backgroundColor: isDark ? '#0D1513' : COLORS.surfaceContainerLow,
                    },
                    isSelected &&
                      (isDark ? styles.monthCellSelectedDark : styles.monthCellSelected),
                  ]}
                  onPress={() => {
                    if (!isFutureMonth) {
                      setSelectedDateRange(isCurrentMonthNow ? 'this-month' : monthVal);
                      setPeriodModalVisible(false);
                    }
                  }}
                  activeOpacity={0.75}
                >
                  <Text
                    style={[
                      styles.monthCellText,
                      isDark && styles.monthCellTextDark,
                      isFutureMonth && { color: isDark ? '#4B5563' : COLORS.outline },
                      isSelected &&
                        (isDark ? styles.monthCellTextSelectedDark : styles.monthCellTextSelected),
                    ]}
                  >
                    {mName}
                  </Text>
                  {isCurrentMonthNow && (
                    <View
                      style={[
                        styles.currentMonthDot,
                        isSelected && { backgroundColor: isDark ? '#101917' : '#ffffff' },
                      ]}
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </BottomSheetModal>

      {/* Filter & Sort BottomSheet Modal */}
      <BottomSheetModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        title="Filter & Sort"
        description="Filter by source, timeframe, or sort order"
        variant={variant}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.periodModalScroll}
        >
          {/* Sort By Filter */}
          <Text style={[styles.modalSectionTitle, isDark && styles.modalSectionTitleDark]}>
            Sort Order
          </Text>
          <View style={styles.monthGrid}>
            {SORT_OPTIONS.map((opt) => {
              const isSelected = sortBy === opt.value;
              return (
                <TouchableOpacity
                  key={opt.value}
                  style={[
                    styles.sortCell,
                    isDark && styles.sortCellDark,
                    isSelected &&
                      (isDark ? styles.monthCellSelectedDark : styles.monthCellSelected),
                  ]}
                  onPress={() => setSortBy(opt.value)}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={opt.icon as never}
                    size={16}
                    color={
                      isSelected
                        ? isDark
                          ? '#101917'
                          : '#ffffff'
                        : isDark
                          ? '#9CA3AF'
                          : COLORS.onSurface
                    }
                  />
                  <Text
                    style={[
                      styles.sortCellText,
                      isDark && styles.sortCellTextDark,
                      isSelected &&
                        (isDark ? styles.monthCellTextSelectedDark : styles.monthCellTextSelected),
                    ]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Action Row */}
          <View style={styles.modalActionRow}>
            <TouchableOpacity
              style={[styles.resetBtn, isDark && styles.resetBtnDark]}
              onPress={() => {
                setSelectedSourceFilter(null);
                setSelectedDateRange('this-month');
                setSortBy('date-desc');
                setFilterModalVisible(false);
              }}
              activeOpacity={0.8}
            >
              <Text style={[styles.resetBtnText, isDark && styles.resetBtnTextDark]}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.applyBtn}
              onPress={() => setFilterModalVisible(false)}
              activeOpacity={0.85}
            >
              <Text style={styles.applyBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </BottomSheetModal>

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
        variant={variant}
        onConfirmExport={() =>
          exportHook.executeExport(
            finalFilteredIncomes.map((i) => ({
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

      {/* 3-Dot Dropdown Overflow Menu Overlay */}
      <Modal
        visible={Boolean(actionMenuIncome)}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setActionMenuIncome(null)}
      >
        <Pressable style={styles.menuOverlay} onPress={() => setActionMenuIncome(null)}>
          <View
            style={[
              styles.menuContainer,
              {
                top: menuPosition.top,
                right: menuPosition.right,
                backgroundColor: isDark ? '#101917' : '#ffffff',
                borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#f1f3f4',
              },
            ]}
          >
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                const target = actionMenuIncome;
                setActionMenuIncome(null);
                if (target) {
                  setEditingIncome(target);
                  setAddModalVisible(true);
                }
              }}
            >
              <Ionicons
                name="pencil-outline"
                size={18}
                color={isDark ? '#ffffff' : COLORS.onSurface}
              />
              <Text style={[styles.menuItemText, isDark && { color: '#ffffff' }]}>Edit Income</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.menuItem,
                styles.menuItemBorder,
                isDark && { borderTopColor: 'rgba(255, 255, 255, 0.08)' },
              ]}
              onPress={() => {
                const target = actionMenuIncome;
                setActionMenuIncome(null);
                if (target) {
                  handleDelete(target.id, target.source, target.amount);
                }
              }}
            >
              <Ionicons name="trash-outline" size={18} color={COLORS.error} />
              <Text style={[styles.menuItemText, { color: COLORS.error }]}>Delete Income</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={[styles.fab, { bottom: Math.max(36, insets.bottom + 28) }]}
        onPress={() => {
          hapticFeedback.selection();
          setAddModalVisible(true);
        }}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={32} color="#ffffff" />
      </TouchableOpacity>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 16,
    paddingBottom: 100,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  topBarIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  topBarIconBtnActive: {
    backgroundColor: '#e2dfff',
  },
  topBarIconBtnActiveDark: {
    backgroundColor: 'rgba(52, 211, 153, 0.16)',
  },
  activeDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  // --- Premium Hero Card (Matching Personal tab) ---
  premiumHeroCard: {
    backgroundColor: '#10B981',
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    marginHorizontal: 16,
    overflow: 'hidden',
    position: 'relative',
    elevation: 8,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },
  cardCircle1: {
    position: 'absolute',
    borderRadius: 999,
    width: 140,
    height: 140,
    top: -40,
    right: -40,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  cardCircle2: {
    position: 'absolute',
    borderRadius: 999,
    width: 80,
    height: 80,
    bottom: -30,
    left: -10,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
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
    color: '#D1FAE5',
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
    borderColor: 'rgba(255, 255, 255, 0.28)',
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
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
  },
  // --- Quick Overview Stats Grid ---
  overviewSection: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  overviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  overviewCard: {
    width: '48%',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    gap: 8,
  },
  overviewCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  overviewIconBg: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overviewCardLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.outline,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    flex: 1,
  },
  overviewCardLabelDark: {
    color: '#9CA3AF',
  },
  overviewCardValue: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  // --- Source Breakdown Carousel ---
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.onSurface,
    letterSpacing: -0.3,
  },
  clearFilterText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.secondary,
  },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  seeAllText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.primary,
  },
  carouselContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 10,
  },
  sourcePill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 16,
    minWidth: 145,
    gap: 12,
    borderWidth: 1,
  },
  sourcePillActive: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  sourcePillLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sourceIconBg: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sourcePillLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  sourcePillAmount: {
    fontSize: 13,
    fontWeight: '800',
  },
  // --- Active Filter Badges ---
  activeFiltersRow: {
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 16,
  },
  activeFilterBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#e2dfff',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#c5c1ff',
  },
  activeFilterBadgeDark: {
    backgroundColor: 'rgba(52, 211, 153, 0.12)',
    borderColor: 'rgba(52, 211, 153, 0.25)',
  },
  activeFilterBadgeText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  activeFilterBadgeTextDark: {
    color: '#34D399',
  },
  // --- Income History Feed ---
  section: {
    gap: 4,
  },
  incomeFeedList: {
    gap: 0,
  },
  dateHeaderContainer: {
    backgroundColor: COLORS.surfaceContainerLow,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceContainer,
  },
  dateHeaderContainerDark: {
    backgroundColor: '#131D1A',
    borderBottomColor: '#1E292B',
  },
  dateHeaderText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.outline,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  dateHeaderTextDark: {
    color: '#34D399',
  },
  incomeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  incomeRowLight: {
    backgroundColor: '#ffffff',
    borderBottomColor: '#f1f3f4',
  },
  incomeRowDark: {
    backgroundColor: 'transparent',
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  middleSection: {
    flex: 1,
    justifyContent: 'center',
  },
  sourceSubtitle: {
    fontSize: 11.5,
    color: '#70757a',
    marginBottom: 2,
    fontWeight: '400',
  },
  titleText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#202124',
    marginBottom: 3,
    letterSpacing: 0.3,
  },
  dateText: {
    fontSize: 11.5,
    color: '#70757a',
    fontWeight: '400',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  amountText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#137333',
  },
  menuBtn: {
    padding: 6,
    marginLeft: 4,
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  menuContainer: {
    position: 'absolute',
    borderRadius: 16,
    padding: 6,
    minWidth: 150,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    borderWidth: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
    borderRadius: 10,
  },
  menuItemBorder: {
    borderTopWidth: 1,
    borderTopColor: '#f1f3f4',
  },
  menuItemText: {
    fontSize: 14.5,
    fontWeight: '600',
    color: COLORS.onSurface,
  },
  emptyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 28,
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 16,
  },
  emptyCardDark: {
    backgroundColor: '#101917',
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  emptyIconBg: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#191c1d',
  },
  emptySub: {
    fontSize: 13,
    color: COLORS.outline,
    textAlign: 'center',
    lineHeight: 18,
  },
  emptyAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#10B981',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 20,
    marginTop: 8,
  },
  emptyAddBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  fab: {
    position: 'absolute',
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
    zIndex: 99,
  },
  // --- Period Filter Modal Styles (Matching Personal tab) ---
  periodModalScroll: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 16,
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
  modalSectionTitleDark: {
    color: '#9CA3AF',
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
  pillCardDark: {
    backgroundColor: '#131D1A',
    borderColor: '#1E292B',
  },
  pillCardActive: {
    backgroundColor: COLORS.secondaryFixed + '50',
    borderColor: COLORS.secondary,
  },
  pillCardActiveDark: {
    backgroundColor: '#34D399',
    borderColor: '#34D399',
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.onSurfaceVariant,
  },
  pillTextDark: {
    color: '#9CA3AF',
  },
  pillTextActive: {
    fontWeight: '800',
    color: COLORS.secondary,
  },
  pillTextActiveDark: {
    fontWeight: '800',
    color: '#101917',
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
  yearSelectorRowDark: {
    backgroundColor: '#131D1A',
    borderColor: '#1E292B',
  },
  yearNavBtn: {
    padding: 3,
  },
  yearText: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.onSurface,
  },
  yearTextDark: {
    color: '#F3F4F6',
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
  monthGridCellDark: {
    backgroundColor: '#131D1A',
    borderColor: '#1E292B',
  },
  monthCellSelected: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
  },
  monthCellSelectedDark: {
    backgroundColor: '#34D399',
    borderColor: '#34D399',
  },
  monthCellText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  monthCellTextDark: {
    color: '#D1D5DB',
  },
  monthCellTextSelected: {
    color: '#ffffff',
    fontWeight: '800',
  },
  monthCellTextSelectedDark: {
    color: '#101917',
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
  sortCell: {
    width: '48.5%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceContainerLow,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainer,
  },
  sortCellDark: {
    backgroundColor: '#131D1A',
    borderColor: '#1E292B',
  },
  sortCellText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  sortCellTextDark: {
    color: '#D1D5DB',
  },
  modalActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 20,
  },
  resetBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: COLORS.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.surfaceContainer,
  },
  resetBtnDark: {
    backgroundColor: '#131D1A',
    borderColor: '#1E292B',
  },
  resetBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  resetBtnTextDark: {
    color: '#E5E7EB',
  },
  applyBtn: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#ffffff',
  },
});
