import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ExpenseItem } from '../../../components/ExpenseItem';
import { getDateHeading } from '../../../utils/date';
import { COLORS } from '../../../constants/theme';
import { globalStyles } from '../../../styles/globalStyles';
import { type Expense } from '@workspace/api';

interface AnalyticsExpensesListProps {
  filteredExpenses: Expense[];
  currentUserId?: string;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
}

export const AnalyticsExpensesList: React.FC<AnalyticsExpensesListProps> = ({
  filteredExpenses,
  currentUserId,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
}) => {
  return (
    <View style={[styles.sectionContainer, { marginBottom: 40 }]}>
      <Text style={globalStyles.sectionTitle}>Expenses in Period</Text>
      {filteredExpenses.length === 0 ? (
        <View style={styles.emptyExpensesContainer}>
          <Ionicons name="receipt-outline" size={32} color={COLORS.outlineVariant} />
          <Text style={styles.emptyExpensesText}>No expenses logged in this period</Text>
        </View>
      ) : (
        <View style={styles.listContainer}>
          {(() => {
            let lastDateHeading = '';
            return filteredExpenses.map((expense) => {
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
                  <ExpenseItem expense={expense} currentUserId={currentUserId} />
                </React.Fragment>
              );
            });
          })()}

          {hasNextPage && (
            <TouchableOpacity
              style={styles.loadMoreRow}
              onPress={onLoadMore}
              disabled={isFetchingNextPage}
              activeOpacity={0.6}
            >
              {isFetchingNextPage ? (
                <ActivityIndicator size="small" color={COLORS.primary} />
              ) : (
                <Text style={styles.loadMoreText}>Load More</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    marginBottom: 24,
  },
  listContainer: {
    marginHorizontal: -20,
    backgroundColor: COLORS.surface,
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
  emptyExpensesContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainer,
    paddingVertical: 32,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
  },
  emptyExpensesText: {
    fontSize: 12,
    color: COLORS.outline,
    fontWeight: '600',
  },
  loadMoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
  },
  loadMoreText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
