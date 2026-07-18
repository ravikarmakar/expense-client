import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LineChart, BarChart } from 'react-native-gifted-charts';
import { COLORS, CURRENCY_SYMBOL } from '../../../constants/theme';
import { globalStyles } from '../../../styles/globalStyles';

interface SpendingTrendChartProps {
  activeSpent: number;
  timeframe: 'today' | 'week' | 'month' | 'year';
  activeChartData: Array<{ value: number; label: string }>;
  chartWidth: number;
}

export const SpendingTrendChart: React.FC<SpendingTrendChartProps> = ({
  activeSpent,
  timeframe,
  activeChartData,
  chartWidth,
}) => {
  return (
    <View style={styles.sectionContainer}>
      <Text style={globalStyles.sectionTitle}>Spending Trend</Text>
      <View style={styles.chartCard}>
        {activeSpent === 0 ? (
          <View style={styles.emptyChartContainer}>
            <Ionicons name="bar-chart-outline" size={32} color={COLORS.outlineVariant} />
            <Text style={styles.emptyChartText}>No spending record in this period</Text>
          </View>
        ) : timeframe === 'month' ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ paddingRight: 20 }}>
              <BarChart
                data={activeChartData}
                barWidth={12}
                spacing={10}
                initialSpacing={12}
                height={160}
                color={COLORS.primary}
                showGradient={true}
                gradientColor={'#00855d'}
                frontColor={COLORS.primary}
                roundedTop={true}
                noOfSections={3}
                yAxisThickness={0}
                xAxisThickness={1}
                xAxisColor={COLORS.surfaceContainer}
                rulesColor={COLORS.surfaceContainerLow}
                rulesType="dashed"
                yAxisTextStyle={styles.axisLabelText}
                xAxisLabelTextStyle={styles.axisLabelText}
              />
            </View>
          </ScrollView>
        ) : (
          <LineChart
            data={activeChartData}
            width={chartWidth}
            height={160}
            areaChart
            thickness={3.5}
            color={COLORS.primary}
            startFillColor={COLORS.primary}
            endFillColor={COLORS.primary}
            startOpacity={0.25}
            endOpacity={0.01}
            curved={true}
            noOfSections={3}
            yAxisThickness={0}
            xAxisThickness={1}
            xAxisColor={COLORS.surfaceContainer}
            rulesColor={COLORS.surfaceContainerLow}
            rulesType="dashed"
            spacing={
              timeframe === 'today'
                ? (chartWidth - 20) / 5
                : timeframe === 'week'
                  ? (chartWidth - 20) / 6
                  : (chartWidth - 20) / 11
            }
            initialSpacing={10}
            dataPointsColor={COLORS.primary}
            dataPointsRadius={4}
            xAxisLabelTextStyle={styles.axisLabelText}
            yAxisTextStyle={styles.axisLabelText}
            pointerConfig={{
              pointerColor: COLORS.primary,
              radius: 6,
              showPointerStrip: true,
              pointerStripColor: COLORS.outlineVariant,
              pointerStripWidth: 1,
              pointerLabelComponent: (items: Array<{ value: number }>) => {
                if (!items || items.length === 0 || !items[0]) return null;
                return (
                  <View style={styles.chartTooltip}>
                    <Text style={styles.chartTooltipText}>
                      {CURRENCY_SYMBOL}
                      {items[0].value.toFixed(2)}
                    </Text>
                  </View>
                );
              },
            }}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    marginBottom: 24,
  },
  chartCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainer,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
  },
  axisLabelText: {
    color: COLORS.outline,
    fontSize: 9,
    fontWeight: '600',
  },
  emptyChartContainer: {
    height: 150,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  emptyChartText: {
    fontSize: 12,
    color: COLORS.outline,
    fontWeight: '600',
  },
  chartTooltip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: COLORS.onSurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartTooltipText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
  },
});
