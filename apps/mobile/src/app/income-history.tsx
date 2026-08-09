import React, { useState, useMemo, useCallback } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Modal,
  ActivityIndicator,
  NativeScrollEvent,
  TextInput,
  Alert,
  Pressable,
  Dimensions,
  GestureResponderEvent,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, CURRENCY_SYMBOL } from '../constants/theme';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { AddIncomeModal } from '../components/AddIncomeModal';
import { getDateRangeLabel } from '../components/ActivityOverviewChartCard';
import { useTheme } from '../context/ThemeContext';
import { ErrorView } from '../components/ErrorView';
import { EmptyState } from '../components/EmptyState';
import { useIncomes, useDeleteIncome, type Income } from '@workspace/api';
import { getDateHeading } from '../utils/date';
import { useExport } from '../hooks/useExport';
import { ExportModalBottomSheet } from '../components/ExportModalBottomSheet';
import { ExportProgressAndSuccessModal } from '../components/ExportProgressAndSuccessModal';
import { BottomSheetModal } from '../components/BottomSheetModal';
import { AppBackground } from '../components/AppBackground';
import { hapticFeedback } from '../utils/haptics';

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

const SOURCE_OPTIONS = [
  'All',
  'Salary',
  'Parents / Family',
  'Pocket Money',
  'Freelance',
  'Investment',
  'Bonus',
  'Other',
];

