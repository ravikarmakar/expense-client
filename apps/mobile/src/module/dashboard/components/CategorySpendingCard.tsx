import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { PieChart, BarChart } from 'react-native-gifted-charts';
import { COLORS, CURRENCY_SYMBOL } from '../../../constants/theme';
import { globalStyles } from '../../../styles/globalStyles';

const CATEGORY_CONFIG = {
  Food: { icon: 'restaurant', bg: '#fff3e0', color: '#e65100' },
  Transport: { icon: 'directions-car', bg: '#e3f2fd', color: '#1565c0' },
  Shopping: { icon: 'shopping-bag', bg: '#fce4ec', color: '#c62828' },
  Entertainment: { icon: 'movie', bg: '#f3e5f5', color: '#6a1b9a' },
  Bills: { icon: 'receipt-long', bg: '#e8f5e9', color: '#2e7d32' },
  Health: { icon: 'favorite', bg: '#ffebee', color: '#b71c1c' },
  Travel: { icon: 'flight', bg: '#e0f7fa', color: '#00695c' },
  Other: { icon: 'more-horiz', bg: '#f5f5f5', color: '#424242' },
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
}

export const CategorySpendingCard = React.memo(function CategorySpendingCard({
  summary,
  totalSpent,
}: CategorySpendingCardProps) {
  const [spendingView, setSpendingView] = useState<'list' | 'pie' | 'bar'>('bar');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handleSetSpendingView = (view: 'list' | 'pie' | 'bar') => {
    setSpendingView(view);
    setSelectedCategory(null);
  };

  if (!summary?.categorySpent || summary.categorySpent.length === 0) {
    return (
      <View style={[globalStyles.sectionContainer, styles.pbHighlight]}>
        <View style={styles.categoryCardHeader}>
          <Text style={[globalStyles.sectionTitle, styles.sectionTitle]}>Spending by Category</Text>
        </View>
        <View style={styles.emptyCard}>
          <View style={styles.emptyIconBg}>
            <Ionicons name="pie-chart-outline" size={28} color={COLORS.outline} />
          </View>
          <Text style={styles.emptyCardTitle}>No spending recorded</Text>
          <Text style={styles.emptyCardSubtitle}>
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
    ? CATEGORY_CONFIG[activeCategory.category as keyof typeof CATEGORY_CONFIG] ||
      CATEGORY_CONFIG.Other
    : null;

  const pieData = summary.categorySpent.map((item) => {
    const config =
      CATEGORY_CONFIG[item.category as keyof typeof CATEGORY_CONFIG] || CATEGORY_CONFIG.Other;
    const percentage = totalSpent > 0 ? (item.amount / totalSpent) * 100 : 0;
    const isSelected = selectedCategory === item.category;

    return {
      value: item.amount,
      color: config.color,
      text: percentage > 8 ? `${percentage.toFixed(0)}%` : '',
      textColor: '#ffffff',
      shiftX: isSelected ? 10 : 0,
      shiftY: isSelected ? 10 : 0,
      onPress: () => setSelectedCategory(isSelected ? null : item.category),
    };
  });

  const barData = summary.categorySpent.map((item) => {
    const config =
      CATEGORY_CONFIG[item.category as keyof typeof CATEGORY_CONFIG] || CATEGORY_CONFIG.Other;
    return {
      value: item.amount,
      label: item.category.substring(0, 4),
      frontColor: config.color,
    };
  });

  return (
    <View style={[globalStyles.sectionContainer, styles.pbHighlight]}>
      <View style={styles.categoryCardHeader}>
        <Text style={[globalStyles.sectionTitle, styles.sectionTitle]}>Spending by Category</Text>
        <View style={styles.viewSelector}>
          <TouchableOpacity
            style={[styles.selectorBtn, spendingView === 'list' && styles.selectorBtnActive]}
            onPress={() => handleSetSpendingView('list')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="list"
              size={14}
              color={spendingView === 'list' ? '#fff' : COLORS.outline}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.selectorBtn, spendingView === 'pie' && styles.selectorBtnActive]}
            onPress={() => handleSetSpendingView('pie')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="pie-chart"
              size={14}
              color={spendingView === 'pie' ? '#fff' : COLORS.outline}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.selectorBtn, spendingView === 'bar' && styles.selectorBtnActive]}
            onPress={() => handleSetSpendingView('bar')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="bar-chart"
              size={14}
              color={spendingView === 'bar' ? '#fff' : COLORS.outline}
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.categoryCard}>
        {spendingView === 'list' && (
          <View style={styles.listViewContainer}>
            {summary.categorySpent.map((item) => {
              const config =
                CATEGORY_CONFIG[item.category as keyof typeof CATEGORY_CONFIG] ||
                CATEGORY_CONFIG.Other;
              const percentage = totalSpent > 0 ? (item.amount / totalSpent) * 100 : 0;
              return (
                <View key={item.category} style={styles.categoryRow}>
                  <View style={styles.categoryHeader}>
                    <View style={styles.categoryInfo}>
                      <View style={[styles.categoryIconBg, { backgroundColor: config.bg }]}>
                        <MaterialIcons name={config.icon as never} size={15} color={config.color} />
                      </View>
                      <Text style={styles.categoryName}>{item.category}</Text>
                      <Text style={styles.categoryPercentage}>{percentage.toFixed(0)}%</Text>
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
                        { width: `${percentage}%`, backgroundColor: config.color },
                      ]}
                    />
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {spendingView === 'pie' && (
          <View style={styles.pieContainer}>
            {activeCategory && activeConfig && (
              <View style={styles.pieFocusHeader}>
                <View style={[styles.centerIconBg, { backgroundColor: activeConfig.bg }]}>
                  <MaterialIcons
                    name={activeConfig.icon as never}
                    size={13}
                    color={activeConfig.color}
                  />
                </View>
                <Text style={styles.pieFocusText}>
                  {activeCategory.category}:{' '}
                  <Text style={{ fontWeight: '800' }}>
                    {CURRENCY_SYMBOL}
                    {activeCategory.amount.toFixed(0)}
                  </Text>{' '}
                  ({((activeCategory.amount / totalSpent) * 100).toFixed(0)}%)
                </Text>
                <TouchableOpacity onPress={() => setSelectedCategory(null)}>
                  <Ionicons name="close-circle" size={16} color={COLORS.outline} />
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.pieChartCenterWrapper}>
              <PieChart
                data={pieData}
                radius={90}
                textSize={11}
                showText
                textColor="#ffffff"
                fontWeight="bold"
                isThreeD={false}
                donut={false}
              />
            </View>

            <View style={styles.pieLegendHorizontalContainer}>
              {summary.categorySpent.map((item) => {
                const config =
                  CATEGORY_CONFIG[item.category as keyof typeof CATEGORY_CONFIG] ||
                  CATEGORY_CONFIG.Other;
                const percentage = totalSpent > 0 ? (item.amount / totalSpent) * 100 : 0;
                const isSelected = selectedCategory === item.category;

                return (
                  <TouchableOpacity
                    key={item.category}
                    style={[
                      styles.legendHorizontalItem,
                      isSelected && {
                        backgroundColor: config.bg,
                        borderColor: config.color,
                        borderWidth: 1,
                      },
                    ]}
                    onPress={() => setSelectedCategory(isSelected ? null : item.category)}
                    activeOpacity={0.85}
                  >
                    <View style={[styles.legendSquare, { backgroundColor: config.color }]} />
                    <Text
                      style={[
                        styles.legendHorizontalText,
                        isSelected && { fontWeight: '700', color: config.color },
                      ]}
                      numberOfLines={1}
                    >
                      {item.category} ({percentage.toFixed(0)}%)
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {spendingView === 'bar' && (
          <View style={styles.barContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ paddingRight: 20 }}>
                <BarChart
                  data={barData}
                  barWidth={28}
                  spacing={summary.categorySpent.length === 1 ? 120 : 30}
                  roundedTop
                  roundedBottom={false}
                  hideRules
                  xAxisThickness={1}
                  xAxisColor={COLORS.surfaceContainer}
                  yAxisThickness={0}
                  yAxisTextStyle={{ color: COLORS.outline, fontSize: 10 }}
                  noOfSections={3}
                  height={150}
                  xAxisLabelTextStyle={styles.barLabelText}
                  renderTooltip={(item: { value: number }) => {
                    return (
                      <View style={styles.barTooltip}>
                        <Text style={styles.barTooltipText}>
                          {CURRENCY_SYMBOL}
                          {item.value.toFixed(0)}
                        </Text>
                      </View>
                    );
                  }}
                />
              </View>
            </ScrollView>
          </View>
        )}
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
  viewSelector: {
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceContainer,
    borderRadius: 8,
    padding: 3,
    gap: 2,
  },
  selectorBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectorBtnActive: {
    backgroundColor: COLORS.primary,
  },
  categoryCard: {
    paddingVertical: 12,
    gap: 16,
    marginHorizontal: 16,
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
  pieContainer: {
    alignItems: 'center',
    paddingVertical: 12,
    gap: 16,
    width: '100%',
  },
  pieFocusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 8,
  },
  pieFocusText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.onSurface,
  },
  centerIconBg: {
    width: 26,
    height: 26,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  pieChartCenterWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 220,
    height: 220,
  },
  pieLegendHorizontalContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    marginTop: 8,
  },
  legendHorizontalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceContainerLow,
    borderWidth: 1,
    borderColor: 'transparent',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    gap: 6,
  },
  legendSquare: {
    width: 10,
    height: 10,
    borderRadius: 2.5,
  },
  legendHorizontalText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.outline,
  },
  barContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    width: '100%',
  },
  barLabelText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.outline,
  },
  barTooltip: {
    backgroundColor: COLORS.onSurface,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  barTooltipText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.surface,
  },
  emptyCard: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.surfaceContainer,
    borderWidth: 1,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
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
