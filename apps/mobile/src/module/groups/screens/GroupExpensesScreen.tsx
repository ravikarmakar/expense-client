import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  TextInput,
  Modal,
  ScrollView,
  Animated,
  Keyboard,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, CURRENCY_SYMBOL, CATEGORY_ICONS } from '../../../constants/theme';
import { ExpenseItem } from '../../../components/ExpenseItem';
import { SettlementItem } from '../../settlements/components/SettlementItem';
import { ExpenseItemSkeleton } from '../../../components/ExpenseItemSkeleton';
import { z } from 'zod';
import { useRouteParams } from '../../../hooks/useRouteParams';
import {
  useGroupExpenses,
  useGroupSettlements,
  useGroupActivity,
  useMe,
  useGroup,
  Settlement,
  Expense,
  ActivityItem,
} from '@workspace/api';
import { getDateHeading } from '../../../utils/date';

const routeSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  type: z.enum(['expenses', 'settlements', 'activity']).optional().default('expenses'),
});

export default function GroupExpensesScreen() {
  const insets = useSafeAreaInsets();
  const { id: groupId, name: groupName, type } = useRouteParams(routeSchema);
  const { data: userData } = useMe();
  const { data: group } = useGroup(groupId);

  const isSettlements = type === 'settlements';
  const isActivity = type === 'activity';

  const [searchQuery, setSearchQuery] = React.useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = React.useState('');
  const [activityFilter, setActivityFilter] = React.useState<
    'all' | 'expenses' | 'settlements' | 'wallet'
  >('all');
  const [isSearching, setIsSearching] = React.useState(false);
  const searchInputRef = React.useRef<TextInput>(null);
  const searchWidth = React.useRef(new Animated.Value(0)).current;

  const openSearch = () => {
    setIsSearching(true);
    Animated.timing(searchWidth, {
      toValue: 1,
      duration: 220,
      useNativeDriver: false,
    }).start(() => searchInputRef.current?.focus());
  };

  const closeSearch = () => {
    Keyboard.dismiss();
    setSearchQuery('');
    setIsSearching(false);
    Animated.timing(searchWidth, {
      toValue: 0,
      duration: 180,
      useNativeDriver: false,
    }).start();
  };

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

  const expensesQuery = useGroupExpenses(groupId, debouncedSearchQuery);
  const settlementsQuery = useGroupSettlements(groupId);
  const activityQuery = useGroupActivity(
    groupId,
    activityFilter === 'wallet' ? 'all' : activityFilter
  );

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
    if (sortBy === 'date_asc') {
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

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const handleResetFilters = () => {
    setSortBy('date_desc');
    setSelectedMemberId(null);
    setSelectedCategory(null);
    setAmountRange('any');
  };

  const hasActiveFilters =
    sortBy !== 'date_desc' ||
    selectedMemberId !== null ||
    selectedCategory !== null ||
    amountRange !== 'any';

  // Group members listing
  const groupMembers = group?.members?.filter((m) => m.role !== 'invited') ?? [];

  // Available categories list
  const categoriesList = Object.keys(CATEGORY_ICONS);

  return (
    <View style={styles.container}>
      {/* ── Header ── */}
      <View style={[styles.header, { paddingTop: insets.top, height: 56 + insets.top }]}>
        {/* Back / Cancel button */}
        <TouchableOpacity
          onPress={isSearching ? closeSearch : () => router.back()}
          style={styles.backBtn}
        >
          <Ionicons
            name={isSearching ? 'close' : 'arrow-back'}
            size={24}
            color={COLORS.onSurface}
          />
        </TouchableOpacity>

        {/* Title or Expanded Search Input */}
        {isSearching ? (
          <Animated.View style={[styles.headerSearchInner]}>
            <Ionicons
              name="search-outline"
              size={20}
              color={COLORS.outline}
              style={{ marginRight: 8 }}
            />
            <TextInput
              ref={searchInputRef}
              placeholder={isActivity ? 'Search activity...' : 'Search expenses...'}
              placeholderTextColor={COLORS.outline}
              style={styles.headerSearchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCorrect={false}
              returnKeyType="search"
            />
            {searchQuery.trim() !== '' && (
              <TouchableOpacity onPress={() => setSearchQuery('')} style={{ padding: 4 }}>
                <Ionicons name="close-circle" size={16} color={COLORS.outline} />
              </TouchableOpacity>
            )}
          </Animated.View>
        ) : (
          <Text style={styles.headerTitle} numberOfLines={1}>
            {groupName
              ? `${groupName} ${isSettlements ? 'Settlements' : isActivity ? 'Activity' : 'Expenses'}`
              : `${isSettlements ? 'Settlement' : isActivity ? 'Activity' : 'Expense'} History`}
          </Text>
        )}

        {/* Right action buttons */}
        <View style={styles.headerActions}>
          {!isSettlements && (
            <TouchableOpacity
              onPress={isSearching ? () => {} : openSearch}
              style={styles.headerActionBtn}
              activeOpacity={0.7}
            >
              <Ionicons
                name={isSearching ? 'search' : 'search-outline'}
                size={24}
                color={isSearching ? COLORS.primary : COLORS.onSurface}
              />
            </TouchableOpacity>
          )}
          {(isActivity || isSearching) && (
            <TouchableOpacity
              onPress={() => setFilterModalVisible(true)}
              style={[
                styles.headerActionBtn,
                hasActiveFilters && { backgroundColor: COLORS.primaryFixed },
              ]}
              activeOpacity={0.7}
            >
              <Ionicons
                name="options-outline"
                size={24}
                color={hasActiveFilters ? COLORS.primary : COLORS.onSurface}
              />
              {hasActiveFilters && <View style={styles.headerFilterBadge} />}
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ── Filter Pills (only for activity) ── */}
      {isActivity && (
        <View style={styles.pillsPanel}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersContainer}
            style={styles.filtersScrollView}
          >
            {(['all', 'expenses', 'settlements', 'wallet'] as const).map((filter) => {
              const isActive = activityFilter === filter;
              const label =
                filter === 'all'
                  ? 'All'
                  : filter === 'expenses'
                    ? 'Expenses'
                    : filter === 'settlements'
                      ? 'Settlements'
                      : 'Wallet';
              return (
                <TouchableOpacity
                  key={filter}
                  style={[styles.filterPill, isActive && styles.filterPillActive]}
                  onPress={() => setActivityFilter(filter)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.filterPillText, isActive && styles.filterPillTextActive]}>
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* ── List View ── */}
      {isLoading ? (
        <View style={{ paddingHorizontal: 16 }}>
          <ExpenseItemSkeleton />
          <ExpenseItemSkeleton />
          <ExpenseItemSkeleton />
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
            color={COLORS.outline}
            style={{ marginBottom: 12 }}
          />
          <Text style={styles.emptyText}>
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
                <View style={{ marginHorizontal: -16 }}>
                  <SettlementItem settlement={s} currentUserId={userData?.id} />
                </View>
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
                <View style={{ marginHorizontal: -16 }}>
                  {showHeading && (
                    <View style={styles.dateHeaderContainer}>
                      <Text style={styles.dateHeaderText}>{currentHeading}</Text>
                    </View>
                  )}
                  {act.type === 'expense' ? (
                    <ExpenseItem
                      expense={act.data}
                      currentUserId={userData?.id}
                      isSettled={act.data.isSettled}
                    />
                  ) : (
                    <SettlementItem settlement={act.data} currentUserId={userData?.id} />
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
              <View style={{ marginHorizontal: -16 }}>
                {showHeading && (
                  <View style={styles.dateHeaderContainer}>
                    <Text style={styles.dateHeaderText}>{currentHeading}</Text>
                  </View>
                )}
                <ExpenseItem
                  expense={expense}
                  currentUserId={userData?.id}
                  isSettled={expense.isSettled}
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

      {/* ── Advanced Filter Modal ── */}
      <Modal
        visible={filterModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContentContainer, { paddingBottom: insets.bottom + 24 }]}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <TouchableOpacity
                onPress={() => setFilterModalVisible(false)}
                style={styles.closeModalBtn}
              >
                <Ionicons name="close" size={24} color={COLORS.onSurface} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Advanced Filters</Text>
              <TouchableOpacity onPress={handleResetFilters}>
                <Text style={styles.resetFiltersBtnText}>Reset</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {/* Section: Sort By */}
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Sort By</Text>
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
                        style={[styles.modalChip, isActive && styles.modalChipActive]}
                        onPress={() => setSortBy(opt.key)}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[styles.modalChipText, isActive && styles.modalChipTextActive]}
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
                  <Text style={styles.modalSectionTitle}>Filter by Member</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.chipsRow}
                  >
                    <TouchableOpacity
                      style={[
                        styles.modalChip,
                        selectedMemberId === null && styles.modalChipActive,
                      ]}
                      onPress={() => setSelectedMemberId(null)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.modalChipText,
                          selectedMemberId === null && styles.modalChipTextActive,
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
                          style={[styles.modalChip, isActive && styles.modalChipActive]}
                          onPress={() => setSelectedMemberId(m.userId)}
                          activeOpacity={0.7}
                        >
                          <Text
                            style={[styles.modalChipText, isActive && styles.modalChipTextActive]}
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
                  <Text style={styles.modalSectionTitle}>Filter by Category</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.chipsRow}
                  >
                    <TouchableOpacity
                      style={[
                        styles.modalChip,
                        selectedCategory === null && styles.modalChipActive,
                      ]}
                      onPress={() => setSelectedCategory(null)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.modalChipText,
                          selectedCategory === null && styles.modalChipTextActive,
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
                          style={[styles.modalChip, isActive && styles.modalChipActive]}
                          onPress={() => setSelectedCategory(cat)}
                          activeOpacity={0.7}
                        >
                          <Text
                            style={[styles.modalChipText, isActive && styles.modalChipTextActive]}
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
                <Text style={styles.modalSectionTitle}>Amount Range</Text>
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
                        style={[styles.modalChip, isActive && styles.modalChipActive]}
                        onPress={() => setAmountRange(opt.key)}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[styles.modalChipText, isActive && styles.modalChipTextActive]}
                        >
                          {opt.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </ScrollView>

            {/* Apply Button */}
            <TouchableOpacity
              style={styles.applyFiltersBtn}
              onPress={() => setFilterModalVisible(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.applyFiltersBtnText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  // Old search panel styles no longer needed — search is in the header
  searchAndFiltersPanel: { display: 'none' },
  searchBarContainer: { display: 'none' },
  searchInner: { display: 'none' },
  searchIcon: {},
  searchInput: { display: 'none' },
  clearButton: {},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.outlineVariant,
    paddingHorizontal: 12,
    gap: 4,
  },
  backBtn: {
    padding: 8,
    marginRight: 2,
  },
  headerTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.onSurface,
    marginHorizontal: 4,
  },
  headerSearchInner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 38,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainer,
    marginHorizontal: 4,
  },
  headerSearchInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.onSurface,
    fontWeight: '500',
    paddingVertical: 0,
    height: '100%',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  headerActionBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  headerFilterBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    borderWidth: 1.5,
    borderColor: COLORS.surface,
  },
  rightPlaceholder: {
    width: 0,
  },
  pillsPanel: {
    backgroundColor: COLORS.surface,
    paddingTop: 8,
    paddingBottom: 4,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 15,
    marginBottom: 16,
  },
  retryBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryBtnText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  emptyText: {
    color: COLORS.outline,
    fontSize: 16,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 0,
    paddingBottom: 16,
  },
  itemWrapper: {
    marginBottom: 0,
  },
  settlementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainer,
    marginBottom: 12,
  },
  settlementIconBg: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.primaryFixed,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settlementInfo: {
    flex: 1,
  },
  settlementText: {
    fontSize: 14,
    color: COLORS.onSurface,
  },
  boldText: {
    fontWeight: '700',
  },
  settlementDate: {
    fontSize: 12,
    color: COLORS.outline,
    marginTop: 2,
  },
  settlementAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
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
  filtersScrollView: {
    maxHeight: 44,
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    alignItems: 'center',
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceContainerLow,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainer,
  },
  filterPillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.outline,
  },
  filterPillTextActive: {
    color: '#ffffff',
  },
  filterIconButton: {},
  filterActiveBadge: {},
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContentContainer: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceContainerLow,
  },
  closeModalBtn: {
    padding: 4,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  resetFiltersBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.error,
  },
  modalBody: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  modalSection: {
    marginBottom: 24,
  },
  modalSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.onSurface,
    marginBottom: 12,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingVertical: 4,
  },
  modalChip: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceContainerLow,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainer,
  },
  modalChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  modalChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.outline,
  },
  modalChipTextActive: {
    color: '#ffffff',
  },
  applyFiltersBtn: {
    marginHorizontal: 20,
    marginTop: 8,
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  applyFiltersBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
});
