import React, { useState, useMemo } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { PieChart, LineChart } from 'react-native-gifted-charts';
import { COLORS, CURRENCY_SYMBOL } from '../../../constants/theme';
import { getCategoryVisuals } from '../../../constants/categories';
import { globalStyles } from '../../../styles/globalStyles';
import { useCategories } from '@workspace/api';

const SCREEN_WIDTH = Dimensions.get('window').width;

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
  const [activeTab, setActiveTab] = useState<'donut' | 'trend'>('donut');
  const { data: categoriesData } = useCategories();
  const customCategories = categoriesData?.custom || [];
  const isDark = variant === 'dark';

  const categorySpent = summary?.categorySpent ?? [];

  // Sort categories by amount descending
  const sortedSpent = useMemo(() => {
    return [...categorySpent].sort((a, b) => b.amount - a.amount);
  }, [categorySpent]);

  // Compute Top Category for Smart Insight
  const topCategory = sortedSpent.length > 0 ? sortedSpent[0] : null;
  const topCategoryPercentage =
    topCategory && totalSpent > 0 ? ((topCategory.amount / totalSpent) * 100).toFixed(0) : '0';

  if (!summary?.categorySpent || summary.categorySpent.length === 0) {
    return (
      <View style={[globalStyles.sectionContainer, styles.pbHighlight]}>
        <View style={styles.categoryCardHeader}>
          <Text
            style={[globalStyles.sectionTitle, styles.sectionTitle, isDark && { color: '#ffffff' }]}
          >
            Spending Breakdown
          </Text>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push('/activity-analytics')}
            style={styles.seeAllContainer}
          >
            <Text
              style={[
                globalStyles.seeAllText,
                styles.seeAllText,
                { color: isDark ? '#D1D5DB' : '#4B5563', fontWeight: '700' },
              ]}
            >
              Analytics
            </Text>
            <Ionicons
              name="chevron-forward"
              size={14}
              color={isDark ? '#D1D5DB' : '#4B5563'}
              style={{ marginLeft: 2 }}
            />
          </TouchableOpacity>
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
    ? sortedSpent.find((c) => c.category === selectedCategory)
    : null;

  const activeConfig = activeCategory
    ? getCategoryVisuals(activeCategory.category, customCategories)
    : null;

  const pieData = sortedSpent.map((item) => {
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

  const lineChartData = sortedSpent.map((item) => {
    const config = getCategoryVisuals(item.category, customCategories);
    return {
      value: item.amount,
      label: item.category.length > 5 ? item.category.slice(0, 4) + '.' : item.category,
      labelTextStyle: {
        color: isDark ? '#9CA3AF' : '#64748B',
        fontSize: 10,
        fontWeight: '700' as const,
      },
      dataPointColor: config.color,
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
      {/* Section Header */}
      <View style={styles.categoryCardHeader}>
        <Text
          style={[globalStyles.sectionTitle, styles.sectionTitle, isDark && { color: '#ffffff' }]}
        >
          Spending Breakdown
        </Text>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.push('/activity-analytics')}
          style={styles.seeAllContainer}
        >
          <Text
            style={[
              globalStyles.seeAllText,
              styles.seeAllText,
              { color: isDark ? '#D1D5DB' : '#4B5563', fontWeight: '700' },
            ]}
          >
            Analytics
          </Text>
          <Ionicons
            name="chevron-forward"
            size={14}
            color={isDark ? '#D1D5DB' : '#4B5563'}
            style={{ marginLeft: 2 }}
          />
        </TouchableOpacity>
      </View>

      {/* Main Glassmorphic Card Container */}
      <View
        style={[
          styles.cardContainer,
          isDark && {
            backgroundColor: '#131D1A',
            borderColor: 'rgba(255, 255, 255, 0.08)',
            borderRadius: 22,
            elevation: 0,
            shadowOpacity: 0,
          },
        ]}
      >
        {/* View Switcher Controls & Reset Zoom */}
        <View style={styles.cardControlsRow}>
          <View
            style={[styles.tabSegment, isDark ? styles.tabSegmentDark : styles.tabSegmentLight]}
          >
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setActiveTab('donut')}
              style={[
                styles.tabPill,
                activeTab === 'donut' &&
                  (isDark ? styles.tabPillActiveDark : styles.tabPillActiveLight),
              ]}
            >
              <Ionicons
                name="pie-chart-outline"
                size={13}
                color={
                  activeTab === 'donut'
                    ? isDark
                      ? '#FFFFFF'
                      : '#0F766E'
                    : isDark
                      ? '#9CA3AF'
                      : '#64748B'
                }
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'donut'
                    ? { color: isDark ? '#FFFFFF' : '#0F766E', fontWeight: '800' }
                    : { color: isDark ? '#9CA3AF' : '#64748B' },
                ]}
              >
                Donut
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setActiveTab('trend')}
              style={[
                styles.tabPill,
                activeTab === 'trend' &&
                  (isDark ? styles.tabPillActiveDark : styles.tabPillActiveLight),
              ]}
            >
              <Ionicons
                name="analytics-outline"
                size={13}
                color={
                  activeTab === 'trend'
                    ? isDark
                      ? '#FFFFFF'
                      : '#0F766E'
                    : isDark
                      ? '#9CA3AF'
                      : '#64748B'
                }
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'trend'
                    ? { color: isDark ? '#FFFFFF' : '#0F766E', fontWeight: '800' }
                    : { color: isDark ? '#9CA3AF' : '#64748B' },
                ]}
              >
                Trend
              </Text>
            </TouchableOpacity>
          </View>

          {/* Reset Zoom Button inside Card */}
          {selectedCategory && (
            <TouchableOpacity
              style={[
                styles.clearSelectionBtn,
                isDark ? styles.clearSelectionBtnDark : styles.clearSelectionBtnLight,
              ]}
              onPress={() => setSelectedCategory(null)}
              activeOpacity={0.7}
            >
              <Ionicons name="refresh" size={12} color={isDark ? '#34D399' : '#047857'} />
              <Text
                style={[
                  styles.clearSelectionText,
                  isDark ? { color: '#34D399' } : { color: '#047857' },
                ]}
              >
                Reset Zoom
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* View Component based on Active Tab */}
        {activeTab === 'donut' ? (
          /* Donut Chart View */
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
        ) : (
          /* Spending Trend Line Chart View */
          <View style={styles.lineChartWrapper}>
            <Text
              style={[styles.lineChartTitle, isDark ? { color: '#9CA3AF' } : { color: '#64748B' }]}
            >
              CATEGORY SPENDING DISTRIBUTION
            </Text>
            <LineChart
              data={lineChartData}
              height={140}
              width={SCREEN_WIDTH - 80}
              color={isDark ? '#10B981' : '#0F766E'}
              thickness={3}
              startFillColor={isDark ? 'rgba(16, 185, 129, 0.35)' : 'rgba(15, 118, 110, 0.25)'}
              endFillColor="rgba(16, 185, 129, 0.01)"
              areaChart
              curved
              hideRules
              yAxisThickness={0}
              xAxisThickness={1}
              xAxisColor={isDark ? 'rgba(255,255,255,0.1)' : '#E2E8F0'}
              noOfSections={3}
              maxValue={Math.max(...sortedSpent.map((s) => s.amount), 100) * 1.15}
              yAxisLabelPrefix={`${CURRENCY_SYMBOL}`}
              yAxisTextStyle={{ color: isDark ? '#6B7280' : '#94A3B8', fontSize: 9 }}
              dataPointsColor={isDark ? '#34D399' : '#0F766E'}
              dataPointsRadius={4}
            />
          </View>
        )}

        {/* Categories Progress List */}
        <View style={styles.listViewContainer}>
          {sortedSpent.map((item) => {
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

      {/* Smart Spending AI Insight Box at Bottom */}
      {topCategory && (
        <View
          style={[
            styles.insightCard,
            isDark ? styles.insightCardDark : styles.insightCardLight,
            { marginTop: 14 },
          ]}
        >
          <View style={styles.insightIconBg}>
            <Ionicons name="bulb-outline" size={16} color={isDark ? '#F59E0B' : '#D97706'} />
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={[styles.insightTitle, isDark ? { color: '#FCD34D' } : { color: '#92400E' }]}
            >
              Spending Insight
            </Text>
            <Text style={[styles.insightSub, isDark ? { color: '#E5E7EB' } : { color: '#4B5563' }]}>
              <Text style={{ fontWeight: '800' }}>{topCategory.category}</Text> is your top expense
              category ({topCategoryPercentage}% of total spent).
            </Text>
          </View>
        </View>
      )}
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
  seeAllContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
    fontSize: 14,
  },
  insightCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 14,
    marginBottom: 14,
    borderWidth: 1,
  },
  insightCardLight: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FDE68A',
  },
  insightCardDark: {
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderColor: 'rgba(245, 158, 11, 0.25)',
  },
  insightIconBg: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(245, 158, 11, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  insightTitle: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  insightSub: {
    fontSize: 12,
    lineHeight: 16,
  },
  cardControlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  tabSegment: {
    flexDirection: 'row',
    padding: 3,
    borderRadius: 12,
    borderWidth: 1,
    gap: 2,
  },
  tabSegmentLight: {
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
  },
  tabSegmentDark: {
    backgroundColor: '#0D1714',
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  tabPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 9,
  },
  tabPillActiveLight: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  tabPillActiveDark: {
    backgroundColor: '#101917',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  tabText: {
    fontSize: 11.5,
    fontWeight: '600',
  },
  clearSelectionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 12,
  },
  clearSelectionBtnLight: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.22)',
  },
  clearSelectionBtnDark: {
    backgroundColor: 'rgba(52, 211, 153, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.3)',
  },
  clearSelectionText: {
    fontSize: 11,
    fontWeight: '800',
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
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceContainerLow,
    marginBottom: 14,
  },
  lineChartWrapper: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    marginBottom: 14,
    alignItems: 'center',
  },
  lineChartTitle: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 12,
    alignSelf: 'flex-start',
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
