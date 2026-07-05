import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { globalStyles } from '../styles/globalStyles';
import { ExpenseItem } from './ExpenseItem';
import type { Expense } from '@workspace/api';

interface RecentExpensesCardProps {
  expenses: Expense[];
  currentUserId?: string;
}

export function RecentExpensesCard({ expenses, currentUserId }: RecentExpensesCardProps) {
  if (expenses.length === 0) {
    return null;
  }

  return (
    <View style={[globalStyles.sectionContainer, styles.pbHighlight]}>
      <View style={globalStyles.sectionHeaderRow}>
        <Text style={globalStyles.sectionTitle}>Recent Expenses</Text>
        <TouchableOpacity activeOpacity={0.7} onPress={() => router.push('/(tabs)/activity')}>
          <Text style={globalStyles.seeAllText}>See All</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.highlightsContainer}>
        {expenses.map((expense) => (
          <ExpenseItem key={expense.id} expense={expense} currentUserId={currentUserId} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pbHighlight: {
    paddingBottom: 24,
  },
  highlightsContainer: {
    gap: 12,
  },
});