const DATE_RANGE_OPTIONS = [
  { label: 'All Time', value: 'all-time', icon: 'infinite-outline' },
  { label: 'This Month', value: 'this-month', icon: 'calendar-number-outline' },
  { label: 'Last Month', value: 'last-month', icon: 'play-back-outline' },
  { label: 'Last 7 Days', value: 'last-7-days', icon: 'time-outline' },
  { label: 'Last 30 Days', value: 'last-30-days', icon: 'timer-outline' },
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

export default function IncomeHistoryScreen() {
  const params = useLocalSearchParams<{ dateRange?: string; source?: string }>();
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const variant = isDark ? 'dark' : 'light';
  const exportHook = useExport();

  const { data, isLoading, isError, refetch } = useIncomes();
  const deleteIncome = useDeleteIncome();

  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);
  const [actionMenuIncome, setActionMenuIncome] = useState<Income | null>(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 16 });

  // Filters & Search
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [activeSource, setActiveSource] = useState<string>(params.source || 'All');
  const [dateRange, setDateRange] = useState<string>(params.dateRange || 'all-time');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'>(
    'date-desc'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

  React.useEffect(() => {
    if (params.dateRange) setDateRange(params.dateRange);
    if (params.source) setActiveSource(params.source);
  }, [params.dateRange, params.source]);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const rawIncomes = data?.incomes ?? [];

  // Filtered & Sorted Incomes
  const filteredIncomes = useMemo(() => {
    let list = [...rawIncomes];

    // Source Filter
    if (activeSource !== 'All') {
      list = list.filter((i) => i.source === activeSource);
    }

    // Search Query Filter
    if (debouncedSearchQuery.trim() !== '') {
      const q = debouncedSearchQuery.trim().toLowerCase();
      list = list.filter(
        (i) =>
          (i.source && i.source.toLowerCase().includes(q)) ||
          (i.notes && i.notes.toLowerCase().includes(q)) ||
          (i.paymentMethod && i.paymentMethod.toLowerCase().includes(q)) ||
          i.amount.toString().includes(q)
      );
    }

    // Date Range Filter
    if (dateRange !== 'all-time') {
      const now = new Date();
      list = list.filter((item) => {
        const itemDate = new Date(item.date || item.createdAt);
        if (dateRange === 'this-month') {
          return (
            itemDate.getMonth() === now.getMonth() && itemDate.getFullYear() === now.getFullYear()
          );
        }
        if (dateRange === 'last-month') {
          const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          return (
            itemDate.getMonth() === lastMonth.getMonth() &&
            itemDate.getFullYear() === lastMonth.getFullYear()
          );
        }
        if (dateRange === 'last-7-days') {
          const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return itemDate >= sevenDaysAgo;
        }
        if (dateRange === 'last-30-days') {
          const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          return itemDate >= thirtyDaysAgo;
        }
        return true;
      });
    }

    // Sort
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
  }, [rawIncomes, activeSource, debouncedSearchQuery, dateRange, sortBy]);

  // Client-side pagination
  const BATCH_SIZE = 15;
  const [displayLimit, setDisplayLimit] = useState<number>(BATCH_SIZE);
  const [isRefreshing, setIsRefreshing] = useState(false);

  React.useEffect(() => {
    setDisplayLimit(BATCH_SIZE);
  }, [dateRange, activeSource, sortBy, debouncedSearchQuery]);

  const paginatedFeed = useMemo(() => {
    return filteredIncomes.slice(0, displayLimit);
  }, [filteredIncomes, displayLimit]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    setDisplayLimit(BATCH_SIZE);
    await refetch();
    setIsRefreshing(false);
  }, [refetch]);

  const handleLoadMore = useCallback(() => {
    if (displayLimit < filteredIncomes.length) {
      setDisplayLimit((prev) => prev + BATCH_SIZE);
    }
  }, [displayLimit, filteredIncomes.length]);

  const isCloseToBottom = ({
    layoutMeasurement,
    contentOffset,
    contentSize,
  }: NativeScrollEvent) => {
    const paddingToBottom = 50;
    return layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;
  };

  const isFiltered = activeSource !== 'All' || dateRange !== 'all-time' || sortBy !== 'date-desc';

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
      {/* Header Bar */}
      <View style={[styles.headerContainer, { paddingTop: insets.top + 12 }]}>
        <View style={styles.tabHeaderRow}>
          <View style={styles.headerLeftRow}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backBtn}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={24} color={isDark ? '#F3F4F6' : COLORS.onSurface} />
            </TouchableOpacity>
            <View>
              <Text style={[styles.tabTitle, isDark && styles.tabTitleDark]}>Income History</Text>
            </View>
          </View>

          <View style={styles.headerRightActions}>
            <TouchableOpacity
              style={styles.iconBtn}
              activeOpacity={0.7}
              onPress={() => {
                hapticFeedback.selection();
                router.push('/income-analytics');
              }}
            >
              <Ionicons
                name="bar-chart-outline"
                size={24}
                color={isDark ? '#F3F4F6' : COLORS.onSurface}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.iconBtn, isFiltered && styles.filterBtnActive]}
              onPress={() => setFilterModalVisible(true)}
              activeOpacity={0.7}
            >
              <Ionicons
                name="options-outline"
                size={24}
                color={isFiltered ? COLORS.secondary : isDark ? '#F3F4F6' : COLORS.onSurface}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconBtn}
              activeOpacity={0.7}
              onPress={() => exportHook.setExportModalVisible(true)}
            >
              <Ionicons
                name="download-outline"
                size={26}
                color={isDark ? '#F3F4F6' : COLORS.onSurface}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Input Box */}
        <View style={[styles.alwaysSearchContainer, isDark && styles.alwaysSearchContainerDark]}>
          <Ionicons
            name="search-outline"
            size={22}
            color={isDark ? 'rgba(255, 255, 255, 0.45)' : COLORS.outline}
            style={{ marginRight: 10 }}
          />
          <TextInput
            style={[styles.alwaysSearchInput, isDark && { color: '#ffffff' }]}
            placeholder="Search income records..."
            placeholderTextColor={isDark ? 'rgba(255, 255, 255, 0.45)' : COLORS.outline}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.trim().length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons
                name="close-circle"
                size={18}
                color={isDark ? 'rgba(255, 255, 255, 0.45)' : COLORS.outline}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Active Filters Bar */}
        {isFiltered && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.activeFiltersRow}
          >
            {dateRange !== 'all-time' && (
              <View style={styles.activeFilterBadge}>
                <Text style={styles.activeFilterBadgeText}>{getDateRangeLabel(dateRange)}</Text>
                <TouchableOpacity onPress={() => setDateRange('all-time')}>
                  <Ionicons name="close-circle" size={14} color={COLORS.secondary} />
                </TouchableOpacity>
              </View>
            )}
            {activeSource !== 'All' && (
              <View style={styles.activeFilterBadge}>
                <Text style={styles.activeFilterBadgeText}>{activeSource}</Text>
                <TouchableOpacity onPress={() => setActiveSource('All')}>
                  <Ionicons name="close-circle" size={14} color={COLORS.secondary} />
                </TouchableOpacity>
              </View>
            )}
            {sortBy !== 'date-desc' && (
              <View style={styles.activeFilterBadge}>
                <Text style={styles.activeFilterBadgeText}>
                  {sortBy === 'date-asc'
                    ? 'Oldest'
                    : sortBy === 'amount-desc'
                      ? 'Amount: High-Low'
                      : 'Amount: Low-High'}
                </Text>
                <TouchableOpacity onPress={() => setSortBy('date-desc')}>
                  <Ionicons name="close-circle" size={14} color={COLORS.secondary} />
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        )}
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor="#10B981" />
        }
        onScroll={({ nativeEvent }) => {
          if (isCloseToBottom(nativeEvent)) {
            handleLoadMore();
          }
        }}
        scrollEventThrottle={400}
      >
        {/* Loading State */}
        {isLoading && (
          <View style={styles.skeletonContainer}>
            <SkeletonLoader height={68} borderRadius={16} style={{ marginBottom: 10 }} />
            <SkeletonLoader height={68} borderRadius={16} style={{ marginBottom: 10 }} />
            <SkeletonLoader height={68} borderRadius={16} style={{ marginBottom: 10 }} />
          </View>
        )}

        {/* Error State */}
        {isError && <ErrorView message="Failed to load income history" onRetry={refetch} />}

        {/* Empty State */}
        {!isLoading && !isError && paginatedFeed.length === 0 && (
          <EmptyState
            emoji="💵"
            title="No income records found"
            description={
              isFiltered || searchQuery.trim()
                ? 'No income records match your search or filters.'
                : 'You have not added any income entries yet.'
            }
            ctaText="Add Income"
            onCtaPress={() => setAddModalVisible(true)}
            ctaIcon="add-circle"
          />
        )}

        {/* Income Feed Grouped by Date */}
        {paginatedFeed.length > 0 && (
          <View style={styles.incomeFeedList}>
            {(() => {
              let lastDateHeading = '';
              return paginatedFeed.map((item) => {
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
                        <Text style={[styles.dateHeaderText, isDark && styles.dateHeaderTextDark]}>
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
                          style={[styles.dateText, isDark && { color: 'rgba(255, 255, 255, 0.4)' }]}
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
        )}

        {displayLimit < filteredIncomes.length && (
          <View style={styles.loadingMore}>
            <ActivityIndicator size="small" color="#10B981" />
            <Text style={styles.loadingMoreText}>Loading more income entries...</Text>
          </View>
        )}
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
          contentContainerStyle={styles.filterModalScroll}
        >
          {/* Source Filter */}
          <Text style={[styles.modalSectionTitle, isDark && styles.modalSectionTitleDark]}>
            Income Source
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.pillsContainer}
          >
            {SOURCE_OPTIONS.map((src) => {
              const isSelected = activeSource === src;
              return (
                <TouchableOpacity
                  key={src}
                  style={[
                    styles.pillCard,
                    isDark && styles.pillCardDark,
                    isSelected && (isDark ? styles.pillCardActiveDark : styles.pillCardActive),
                  ]}
                  onPress={() => setActiveSource(src)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.pillText,
                      isDark && styles.pillTextDark,
                      isSelected && (isDark ? styles.pillTextActiveDark : styles.pillTextActive),
                    ]}
                  >
                    {src}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Timeframe Filter */}
          <Text
            style={[
              styles.modalSectionTitle,
              isDark && styles.modalSectionTitleDark,
              { marginTop: 14 },
            ]}
          >
            Timeframe
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.pillsContainer}
          >
            {DATE_RANGE_OPTIONS.map((opt) => {
              const isSelected = dateRange === opt.value;
              return (
                <TouchableOpacity
                  key={opt.value}
                  style={[
                    styles.pillCard,
                    isDark && styles.pillCardDark,
                    isSelected && (isDark ? styles.pillCardActiveDark : styles.pillCardActive),
                  ]}
                  onPress={() => setDateRange(opt.value)}
                  activeOpacity={0.8}
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

          {/* Sort By Filter */}
          <Text
            style={[
              styles.modalSectionTitle,
              isDark && styles.modalSectionTitleDark,
              { marginTop: 14 },
            ]}
          >
            Sort Order
          </Text>
          <View style={styles.sortGrid}>
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
                setActiveSource('All');
                setDateRange('all-time');
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
              <Text style={styles.applyBtnText}>Apply</Text>
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
            filteredIncomes.map((i) => ({
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
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f1f1',
  },
  tabHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backBtn: {
    padding: 4,
  },
  tabTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.onSurface,
    letterSpacing: -0.3,
  },
  tabTitleDark: {
    color: '#F9FAFB',
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  iconBtn: {
    padding: 8,
    borderRadius: 12,
  },
  filterBtnActive: {
    backgroundColor: '#e2dfff',
  },
  alwaysSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginTop: 8,
    minHeight: 50,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainer,
  },
  alwaysSearchContainerDark: {
    backgroundColor: '#101917',
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  alwaysSearchInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.onSurface,
    padding: 0,
  },
  activeFiltersRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
    paddingHorizontal: 2,
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
  activeFilterBadgeText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  scrollContent: {
    paddingTop: 0,
    paddingBottom: 100,
  },
  skeletonContainer: {
    paddingHorizontal: 16,
  },
  // --- Overview Stats Cards ---
  overviewSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
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
  // --- Income History Feed ---
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
  loadingMore: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  loadingMoreText: {
    fontSize: 13,
    color: COLORS.outline,
    fontWeight: '500',
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
  // --- Modals ---
  filterModalScroll: {
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
  sortGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
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
  monthCellSelected: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
  },
  monthCellSelectedDark: {
    backgroundColor: '#34D399',
    borderColor: '#34D399',
  },
  sortCellText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  sortCellTextDark: {
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
