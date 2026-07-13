import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, CURRENCY_SYMBOL } from '../../../constants/theme';
import { ExpenseItem } from '../../../components/ExpenseItem';
import { z } from 'zod';
import { useRouteParams } from '../../../hooks/useRouteParams';
import { useGroupExpenses, useGroupSettlements, useMe, Settlement, Expense } from '@workspace/api';

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

  const expensesQuery = useGroupExpenses(groupId);
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
          renderItem={({ item }) => {
            if (isSettlements) {
              const s = item as Settlement;
              const isFromMe = s.fromId === userData?.id;
              const isToMe = s.toId === userData?.id;
              const dateStr = new Date(s.createdAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });
              return (
                <View style={styles.settlementItem}>
                  <View style={styles.settlementIconBg}>
                    <Ionicons name="swap-horizontal" size={20} color={COLORS.primary} />
                  </View>
                  <View style={styles.settlementInfo}>
                    <Text style={styles.settlementText}>
                      <Text style={styles.boldText}>{isFromMe ? 'You' : s.from.name}</Text> paid{' '}
                      <Text style={styles.boldText}>{isToMe ? 'you' : s.to.name}</Text>
                    </Text>
                    <Text style={styles.settlementDate}>{dateStr}</Text>
                  </View>
                  <Text style={styles.settlementAmount}>
                    {CURRENCY_SYMBOL}
                    {s.amount.toFixed(2)}
                  </Text>
                </View>
              );
            }
            const expense = item as Expense;
            return (
              <View style={styles.itemWrapper}>
                <ExpenseItem expense={expense} currentUserId={userData?.id} />
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
    gap: 12,
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
});
