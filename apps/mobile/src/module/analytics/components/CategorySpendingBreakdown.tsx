import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { COLORS, CURRENCY_SYMBOL, CATEGORY_ICONS } from '../../../constants/theme';
import { globalStyles } from '../../../styles/globalStyles';

interface CategoryItem {
  category: string;
  amount: number;
  percentage: number;
}

interface CategorySpendingBreakdownProps {
  activeCategorySpent: CategoryItem[];
}

export const CategorySpendingBreakdown: React.FC<CategorySpendingBreakdownProps> = ({
  activeCategorySpent,
}) => {
  return (
    <View style={styles.sectionContainer}>
      <Text style={globalStyles.sectionTitle}>Spending by Category</Text>
      <View style={styles.categoryCard}>
        {activeCategorySpent.length === 0 ? (
          <Text style={styles.noDataText}>No categories to display</Text>
        ) : (
          <View style={styles.listViewContainer}>
            {activeCategorySpent.map((item) => {
              const config = CATEGORY_ICONS[item.category] || CATEGORY_ICONS.Other;
              return (
                <View key={item.category} style={styles.categoryRow}>
                  <View style={styles.categoryHeader}>
                    <View style={styles.categoryInfo}>
                      <View style={[styles.categoryIconBg, { backgroundColor: config.bg }]}>
                        {config.lib === 'Ionicons' ? (
                          <Ionicons name={config.icon as never} size={15} color={config.color} />
                        ) : (
                          <MaterialIcons
                            name={config.icon as never}
                            size={15}
                            color={config.color}
                          />
                        )}
                      </View>
                      <Text style={styles.categoryName}>{item.category}</Text>
                      <Text style={styles.categoryPercentage}>{item.percentage.toFixed(0)}%</Text>
                    </View>
                    <Text style={styles.categoryAmountText}>
                      {CURRENCY_SYMBOL}
                      {item.amount.toFixed(2)}
                    </Text>
                  </View>
                  <View style={styles.categoryProgressTrack}>
                    <View
                      style={[
                        styles.categoryProgressFill,
                        { width: `${item.percentage}%`, backgroundColor: config.color },
                      ]}
                    />
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    marginBottom: 24,
  },
  categoryCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainer,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
  },
  noDataText: {
    textAlign: 'center',
    color: COLORS.outline,
    fontSize: 13,
    paddingVertical: 12,
  },
  listViewContainer: {
    gap: 16,
  },
  categoryRow: {
    gap: 8,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  categoryIconBg: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  categoryPercentage: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.outline,
    backgroundColor: COLORS.surfaceContainerLow,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  categoryAmountText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  categoryProgressTrack: {
    height: 6,
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: 3,
    overflow: 'hidden',
  },
  categoryProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
});
