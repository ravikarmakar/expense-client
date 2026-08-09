import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  TextInput,
  ScrollView,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, CURRENCY_SYMBOL, CATEGORY_ICONS } from '../../../constants/theme';
import { ExpenseItem } from '../../../components/ExpenseItem';
import { SettlementItem } from '../components/SettlementItem';
import { ExpenseItemSkeleton } from '../../../components/ExpenseItemSkeleton';
import {
  useGroupExpenses,
  useGroupSettlements,
  useGroupActivity,
  useDeleteSettlement,
  useMe,
  useGroup,
  Settlement,
  Expense,
  ActivityItem,
} from '@workspace/api';
import { getDateHeading } from '../../../utils/date';
import { useTheme } from '../../../context/ThemeContext';
import { useExport } from '../../../hooks/useExport';
import { ExportModalBottomSheet } from '../../../components/ExportModalBottomSheet';
import { ExportProgressAndSuccessModal } from '../../../components/ExportProgressAndSuccessModal';
import { BottomSheetModal } from '../../../components/BottomSheetModal';
import { hapticFeedback } from '../../../utils/haptics';

export default function GroupExpensesScreen() {
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const exportHook = useExport();

  const rawParams = useLocalSearchParams<{ id?: string; name?: string; type?: string }>();
  const groupId = rawParams.id || '';
  const groupName = rawParams.name;
  const activeType = rawParams.type || 'expenses';

  const isSettlements = activeType === 'settlements';
  const isActivity = activeType === 'activity';
  const isExpenses = activeType === 'expenses';

  const [searchQuery, setSearchQuery] = React.useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = React.useState('');
  const [activityFilter, setActivityFilter] = React.useState<
    'all' | 'expenses' | 'settlements' | 'wallet'
  >('all');

  // Advanced Filters State
  const [filterModalVisible, setFilterModalVisible] = React.useState(false);
  const [sortBy, setSortBy] = React.useState<'date_desc' | 'date_asc' | 'amount_desc'>('date_desc');
  const [selectedMemberId, setSelectedMemberId] = React.useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null);
  const [amountRange, setAmountRange] = React.useState<
    'any' | 'under_500' | '500_2000' | 'over_2000'
  >('any');

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const { data: userData } = useMe();
  const { data: group } = useGroup(groupId);

  const expensesQuery = useGroupExpenses(groupId, debouncedSearchQuery, {
    enabled: isExpenses && !!groupId,
  });
  const settlementsQuery = useGroupSettlements(groupId, {
    enabled: isSettlements && !!groupId,
  });
  const activityQuery = useGroupActivity(
    groupId,
    activityFilter === 'wallet' ? 'all' : activityFilter,
    { enabled: isActivity && !!groupId }
  );

  const deleteSettlementMutation = useDeleteSettlement(groupId);
  const handleDeleteSettlement = (settlementId: string) => {
    deleteSettlementMutation.mutate(settlementId);
  };

  const query = isSettlements ? settlementsQuery : isActivity ? activityQuery : expensesQuery;

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError, refetch } =
    query;

  const items = (
    isSettlements
      ? data?.pages.flatMap((page) => (page as { settlements: Settlement[] }).settlements) || []
      : isActivity
        ? data?.pages.flatMap((page) => (page as { activity: ActivityItem[] }).activity) || []
        : data?.pages.flatMap((page) => (page as { expenses: Expense[] }).expenses) || []
  ) as (Settlement | Expense | ActivityItem)[];

  const displayedItems = React.useMemo(() => {
    let filtered = items;

    // Filter by type (wallet) if selected
    if (isActivity && activityFilter === 'wallet') {
      filtered = items.filter((item) => {
        const act = item as ActivityItem;
        return act.type === 'expense' && act.data.isWalletPayment === true;
      });
    }

    // Advanced Filter: Member Id (paid by or involved in settlements)
    if (selectedMemberId) {
      filtered = filtered.filter((item) => {
        if (isActivity) {
          const act = item as ActivityItem;
          if (act.type === 'expense') {
            return act.data.paidBy.userId === selectedMemberId;
          } else if (act.type === 'settlement') {
            return (
              act.data.from.userId === selectedMemberId || act.data.to.userId === selectedMemberId
            );
          }
        } else if (isSettlements) {
          const s = item as Settlement;
          return s.from.userId === selectedMemberId || s.to.userId === selectedMemberId;
        } else {
          const e = item as Expense;
          return e.paidBy.userId === selectedMemberId;
        }
        return false;
      });
    }

    // Advanced Filter: Category
    if (selectedCategory) {
      filtered = filtered.filter((item) => {
        if (isActivity) {
          const act = item as ActivityItem;
          return act.type === 'expense' && act.data.category === selectedCategory;
        } else if (isSettlements) {
          return false;
        } else {
          const e = item as Expense;
          return e.category === selectedCategory;
        }
      });
    }

    // Advanced Filter: Amount Range
    if (amountRange !== 'any') {
      filtered = filtered.filter((item) => {
        let amount = 0;
        if (isActivity) {
          const act = item as ActivityItem;
          amount = act.data.amount;
        } else if (isSettlements) {
          amount = (item as Settlement).amount;
        } else {
          amount = (item as Expense).amount;
        }

        if (amountRange === 'under_500') return amount < 500;
        if (amountRange === '500_2000') return amount >= 500 && amount <= 2000;
        if (amountRange === 'over_2000') return amount > 2000;
        return true;
      });
    }

    // Advanced Filter: Sort By
    const sorted = [...filtered];
    if (sortBy === 'date_desc') {
      sorted.sort((a, b) => {
        let dateA: string, dateB: string;
        let createdA = 0,
          createdB = 0;

        if (isActivity) {
          const actA = a as ActivityItem;
          dateA =
            actA.type === 'expense'
              ? (actA.data as Expense).date
              : (actA.data as Settlement).createdAt;
          createdA = new Date(
            actA.type === 'expense'
              ? (actA.data as Expense).createdAt
              : (actA.data as Settlement).createdAt
          ).getTime();
          const actB = b as ActivityItem;
          dateB =
            actB.type === 'expense'
              ? (actB.data as Expense).date
              : (actB.data as Settlement).createdAt;
          createdB = new Date(
            actB.type === 'expense'
              ? (actB.data as Expense).createdAt
              : (actB.data as Settlement).createdAt
          ).getTime();
        } else if (isSettlements) {
          dateA = (a as Settlement).createdAt;
          createdA = new Date((a as Settlement).createdAt).getTime();
          dateB = (b as Settlement).createdAt;
          createdB = new Date((b as Settlement).createdAt).getTime();
        } else {
          dateA = (a as Expense).date;
          createdA = new Date((a as Expense).createdAt).getTime();
          dateB = (b as Expense).date;
          createdB = new Date((b as Expense).createdAt).getTime();
        }

        const dateDiff = new Date(dateB).getTime() - new Date(dateA).getTime();
        if (dateDiff !== 0) return dateDiff;
        return createdB - createdA;
      });
    } else if (sortBy === 'date_asc') {
      sorted.sort((a, b) => {
        let dateA: string;
        let dateB: string;

        if (isActivity) {
          const actA = a as ActivityItem;
          dateA =
            actA.type === 'expense'
              ? (actA.data as Expense).date
              : (actA.data as Settlement).createdAt;
        } else if (isSettlements) {
          dateA = (a as Settlement).createdAt;
        } else {
          dateA = (a as Expense).date;
        }

        if (isActivity) {
          const actB = b as ActivityItem;
          dateB =
            actB.type === 'expense'
              ? (actB.data as Expense).date
              : (actB.data as Settlement).createdAt;
        } else if (isSettlements) {
          dateB = (b as Settlement).createdAt;
        } else {
          dateB = (b as Expense).date;
        }

        return new Date(dateA).getTime() - new Date(dateB).getTime();
      });
    } else if (sortBy === 'amount_desc') {
      sorted.sort((a, b) => {
        let amtA = 0;
        let amtB = 0;

        if (isActivity) {
          const actA = a as ActivityItem;
          amtA =
            actA.type === 'expense'
              ? (actA.data as Expense).amount
              : (actA.data as Settlement).amount;
        } else if (isSettlements) {
          amtA = (a as Settlement).amount;
        } else {
          amtA = (a as Expense).amount;
        }

        if (isActivity) {
          const actB = b as ActivityItem;
          amtB =
            actB.type === 'expense'
              ? (actB.data as Expense).amount
              : (actB.data as Settlement).amount;
        } else if (isSettlements) {
          amtB = (b as Settlement).amount;
        } else {
          amtB = (b as Expense).amount;
        }

        return amtB - amtA;
      });
    }

    // Filter by search query if present
    if (!searchQuery) return sorted;
    const queryStr = searchQuery.toLowerCase().trim();
    return sorted.filter((item) => {
      if (isActivity) {
        const act = item as ActivityItem;
        if (act.type === 'expense') {
          const title = act.data.title.toLowerCase();
          const category = act.data.category.toLowerCase();
          const paidByName = act.data.paidBy.name.toLowerCase();
          return (
            title.includes(queryStr) || category.includes(queryStr) || paidByName.includes(queryStr)
          );
        } else if (act.type === 'settlement') {
          const paidByName = act.data.from.name.toLowerCase();
          const paidToName = act.data.to.name.toLowerCase();
          const amountStr = act.data.amount.toString();
          return (
            paidByName.includes(queryStr) ||
            paidToName.includes(queryStr) ||
            amountStr.includes(queryStr)
          );
        }
      } else {
        const expense = item as Expense;
        const title = expense.title.toLowerCase();
        const category = expense.category.toLowerCase();
        const paidByName = expense.paidBy.name.toLowerCase();
        return (
          title.includes(queryStr) || category.includes(queryStr) || paidByName.includes(queryStr)
        );
      }
      return false;
    });
  }, [
    items,
    searchQuery,
    isActivity,
    isSettlements,
    activityFilter,
    selectedMemberId,
    selectedCategory,
    amountRange,
    sortBy,
  ]);

  // Export Mapped Items
  const exportItems = React.useMemo(() => {
    return displayedItems.map((item) => {
      if (isActivity) {
        const act = item as ActivityItem;
        if (act.type === 'expense') {
          return {
            id: act.data.id,
            title: act.data.title || 'Expense',
            amount: act.data.amount,
            category: act.data.category || 'Other',
            date: act.data.date,
            notes: act.data.notes || '',
            type: 'GROUP' as const,
          };
        } else {
          return {
            id: act.data.id,
            title: `Settlement (${act.data.from.name} -> ${act.data.to.name})`,
            amount: act.data.amount,
            category: 'Settlement',
            date: act.data.createdAt,
            notes: 'Settlement',
            type: 'GROUP' as const,
          };
        }
      } else if (isSettlements) {
        const s = item as Settlement;
        return {
          id: s.id,
          title: `Settlement (${s.from.name} -> ${s.to.name})`,
          amount: s.amount,
          category: 'Settlement',
          date: s.createdAt,
          notes: 'Settlement',
          type: 'GROUP' as const,
        };
      } else {
        const e = item as Expense;
        return {
          id: e.id,
          title: e.title || 'Expense',
          amount: e.amount,
          category: e.category || 'Other',
          date: e.date,
          notes: e.notes || '',
          type: 'GROUP' as const,
        };
      }
    });
  }, [displayedItems, isActivity, isSettlements]);

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const handleResetFilters = () => {
    setActivityFilter('all');
    setSortBy('date_desc');
    setSelectedMemberId(null);
    setSelectedCategory(null);
    setAmountRange('any');
  };

  const hasActiveFilters =
    activityFilter !== 'all' ||
    sortBy !== 'date_desc' ||
    selectedMemberId !== null ||
    selectedCategory !== null ||
    amountRange !== 'any';

  // Group members listing
  const groupMembers = group?.members?.filter((m) => m.role !== 'invited') ?? [];

  // Available categories list
  const categoriesList = Object.keys(CATEGORY_ICONS);

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
        <View style={styles.tabHeaderRow}>
          <View style={styles.headerLeftRow}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backBtn}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={24} color={isDark ? '#F3F4F6' : COLORS.onSurface} />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={[styles.tabTitle, isDark && styles.tabTitleDark]} numberOfLines={1}>
                {groupName
                  ? `${groupName} ${isSettlements ? 'Settlements' : isActivity ? 'Activity' : 'Expenses'}`
                  : `${isSettlements ? 'Settlement' : isActivity ? 'Activity' : 'Expense'} History`}
              </Text>
            </View>
          </View>

          <View style={styles.headerRightActions}>
            {/* Analytics Icon Button */}
            <TouchableOpacity
              style={styles.iconBtn}
              activeOpacity={0.7}
              onPress={() => {
                hapticFeedback.selection();
                router.push({
                  pathname: '/groups/[id]/analytics',
                  params: { id: groupId, name: groupName },
                });
              }}
            >
              <Ionicons
                name="bar-chart-outline"
                size={24}
                color={isDark ? '#F3F4F6' : COLORS.onSurface}
              />
            </TouchableOpacity>

            {/* Filter Icon Button */}
            <TouchableOpacity
              style={[styles.iconBtn, hasActiveFilters && styles.filterBtnActive]}
              onPress={() => {
                hapticFeedback.selection();
                setFilterModalVisible(true);
              }}
              activeOpacity={0.7}
            >
              <Ionicons
                name="options-outline"
                size={24}
                color={hasActiveFilters ? COLORS.primary : isDark ? '#F3F4F6' : COLORS.onSurface}
              />
            </TouchableOpacity>

            {/* Download / Export Icon Button */}
            <TouchableOpacity
              style={styles.iconBtn}
              activeOpacity={0.7}
              onPress={() => {
                hapticFeedback.selection();
                exportHook.setExportModalVisible(true);
              }}
            >
              <Ionicons
                name="download-outline"
                size={26}
                color={isDark ? '#F3F4F6' : COLORS.onSurface}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Always-visible Search Input Box */}
        <View style={[styles.alwaysSearchContainer, isDark && styles.alwaysSearchContainerDark]}>
          <Ionicons
            name="search-outline"
            size={22}
            color={isDark ? 'rgba(255, 255, 255, 0.45)' : COLORS.outline}
            style={{ marginRight: 10 }}
          />
          <TextInput
            style={[styles.alwaysSearchInput, isDark && { color: '#ffffff' }]}
            placeholder={isActivity ? 'Search group activity...' : 'Search group expenses...'}
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
        {hasActiveFilters && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.activeFiltersRow}
          >
            {activityFilter !== 'all' && (
              <View style={styles.activeFilterBadge}>
                <Text style={styles.activeFilterBadgeText}>
                  {activityFilter === 'expenses'
                    ? 'Expenses Only'
                    : activityFilter === 'settlements'
                      ? 'Settlements Only'
                      : 'Wallet Payments'}
                </Text>
                <TouchableOpacity onPress={() => setActivityFilter('all')}>
                  <Ionicons name="close-circle" size={14} color={COLORS.primary} />
                </TouchableOpacity>
              </View>
            )}
            {sortBy !== 'date_desc' && (
              <View style={styles.activeFilterBadge}>
                <Text style={styles.activeFilterBadgeText}>
                  {sortBy === 'date_asc' ? 'Oldest First' : 'Highest Amount'}
                </Text>
                <TouchableOpacity onPress={() => setSortBy('date_desc')}>
                  <Ionicons name="close-circle" size={14} color={COLORS.primary} />
                </TouchableOpacity>
              </View>
            )}
            {selectedMemberId && (
              <View style={styles.activeFilterBadge}>
                <Text style={styles.activeFilterBadgeText}>
                  Member:{' '}
                  {groupMembers.find((m) => m.userId === selectedMemberId)?.name.split(' ')[0] ||
                    'Member'}
                </Text>
                <TouchableOpacity onPress={() => setSelectedMemberId(null)}>
                  <Ionicons name="close-circle" size={14} color={COLORS.primary} />
                </TouchableOpacity>
              </View>
            )}
            {selectedCategory && (
              <View style={styles.activeFilterBadge}>
                <Text style={styles.activeFilterBadgeText}>{selectedCategory}</Text>
                <TouchableOpacity onPress={() => setSelectedCategory(null)}>
                  <Ionicons name="close-circle" size={14} color={COLORS.primary} />
                </TouchableOpacity>
              </View>
            )}
            {amountRange !== 'any' && (
              <View style={styles.activeFilterBadge}>
                <Text style={styles.activeFilterBadgeText}>
                  {amountRange === 'under_500'
                    ? `< ${CURRENCY_SYMBOL}500`
                    : amountRange === '500_2000'
                      ? `${CURRENCY_SYMBOL}500-2k`
                      : `> ${CURRENCY_SYMBOL}2k`}
                </Text>
                <TouchableOpacity onPress={() => setAmountRange('any')}>
                  <Ionicons name="close-circle" size={14} color={COLORS.primary} />
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        )}
      </View>

      {/* ── List View ── */}
      {isLoading ? (
        <View style={{ paddingHorizontal: 16 }}>
          <ExpenseItemSkeleton />
          <ExpenseItemSkeleton />
          <ExpenseItemSkeleton />
          <ExpenseItemSkeleton />
          <ExpenseItemSkeleton />
          <ExpenseItemSkeleton />
        </View>
      ) : isError ? (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Failed to load history</Text>
          <TouchableOpacity onPress={() => refetch()} style={styles.retryBtn}>
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : displayedItems.length === 0 ? (
        <View style={styles.centerContainer}>
          <Ionicons
            name={
              isSettlements
                ? 'checkmark-circle-outline'
                : isActivity
                  ? 'pulse-outline'
                  : 'receipt-outline'
            }
            size={48}
            color={isDark ? 'rgba(255, 255, 255, 0.4)' : COLORS.outline}
            style={{ marginBottom: 12 }}
          />
          <Text style={[styles.emptyText, isDark && { color: '#9CA3AF' }]}>
            No matching {isSettlements ? 'settlements' : isActivity ? 'activity' : 'expenses'} found
          </Text>
        </View>
      ) : (
        <FlatList
          data={displayedItems}
          keyExtractor={(item) =>
            isActivity ? (item as ActivityItem).data.id : (item as Settlement | Expense).id
          }
          renderItem={({ item, index }) => {
            if (isSettlements) {
              const s = item as Settlement;
              return (
                <SettlementItem
                  settlement={s}
                  currentUserId={userData?.id}
                  onDelete={handleDeleteSettlement}
                  variant={isDark ? 'dark' : 'light'}
                />
              );
            }

            if (isActivity) {
              const act = item as ActivityItem;
              const prevItem = index > 0 ? (displayedItems[index - 1] as ActivityItem) : null;

              const actDate =
                act.type === 'expense' ? act.data.date : act.data.createdAt.split('T')[0];
              const currentHeading = getDateHeading(actDate);

              const prevActDate = prevItem
                ? prevItem.type === 'expense'
                  ? prevItem.data.date
                  : prevItem.data.createdAt.split('T')[0]
                : '';
              const prevHeading = prevItem ? getDateHeading(prevActDate) : '';

              const showHeading = currentHeading !== prevHeading;

              return (
                <View>
                  {showHeading && (
                    <View
                      style={[styles.dateHeaderContainer, isDark && styles.dateHeaderContainerDark]}
                    >
                      <Text style={[styles.dateHeaderText, isDark && styles.dateHeaderTextDark]}>
                        {currentHeading}
                      </Text>
                    </View>
                  )}
                  {act.type === 'expense' ? (
                    <ExpenseItem
                      expense={act.data}
                      currentUserId={userData?.id}
                      isSettled={act.data.isSettled}
                      variant={isDark ? 'dark' : 'light'}
                    />
                  ) : (
                    <SettlementItem
                      settlement={act.data}
                      currentUserId={userData?.id}
                      onDelete={handleDeleteSettlement}
                      variant={isDark ? 'dark' : 'light'}
                    />
                  )}
                </View>
              );
            }

            const expense = item as Expense;
            const prevItem = index > 0 ? displayedItems[index - 1] : null;
            const currentHeading = getDateHeading(expense.date);
            const prevHeading =
              prevItem && !isSettlements ? getDateHeading((prevItem as Expense).date) : '';
            const showHeading = currentHeading !== prevHeading;

            return (
              <View>
                {showHeading && (
                  <View
                    style={[styles.dateHeaderContainer, isDark && styles.dateHeaderContainerDark]}
                  >
                    <Text style={[styles.dateHeaderText, isDark && styles.dateHeaderTextDark]}>
                      {currentHeading}
                    </Text>
                  </View>
                )}
                <ExpenseItem
                  expense={expense}
                  currentUserId={userData?.id}
                  isSettled={expense.isSettled}
                  variant={isDark ? 'dark' : 'light'}
                />
              </View>
            );
          }}
          contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 24 }]}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.4}
          ListFooterComponent={
            isFetchingNextPage ? (
              <ActivityIndicator
                size="small"
                color={COLORS.primary}
                style={{ marginVertical: 16 }}
              />
            ) : null
          }
        />
      )}

      {/* ── Advanced Filter Bottom Sheet Modal ── */}
      <BottomSheetModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        title="Advanced Filters"
        variant={isDark ? 'dark' : 'light'}
        headerRight={
          <TouchableOpacity
            onPress={handleResetFilters}
            style={[styles.resetFiltersBtn, isDark && styles.resetFiltersBtnDark]}
            activeOpacity={0.7}
          >
            <Text style={[styles.resetFiltersBtnText, isDark && { color: '#34D399' }]}>Reset</Text>
          </TouchableOpacity>
        }
      >
        <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
          {/* Section: Activity Type */}
          {isActivity && (
            <View style={styles.modalSection}>
              <Text style={[styles.modalSectionTitle, isDark && { color: '#F9FAFB' }]}>
                Activity Type
              </Text>
              <View style={styles.chipsRow}>
                {(
                  [
                    { key: 'all', label: 'All Activity' },
                    { key: 'expenses', label: 'Expenses Only' },
                    { key: 'settlements', label: 'Settlements Only' },
                    { key: 'wallet', label: 'Wallet Payments' },
                  ] as const
                ).map((opt) => {
                  const isActive = activityFilter === opt.key;
                  return (
                    <TouchableOpacity
                      key={opt.key}
                      style={[
                        styles.modalChip,
                        isDark
                          ? isActive
                            ? styles.modalChipActiveDark
                            : styles.modalChipDark
                          : isActive && styles.modalChipActive,
                      ]}
                      onPress={() => setActivityFilter(opt.key)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.modalChipText,
                          isDark
                            ? isActive
                              ? { color: '#34D399', fontWeight: '700' }
                              : { color: '#9CA3AF' }
                            : isActive && styles.modalChipTextActive,
                        ]}
                      >
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* Section: Sort By */}
          <View style={styles.modalSection}>
            <Text style={[styles.modalSectionTitle, isDark && { color: '#F9FAFB' }]}>Sort By</Text>
            <View style={styles.chipsRow}>
              {(
                [
                  { key: 'date_desc', label: 'Newest First' },
                  { key: 'date_asc', label: 'Oldest First' },
                  { key: 'amount_desc', label: 'Highest Amount' },
                ] as const
              ).map((opt) => {
                const isActive = sortBy === opt.key;
                return (
                  <TouchableOpacity
                    key={opt.key}
                    style={[
                      styles.modalChip,
                      isDark
                        ? isActive
                          ? styles.modalChipActiveDark
                          : styles.modalChipDark
                        : isActive && styles.modalChipActive,
                    ]}
                    onPress={() => setSortBy(opt.key)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.modalChipText,
                        isDark
                          ? isActive
                            ? { color: '#34D399', fontWeight: '700' }
                            : { color: '#9CA3AF' }
                          : isActive && styles.modalChipTextActive,
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Section: Paid By / Member */}
          {groupMembers.length > 0 && (
            <View style={styles.modalSection}>
              <Text style={[styles.modalSectionTitle, isDark && { color: '#F9FAFB' }]}>
                Filter by Member
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chipsRow}
              >
                <TouchableOpacity
                  style={[
                    styles.modalChip,
                    isDark
                      ? selectedMemberId === null
                        ? styles.modalChipActiveDark
                        : styles.modalChipDark
                      : selectedMemberId === null && styles.modalChipActive,
                  ]}
                  onPress={() => setSelectedMemberId(null)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.modalChipText,
                      isDark
                        ? selectedMemberId === null
                          ? { color: '#34D399', fontWeight: '700' }
                          : { color: '#9CA3AF' }
                        : selectedMemberId === null && styles.modalChipTextActive,
                    ]}
                  >
                    All Members
                  </Text>
                </TouchableOpacity>
                {groupMembers.map((m) => {
                  const isActive = selectedMemberId === m.userId;
                  return (
                    <TouchableOpacity
                      key={m.userId}
                      style={[
                        styles.modalChip,
                        isDark
                          ? isActive
                            ? styles.modalChipActiveDark
                            : styles.modalChipDark
                          : isActive && styles.modalChipActive,
                      ]}
                      onPress={() => setSelectedMemberId(m.userId)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.modalChipText,
                          isDark
                            ? isActive
                              ? { color: '#34D399', fontWeight: '700' }
                              : { color: '#9CA3AF' }
                            : isActive && styles.modalChipTextActive,
                        ]}
                      >
                        {m.name.split(' ')[0]}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          )}

          {/* Section: Category (Not for settlements) */}
          {!isSettlements && categoriesList.length > 0 && (
            <View style={styles.modalSection}>
              <Text style={[styles.modalSectionTitle, isDark && { color: '#F9FAFB' }]}>
                Filter by Category
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chipsRow}
              >
                <TouchableOpacity
                  style={[
                    styles.modalChip,
                    isDark
                      ? selectedCategory === null
                        ? styles.modalChipActiveDark
                        : styles.modalChipDark
                      : selectedCategory === null && styles.modalChipActive,
                  ]}
                  onPress={() => setSelectedCategory(null)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.modalChipText,
                      isDark
                        ? selectedCategory === null
                          ? { color: '#34D399', fontWeight: '700' }
                          : { color: '#9CA3AF' }
                        : selectedCategory === null && styles.modalChipTextActive,
                    ]}
                  >
                    All Categories
                  </Text>
                </TouchableOpacity>
                {categoriesList.map((cat) => {
                  const isActive = selectedCategory === cat;
                  const iconCfg = CATEGORY_ICONS[cat] ?? CATEGORY_ICONS.Other;
                  return (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.modalChip,
                        isDark
                          ? isActive
                            ? styles.modalChipActiveDark
                            : styles.modalChipDark
                          : isActive && styles.modalChipActive,
                      ]}
                      onPress={() => setSelectedCategory(cat)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.modalChipText,
                          isDark
                            ? isActive
                              ? { color: '#34D399', fontWeight: '700' }
                              : { color: '#9CA3AF' }
                            : isActive && styles.modalChipTextActive,
                        ]}
                      >
                        {iconCfg.icon} {cat}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          )}

          {/* Section: Amount Range */}
          <View style={styles.modalSection}>
            <Text style={[styles.modalSectionTitle, isDark && { color: '#F9FAFB' }]}>
              Amount Range
            </Text>
            <View style={styles.chipsRow}>
              {(
                [
                  { key: 'any', label: 'Any Amount' },
                  { key: 'under_500', label: `Under ${CURRENCY_SYMBOL}500` },
                  { key: '500_2000', label: `${CURRENCY_SYMBOL}500 - ${CURRENCY_SYMBOL}2,000` },
                  { key: 'over_2000', label: `Over ${CURRENCY_SYMBOL}2,000` },
                ] as const
              ).map((opt) => {
                const isActive = amountRange === opt.key;
                return (
                  <TouchableOpacity
                    key={opt.key}
                    style={[
                      styles.modalChip,
                      isDark
                        ? isActive
                          ? styles.modalChipActiveDark
                          : styles.modalChipDark
                        : isActive && styles.modalChipActive,
                    ]}
                    onPress={() => setAmountRange(opt.key)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.modalChipText,
                        isDark
                          ? isActive
                            ? { color: '#34D399', fontWeight: '700' }
                            : { color: '#9CA3AF' }
                          : isActive && styles.modalChipTextActive,
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </ScrollView>

        <TouchableOpacity
          style={[styles.applyFiltersBtn, isDark && { backgroundColor: '#10B981' }]}
          onPress={() => setFilterModalVisible(false)}
        >
          <Text style={styles.applyFiltersBtnText}>Apply Filters</Text>
        </TouchableOpacity>
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
        onConfirmExport={() =>
          exportHook.executeExport(
            exportItems,
            userData?.name || userData?.email || 'User',
            'group'
          )
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
        variant={isDark ? 'dark' : 'light'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  containerDark: {
    backgroundColor: '#08110F',
  },
  headerContainer: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f1f1',
  },
  headerContainerDark: {
    backgroundColor: '#0D1714',
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  tabHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
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
    paddingVertical: 12,
    minHeight: 50,
    marginTop: 8,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainer,
  },
  alwaysSearchContainerDark: {
    backgroundColor: '#101917',
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  alwaysSearchInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.onSurface,
    padding: 0,
  },
  activeFiltersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
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
    color: COLORS.primary,
  },
  listContent: {
    paddingTop: 0,
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
    color: '#9CA3AF',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    minHeight: 250,
  },
  errorText: {
    fontSize: 15,
    color: COLORS.error,
    marginBottom: 12,
  },
  retryBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryBtnText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.outline,
    textAlign: 'center',
  },
  resetFiltersBtn: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceContainerLow,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainer,
  },
  resetFiltersBtnDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  resetFiltersBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  modalBody: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  modalSection: {
    marginBottom: 20,
  },
  modalSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.onSurface,
    marginBottom: 10,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  modalChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceContainerLow,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainer,
  },
  modalChipDark: {
    backgroundColor: '#101917',
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  modalChipActive: {
    backgroundColor: COLORS.primaryFixed,
    borderColor: COLORS.primary,
  },
  modalChipActiveDark: {
    backgroundColor: 'rgba(52, 211, 153, 0.15)',
    borderColor: '#34D399',
  },
  modalChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.onSurfaceVariant,
  },
  modalChipTextActive: {
    fontWeight: '700',
    color: COLORS.primary,
  },
  applyFiltersBtn: {
    backgroundColor: COLORS.primary,
    marginHorizontal: 20,
    marginTop: 8,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  applyFiltersBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
  },
});
