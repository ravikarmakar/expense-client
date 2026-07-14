import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  TextInput,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../../constants/theme';
import { TransactionItem } from '../../../components/TransactionItem';
import { SettlementItem } from '../components/SettlementItem';
import { z } from 'zod';
import { useRouteParams } from '../../../hooks/useRouteParams';
import { useGroupExpenses, useGroupSettlements, useMe, Settlement, Expense } from '@workspace/api';
import { getDateHeading } from '../../../utils/date';

const routeSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  type: z.enum(['expenses', 'settlements']).optional().default('expenses'),
});

export default function GroupExpensesScreen() {
  const insets = useSafeAreaInsets();
  const { id: groupId, name: groupName, type } = useRouteParams(routeSchema);
  const { data: userData } = useMe();
  const isSettlements = type === 'settlements';

  const [searchQuery, setSearchQuery] = React.useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = React.useState('');

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const expensesQuery = useGroupExpenses(groupId, debouncedSearchQuery);
  const settlementsQuery = useGroupSettlements(groupId);

  const query = isSettlements ? settlementsQuery : expensesQuery;

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError, refetch } =
    query;

  const items = (
    isSettlements
      ? data?.pages.flatMap((page) => (page as { settlements: Settlement[] }).settlements) || []
      : data?.pages.flatMap((page) => (page as { expenses: Expense[] }).expenses) || []
  ) as (Settlement | Expense)[];

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  return (
    <View style={styles.container}>
      {/* ── Header ── */}
      <View style={[styles.header, { paddingTop: insets.top, height: 56 + insets.top }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {groupName
            ? `${groupName} ${isSettlements ? 'Settlements' : 'Expenses'}`
            : `${isSettlements ? 'Settlement' : 'Expense'} History`}
        </Text>
        <View style={styles.rightPlaceholder} />
      </View>

      {/* ── Search Bar (only for expenses) ── */}
      {!isSettlements && (
        <View style={styles.searchBarContainer}>
          <View style={styles.searchInner}>
            <Ionicons
              name="search-outline"
              size={18}
              color={COLORS.outline}
              style={styles.searchIcon}
            />
            <TextInput
              placeholder="Search expenses..."
              placeholderTextColor={COLORS.outline}
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCorrect={false}
            />
            {searchQuery.trim() !== '' && (
              <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
                <Ionicons name="close-circle" size={16} color={COLORS.outline} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* ── List View ── */}
      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : isError ? (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Failed to load history</Text>
          <TouchableOpacity onPress={() => refetch()} style={styles.retryBtn}>
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : items.length === 0 ? (
        <View style={styles.centerContainer}>
          <Ionicons
            name={isSettlements ? 'checkmark-circle-outline' : 'receipt-outline'}
            size={48}
            color={COLORS.outline}
            style={{ marginBottom: 12 }}
          />
          <Text style={styles.emptyText}>
            No {isSettlements ? 'settlements' : 'expenses'} logged yet
          </Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => {
            if (isSettlements) {
              const s = item as Settlement;
              return (
                <View style={{ marginHorizontal: -16 }}>
                  <SettlementItem settlement={s} currentUserId={userData?.id} />
                </View>
              );
            }
            const expense = item as Expense;
            const prevItem = index > 0 ? items[index - 1] : null;
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
                <TransactionItem expense={expense} currentUserId={userData?.id} />
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  searchBarContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: COLORS.background,
  },
  searchInner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: '#e8ece9',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14.5,
    color: COLORS.onSurface,
    fontWeight: '500',
    height: '100%',
    paddingVertical: 0,
  },
  clearButton: {
    padding: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.outlineVariant,
    paddingHorizontal: 16,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.onSurface,
    textAlign: 'center',
    flex: 1,
    marginHorizontal: 8,
  },
  rightPlaceholder: {
    width: 32,
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
    padding: 16,
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
});
