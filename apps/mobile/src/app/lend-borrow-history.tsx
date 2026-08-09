import React, { useState, useMemo, useCallback } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  NativeScrollEvent,
  TextInput,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, CURRENCY_SYMBOL } from '../constants/theme';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { AddLoanModal } from '../components/AddLoanModal';
import { EditLoanModal } from '../components/EditLoanModal';
import { LoanDetailModal } from '../components/LoanDetailModal';
import { useTheme } from '../context/ThemeContext';
import { ErrorView } from '../components/ErrorView';
import { EmptyState } from '../components/EmptyState';
import { useLoans, type Loan } from '@workspace/api';
import { getDateHeading } from '../utils/date';
import { useExport } from '../hooks/useExport';
import { ExportModalBottomSheet } from '../components/ExportModalBottomSheet';
import { ExportProgressAndSuccessModal } from '../components/ExportProgressAndSuccessModal';
import { BottomSheetModal } from '../components/BottomSheetModal';
import { AppBackground } from '../components/AppBackground';
import { hapticFeedback } from '../utils/haptics';

const TYPE_FILTER_OPTIONS = [
  { id: 'ALL', label: 'All Records', icon: 'infinite-outline' },
  { id: 'LEND', label: 'Lent (Owed)', icon: 'arrow-down-circle-outline' },
  { id: 'BORROW', label: 'Borrowed (Owed)', icon: 'arrow-up-circle-outline' },
  { id: 'SETTLED', label: 'Settled', icon: 'checkmark-done-circle-outline' },
  { id: 'BANK_APP', label: 'Banks & Loan Apps', icon: 'business-outline' },
] as const;

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

