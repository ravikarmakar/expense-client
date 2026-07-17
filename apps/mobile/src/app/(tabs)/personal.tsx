import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  NativeScrollEvent,
  Modal,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { COLORS, CURRENCY_SYMBOL, CATEGORY_ICONS } from '../../constants/theme';
import { AddExpenseModal } from '../../components/AddExpenseModal';
import { ExpenseItem } from '../../components/ExpenseItem';
import { ExpenseItemSkeleton } from '../../components/ExpenseItemSkeleton';
import { SkeletonLoader } from '../../components/SkeletonLoader';
import { ErrorView } from '../../components/ErrorView';
import { EmptyState } from '../../components/EmptyState';
import { useExpenses, useMe, type ExpenseCategory } from '@workspace/api';
import { getDateHeading } from '../../utils/date';

const PERSONAL_CATEGORIES = [
  'Food',
  'Transport',
  'Shopping',
  'Entertainment',
  'Bills',
  'Travel',
  'Health',
  'Other',
] as const;

export default function PersonalTabScreen() {
  const [addExpenseVisible, setAddExpenseVisible] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { data: user } = useMe();
  const insets = useSafeAreaInsets();

  const {
    data: expensesData,
    isLoading,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useExpenses({
    personal: true,
    ...(selectedCategoryFilter && { category: selectedCategoryFilter as ExpenseCategory }),
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  const expensesList = React.useMemo(() => {
    return expensesData?.pages.flatMap((page) => page.expenses) ?? [];
  }, [expensesData]);

  // Compute total spent on personal expenses (overall)
  const totalSpent = React.useMemo(() => {
    return expensesList.reduce((sum, item) => sum + item.amount, 0);
  }, [expensesList]);

  // Compute category breakdown totals for the carousel
  const categoryTotals = React.useMemo(() => {
    const totals: Record<string, number> = {};
    PERSONAL_CATEGORIES.forEach((cat) => {
      totals[cat] = 0;
    });

    expensesList.forEach((exp) => {
      const cat = exp.category;
      if (cat in totals) {
        totals[cat] += exp.amount;
      } else {
        totals['Other'] = (totals['Other'] ?? 0) + exp.amount;
      }
    });

    return PERSONAL_CATEGORIES.map((cat) => ({
      name: cat,
      amount: totals[cat] ?? 0,
      iconConfig: CATEGORY_ICONS[cat] ?? CATEGORY_ICONS.Other,
    }));
  }, [expensesList]);

  const isCloseToBottom = ({
    layoutMeasurement,
    contentOffset,
    contentSize,
  }: NativeScrollEvent) => {
    const paddingToBottom = 50;
    return layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;
  };

  return (
    <View style={styles.container}>
      {/* Header section */}
      <View style={[styles.headerContainer, { paddingTop: insets.top + 16 }]}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerTitle}>My Expenses</Text>
            <Text style={styles.headerSubtitle}>Personal Budget</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <TouchableOpacity
              style={styles.personalWalletBtn}
              activeOpacity={0.7}
              onPress={() => router.push('/personal-wallet')}
            >
              <Ionicons name="wallet-sharp" size={30} color={COLORS.secondary} />
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.7} onPress={() => setMenuVisible(true)}>
              <Ionicons name="ellipsis-vertical" size={26} color={COLORS.onSurface} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, styles.scrollContentExtra]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
        onScroll={({ nativeEvent }) => {
          if (isCloseToBottom(nativeEvent) && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        }}
        scrollEventThrottle={400}
      >
        {/* Premium Total Spent Card */}
        <View style={styles.premiumCard}>
          <View style={styles.cardCircle1} />
          <View style={styles.cardCircle2} />
          <Text style={styles.cardLabel}>Total Personal Expenses</Text>
          {isLoading ? (
            <SkeletonLoader
              width={140}
              height={32}
              borderRadius={6}
              style={{ marginVertical: 4, backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
            />
          ) : (
            <Text style={styles.cardValue}>
              {CURRENCY_SYMBOL}
              {totalSpent.toLocaleString('en-IN', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Text>
          )}
          <View style={styles.cardFooter}>
            <Ionicons name="shield-checkmark-sharp" size={14} color="rgba(255, 255, 255, 0.7)" />
            <Text style={styles.cardFooterText}>Tracking strictly offline/personal items</Text>
          </View>
        </View>

        {/* Category breakdown carousel */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Category Spending</Text>
          {selectedCategoryFilter && (
            <TouchableOpacity onPress={() => setSelectedCategoryFilter(null)}>
              <Text style={styles.clearFilterText}>Clear Filter</Text>
            </TouchableOpacity>
          )}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.carouselContainer}
        >
          {categoryTotals.map((cat) => {
            const isSelected = selectedCategoryFilter === cat.name;
            return (
              <TouchableOpacity
                key={cat.name}
                style={[
                  styles.categoryPill,
                  { backgroundColor: cat.iconConfig.bg },
                  isSelected && styles.categoryPillActive,
                ]}
                onPress={() => setSelectedCategoryFilter(isSelected ? null : cat.name)}
                activeOpacity={0.8}
              >
                <View style={styles.categoryPillLeft}>
                  <View
                    style={[
                      styles.categoryIconBg,
                      { backgroundColor: isSelected ? '#ffffff' : 'rgba(255, 255, 255, 0.6)' },
                    ]}
                  >
                    {cat.iconConfig.lib === 'Ionicons' ? (
                      <Ionicons
                        name={cat.iconConfig.icon as React.ComponentProps<typeof Ionicons>['name']}
                        size={14}
                        color={cat.iconConfig.color}
                      />
                    ) : (
                      <MaterialIcons
                        name={
                          cat.iconConfig.icon as React.ComponentProps<typeof MaterialIcons>['name']
                        }
                        size={14}
                        color={cat.iconConfig.color}
                      />
                    )}
                  </View>
                  <Text
                    style={[
                      styles.categoryPillLabel,
                      { color: isSelected ? '#ffffff' : COLORS.onSurfaceVariant },
                    ]}
                  >
                    {cat.name}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.categoryPillAmount,
                    { color: isSelected ? '#ffffff' : cat.iconConfig.color },
                  ]}
                >
                  {CURRENCY_SYMBOL}
                  {cat.amount.toFixed(0)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={[styles.sectionHeader, styles.mtNormal]}>
          <Text style={styles.sectionTitle}>Expense History</Text>
        </View>

        {/* Loading State */}
        {isLoading && (
          <View>
            <ExpenseItemSkeleton />
            <ExpenseItemSkeleton />
            <ExpenseItemSkeleton />
            <ExpenseItemSkeleton />
            <ExpenseItemSkeleton />
            <ExpenseItemSkeleton />
          </View>
        )}

        {/* Error State */}
        {isError && <ErrorView message="Failed to load personal expenses" onRetry={refetch} />}

        {/* Empty State */}
        {!isLoading && !isError && expensesList.length === 0 && (
          <EmptyState
            emoji="🏷️"
            title="No personal expenses yet"
            description={
              selectedCategoryFilter
                ? `No personal expenses recorded under ${selectedCategoryFilter} yet.`
                : "You haven't recorded any personal expenses. Click the FAB button to add one!"
            }
          />
        )}

        {/* Expenses List */}
        {expensesList.length > 0 && (
          <View style={styles.expensesFeed}>
            {(() => {
              let lastDateHeading = '';
              return expensesList.map((expense) => {
                const currentHeading = getDateHeading(expense.date);
                const showHeading = currentHeading !== lastDateHeading;
                lastDateHeading = currentHeading;

                return (
                  <React.Fragment key={expense.id}>
                    {showHeading && (
                      <View style={styles.dateHeaderContainer}>
                        <Text style={styles.dateHeaderText}>{currentHeading}</Text>
                      </View>
                    )}
                    <ExpenseItem expense={expense} currentUserId={user?.id} />
                  </React.Fragment>
                );
              });
            })()}
          </View>
        )}

        {isFetchingNextPage && (
          <View style={styles.loadingMore}>
            <ActivityIndicator size="small" color={COLORS.secondary} />
            <Text style={styles.loadingMoreText}>Loading more...</Text>
          </View>
        )}
      </ScrollView>

      {/* Floating Action Button (FAB) */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.85}
        onPress={() => setAddExpenseVisible(true)}
      >
        <Ionicons name="add" size={32} color="#ffffff" />
      </TouchableOpacity>

      {/* Add Expense Modal */}
      <AddExpenseModal
        visible={addExpenseVisible}
        initialExpenseType="PERSONAL"
        onClose={() => setAddExpenseVisible(false)}
        onSuccess={refetch}
      />

      {/* 3-Dot Dropdown Menu Modal */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setMenuVisible(false)}
        >
          <View style={[styles.dropdownMenu, { top: insets.top + 56 }]}>
            <TouchableOpacity
              style={styles.dropdownItem}
              activeOpacity={0.7}
              onPress={() => {
                setMenuVisible(false);
                router.push('/total-spent');
              }}
            >
              <Ionicons name="bar-chart-outline" size={20} color={COLORS.secondary} />
              <Text style={styles.dropdownItemText}>Analytics</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingTop: 12,
    paddingBottom: 100,
    paddingHorizontal: 0,
  },
  headerContainer: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f1f1',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  personalWalletBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  personalWalletBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.onSurface,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.onSurface,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 12,
    color: COLORS.outline,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 2,
  },
  scrollContentExtra: {
    paddingTop: 16,
  },
  premiumCard: {
    backgroundColor: COLORS.secondary,
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    marginHorizontal: 16,
    overflow: 'hidden',
    position: 'relative',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  cardCircle1: {
    position: 'absolute',
    borderRadius: 999,
    width: 140,
    height: 140,
    top: -40,
    right: -40,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  cardCircle2: {
    position: 'absolute',
    borderRadius: 999,
    width: 80,
    height: 80,
    bottom: -30,
    left: -10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.secondaryFixed,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
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
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
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
  carouselContainer: {
    paddingHorizontal: 16,
    paddingBottom: 4,
    gap: 12,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 16,
    minWidth: 140,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  categoryPillActive: {
    backgroundColor: COLORS.secondary + 'dd',
    borderColor: COLORS.secondary,
  },
  categoryPillLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryIconBg: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryPillLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  categoryPillAmount: {
    fontSize: 14,
    fontWeight: '800',
  },
  mtNormal: {
    marginTop: 20,
  },
  expensesFeed: {},
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
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    zIndex: 40,
  },
  dateHeaderContainer: {
    backgroundColor: COLORS.surfaceContainerLow,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceContainer,
  },
  dateHeaderText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.outline,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  dropdownMenu: {
    position: 'absolute',
    right: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 6,
    minWidth: 145,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#e8ece9',
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 10,
    borderRadius: 8,
  },
  dropdownItemText: {
    fontSize: 14.5,
    fontWeight: '600',
    color: COLORS.onSurface,
  },
});
