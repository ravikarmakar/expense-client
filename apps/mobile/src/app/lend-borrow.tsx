import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, CURRENCY_SYMBOL } from '../constants/theme';
import { useLoans, useLoanSummary, type Loan } from '@workspace/api';
import { TopAppBar } from '../components/TopAppBar';
import { useTheme } from '../context/ThemeContext';
import { AppBackground } from '../components/AppBackground';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { LendBorrowSummaryCard } from '../components/LendBorrowSummaryCard';
import { AddLoanModal } from '../components/AddLoanModal';
import { LoanDetailModal } from '../components/LoanDetailModal';
import { useExport } from '../hooks/useExport';
import { ExportModalBottomSheet } from '../components/ExportModalBottomSheet';
import { ExportProgressAndSuccessModal } from '../components/ExportProgressAndSuccessModal';
import { hapticFeedback } from '../utils/haptics';

type FilterOption = 'ALL' | 'LEND' | 'BORROW' | 'SETTLED';

const FILTER_PILLS: { id: FilterOption; label: string; icon: string }[] = [
  { id: 'ALL', label: 'All Records', icon: 'layers-outline' },
  { id: 'LEND', label: 'Lent (Owed)', icon: 'arrow-down-circle-outline' },
  { id: 'BORROW', label: 'Borrowed (Owed)', icon: 'arrow-up-circle-outline' },
  { id: 'SETTLED', label: 'Settled', icon: 'checkmark-circle-outline' },
];

