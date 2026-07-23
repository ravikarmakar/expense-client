import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { PieChart } from 'react-native-gifted-charts';
import { COLORS, CURRENCY_SYMBOL } from '../../../constants/theme';
import { getCategoryVisuals } from '../../../constants/categories';
import { globalStyles } from '../../../styles/globalStyles';
import { useCategories } from '@workspace/api';

const CategoryIcon = ({
  name,
  lib,
  color,
  size = 15,
}: {
  name: string;
  lib: 'Ionicons' | 'MaterialIcons';
  color: string;
  size?: number;
}) => {
  if (lib === 'Ionicons') {
    return <Ionicons name={name as never} size={size} color={color} />;
  }
  return <MaterialIcons name={name as never} size={size} color={color} />;
};

interface CategorySpentItem {
  category: string;
  amount: number;
}

interface CategorySpendingCardProps {
  summary?: {
    categorySpent: CategorySpentItem[];
  } | null;
  totalSpent: number;
  variant?: 'light' | 'dark';
}

export const CategorySpendingCard = React.memo(function CategorySpendingCard({
  summary,
  totalSpent,
  variant = 'light',
}: CategorySpendingCardProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { data: categoriesData } = useCategories();
  const customCategories = categoriesData?.custom || [];
  const isDark = variant === 'dark';

  if (!summary?.categorySpent || summary.categorySpent.length === 0) {
    return (
      <View style={[globalStyles.sectionContainer, styles.pbHighlight]}>
        <View style={styles.categoryCardHeader}>
          <Text
            style={[globalStyles.sectionTitle, styles.sectionTitle, isDark && { color: '#ffffff' }]}
          >
            Spending Breakdown
          </Text>
        </View>
        <View
          style={[
            styles.emptyCard,
            isDark && {
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
              borderColor: 'rgba(255, 255, 255, 0.05)',
            },
          ]}
        >
          <View
            style={[
              styles.emptyIconBg,
              isDark && {
                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                borderColor: 'rgba(255, 255, 255, 0.08)',
              },
            ]}
          >
            <Ionicons
              name="analytics"
              size={28}
              color={isDark ? 'rgba(255, 255, 255, 0.5)' : COLORS.outline}
            />
          </View>
          <Text style={[styles.emptyCardTitle, isDark && { color: '#ffffff' }]}>
            No spending recorded
          </Text>
          <Text
            style={[styles.emptyCardSubtitle, isDark && { color: 'rgba(255, 255, 255, 0.45)' }]}
          >
            Add expenses with categories to see your monthly spending breakdown here.
          </Text>
        </View>
      </View>
    );
  }

  const activeCategory = selectedCategory
    ? summary.categorySpent.find((c) => c.category === selectedCategory)
    : null;

  const activeConfig = activeCategory
    ? getCategoryVisuals(activeCategory.category, customCategories)
    : null;

  const pieData = summary.categorySpent.map((item) => {
    const config = getCategoryVisuals(item.category, customCategories);
    const isSelected = selectedCategory === item.category;

    return {
      value: item.amount,
      color: config.color,
      shiftX: isSelected ? 8 : 0,
      shiftY: isSelected ? 8 : 0,
      onPress: () => setSelectedCategory(isSelected ? null : item.category),
    };
  });

  const renderCenterLabel = () => {
    if (selectedCategory && activeCategory && activeConfig) {
      const percentage = totalSpent > 0 ? (activeCategory.amount / totalSpent) * 100 : 0;
      return (
        <View style={styles.centerLabelContainer}>
          <Text style={[styles.centerLabelTitle, { color: activeConfig.color }]} numberOfLines={1}>
            {activeCategory.category}
          </Text>
          <Text
            style={[styles.centerLabelAmount, isDark && { color: '#ffffff' }]}
            numberOfLines={1}
          >
            {CURRENCY_SYMBOL}
            {activeCategory.amount.toFixed(0)}
          </Text>
          <Text style={[styles.centerLabelSub, isDark && { color: 'rgba(255,255,255,0.4)' }]}>
            {percentage.toFixed(0)}% of total
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.centerLabelContainer}>
        <Text style={[styles.centerLabelTitle, isDark && { color: 'rgba(255,255,255,0.5)' }]}>
          Total Spent
        </Text>
        <Text style={[styles.centerLabelAmount, isDark && { color: '#ffffff' }]} numberOfLines={1}>
          {CURRENCY_SYMBOL}
          {totalSpent.toFixed(0)}
        </Text>
        <Text style={[styles.centerLabelSub, isDark && { color: 'rgba(255,255,255,0.4)' }]}>
          This Month
        </Text>
      </View>
    );
  };

  return (
    <View style={[globalStyles.sectionContainer, styles.pbHighlight]}>
      <View style={styles.categoryCardHeader}>
        <Text
          style={[globalStyles.sectionTitle, styles.sectionTitle, isDark && { color: '#ffffff' }]}
        >
          Spending Breakdown
        </Text>
        {selectedCategory && (
          <TouchableOpacity
            style={[
              styles.clearSelectionBtn,
              isDark && { backgroundColor: 'rgba(255, 255, 255, 0.08)' },
            ]}
            onPress={() => setSelectedCategory(null)}
            activeOpacity={0.7}
          >
            <Text style={[styles.clearSelectionText, isDark && { color: '#10B981' }]}>
              Reset Zoom
            </Text>
            <Ionicons name="refresh" size={12} color={isDark ? '#10B981' : COLORS.primary} />
          </TouchableOpacity>
        )}
      </View>

      <View
        style={[
          styles.cardContainer,
          isDark && {
            backgroundColor: '#131D1A',
            borderColor: 'rgba(255, 255, 255, 0.08)',
            borderRadius: 20,
            elevation: 0,
            shadowOpacity: 0,
          },
        ]}
      >
        {/* Donut Chart Block */}
        <View
          style={[
            styles.chartWrapper,
            isDark && { borderBottomColor: 'rgba(255, 255, 255, 0.05)' },
          ]}
        >
          <PieChart
            data={pieData}
            donut
            radius={85}
            innerRadius={62}
            innerCircleColor={isDark ? '#08110F' : COLORS.surface}
            centerLabelComponent={renderCenterLabel}
          />
        </View>

        {/* Categories Progress List */}
        <View style={styles.listViewContainer}>
          {summary.categorySpent.map((item) => {
            const config = getCategoryVisuals(item.category, customCategories);
            const percentage = totalSpent > 0 ? (item.amount / totalSpent) * 100 : 0;
            const isSelected = selectedCategory === item.category;

            return (
              <TouchableOpacity
                key={item.category}
                style={[
                  styles.categoryCardRow,
                  isDark && { backgroundColor: '#101917' },
                  isSelected && !isDark && styles.categoryCardRowActive,
                  isSelected &&
                    isDark && {
                      backgroundColor: '#08110F',
                      borderColor: 'rgba(16, 185, 129, 0.25)',
                      borderWidth: 1.5,
                    },
                ]}
                onPress={() => setSelectedCategory(isSelected ? null : item.category)}
                activeOpacity={0.8}
              >
                <View style={styles.categoryHeader}>
                  <View style={styles.categoryInfo}>
                    <View
                      style={[
                        styles.categoryIconBg,
                        { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : config.bg },
                      ]}
                    >
                      <CategoryIcon
                        name={config.icon}
                        lib={config.lib}
                        size={15}
                        color={config.color}
                      />
                    </View>
                    <View style={styles.categoryTextWrapper}>
                      <Text style={[styles.categoryName, isDark && { color: '#ffffff' }]}>
                        {item.category}
                      </Text>
                      <Text
                        style={[
                          styles.categorySubtext,
                          isDark && { color: 'rgba(255, 255, 255, 0.45)' },
                        ]}
                      >
                        {percentage.toFixed(0)}% of total
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.categoryAmountText, isDark && { color: '#ffffff' }]}>
                    {CURRENCY_SYMBOL}
                    {item.amount.toFixed(2)}
                  </Text>
                </View>

                <View
                  style={[
                    styles.progressTrack,
                    isDark && { backgroundColor: 'rgba(255, 255, 255, 0.05)' },
                  ]}
                >
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${percentage}%`,
                        backgroundColor: isDark ? '#10B981' : config.color,
                      },
                    ]}
                  />
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  pbHighlight: {
    paddingBottom: 24,
  },
  categoryCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.onSurface,
    textTransform: 'none',
    letterSpacing: -0.2,
    marginBottom: 0,
    marginLeft: 0,
  },
  clearSelectionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.primaryContainer || '#e8f5e9',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  clearSelectionText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  cardContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainer,
    padding: 16,
    marginHorizontal: 0,
    elevation: 2,
    shadowColor: COLORS.onSurface,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  chartWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceContainerLow,
    marginBottom: 12,
  },
  centerLabelContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 110,
  },
  centerLabelTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.outline,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  centerLabelAmount: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.onSurface,
    marginTop: 2,
    textAlign: 'center',
  },
  centerLabelSub: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.outlineVariant,
    marginTop: 2,
    textAlign: 'center',
  },
  listViewContainer: {
    gap: 8,
  },
  categoryCardRow: {
    borderRadius: 16,
    padding: 10,
    borderWidth: 1.5,
    borderColor: 'transparent',
    backgroundColor: COLORS.surfaceContainerLow,
    gap: 8,
  },
  categoryCardRowActive: {
    backgroundColor: COLORS.surfaceContainer,
    borderColor: COLORS.surfaceContainerHigh || '#e0e0e0',
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  categoryIconBg: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryTextWrapper: {
    justifyContent: 'center',
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  categorySubtext: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.outline,
    marginTop: 1,
  },
  categoryAmountText: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.onSurface,
  },
  progressTrack: {
    height: 5,
    backgroundColor: COLORS.surfaceContainer,
    borderRadius: 2.5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2.5,
  },
  emptyCard: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.surfaceContainer,
    borderWidth: 1,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 0,
    gap: 8,
  },
  emptyIconBg: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainer,
  },
  emptyCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  emptyCardSubtitle: {
    fontSize: 13,
    color: COLORS.outline,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 16,
  },
});
