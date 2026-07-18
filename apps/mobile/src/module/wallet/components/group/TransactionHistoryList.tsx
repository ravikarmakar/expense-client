import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, CURRENCY_SYMBOL } from '../../../../constants/theme';
import { walletStyles as styles } from '../../../groups/styles/group.styles';
import { EmptyState } from '../../../../components/EmptyState';

interface TransactionHistoryListProps {
  transactions: Array<{
    id: string;
    type: string;
    description: string | null;
    amount: number | null;
    createdAt: string;
    user?: {
      name: string;
    } | null;
  }>;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  onLoadMore?: () => void;
}

export function TransactionHistoryList({
  transactions,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
}: TransactionHistoryListProps) {
  return (
    <View>
      <Text style={[styles.sectionTitle, { marginTop: 28 }]}>Group Activity</Text>
      {transactions.length === 0 ? (
        <View style={{ marginHorizontal: 16 }}>
          <EmptyState
            icon="receipt-outline"
            title="No activity yet"
            description="Contributions and payments will show up here."
          />
        </View>
      ) : (
        <View style={styles.historyListContainer}>
          {transactions.map((tx, index) => (
            <React.Fragment key={tx.id}>
              <View style={styles.txItem}>
                <View
                  style={[
                    styles.txIcon,
                    {
                      backgroundColor:
                        tx.type === 'DEPOSIT'
                          ? COLORS.secondaryFixed
                          : tx.type === 'EXPENSE'
                            ? COLORS.errorContainer
                            : tx.type === 'TARGET_CHANGE'
                              ? '#e6f4ea'
                              : COLORS.surfaceContainer,
                    },
                  ]}
                >
                  <Ionicons
                    name={
                      tx.type === 'DEPOSIT'
                        ? 'arrow-down'
                        : tx.type === 'EXPENSE'
                          ? 'arrow-up'
                          : tx.type === 'TARGET_CHANGE'
                            ? 'flag'
                            : 'swap-horizontal'
                    }
                    size={16}
                    color={
                      tx.type === 'DEPOSIT'
                        ? COLORS.secondary
                        : tx.type === 'EXPENSE'
                          ? COLORS.error
                          : tx.type === 'TARGET_CHANGE'
                            ? COLORS.primary
                            : COLORS.outline
                    }
                  />
                </View>
                <View style={styles.txInfo}>
                  <Text style={styles.txDesc}>
                    {tx.description}
                    {tx.user?.name ? ` (by ${tx.user.name})` : ''}
                  </Text>
                  <Text style={styles.txDate}>
                    {new Date(tx.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </Text>
                </View>
                {tx.amount !== null && (
                  <Text
                    style={[
                      styles.txAmount,
                      { color: tx.amount > 0 ? COLORS.primary : COLORS.error },
                    ]}
                  >
                    {tx.amount > 0 ? '+' : ''}
                    {CURRENCY_SYMBOL}
                    {Math.abs(tx.amount).toFixed(2)}
                  </Text>
                )}
              </View>
              {index < transactions.length - 1 && <View style={styles.divider} />}
            </React.Fragment>
          ))}

          {hasNextPage && (
            <TouchableOpacity
              onPress={onLoadMore}
              disabled={isFetchingNextPage}
              style={localStyles.loadMoreBtn}
            >
              {isFetchingNextPage ? (
                <ActivityIndicator size="small" color={COLORS.primary} />
              ) : (
                <Text style={localStyles.loadMoreText}>Load More</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

const localStyles = StyleSheet.create({
  loadMoreBtn: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceContainer,
  },
  loadMoreText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
});