export default function LendBorrowHistoryScreen() {
  const params = useLocalSearchParams<{ type?: string; status?: string }>();
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const variant = isDark ? 'dark' : 'light';
  const exportHook = useExport();

  const { data, isLoading, isError, refetch } = useLoans({
    type: 'ALL',
    status: 'ALL',
  });

  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editingLoan, setEditingLoan] = useState<Loan | null>(null);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [filterModalVisible, setFilterModalVisible] = useState(false);

  // Filters & Search
  const [activeTypeFilter, setActiveTypeFilter] = useState<string>(params.type || 'ALL');
  const [dateRange, setDateRange] = useState<string>('all-time');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'>(
    'date-desc'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const rawLoans = useMemo(() => {
    return data?.pages.flatMap((page) => page.loans) ?? [];
  }, [data]);

  // Filtered & Sorted Loans
  const filteredLoans = useMemo(() => {
    let list = [...rawLoans];

    // Type / Category Filter
    if (activeTypeFilter === 'LEND') {
      list = list.filter((l) => l.type === 'LEND' && l.status !== 'SETTLED');
    } else if (activeTypeFilter === 'BORROW') {
      list = list.filter((l) => l.type === 'BORROW' && l.status !== 'SETTLED');
    } else if (activeTypeFilter === 'SETTLED') {
      list = list.filter((l) => l.status === 'SETTLED');
    } else if (activeTypeFilter === 'BANK_APP') {
      list = list.filter((l) => {
        const n = l.personName.toLowerCase();
        return (
          n.includes('bank') ||
          n.includes('hdfc') ||
          n.includes('sbi') ||
          n.includes('icici') ||
          n.includes('cred') ||
          n.includes('navi') ||
          n.includes('slice') ||
          n.includes('moneyview') ||
          n.includes('pay')
        );
      });
    }

    // Search Query Filter
    if (debouncedSearchQuery.trim() !== '') {
      const q = debouncedSearchQuery.trim().toLowerCase();
      list = list.filter(
        (l) =>
          l.personName.toLowerCase().includes(q) ||
          (l.personEmail && l.personEmail.toLowerCase().includes(q)) ||
          (l.notes && l.notes.toLowerCase().includes(q)) ||
          (l.paymentMethod && l.paymentMethod.toLowerCase().includes(q)) ||
          l.amount.toString().includes(q)
      );
    }

    // Date Range Filter
    if (dateRange !== 'all-time') {
      const now = new Date();
      list = list.filter((item) => {
        const itemDate = new Date(item.date);
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
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      if (sortBy === 'date-desc') return dateB - dateA;
      if (sortBy === 'date-asc') return dateA - dateB;
      if (sortBy === 'amount-desc') return b.amount - a.amount;
      if (sortBy === 'amount-asc') return a.amount - b.amount;
      return 0;
    });

    return list;
  }, [rawLoans, activeTypeFilter, debouncedSearchQuery, dateRange, sortBy]);

  // Client-side pagination
  const BATCH_SIZE = 15;
  const [displayLimit, setDisplayLimit] = useState<number>(BATCH_SIZE);
  const [isRefreshing, setIsRefreshing] = useState(false);

  React.useEffect(() => {
    setDisplayLimit(BATCH_SIZE);
  }, [activeTypeFilter, dateRange, sortBy, debouncedSearchQuery]);

  const paginatedFeed = useMemo(() => {
    return filteredLoans.slice(0, displayLimit);
  }, [filteredLoans, displayLimit]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    setDisplayLimit(BATCH_SIZE);
    await refetch();
    setIsRefreshing(false);
  }, [refetch]);

  const handleLoadMore = useCallback(() => {
    if (displayLimit < filteredLoans.length) {
      setDisplayLimit((prev) => prev + BATCH_SIZE);
    }
  }, [displayLimit, filteredLoans.length]);

  const isCloseToBottom = ({
    layoutMeasurement,
    contentOffset,
    contentSize,
  }: NativeScrollEvent) => {
    const paddingToBottom = 50;
    return layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;
  };

  const isFiltered =
    activeTypeFilter !== 'ALL' || dateRange !== 'all-time' || sortBy !== 'date-desc';

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
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="arrow-back" size={22} color={isDark ? '#F3F4F6' : COLORS.onSurface} />
            </TouchableOpacity>
            <Text
              style={[styles.tabTitle, isDark && styles.tabTitleDark]}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.85}
            >
              Lend & Borrow History
            </Text>
          </View>

          <View style={styles.headerRightActions}>
            <TouchableOpacity
              style={[styles.iconBtn, isDark && { backgroundColor: 'rgba(255, 255, 255, 0.08)' }]}
              onPress={() => router.push('/personal-analytics')}
              activeOpacity={0.7}
            >
              <Ionicons
                name="bar-chart-outline"
                size={22}
                color={isDark ? '#F3F4F6' : COLORS.onSurface}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.iconBtn,
                isDark && { backgroundColor: 'rgba(255, 255, 255, 0.08)' },
                isFiltered && styles.filterBtnActive,
              ]}
              onPress={() => setFilterModalVisible(true)}
              activeOpacity={0.7}
            >
              <Ionicons
                name="options-outline"
                size={24}
                color={isFiltered ? '#818CF8' : isDark ? '#F3F4F6' : COLORS.onSurface}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.iconBtn, isDark && { backgroundColor: 'rgba(255, 255, 255, 0.08)' }]}
              activeOpacity={0.7}
              onPress={() => exportHook.setExportModalVisible(true)}
            >
              <Ionicons
                name="download-outline"
                size={24}
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
            placeholder="Search by person, bank, app, notes..."
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

        {/* Type Category Filter Horizontal Scroll */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterPillsRow}
        >
          {TYPE_FILTER_OPTIONS.map((opt) => {
            const isSelected = activeTypeFilter === opt.id;
            return (
              <TouchableOpacity
                key={opt.id}
                style={[
                  styles.filterPill,
                  isDark && styles.filterPillDark,
                  isSelected &&
                    (isDark ? styles.filterPillActiveDark : styles.filterPillActiveLight),
                ]}
                onPress={() => {
                  hapticFeedback.selection();
                  setActiveTypeFilter(opt.id);
                }}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={opt.icon as never}
                  size={15}
                  color={isSelected ? '#ffffff' : isDark ? '#9CA3AF' : COLORS.outline}
                />
                <Text
                  style={[
                    styles.filterPillText,
                    isDark && { color: '#9CA3AF' },
                    isSelected && styles.filterPillTextActive,
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor="#6366F1" />
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
        {isError && <ErrorView message="Failed to load loan history" onRetry={refetch} />}

        {/* Empty State */}
        {!isLoading && !isError && paginatedFeed.length === 0 && (
          <EmptyState
            emoji="🤝"
            title="No records found"
            description={
              isFiltered || searchQuery.trim()
                ? 'No lend or borrow records match your search query or selected filters.'
                : 'You have not recorded any lend or borrow transactions yet.'
            }
            ctaText="Add Record"
            onCtaPress={() => setAddModalVisible(true)}
            ctaIcon="add-circle"
          />
        )}

        {/* Loan Feed Grouped by Date */}
        {paginatedFeed.length > 0 && (
          <View style={styles.loansList}>
            {(() => {
              let lastDateHeading = '';
              return paginatedFeed.map((item) => {
                const currentHeading = getDateHeading(item.date);
                const showHeading = currentHeading !== lastDateHeading;
                lastDateHeading = currentHeading;

                const isLend = item.type === 'LEND';
                const isSettled = item.status === 'SETTLED';
                const nameLower = item.personName.toLowerCase();
                const isBank =
                  nameLower.includes('bank') ||
                  nameLower.includes('hdfc') ||
                  nameLower.includes('sbi') ||
                  nameLower.includes('icici') ||
                  nameLower.includes('axis');
                const isApp =
                  nameLower.includes('cred') ||
                  nameLower.includes('navi') ||
                  nameLower.includes('slice') ||
                  nameLower.includes('moneyview') ||
                  nameLower.includes('pay');

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

                    <TouchableOpacity
                      style={[styles.loanCard, isDark && styles.loanCardDark]}
                      onPress={() => setSelectedLoan(item)}
                      activeOpacity={0.85}
                    >
                      <Image
                        source={{
                          uri:
                            item.personImage ||
                            'https://lh3.googleusercontent.com/aida-public/AB6AXuD5T5AJUovvhA_WnRPgEHHUebHGXF5_1EiHG95y-QfKq2nOO07Mu6O3nzSp4AjHOG8hjAGd0Le9T3VMsQ554EcRvn-FBqlSpjy3oLYsJUgXfzsRNskrMk9B58aBpvnyrr9dunlwrQ3t-uLtHtQ5AeVKOCn-64fTFblLeVHlXrsHWRLrpvOIYhhnMeriv4c4aLSPUpLcih10KZ6yXzN32ixRZd3TUiAozHsESLzxhXawBgffwZTpUF4UXguT6m8ijF1N9kQL0fwVx9xM',
                        }}
                        style={styles.cardAvatar}
                      />

                      <View style={styles.cardMiddle}>
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 6,
                            flexWrap: 'wrap',
                          }}
                        >
                          <Text style={[styles.cardPersonName, isDark && { color: '#F9FAFB' }]}>
                            {item.personName}
                          </Text>
                          {item.isRegisteredUser ? (
                            <View style={styles.appUserTag}>
                              <Ionicons name="checkmark-circle" size={10} color="#10B981" />
                              <Text style={styles.appUserTagText}>App</Text>
                            </View>
                          ) : isBank ? (
                            <View
                              style={[
                                styles.entityTag,
                                { backgroundColor: 'rgba(59, 130, 246, 0.15)' },
                              ]}
                            >
                              <Ionicons name="business-outline" size={10} color="#3B82F6" />
                              <Text style={[styles.entityTagText, { color: '#3B82F6' }]}>Bank</Text>
                            </View>
                          ) : isApp ? (
                            <View
                              style={[
                                styles.entityTag,
                                { backgroundColor: 'rgba(139, 92, 246, 0.15)' },
                              ]}
                            >
                              <Ionicons name="phone-portrait-outline" size={10} color="#8B5CF6" />
                              <Text style={[styles.entityTagText, { color: '#8B5CF6' }]}>
                                Loan App
                              </Text>
                            </View>
                          ) : null}
                        </View>

                        <View style={styles.cardMetaRow}>
                          <View
                            style={[
                              styles.typeTag,
                              isLend
                                ? isDark
                                  ? styles.typeTagLendDark
                                  : styles.typeTagLendLight
                                : isDark
                                  ? styles.typeTagBorrowDark
                                  : styles.typeTagBorrowLight,
                            ]}
                          >
                            <Text
                              style={[
                                styles.typeTagText,
                                isLend
                                  ? { color: isDark ? '#34D399' : '#10B981' }
                                  : { color: isDark ? '#F87171' : '#EF4444' },
                              ]}
                            >
                              {isLend ? 'Lent' : 'Borrowed'}
                            </Text>
                          </View>

                          <Text style={[styles.cardDateText, isDark && { color: '#9CA3AF' }]}>
                            {item.date}
                          </Text>

                          {item.dueDate && !isSettled && (
                            <Text style={styles.dueDateText}>Due: {item.dueDate}</Text>
                          )}
                        </View>
                      </View>

                      <View style={styles.cardRight}>
                        <Text
                          style={[
                            styles.cardAmount,
                            isLend
                              ? { color: isDark ? '#34D399' : '#10B981' }
                              : { color: isDark ? '#F87171' : '#EF4444' },
                          ]}
                        >
                          {isLend ? '+' : '-'}
                          {CURRENCY_SYMBOL}
                          {item.amount.toFixed(2)}
                        </Text>

                        {isSettled ? (
                          <View style={styles.settledBadge}>
                            <Text style={styles.settledBadgeText}>Settled</Text>
                          </View>
                        ) : item.paidAmount > 0 ? (
                          <Text style={[styles.remainingText, isDark && { color: '#9CA3AF' }]}>
                            Rem: {CURRENCY_SYMBOL}
                            {(item.amount - item.paidAmount).toFixed(2)}
                          </Text>
                        ) : null}
                      </View>
                    </TouchableOpacity>
                  </React.Fragment>
                );
              });
            })()}
          </View>
        )}

        {displayLimit < filteredLoans.length && (
          <View style={styles.loadingMore}>
            <ActivityIndicator size="small" color="#10B981" />
            <Text style={styles.loadingMoreText}>Loading more records...</Text>
          </View>
        )}
      </ScrollView>

      {/* Add Loan Modal */}
      <AddLoanModal
        visible={addModalVisible}
        onClose={() => setAddModalVisible(false)}
        onSuccess={refetch}
        variant={variant}
      />

      {/* Edit Loan Modal */}
      <EditLoanModal
        visible={!!editingLoan}
        onClose={() => setEditingLoan(null)}
        loan={editingLoan}
        onSuccess={refetch}
        variant={variant}
      />

      {/* Loan Detail Modal */}
      <LoanDetailModal
        visible={!!selectedLoan}
        onClose={() => setSelectedLoan(null)}
        loan={selectedLoan}
        onSuccess={refetch}
        variant={variant}
      />

      {/* Filter & Sort BottomSheet Modal */}
      <BottomSheetModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        title="Filter & Sort Records"
        description="Filter by type, timeframe, or amount sorting"
        variant={variant}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.filterModalScroll}
        >
          {/* Timeframe Filter */}
          <Text style={[styles.modalSectionTitle, isDark && styles.modalSectionTitleDark]}>
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
                    color={isSelected ? '#ffffff' : isDark ? '#9CA3AF' : COLORS.outline}
                  />
                  <Text
                    style={[
                      styles.pillText,
                      isDark && styles.pillTextDark,
                      isSelected && styles.pillTextActive,
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
                    color={isSelected ? '#ffffff' : isDark ? '#9CA3AF' : COLORS.onSurface}
                  />
                  <Text
                    style={[
                      styles.sortCellText,
                      isDark && styles.sortCellTextDark,
                      isSelected && styles.monthCellTextSelected,
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
                setActiveTypeFilter('ALL');
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

      {/* Export Bottom Sheet Modal */}
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
            filteredLoans.map((l) => ({
              id: l.id,
              title: `${l.type === 'LEND' ? 'Lent to' : 'Borrowed from'} ${l.personName}`,
              amount: l.amount,
              category: l.type === 'LEND' ? 'Lend' : 'Borrow',
              date: l.date,
              notes: l.notes || '',
              paymentMethod: l.paymentMethod,
            })),
            'User',
            'personal'
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
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingBottom: 10,
    backgroundColor: 'transparent',
  },
  tabHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerLeftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    marginRight: 6,
  },
  backBtn: {
    padding: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabTitle: {
    fontSize: 17.5,
    fontWeight: '800',
    color: COLORS.onSurface,
    flex: 1,
  },
  tabTitleDark: {
    color: '#ffffff',
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  iconBtn: {
    padding: 6,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
  },
  filterBtnActive: {
    backgroundColor: 'rgba(99, 102, 241, 0.12)',
  },
  alwaysSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: 16,
    paddingHorizontal: 14,
    height: 48,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainer,
    marginBottom: 10,
  },
  alwaysSearchContainerDark: {
    backgroundColor: '#101917',
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  alwaysSearchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.onSurface,
    fontWeight: '500',
  },
  filterPillsRow: {
    gap: 8,
    paddingVertical: 4,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: COLORS.surfaceContainerLow,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainer,
  },
  filterPillDark: {
    backgroundColor: '#101917',
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  filterPillActiveLight: {
    backgroundColor: '#6366F1',
    borderColor: '#6366F1',
  },
  filterPillActiveDark: {
    backgroundColor: '#6366F1',
    borderColor: '#6366F1',
  },
  filterPillText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: COLORS.onSurface,
  },
  filterPillTextActive: {
    color: '#ffffff',
    fontWeight: '800',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  skeletonContainer: {
    gap: 12,
  },
  loansList: {
    gap: 12,
  },
  dateHeaderContainer: {
    paddingVertical: 6,
    paddingHorizontal: 4,
    marginTop: 8,
  },
  dateHeaderContainerDark: {},
  dateHeaderText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.outline,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  dateHeaderTextDark: {
    color: '#D1D5DB',
  },
  loanCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainer,
    gap: 12,
  },
  loanCardDark: {
    backgroundColor: '#101917',
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  cardAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  cardMiddle: {
    flex: 1,
    gap: 4,
  },
  cardPersonName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  appUserTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 6,
  },
  appUserTagText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#6366F1',
  },
  entityTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  entityTagText: {
    fontSize: 9,
    fontWeight: '700',
  },
  cardMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  typeTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  typeTagLendLight: { backgroundColor: 'rgba(99, 102, 241, 0.12)' },
  typeTagLendDark: { backgroundColor: 'rgba(129, 140, 248, 0.18)' },
  typeTagBorrowLight: { backgroundColor: '#FCE8E6' },
  typeTagBorrowDark: { backgroundColor: 'rgba(248, 113, 113, 0.15)' },
  typeTagText: { fontSize: 10, fontWeight: '800' },
  cardDateText: {
    fontSize: 11.5,
    color: COLORS.outline,
  },
  dueDateText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#EF4444',
  },
  cardRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  cardAmount: {
    fontSize: 16,
    fontWeight: '800',
  },
  settledBadge: {
    backgroundColor: 'rgba(99, 102, 241, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  settledBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#6366F1',
  },
  remainingText: {
    fontSize: 10.5,
    color: COLORS.outline,
  },
  loadingMore: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  loadingMoreText: {
    fontSize: 12,
    color: COLORS.outline,
  },
  filterModalScroll: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  modalSectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.outline,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  modalSectionTitleDark: {
    color: '#9CA3AF',
  },
  pillsContainer: {
    gap: 8,
    paddingBottom: 4,
  },
  pillCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: COLORS.surfaceContainerLow,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainer,
  },
  pillCardDark: {
    backgroundColor: '#101917',
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  pillCardActive: {
    backgroundColor: '#6366F1',
    borderColor: '#6366F1',
  },
  pillCardActiveDark: {
    backgroundColor: '#6366F1',
    borderColor: '#6366F1',
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.onSurface,
  },
  pillTextDark: {
    color: '#9CA3AF',
  },
  pillTextActive: {
    color: '#ffffff',
    fontWeight: '800',
  },
  pillTextActiveDark: {
    color: '#ffffff',
    fontWeight: '800',
  },
  sortGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  sortCell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceContainerLow,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainer,
  },
  sortCellDark: {
    backgroundColor: '#101917',
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  monthCellSelected: {
    backgroundColor: '#6366F1',
    borderColor: '#6366F1',
  },
  monthCellSelectedDark: {
    backgroundColor: '#6366F1',
    borderColor: '#6366F1',
  },
  sortCellText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: COLORS.onSurface,
  },
  sortCellTextDark: {
    color: '#9CA3AF',
  },
  monthCellTextSelected: {
    color: '#ffffff',
    fontWeight: '800',
  },
  monthCellTextSelectedDark: {
    color: '#ffffff',
    fontWeight: '800',
  },
  modalActionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  resetBtn: {
    flex: 1,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surfaceContainerLow,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainer,
  },
  resetBtnDark: {
    backgroundColor: '#101917',
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  resetBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  resetBtnTextDark: {
    color: '#9CA3AF',
  },
  applyBtn: {
    flex: 1.5,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6366F1',
  },
  applyBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#ffffff',
  },
});
