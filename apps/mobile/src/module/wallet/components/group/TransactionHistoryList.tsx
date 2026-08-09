import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, CURRENCY_SYMBOL } from '../../../../constants/theme';
import { walletStyles as styles } from '../../../groups/styles/group.styles';
import { EmptyState } from '../../../../components/EmptyState';
import { useTheme } from '../../../../context/ThemeContext';

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
  const { isDark } = useTheme();

  return (
    <View>
      <Text style={[styles.sectionTitle, { marginTop: 28 }, isDark && { color: '#F9FAFB' }]}>
        Group Activity
      </Text>
      {transactions.length === 0 ? (
        <View style={{ marginHorizontal: 16 }}>
          <EmptyState
            icon="receipt-outline"
            title="No activity yet"
            description="Contributions and payments will show up here."
          />
        </View>
      ) : (
        <View
          style={[
            styles.historyListContainer,
            isDark && {
              backgroundColor: '#101917',
              borderColor: 'rgba(255, 255, 255, 0.08)',
            },
          ]}
        >
          {transactions.map((tx, index) => (
            <React.Fragment key={tx.id}>
              <View style={styles.txItem}>
                <View
                  style={[
                    styles.txIcon,
                    {
                      backgroundColor:
                        tx.type === 'DEPOSIT'
                          ? isDark
                            ? 'rgba(129, 140, 248, 0.18)'
                            : COLORS.secondaryFixed
                          : tx.type === 'EXPENSE'
                            ? isDark
                              ? 'rgba(239, 68, 68, 0.18)'
                              : COLORS.errorContainer
                            : tx.type === 'TARGET_CHANGE'
                              ? isDark
                                ? 'rgba(52, 211, 153, 0.18)'
                                : '#e6f4ea'
                              : isDark
                                ? 'rgba(255, 255, 255, 0.08)'
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
                        ? isDark
                          ? '#818CF8'
                          : COLORS.secondary
                        : tx.type === 'EXPENSE'
                          ? isDark
                            ? '#F87171'
                            : COLORS.error
                          : tx.type === 'TARGET_CHANGE'
                            ? isDark
                              ? '#34D399'
                              : COLORS.primary
                            : isDark
                              ? '#9CA3AF'
                              : COLORS.outline
                    }
                  />
                </View>
                <View style={styles.txInfo}>
                  <Text style={[styles.txDesc, isDark && { color: '#F9FAFB' }]}>
                    {tx.description}
                    {tx.user?.name ? ` (by ${tx.user.name})` : ''}
                  </Text>
                  <Text style={[styles.txDate, isDark && { color: '#9CA3AF' }]}>
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
                      {
                        color:
                          tx.amount > 0
                            ? isDark
                              ? '#34D399'
                              : COLORS.primary
                            : isDark
                              ? '#F87171'
                              : COLORS.error,
                      },
                    ]}
                  >
                    {tx.amount > 0 ? '+' : ''}
                    {CURRENCY_SYMBOL}
                    {Math.abs(tx.amount).toFixed(2)}
                  </Text>
                )}
              </View>
              {index < transactions.length - 1 && (
                <View
                  style={[
                    styles.divider,
                    isDark && { backgroundColor: 'rgba(255, 255, 255, 0.06)' },
                  ]}
                />
              )}
            </React.Fragment>
          ))}

          {hasNextPage && (
            <TouchableOpacity
              onPress={onLoadMore}
              disabled={isFetchingNextPage}
              style={[
                localStyles.loadMoreBtn,
                isDark && { borderTopColor: 'rgba(255, 255, 255, 0.08)' },
              ]}
            >
              {isFetchingNextPage ? (
                <ActivityIndicator size="small" color={isDark ? '#34D399' : COLORS.primary} />
              ) : (
                <Text style={[localStyles.loadMoreText, isDark && { color: '#34D399' }]}>
                  Load More
                </Text>
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
