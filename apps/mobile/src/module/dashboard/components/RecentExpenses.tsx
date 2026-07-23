import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../constants/theme';
import { globalStyles } from '../../../styles/globalStyles';
import type { Expense } from '@workspace/api';
import { getDateHeading } from '../../../utils/date';
import { ExpenseItem } from '@/components/ExpenseItem';
import { ExpenseItemSkeleton } from '@/components/ExpenseItemSkeleton';

interface RecentExpensesProps {
  expenses: Expense[];
  currentUserId?: string;
  isRefetching?: boolean;
  variant?: 'light' | 'dark';
}

export const RecentExpenses = React.memo(function RecentExpenses({
  expenses,
  currentUserId,
  isRefetching,
  variant = 'light',
}: RecentExpensesProps) {
  if (expenses.length === 0 && !isRefetching) {
    return null;
  }

  const isDark = variant === 'dark';

  return (
    <View style={[globalStyles.sectionContainer, styles.pbHighlight, { marginHorizontal: -16 }]}>
      <View style={[globalStyles.sectionHeaderRow, styles.sectionHeaderRow]}>
        <Text
          style={[globalStyles.sectionTitle, styles.sectionTitle, isDark && { color: '#ffffff' }]}
        >
          Recent Expenses
        </Text>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.push('/(tabs)/activity')}
          style={styles.seeAllContainer}
        >
          <Text
            style={[
              globalStyles.seeAllText,
              styles.seeAllText,
              { color: isDark ? '#D1D5DB' : '#4B5563', fontWeight: '700' },
            ]}
          >
            See All
          </Text>
          <Ionicons
            name="chevron-forward"
            size={14}
            color={isDark ? '#D1D5DB' : '#4B5563'}
            style={styles.seeAllIcon}
          />
        </TouchableOpacity>
      </View>
      {isRefetching ? (
        <View style={{ paddingHorizontal: 16 }}>
          <ExpenseItemSkeleton />
          <ExpenseItemSkeleton />
          <ExpenseItemSkeleton />
          <ExpenseItemSkeleton />
          <ExpenseItemSkeleton />
          <ExpenseItemSkeleton />
        </View>
      ) : (
        <View
          style={[
            styles.highlightsContainer,
            !isDark && {
              backgroundColor: '#ffffff',
              borderTopWidth: 1,
              borderBottomWidth: 1,
              borderColor: '#edeeef',
            },
            isDark && {
              backgroundColor: '#101917',
              borderTopWidth: 1,
              borderBottomWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.08)',
            },
          ]}
        >
          {(() => {
            let lastDateHeading = '';
            return expenses.map((expense) => {
              const currentHeading = getDateHeading(expense.date);
              const showHeading = currentHeading !== lastDateHeading;
              lastDateHeading = currentHeading;

              return (
                <React.Fragment key={expense.id}>
                  {showHeading && (
                    <View
                      style={[
                        styles.dateHeaderContainer,
                        !isDark && {
                          backgroundColor: '#f8f9fa',
                          paddingHorizontal: 20,
                          paddingVertical: 8,
                          borderBottomWidth: 1,
                          borderBottomColor: '#f1f3f4',
                        },
                        isDark && {
                          backgroundColor: '#131D1A',
                          paddingHorizontal: 20,
                          paddingVertical: 8,
                          borderBottomWidth: 1,
                          borderBottomColor: 'rgba(255, 255, 255, 0.06)',
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.dateHeaderText,
                          isDark
                            ? { color: '#9CA3AF', fontWeight: '800' }
                            : { color: '#4B5563', fontWeight: '800' },
                        ]}
                      >
                        {currentHeading}
                      </Text>
                    </View>
                  )}
                  <ExpenseItem expense={expense} currentUserId={currentUserId} variant={variant} />
                </React.Fragment>
              );
            });
          })()}
          {expenses.length > 0 && (
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/activity')}
              style={[
                styles.viewAllBtn,
                !isDark && {
                  backgroundColor: '#ffffff',
                  paddingVertical: 14,
                  borderTopWidth: 1,
                  borderTopColor: '#f1f3f4',
                  borderBottomWidth: 0,
                },
                isDark && {
                  backgroundColor: '#101917',
                  paddingVertical: 14,
                  borderTopWidth: 1,
                  borderTopColor: 'rgba(255, 255, 255, 0.06)',
                  borderBottomWidth: 0,
                },
              ]}
              activeOpacity={0.75}
            >
              <Text
                style={[
                  styles.viewAllBtnText,
                  isDark
                    ? { color: '#ffffff', fontWeight: '700' }
                    : { color: '#191c1d', fontWeight: '700' },
                ]}
              >
                See All Expenses
              </Text>
              <Ionicons name="chevron-forward" size={15} color={isDark ? '#D1D5DB' : '#4B5563'} />
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  pbHighlight: {
    paddingBottom: 24,
  },
  highlightsContainer: {},
  sectionHeaderRow: {
    marginBottom: 14,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.onSurface,
    textTransform: 'none',
    letterSpacing: 0,
    marginBottom: 0,
    marginLeft: 0,
  },
  seeAllContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
    fontSize: 14,
  },
  seeAllIcon: {
    marginLeft: 2,
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1.5,
    borderBottomColor: COLORS.surfaceContainer,
    gap: 4,
  },
  viewAllBtnText: {
    fontSize: 14,
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