function LoanSkeleton({ isDark = false }: { isDark?: boolean }) {
  return (
    <View style={styles.skeletonContainer}>
      {[1, 2, 3, 4].map((i) => (
        <View
          key={i}
          style={[
            styles.skeletonCard,
            isDark && {
              backgroundColor: '#101917',
              borderColor: 'rgba(255, 255, 255, 0.08)',
            },
          ]}
        >
          <SkeletonLoader width={44} height={44} borderRadius={22} />
          <View style={{ flex: 1, gap: 8 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <SkeletonLoader width={110} height={14} borderRadius={4} />
              <SkeletonLoader width={60} height={14} borderRadius={4} />
            </View>
            <SkeletonLoader width="80%" height={12} borderRadius={4} />
          </View>
        </View>
      ))}
    </View>
  );
}

export default function LendBorrowScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const variant = isDark ? 'dark' : 'light';

  const [activeFilter, setActiveFilter] = useState<FilterOption>('ALL');

  const [addModalVisible, setAddModalVisible] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Export Hook
  const exportHook = useExport();

  const { data: summaryData, refetch: refetchSummary } = useLoanSummary();

  const isNetPositive = (summaryData?.netBalance ?? 0) >= 0;
  const fabBgColor = isNetPositive
    ? isDark
      ? '#114B45'
      : '#0F766E'
    : isDark
      ? '#6B1226'
      : '#9F1239';

  const {
    data,
    isLoading,
    refetch: refetchLoans,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useLoans({
    type: activeFilter === 'LEND' || activeFilter === 'BORROW' ? activeFilter : 'ALL',
    status: activeFilter === 'SETTLED' ? 'SETTLED' : 'ALL',
  });

  const loans = useMemo(() => {
    return data?.pages.flatMap((page) => page.loans) ?? [];
  }, [data]);

  const exportableLoans = useMemo(() => {
    return loans.map((l) => ({
      id: l.id,
      title: `${l.type === 'LEND' ? 'Lent to' : 'Borrowed from'} ${l.personName}`,
      amount: l.amount,
      category: l.type === 'LEND' ? 'Lend' : 'Borrow',
      date: l.date,
      notes: l.notes || undefined,
      paymentMethod: l.paymentMethod,
    }));
  }, [loans]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([refetchLoans(), refetchSummary()]);
    setIsRefreshing(false);
  };

  return (
    <AppBackground style={[styles.container, isDark && { backgroundColor: '#070E0C' }]}>
      <TopAppBar
        title="Lend & Borrow"
        showBack
        onBack={() => router.back()}
        variant={variant}
        rightActions={
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <TouchableOpacity
              style={[styles.headerIconBtn, isDark && styles.headerIconBtnDark]}
              onPress={() => router.push('/personal-analytics')}
              activeOpacity={0.7}
            >
              <Ionicons
                name="bar-chart-outline"
                size={22}
                color={isDark ? '#F9FAFB' : COLORS.onSurface}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.headerIconBtn, isDark && styles.headerIconBtnDark]}
              onPress={() => exportHook.setExportModalVisible(true)}
              activeOpacity={0.7}
            >
              <Ionicons
                name="download-outline"
                size={24}
                color={isDark ? '#F9FAFB' : COLORS.onSurface}
              />
            </TouchableOpacity>
          </View>
        }
      />

      {/* Main Container */}
      <View style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingBottom: 90 + insets.bottom }]}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={isDark ? '#10B981' : COLORS.primary}
              colors={[isDark ? '#10B981' : COLORS.primary]}
            />
          }
          showsVerticalScrollIndicator={false}
        >
          {/* Summary Banner Card */}
          <LendBorrowSummaryCard summary={summaryData} isDark={isDark} />

          {/* Section Header Row with View History Link */}
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitle, isDark && { color: '#F9FAFB' }]}>
              Recent Records
            </Text>

            <TouchableOpacity
              style={[
                styles.viewHistoryBtn,
                isDark && { backgroundColor: 'rgba(129, 140, 248, 0.15)' },
              ]}
              onPress={() => {
                hapticFeedback.selection();
                router.push('/lend-borrow-history');
              }}
              activeOpacity={0.7}
            >
              <Text style={[styles.viewHistoryText, isDark && { color: '#818CF8' }]}>
                View History
              </Text>
              <Ionicons name="chevron-forward" size={16} color={isDark ? '#818CF8' : '#6366F1'} />
            </TouchableOpacity>
          </View>

          {/* Filter Pills */}
          <View style={styles.filterBar}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8 }}
            >
              {FILTER_PILLS.map((pill) => {
                const isSelected = activeFilter === pill.id;
                return (
                  <TouchableOpacity
                    key={pill.id}
                    style={[
                      styles.filterPill,
                      isDark && styles.filterPillDark,
                      isSelected &&
                        (isDark ? styles.filterPillActiveDark : styles.filterPillActiveLight),
                    ]}
                    onPress={() => setActiveFilter(pill.id)}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name={pill.icon as never}
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
                      {pill.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Loans List */}
          {isLoading ? (
            <LoanSkeleton isDark={isDark} />
          ) : loans.length > 0 ? (
            <View style={styles.loansList}>
              {loans.map((item) => {
                const isLend = item.type === 'LEND';
                const isSettled = item.status === 'SETTLED';
                const nameLower = item.personName.toLowerCase();
                const isBank =
                  nameLower.includes('bank') ||
                  nameLower.includes('hdfc') ||
                  nameLower.includes('sbi') ||
                  nameLower.includes('icici') ||
                  nameLower.includes('axis') ||
                  nameLower.includes('kotak');
                const isApp =
                  nameLower.includes('cred') ||
                  nameLower.includes('navi') ||
                  nameLower.includes('slice') ||
                  nameLower.includes('moneyview') ||
                  nameLower.includes('kreditbee') ||
                  nameLower.includes('pay');

                return (
                  <TouchableOpacity
                    key={item.id}
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
                          {item.remainingAmount.toFixed(2)}
                        </Text>
                      ) : null}
                    </View>
                  </TouchableOpacity>
                );
              })}

              {hasNextPage && (
                <TouchableOpacity
                  style={[styles.loadMoreBtn, isDark && styles.loadMoreBtnDark]}
                  onPress={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  activeOpacity={0.8}
                >
                  {isFetchingNextPage ? (
                    <ActivityIndicator size="small" color={isDark ? '#10B981' : COLORS.primary} />
                  ) : (
                    <Text style={[styles.loadMoreText, isDark && { color: '#10B981' }]}>
                      Load More
                    </Text>
                  )}
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <View style={[styles.emptyOuterCircle, isDark && styles.emptyOuterCircleDark]}>
                <View style={[styles.emptyInnerCircle, isDark && styles.emptyInnerCircleDark]}>
                  <Ionicons
                    name="hand-left-outline"
                    size={40}
                    color={isDark ? '#74817B' : COLORS.outline}
                  />
                </View>
              </View>
              <Text style={[styles.emptyTitle, isDark && { color: '#F9FAFB' }]}>
                No Lend or Borrow Records
              </Text>
              <Text style={[styles.emptySubtitle, isDark && { color: '#9CA3AF' }]}>
                Record money you lent to friends or borrowed from contacts to keep track of
                balances.
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Floating Action Button */}
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: fabBgColor, shadowColor: fabBgColor }]}
          onPress={() => setAddModalVisible(true)}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={28} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {/* Add Loan Modal */}
      <AddLoanModal
        visible={addModalVisible}
        onClose={() => setAddModalVisible(false)}
        onSuccess={() => {
          refetchLoans();
          refetchSummary();
        }}
        variant={variant}
      />

      {/* Loan Detail Modal */}
      <LoanDetailModal
        visible={!!selectedLoan}
        onClose={() => setSelectedLoan(null)}
        loan={selectedLoan}
        onSuccess={() => {
          refetchLoans();
          refetchSummary();
        }}
        variant={variant}
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
        onConfirmExport={() => exportHook.executeExport(exportableLoans, 'User', 'personal')}
        variant={variant}
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
  headerIconBtn: {
    padding: 6,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
  },
  headerIconBtnDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
    marginTop: 14,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: COLORS.onSurface,
  },
  viewHistoryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(99, 102, 241, 0.08)',
  },
  viewHistoryText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#6366F1',
  },
  filterBar: {
    marginBottom: 16,
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
  loansList: {
    gap: 12,
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
    fontSize: 14.5,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  appUserTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: 'rgba(52, 211, 153, 0.15)',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 6,
  },
  appUserTagText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#10B981',
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
  typeTagLendLight: { backgroundColor: '#E6F4EA' },
  typeTagLendDark: { backgroundColor: 'rgba(52, 211, 153, 0.15)' },
  typeTagBorrowLight: { backgroundColor: '#FCE8E6' },
  typeTagBorrowDark: { backgroundColor: 'rgba(248, 113, 113, 0.15)' },
  typeTagText: { fontSize: 10, fontWeight: '800' },
  cardDateText: { fontSize: 11, color: COLORS.outline },
  dueDateText: { fontSize: 10.5, fontWeight: '700', color: '#D97706' },
  cardRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  cardAmount: {
    fontSize: 15,
    fontWeight: '800',
  },
  settledBadge: {
    backgroundColor: '#E6F4EA',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  settledBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#10B981',
  },
  remainingText: {
    fontSize: 10.5,
    color: COLORS.outline,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
    paddingVertical: 40,
  },
  emptyOuterCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: COLORS.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.surfaceContainer,
    marginBottom: 16,
  },
  emptyOuterCircleDark: {
    backgroundColor: '#101917',
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  emptyInnerCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyInnerCircleDark: {
    backgroundColor: '#14231E',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.onSurface,
    textAlign: 'center',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 12.5,
    color: COLORS.outline,
    textAlign: 'center',
    lineHeight: 18,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    zIndex: 40,
  },
  skeletonContainer: {
    gap: 12,
  },
  skeletonCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainer,
    gap: 14,
  },
  loadMoreBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 8,
    backgroundColor: COLORS.surfaceContainerLow,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainer,
    borderRadius: 14,
  },
  loadMoreBtnDark: {
    backgroundColor: '#101917',
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  loadMoreText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '700',
  },
});
