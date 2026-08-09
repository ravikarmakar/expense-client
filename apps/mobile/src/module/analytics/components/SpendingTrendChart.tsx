import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LineChart, BarChart } from 'react-native-gifted-charts';
import { COLORS, CURRENCY_SYMBOL } from '../../../constants/theme';

interface SpendingTrendChartProps {
  activeSpent: number;
  timeframe: 'today' | 'week' | 'month' | 'year' | 'all';
  activeChartData: Array<{ value: number; label: string }>;
  chartWidth: number;
  themeColor?: string;
}

export const SpendingTrendChart: React.FC<SpendingTrendChartProps> = ({
  activeSpent,
  timeframe,
  activeChartData,
  chartWidth,
  themeColor,
}) => {
  const primaryColor = themeColor || COLORS.secondary;
  const [chartType, setChartType] = useState<'area' | 'bar'>('area');

  const pointerConfig = useMemo(
    () => ({
      pointerColor: primaryColor,
      pointerRadius: 6,
      showPointerStrip: true,
      pointerStripColor: primaryColor + '70',
      pointerStripWidth: 1.5,
      pointerStripUptoDataPoint: true,
      pointerVanishDelay: 3500,
      activatePointersOnPress: true,
      autoAdjustPointerLabelPosition: true,
      pointerLabelWidth: 100,
      pointerLabelHeight: 46,
      shiftPointerLabelX: -40,
      shiftPointerLabelY: -35,
      pointerLabelComponent: (
        items: Array<{ value: number; label?: string; dateLabel?: string }>
      ) => {
        if (!items || items.length === 0 || !items[0]) return null;
        const item = items[0];
        const displayLabel = item.dateLabel || item.label;
        return (
          <View style={styles.chartTooltipCard}>
            {displayLabel && <Text style={styles.chartTooltipLabel}>{displayLabel}</Text>}
            <Text style={styles.chartTooltipValue}>
              {CURRENCY_SYMBOL}
              {item.value.toLocaleString('en-IN', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Text>
          </View>
        );
      },
    }),
    [primaryColor]
  );

  const avgValue = useMemo(() => {
    if (!activeChartData || activeChartData.length === 0) return 0;
    const sum = activeChartData.reduce((acc, item) => acc + item.value, 0);
    return sum / activeChartData.length;
  }, [activeChartData]);

  const maxVal = useMemo(() => {
    if (!activeChartData || activeChartData.length === 0) return 100;
    return Math.max(...activeChartData.map((d) => d.value), 10);
  }, [activeChartData]);

  return (
    <View style={styles.sectionContainer}>
      {/* Chart Header Row with View Switcher */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.sectionTitleText}>Spending Trend</Text>
          {activeSpent > 0 && (
            <Text style={styles.sectionSubtitleText}>
              Avg: {CURRENCY_SYMBOL}
              {avgValue.toFixed(0)} / period point
            </Text>
          )}
        </View>

        {activeSpent > 0 && (
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[styles.toggleBtn, chartType === 'area' && styles.toggleBtnActive]}
              onPress={() => setChartType('area')}
              activeOpacity={0.75}
            >
              <Ionicons
                name="stats-chart"
                size={14}
                color={chartType === 'area' ? COLORS.secondary : COLORS.outline}
              />
              <Text style={[styles.toggleText, chartType === 'area' && styles.toggleTextActive]}>
                Line
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.toggleBtn, chartType === 'bar' && styles.toggleBtnActive]}
              onPress={() => setChartType('bar')}
              activeOpacity={0.75}
            >
              <Ionicons
                name="bar-chart"
                size={14}
                color={chartType === 'bar' ? COLORS.secondary : COLORS.outline}
              />
              <Text style={[styles.toggleText, chartType === 'bar' && styles.toggleTextActive]}>
                Bars
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.chartCard}>
        {activeSpent === 0 ? (
          <View style={styles.emptyChartContainer}>
            <Ionicons name="analytics-outline" size={36} color={COLORS.outlineVariant} />
            <Text style={styles.emptyChartText}>No spending record in this period</Text>
          </View>
        ) : chartType === 'bar' ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ paddingRight: 20, paddingTop: 10 }}>
              <BarChart
                data={activeChartData}
                barWidth={14}
                spacing={14}
                initialSpacing={14}
                height={210}
                color={primaryColor}
                showGradient={true}
                gradientColor={primaryColor + '40'}
                frontColor={primaryColor}
                roundedTop={true}
                noOfSections={4}
                yAxisThickness={0}
                xAxisThickness={1}
                xAxisColor={COLORS.surfaceContainerLow}
                rulesColor={COLORS.surfaceContainerLow}
                rulesType="dashed"
                yAxisTextStyle={styles.axisLabelText}
                xAxisLabelTextStyle={styles.axisLabelText}
                maxValue={maxVal * 1.15}
              />
            </View>
          </ScrollView>
        ) : activeChartData.length > 12 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ paddingRight: 20, paddingTop: 10 }}>
              <LineChart
                data={activeChartData}
                height={210}
                areaChart
                thickness={3.5}
                color={primaryColor}
                startFillColor={primaryColor}
                endFillColor={primaryColor}
                startOpacity={0.3}
                endOpacity={0.02}
                curved={true}
                noOfSections={4}
                yAxisThickness={0}
                xAxisThickness={1}
                xAxisColor={COLORS.surfaceContainerLow}
                rulesColor={COLORS.surfaceContainerLow}
                rulesType="dashed"
                showReferenceLine1={avgValue > 0}
                referenceLine1Position={avgValue}
                referenceLine1Config={{
                  color: COLORS.secondary + '80',
                  dashWidth: 4,
                  dashGap: 4,
                  thickness: 1.5,
                }}
                spacing={24}
                initialSpacing={14}
                dataPointsColor={primaryColor}
                dataPointsRadius={4}
                xAxisLabelTextStyle={styles.axisLabelText}
                yAxisTextStyle={styles.axisLabelText}
                maxValue={maxVal * 1.15}
                pointerConfig={pointerConfig}
              />
            </View>
          </ScrollView>
        ) : (
          <View style={{ paddingTop: 10 }}>
            <LineChart
              data={activeChartData}
              width={chartWidth}
              height={210}
              areaChart
              thickness={3.5}
              color={primaryColor}
              startFillColor={primaryColor}
              endFillColor={primaryColor}
              startOpacity={0.3}
              endOpacity={0.02}
              curved={true}
              noOfSections={4}
              yAxisThickness={0}
              xAxisThickness={1}
              xAxisColor={COLORS.surfaceContainerLow}
              rulesColor={COLORS.surfaceContainerLow}
              rulesType="dashed"
              showReferenceLine1={avgValue > 0}
              referenceLine1Position={avgValue}
              referenceLine1Config={{
                color: COLORS.secondary + '80',
                dashWidth: 4,
                dashGap: 4,
                thickness: 1.5,
              }}
              spacing={
                timeframe === 'today'
                  ? (chartWidth - 20) / 5
                  : timeframe === 'week'
                    ? (chartWidth - 20) / 6
                    : (chartWidth - 20) / 11
              }
              initialSpacing={10}
              dataPointsColor={primaryColor}
              dataPointsRadius={4}
              xAxisLabelTextStyle={styles.axisLabelText}
              yAxisTextStyle={styles.axisLabelText}
              maxValue={maxVal * 1.15}
              pointerConfig={pointerConfig}
            />
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    marginBottom: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionTitleText: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.onSurface,
    letterSpacing: -0.3,
  },
  sectionSubtitleText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: COLORS.outline,
    marginTop: 2,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    padding: 3,
    borderRadius: 12,
    gap: 2,
  },
  toggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 9,
  },
  toggleBtnActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  toggleText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: COLORS.outline,
  },
  toggleTextActive: {
    color: COLORS.secondary,
  },
  chartCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainer,
    padding: 16,
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
    fontSize: 9.5,
    fontWeight: '600',
  },
  emptyChartContainer: {
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  emptyChartText: {
    fontSize: 12.5,
    color: COLORS.outline,
    fontWeight: '600',
  },
  chartTooltipCard: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.secondaryFixed,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
    minWidth: 90,
  },
  chartTooltipLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    color: COLORS.secondary,
    letterSpacing: 0.5,
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  chartTooltipValue: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.onSurface,
  },
});
