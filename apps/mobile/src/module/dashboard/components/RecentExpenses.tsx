import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../constants/theme';
import { globalStyles } from '../../../styles/globalStyles';
import type { Expense } from '@workspace/api';
import { getDateHeading } from '../../../utils/date';
import { ExpenseItem } from '@/components/ExpenseItem';

interface RecentExpensesProps {
  expenses: Expense[];
  currentUserId?: string;
}

export const RecentExpenses = React.memo(function RecentExpenses({
  expenses,
  currentUserId,
}: RecentExpensesProps) {
  if (expenses.length === 0) {
    return null;
  }

  return (
    <View style={[globalStyles.sectionContainer, styles.pbHighlight]}>
      <View style={[globalStyles.sectionHeaderRow, styles.sectionHeaderRow]}>
        <Text style={[globalStyles.sectionTitle, styles.sectionTitle]}>Recent Expenses</Text>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.push('/(tabs)/activity')}
          style={styles.seeAllContainer}
        >
          <Text style={[globalStyles.seeAllText, styles.seeAllText]}>See All</Text>
          <Ionicons
            name="chevron-forward"
            size={14}
            color={COLORS.secondary}
            style={styles.seeAllIcon}
          />
        </TouchableOpacity>
      </View>
      <View style={styles.highlightsContainer}>
        {(() => {
          let lastDateHeading = '';
          return expenses.map((expense) => {
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
        {expenses.length > 0 && (
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/activity')}
            style={styles.viewAllBtn}
            activeOpacity={0.7}
          >
            <Text style={styles.viewAllBtnText}>See All Expenses</Text>
            <Ionicons name="chevron-forward" size={15} color={COLORS.primary} />
          </TouchableOpacity>
        )}
      </View>
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
    paddingHorizontal: 16,
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
