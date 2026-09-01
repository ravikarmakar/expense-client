import React from 'react';
import { View, StyleSheet, Dimensions, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path, Defs, LinearGradient, Stop, Line, Circle } from 'react-native-svg';
import { CURRENCY_SYMBOL } from '../../../constants/theme';
import { formatAmount } from '../../../utils/format';
import { hapticFeedback } from '../../../utils/haptics';
import {
  getCurveY,
  prepareSparklineTimeline,
  type PaymentTransaction,
  type TransactionInputItem,
} from '../utils/sparklineUtils';
import { useSparklineScrub } from '../hooks/useSparklineScrub';

export interface SparklineChartProps {
  incomes?: TransactionInputItem[];
  expenses?: TransactionInputItem[];
  transactions?: PaymentTransaction[];
  variant?: 'light' | 'dark';
}

/**
 * Pure Presentational Sparkline Chart Component.
 * Can render from explicit `transactions` prop or from `incomes` & `expenses` arrays.
 * 100% decoupled from network API queries.
 */
export const SparklineChart = React.memo(function SparklineChart({
  incomes = [],
  expenses = [],
  transactions: propTransactions,
}: SparklineChartProps) {
  const screenWidth = Dimensions.get('window').width - 80;
  const height = 44;

  const transactions = React.useMemo(() => {
    if (propTransactions) return propTransactions;
    return prepareSparklineTimeline(incomes, expenses);
  }, [propTransactions, incomes, expenses]);

  const { isScrubbing, activeTransactionIndex, panResponder } = useSparklineScrub({
    transactions,
    screenWidth,
  });

  const handleNavigate = (tx?: PaymentTransaction) => {
    if (!tx || !tx.id) return;
    hapticFeedback.selection();
    if (tx.type === 'income') {
      router.push(`/income/${tx.id}` as never);
    } else {
      router.push(`/expense/${tx.id}` as never);
    }
  };

  const linePath = `M 0 32 Q ${screenWidth * 0.25} 18, ${screenWidth * 0.5} 25 T ${screenWidth * 0.75} 14 T ${screenWidth} 10`;
  const areaPath = `${linePath} L ${screenWidth} ${height} L 0 ${height} Z`;

  // Render clean dashed baseline when user has 0 transactions
  if (transactions.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.chartWrapper}>
          <Svg height={height} width={screenWidth}>
            <Line
              x1={0}
              y1={height / 2}
              x2={screenWidth}
              y2={height / 2}
              stroke="#10B981"
              strokeWidth={1.5}
              strokeDasharray="4 4"
              opacity={0.4}
            />
          </Svg>
        </View>
      </View>
    );
  }

  const currentTx = transactions[activeTransactionIndex] || transactions[0];
  const snappedX = currentTx.ratio * screenWidth;
  const currentCurveY = getCurveY(currentTx.ratio);

  const isIncome = currentTx.type === 'income';
  const isGroupExpense = currentTx.type === 'group_expense';

  // High contrast palette: Mint Green (#34D399) for Income, Bright Amber (#FBBF24) for Group, Coral Red (#F87171) for Personal
  const badgeColor = isIncome ? '#34D399' : isGroupExpense ? '#FBBF24' : '#F87171';
  const badgeBg = isIncome ? '#04382c' : isGroupExpense ? '#542308' : '#5c1313';
  const badgeBorder = isIncome
    ? 'rgba(52, 211, 153, 0.8)'
    : isGroupExpense
      ? 'rgba(251, 191, 36, 0.8)'
      : 'rgba(248, 113, 113, 0.8)';

  const labelText = isIncome ? 'Income' : isGroupExpense ? 'Group Exp' : 'Personal Exp';

  const lastTx = transactions[transactions.length - 1] || transactions[0];
  const lastTxX = lastTx.ratio * screenWidth;
  const lastTxY = getCurveY(lastTx.ratio);
  const lastTxColor =
    lastTx.type === 'income' ? '#34D399' : lastTx.type === 'group_expense' ? '#FBBF24' : '#F87171';

  return (
    <View style={styles.container}>
      {/* Floating Tooltip Capsule */}
      {isScrubbing && (
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => handleNavigate(currentTx)}
          style={[
            styles.tooltip,
            {
              left: Math.max(0, Math.min(screenWidth - 150, snappedX - 75)),
              backgroundColor: badgeBg,
              borderColor: badgeBorder,
            },
          ]}
        >
          <View style={[styles.dot, { backgroundColor: badgeColor }]} />
          <Text style={[styles.tooltipText, { color: '#FFFFFF' }]}>
            {labelText}: {isIncome ? '+' : '-'}
            {CURRENCY_SYMBOL}
            {formatAmount(currentTx.amount)}
          </Text>
          <Ionicons
            name="chevron-forward"
            size={11}
            color="rgba(255, 255, 255, 0.7)"
            style={{ marginLeft: 3 }}
          />
        </TouchableOpacity>
      )}

      {/* Interactive SVG Chart Area */}
      <View {...panResponder.panHandlers} style={styles.chartWrapper}>
        <Svg height={height} width={screenWidth}>
          <Defs>
            <LinearGradient id="glowGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#34D399" stopOpacity="0.25" />
              <Stop offset="1" stopColor="#34D399" stopOpacity="0.00" />
            </LinearGradient>
          </Defs>

          {/* Area Fill */}
          <Path d={areaPath} fill="url(#glowGrad)" />

          {/* Trend Line */}
          <Path d={linePath} fill="none" stroke="#34D399" strokeWidth={2.5} strokeLinecap="round" />

          {/* Single Endpoint Dot when NOT scrubbing */}
          {!isScrubbing && (
            <Circle
              cx={lastTxX}
              cy={lastTxY}
              r={4.5}
              fill={lastTxColor}
              stroke="#FFFFFF"
              strokeWidth={2}
            />
          )}

          {/* Scrubbing Transaction Dots */}
          {isScrubbing && (
            <>
              {/* Vertical Dashed Guide Line */}
              <Line
                x1={snappedX}
                y1={0}
                x2={snappedX}
                y2={currentCurveY}
                stroke={badgeColor}
                strokeWidth={1.5}
                strokeDasharray="3 3"
                opacity={0.9}
              />

              {/* All Transaction Dots with Type-Specific Colors & Crisp Contrast */}
              {transactions.map((tx, idx) => {
                const txX = tx.ratio * screenWidth;
                const txY = getCurveY(tx.ratio);
                const txColor =
                  tx.type === 'income'
                    ? '#34D399'
                    : tx.type === 'group_expense'
                      ? '#FBBF24'
                      : '#F87171';
                const isActive = idx === activeTransactionIndex;

                return (
                  <Circle
                    key={idx}
                    cx={txX}
                    cy={txY}
                    r={isActive ? 6.5 : 4}
                    fill={txColor}
                    stroke="#FFFFFF"
                    strokeWidth={isActive ? 2 : 1}
                    opacity={isActive ? 1 : 0.6}
                  />
                );
              })}
            </>
          )}
        </Svg>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    width: '100%',
    position: 'relative',
  },
  chartWrapper: {
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  tooltip: {
    position: 'absolute',
    top: -26,
    zIndex: 50,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  tooltipText: {
    fontSize: 10.5,
    fontWeight: '800',
  },
});
