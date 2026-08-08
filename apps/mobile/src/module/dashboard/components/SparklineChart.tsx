import React, { useState, useRef } from 'react';
import { View, StyleSheet, Dimensions, Text, PanResponder } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Line, Circle } from 'react-native-svg';
import { CURRENCY_SYMBOL } from '../../../constants/theme';
import { hapticFeedback } from '../../../utils/haptics';

import { useIncomes } from '@workspace/api';

interface SparklineChartProps {
  monthlyIncome?: number;
  expenses?: Array<Record<string, unknown>>;
  variant?: 'light' | 'dark';
}

interface PaymentTransaction {
  type: 'income' | 'expense' | 'group_expense';
  amount: number;
  ratio: number;
}

/**
 * Clean single-line sparkline chart with transaction-specific single-color tooltips:
 * - Green tooltip for Income payments
 * - Red tooltip for Personal Expense payments
 * - Amber/Orange tooltip for Group Expense payments
 */
export const SparklineChart = React.memo(function SparklineChart({
  monthlyIncome = 0,
  expenses = [],
}: SparklineChartProps) {
  const screenWidth = Dimensions.get('window').width - 80; // Account for BalanceCard padding
  const height = 44;

  const [isScrubbing, setIsScrubbing] = useState(false);
  const [activeTransactionIndex, setActiveTransactionIndex] = useState(0);

  const { data: incomeData } = useIncomes();
  const rawIncomes = incomeData?.incomes ?? [];

  // Single clean emerald green trend line path adjusted with padding so top stroke never clips
  const linePath = `M 0 32 Q ${screenWidth * 0.25} 18, ${screenWidth * 0.5} 25 T ${screenWidth * 0.75} 14 T ${screenWidth} 10`;
  const areaPath = `${linePath} L ${screenWidth} ${height} L 0 ${height} Z`;

  // Filter transactions for the current month only
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const currentMonthIncomes = rawIncomes.filter((inc) => {
    if (!inc.date && !inc.createdAt) return true;
    const d = new Date(String(inc.date || inc.createdAt));
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const currentMonthExpenses = (expenses || []).filter((e: Record<string, unknown>) => {
    if (!e.date && !e.createdAt) return true;
    const d = new Date(String(e.date || e.createdAt));
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  interface RawTimelineItem {
    type: 'income' | 'expense' | 'group_expense';
    amount: number;
    timestamp: number;
  }

  const incomeItems: RawTimelineItem[] = currentMonthIncomes.map((inc) => {
    const dStr = String(inc.createdAt || inc.date || '');
    const t = new Date(dStr).getTime();
    return {
      type: 'income' as const,
      amount: typeof inc.amount === 'number' ? inc.amount : parseFloat(String(inc.amount)) || 0,
      timestamp: isNaN(t) ? 0 : t,
    };
  });

  const expenseItems: RawTimelineItem[] = currentMonthExpenses.map((e: Record<string, unknown>) => {
    const amt = typeof e.amount === 'number' ? e.amount : parseFloat(String(e.amount)) || 0;
    const isGroup = Boolean(e.groupId || e.group || e.isGroup);
    const dStr = String(e.createdAt || e.date || '');
    const t = new Date(dStr).getTime();
    return {
      type: isGroup ? ('group_expense' as const) : ('expense' as const),
      amount: amt,
      timestamp: isNaN(t) ? 0 : t,
    };
  });

  // Strict Chronological Order: Oldest on the LEFT (index 0), Newest/Latest on the RIGHT (index N-1)
  const combinedTimeline = [...incomeItems, ...expenseItems].sort(
    (a, b) => a.timestamp - b.timestamp
  );

  const activeTimeline =
    combinedTimeline.length > 0
      ? combinedTimeline
      : [
          ...(monthlyIncome > 0
            ? [{ type: 'income' as const, amount: monthlyIncome, timestamp: 1 }]
            : []),
          { type: 'group_expense' as const, amount: 30, timestamp: 2 },
          { type: 'expense' as const, amount: 90, timestamp: 3 },
        ];

  const transactions: PaymentTransaction[] = activeTimeline.map((item, idx) => ({
    type: item.type,
    amount: item.amount,
    ratio: activeTimeline.length === 1 ? 0.5 : 0.05 + (idx * 0.9) / (activeTimeline.length - 1),
  }));

  // Y position along the curve matching exact 3-segment SVG Bezier linePath
  const getCurveY = (r: number) => {
    const clampedR = Math.max(0, Math.min(1, r));
    if (clampedR <= 0.5) {
      // Segment 1: r from 0 to 0.5
      const t = clampedR / 0.5;
      return (1 - t) * (1 - t) * 32 + 2 * (1 - t) * t * 18 + t * t * 25;
    } else if (clampedR <= 0.75) {
      // Segment 2: r from 0.5 to 0.75
      const t = (clampedR - 0.5) / 0.25;
      return (1 - t) * (1 - t) * 25 + 2 * (1 - t) * t * 32 + t * t * 14;
    } else {
      // Segment 3: r from 0.75 to 1.0
      const t = (clampedR - 0.75) / 0.25;
      return (1 - t) * (1 - t) * 14 + 2 * (1 - t) * t * -4 + t * t * 10;
    }
  };

  const lastTxRef = useRef<number>(-1);

  const handleTouch = (locationX: number) => {
    const x = Math.max(0, Math.min(screenWidth, locationX));
    const ratio = x / screenWidth;

    // Find closest payment transaction
    let closestIndex = 0;
    let minDistance = Math.abs(ratio - transactions[0].ratio);

    for (let i = 1; i < transactions.length; i++) {
      const dist = Math.abs(ratio - transactions[i].ratio);
      if (dist < minDistance) {
        minDistance = dist;
        closestIndex = i;
      }
    }

    setActiveTransactionIndex(closestIndex);

    if (!isScrubbing) {
      setIsScrubbing(true);
    }

    if (closestIndex !== lastTxRef.current) {
      lastTxRef.current = closestIndex;
      hapticFeedback.selection();
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        handleTouch(evt.nativeEvent.locationX);
      },
      onPanResponderMove: (evt) => {
        handleTouch(evt.nativeEvent.locationX);
      },
      onPanResponderRelease: () => {
        setIsScrubbing(false);
        lastTxRef.current = -1;
      },
      onPanResponderTerminate: () => {
        setIsScrubbing(false);
        lastTxRef.current = -1;
      },
    })
  ).current;

  const currentTx = transactions[activeTransactionIndex] || transactions[0];
  const snappedX = currentTx.ratio * screenWidth;
  const currentCurveY = getCurveY(currentTx.ratio);

  const isIncome = currentTx.type === 'income';
  const isGroupExpense = currentTx.type === 'group_expense';

  const badgeColor = isIncome ? '#10B981' : isGroupExpense ? '#F59E0B' : '#EF4444';
  const badgeBg = isIncome ? '#064e3b' : isGroupExpense ? '#78350f' : '#7f1d1d';
  const badgeBorder = isIncome
    ? 'rgba(16, 185, 129, 0.6)'
    : isGroupExpense
      ? 'rgba(245, 158, 11, 0.6)'
      : 'rgba(239, 68, 68, 0.6)';

  const labelText = isIncome ? 'Income' : isGroupExpense ? 'Group Exp' : 'Personal Exp';

  const lastTx = transactions[transactions.length - 1] || transactions[0];
  const lastTxX = lastTx.ratio * screenWidth;
  const lastTxY = getCurveY(lastTx.ratio);
  const lastTxColor =
    lastTx.type === 'income' ? '#10B981' : lastTx.type === 'group_expense' ? '#F59E0B' : '#EF4444';

  return (
    <View style={styles.container}>
      {/* Floating Single-Color Tooltip: GREEN for Income, AMBER for Group Expense, RED for Personal Expense */}
      {isScrubbing && (
        <View
          style={[
            styles.tooltip,
            {
              left: Math.max(0, Math.min(screenWidth - 145, snappedX - 70)),
              backgroundColor: badgeBg,
              borderColor: badgeBorder,
            },
          ]}
        >
          <View style={[styles.dot, { backgroundColor: badgeColor }]} />
          <Text style={[styles.tooltipText, { color: '#FFFFFF' }]}>
            {labelText}: {isIncome ? '+' : '-'}
            {CURRENCY_SYMBOL}
            {currentTx.amount.toFixed(2)}
          </Text>
        </View>
      )}

      {/* Touch Interactive Chart Area */}
      <View {...panResponder.panHandlers} style={styles.chartWrapper}>
        <Svg height={height} width={screenWidth}>
          <Defs>
            <LinearGradient id="glowGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#10B981" stopOpacity="0.20" />
              <Stop offset="1" stopColor="#10B981" stopOpacity="0.00" />
            </LinearGradient>
          </Defs>

          {/* Emerald Green Area Gradient Fill */}
          <Path d={areaPath} fill="url(#glowGrad)" />

          {/* Single Crisp Emerald Green Line Stroke */}
          <Path d={linePath} fill="none" stroke="#10B981" strokeWidth={2.5} strokeLinecap="round" />

          {/* Single Endpoint Dot for Latest Payment */}
          {!isScrubbing && (
            <Circle
              cx={lastTxX}
              cy={lastTxY}
              r={4}
              fill={lastTxColor}
              stroke="#FFFFFF"
              strokeWidth={1.5}
            />
          )}

          {/* Scrubber Guide Line & Cursor Dot */}
          {isScrubbing && (
            <>
              <Line
                x1={snappedX}
                y1={0}
                x2={snappedX}
                y2={currentCurveY}
                stroke={badgeColor}
                strokeWidth={1.5}
                strokeDasharray="3 3"
                opacity={0.85}
              />
              <Circle
                cx={snappedX}
                cy={currentCurveY}
                r={5.5}
                fill={badgeColor}
                stroke="#FFFFFF"
                strokeWidth={2}
              />
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
