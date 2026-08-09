import React, { useState, useMemo } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions } from 'react-native';
import Svg, { Path, Line, Text as SvgText, G } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { COLORS, CURRENCY_SYMBOL } from '../constants/theme';
import { getCategoryVisuals } from '../constants/categories';
import { useCategories, type Income, type Settlement, type Expense } from '@workspace/api';
import { hapticFeedback } from '../utils/haptics';

const screenWidth = Dimensions.get('window').width;

// Curated modern financial color palette (vibrant HSL / modern UI aesthetic)
const PREMIUM_PALETTE: Record<string, string> = {
  Food: '#F59E0B', // Warm Amber Gold
  Transport: '#3B82F6', // Electric Azure Blue
  Shopping: '#EC4899', // Modern Vibrant Rose Pink
  Bills: '#10B981', // Emerald Teal Green
  Entertainment: '#8B5CF6', // Vibrant Violet Purple
  Travel: '#06B6D4', // Cyan Blue
  Health: '#F43F5E', // Coral Rose
  Groceries: '#84CC16', // Lime Green
  Education: '#6366F1', // Indigo
  Other: '#94A3B8', // Slate Gray
};

const PALETTE_FALLBACKS = [
  '#EC4899',
  '#3B82F6',
  '#F59E0B',
  '#10B981',
  '#8B5CF6',
  '#06B6D4',
  '#F43F5E',
  '#84CC16',
];

export function getDateRangeLabel(range?: string): string {
  if (!range || range === 'this-month') return 'This Month';
  if (range === 'last-month') return 'Last Month';
  if (range === 'last-7-days') return 'Last 7 Days';
  if (range === 'last-30-days') return 'Last 30 Days';
  if (range === 'all-time') return 'All Time';
  if (range.startsWith('year-')) return range.replace('year-', '');
  if (range.startsWith('month-')) {
    const parts = range.replace('month-', '').split('-');
    const year = parseInt(parts[0], 10);
    const monthIdx = parseInt(parts[1], 10) - 1;
    const monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    if (!isNaN(year) && monthIdx >= 0 && monthIdx < 12) {
      return `${monthNames[monthIdx]} ${year}`;
    }
  }
  return 'This Month';
}

export function getPeriodDurationText(range?: string): string {
  const now = new Date();
  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  const shortMonthNames = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  if (!range || range === 'this-month') {
    return `${monthNames[now.getMonth()]} ${now.getFullYear()}`;
  }
  if (range === 'last-month') {
    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    return `${monthNames[lastMonthDate.getMonth()]} ${lastMonthDate.getFullYear()}`;
  }
  if (range === 'last-7-days') {
    const sevenDaysAgo = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000);
    if (sevenDaysAgo.getMonth() === now.getMonth()) {
      return `${sevenDaysAgo.getDate()} – ${now.getDate()} ${shortMonthNames[now.getMonth()]} ${now.getFullYear()}`;
    }
    return `${sevenDaysAgo.getDate()} ${shortMonthNames[sevenDaysAgo.getMonth()]} – ${now.getDate()} ${shortMonthNames[now.getMonth()]} ${now.getFullYear()}`;
  }
  if (range === 'last-30-days') {
    const thirtyDaysAgo = new Date(now.getTime() - 29 * 24 * 60 * 60 * 1000);
    if (thirtyDaysAgo.getMonth() === now.getMonth()) {
      return `${thirtyDaysAgo.getDate()} – ${now.getDate()} ${shortMonthNames[now.getMonth()]} ${now.getFullYear()}`;
    }
    return `${thirtyDaysAgo.getDate()} ${shortMonthNames[thirtyDaysAgo.getMonth()]} – ${now.getDate()} ${shortMonthNames[now.getMonth()]} ${now.getFullYear()}`;
  }
  if (range === 'all-time') {
    return 'All Time';
  }
  if (range.startsWith('month-')) {
    const parts = range.replace('month-', '').split('-');
    const year = parseInt(parts[0], 10);
    const monthIdx = parseInt(parts[1], 10) - 1;
    if (!isNaN(year) && monthIdx >= 0 && monthIdx < 12) {
      return `${monthNames[monthIdx]} ${year}`;
    }
  }
  return `${monthNames[now.getMonth()]} ${now.getFullYear()}`;
}

interface ActivityOverviewChartCardProps {
  expenses: Expense[];
  incomes: Income[];
  settlements: Settlement[];
  variant?: 'light' | 'dark';
  dateRange?: string;
  onDateRangeChange?: (range: string) => void;
}

interface SliceData {
  key: string;
  value: number;
  color: string;
  percentage: number;
}

interface ArcCallout extends SliceData {
  startAngle: number;
  endAngle: number;
  midAngle: number;
  sliceEdgePt: { x: number; y: number };
  elbowPt: { x: number; y: number };
  isRightSide: boolean;
  adjustedY: number;
}

function polarToCartesian(cx: number, cy: number, radius: number, angleInDegrees: number) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: cx + radius * Math.cos(angleInRadians),
    y: cy + radius * Math.sin(angleInRadians),
  };
}

function describeArc(cx: number, cy: number, radius: number, startAngle: number, endAngle: number) {
  if (endAngle - startAngle >= 360) {
    endAngle = startAngle + 359.99;
  }
  const start = polarToCartesian(cx, cy, radius, endAngle);
  const end = polarToCartesian(cx, cy, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

  return [
    'M',
    cx,
    cy,
    'L',
    start.x,
    start.y,
    'A',
    radius,
    radius,
    0,
    largeArcFlag,
    0,
    end.x,
    end.y,
    'Z',
  ].join(' ');
}

export const ActivityOverviewChartCard = React.memo(function ActivityOverviewChartCard({
  expenses,
  incomes,
  settlements,
  variant = 'light',
  dateRange = 'this-month',
}: ActivityOverviewChartCardProps) {
  const [chartTab, setChartTab] = useState<'category' | 'type'>('category');

  const { data: categoriesData } = useCategories();
  const customCategories = categoriesData?.custom || [];
  const isDark = variant === 'dark';

  const totalExpense = useMemo(() => expenses.reduce((s, e) => s + e.amount, 0), [expenses]);
  const totalIncome = useMemo(() => incomes.reduce((s, i) => s + i.amount, 0), [incomes]);
  const totalSettlement = useMemo(
    () => settlements.reduce((s, st) => s + st.amount, 0),
    [settlements]
  );
  const totalFlow = totalExpense + totalIncome + totalSettlement;

  // Category breakdown with curated colors
  const categorySlices: SliceData[] = useMemo(() => {
    if (totalExpense === 0) return [];
    const map: Record<string, number> = {};
    expenses.forEach((e) => {
      const cat = e.category || 'Other';
      map[cat] = (map[cat] || 0) + e.amount;
    });

    const sorted = Object.entries(map).sort((a, b) => b[1] - a[1]);

    return sorted.map(([category, amount], idx) => {
      const customConfig = getCategoryVisuals(category, customCategories);
      const curatedColor =
        PREMIUM_PALETTE[category] ||
        customConfig.color ||
        PALETTE_FALLBACKS[idx % PALETTE_FALLBACKS.length];
      return {
        key: category,
        value: amount,
        color: curatedColor,
        percentage: (amount / totalExpense) * 100,
      };
    });
  }, [expenses, customCategories, totalExpense]);

  // Flow types breakdown with curated colors
  const typeSlices: SliceData[] = useMemo(() => {
    const list: SliceData[] = [];
    if (totalExpense > 0) {
      list.push({
        key: 'Expenses',
        value: totalExpense,
        color: '#F43F5E', // Modern Coral Rose
        percentage: totalFlow > 0 ? (totalExpense / totalFlow) * 100 : 0,
      });
    }
    if (totalIncome > 0) {
      list.push({
        key: 'Incomes',
        value: totalIncome,
        color: '#10B981', // Modern Emerald Green
        percentage: totalFlow > 0 ? (totalIncome / totalFlow) * 100 : 0,
      });
    }
    if (totalSettlement > 0) {
      list.push({
        key: 'Settlements',
        value: totalSettlement,
        color: '#6366F1', // Modern Indigo Violet
        percentage: totalFlow > 0 ? (totalSettlement / totalFlow) * 100 : 0,
      });
    }
    return list;
  }, [totalExpense, totalIncome, totalSettlement, totalFlow]);

  const activeSlices = chartTab === 'category' ? categorySlices : typeSlices;

  // Geometry for Single SVG Pie Chart
  const svgWidth = Math.min(screenWidth - 16, 400);
  const svgHeight = 330;
  const cx = svgWidth / 2;
  const cy = 165;
  const radius = 78;

  // Process arcs & compute anti-collision callout Y coordinates
  const processedArcs = useMemo(() => {
    if (activeSlices.length === 0) return [];

    let cumulativeAngle = 0;
    const rawArcs: ArcCallout[] = activeSlices.map((slice) => {
      const sweep = (slice.percentage / 100) * 360;
      const startAngle = cumulativeAngle;
      const endAngle = cumulativeAngle + sweep;
      cumulativeAngle += sweep;
      const midAngle = (startAngle + endAngle) / 2;

      const sliceEdgePt = polarToCartesian(cx, cy, radius, midAngle);
      const elbowPt = polarToCartesian(cx, cy, radius + 18, midAngle);
      const isRightSide = midAngle <= 180;

      return {
        ...slice,
        startAngle,
        endAngle,
        midAngle,
        sliceEdgePt,
        elbowPt,
        isRightSide,
        adjustedY: elbowPt.y,
      };
    });

    // Anti-collision algorithm for Left & Right sides
    const adjustSideY = (sideArcs: ArcCallout[]) => {
      if (sideArcs.length <= 1) return;
      sideArcs.sort((a, b) => a.elbowPt.y - b.elbowPt.y);

      const MIN_V_GAP = 18;
      for (let i = 1; i < sideArcs.length; i++) {
        const prev = sideArcs[i - 1];
        const curr = sideArcs[i];
        if (curr.adjustedY - prev.adjustedY < MIN_V_GAP) {
          curr.adjustedY = prev.adjustedY + MIN_V_GAP;
        }
      }

      // Clamp bottom overflow
      const maxY = svgHeight - 20;
      if (sideArcs[sideArcs.length - 1].adjustedY > maxY) {
        let over = sideArcs[sideArcs.length - 1].adjustedY - maxY;
        for (let i = sideArcs.length - 1; i >= 0; i--) {
          sideArcs[i].adjustedY -= over;
        }
      }
    };

    const rightArcs = rawArcs.filter((a) => a.isRightSide);
    const leftArcs = rawArcs.filter((a) => !a.isRightSide);

    adjustSideY(rightArcs);
    adjustSideY(leftArcs);

    return rawArcs;
  }, [activeSlices, cx, cy, radius, svgHeight]);

  return (
    <View style={styles.cardContainer}>
      {/* Top Controls Header: Category/Type Tabs & Activity Logs Button */}
      <View style={styles.topControlsContainer}>
        <View style={styles.topDropdownRow}>
          <View style={[styles.tabSelector, isDark && styles.tabSelectorDark]}>
            <TouchableOpacity
              style={[
                styles.tabBtn,
                chartTab === 'category' &&
                  (isDark ? styles.tabBtnActiveDark : styles.tabBtnActiveLight),
              ]}
              onPress={() => setChartTab('category')}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.tabBtnText,
                  chartTab === 'category' &&
                    (isDark
                      ? { color: '#34D399', fontWeight: '800' }
                      : { color: COLORS.primary, fontWeight: '800' }),
                ]}
              >
                Categories
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tabBtn,
                chartTab === 'type' &&
                  (isDark ? styles.tabBtnActiveDark : styles.tabBtnActiveLight),
              ]}
              onPress={() => setChartTab('type')}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.tabBtnText,
                  chartTab === 'type' &&
                    (isDark
                      ? { color: '#34D399', fontWeight: '800' }
                      : { color: COLORS.primary, fontWeight: '800' }),
                ]}
              >
                Types
              </Text>
            </TouchableOpacity>
          </View>

          {/* Activity Logs Navigation Button */}
          <TouchableOpacity
            style={[styles.activityLogsNavBtn, isDark && styles.activityLogsNavBtnDark]}
            onPress={() => {
              hapticFeedback.selection();
              router.push({ pathname: '/activity-logs', params: { dateRange } });
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="time-outline" size={14} color={isDark ? '#34D399' : COLORS.primary} />
            <Text
              style={[styles.activityLogsNavBtnText, isDark && styles.activityLogsNavBtnTextDark]}
            >
              Activity Logs
            </Text>
            <Ionicons
              name="chevron-forward"
              size={14}
              color={isDark ? '#34D399' : COLORS.primary}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* SVG Pie Chart with Leader Lines or Empty State */}
      {activeSlices.length === 0 ? (
        <View style={[styles.emptyChartContainer, isDark && styles.emptyChartContainerDark]}>
          <Ionicons name="pie-chart-outline" size={36} color={isDark ? '#4B5563' : '#9CA3AF'} />
          <Text style={[styles.emptyChartTitle, isDark && styles.emptyChartTitleDark]}>
            No chart data for {getDateRangeLabel(dateRange)}
          </Text>
          <Text style={[styles.emptyChartSub, isDark && styles.emptyChartSubDark]}>
            Tap the date dropdown above to choose a different month.
          </Text>
        </View>
      ) : (
        <View style={styles.svgContainer}>
          <Svg width={svgWidth} height={svgHeight}>
            {processedArcs.map((arc) => {
              const pathData = describeArc(cx, cy, radius, arc.startAngle, arc.endAngle);

              const horizontalEndPt = {
                x: arc.elbowPt.x + (arc.isRightSide ? 10 : -10),
                y: arc.adjustedY,
              };
              const textX = horizontalEndPt.x + (arc.isRightSide ? 3 : -3);

              return (
                <G key={arc.key}>
                  {/* Pie Slice */}
                  <Path
                    d={pathData}
                    fill={arc.color}
                    stroke={isDark ? '#101917' : '#ffffff'}
                    strokeWidth="1.5"
                  />

                  {/* Non-overlapping Leader Line */}
                  <Line
                    x1={arc.sliceEdgePt.x}
                    y1={arc.sliceEdgePt.y}
                    x2={arc.elbowPt.x}
                    y2={arc.adjustedY}
                    stroke={arc.color}
                    strokeWidth="1.2"
                  />
                  <Line
                    x1={arc.elbowPt.x}
                    y1={arc.adjustedY}
                    x2={horizontalEndPt.x}
                    y2={arc.adjustedY}
                    stroke={arc.color}
                    strokeWidth="1.2"
                  />

                  {/* Direct Category Name & Actual Amount Callout Text */}
                  <SvgText
                    x={textX}
                    y={arc.adjustedY + 4}
                    fill={isDark ? '#E5E7EB' : '#374151'}
                    fontSize="11"
                    fontWeight="700"
                    textAnchor={arc.isRightSide ? 'start' : 'end'}
                  >
                    {`${arc.key} (${CURRENCY_SYMBOL}${arc.value.toLocaleString('en-IN')})`}
                  </SvgText>
                </G>
              );
            })}
          </Svg>
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  cardContainer: {
    marginTop: 16,
    marginBottom: 16,
  },
  topControlsContainer: {
    marginBottom: 12,
    paddingHorizontal: 16,
    gap: 10,
  },
  topDropdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  breakdownTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.onSurface,
    letterSpacing: -0.3,
  },
  breakdownTitleDark: {
    color: '#F9FAFB',
  },
  activityLogsNavBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceContainerLow,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainer,
  },
  activityLogsNavBtnDark: {
    backgroundColor: 'rgba(52, 211, 153, 0.12)',
    borderColor: 'rgba(52, 211, 153, 0.25)',
  },
  activityLogsNavBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  activityLogsNavBtnTextDark: {
    color: '#34D399',
  },
  tabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tabSelector: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
    padding: 3,
    gap: 2,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  tabSelectorDark: {
    backgroundColor: '#131D1A',
    borderColor: 'rgba(255,255,255,0.06)',
  },
  tabBtn: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 7,
  },
  tabBtnActiveLight: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  tabBtnActiveDark: {
    backgroundColor: '#1E292B',
  },
  tabBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  datePickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 14,
    gap: 6,
  },
  datePickerBtnDark: {
    backgroundColor: '#131D1A',
  },
  datePickerBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
  datePickerBtnTextDark: {
    color: '#34D399',
  },
  svgContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  emptyChartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    marginVertical: 4,
  },
  emptyChartContainerDark: {
    backgroundColor: '#131D1A',
  },
  emptyChartTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
    marginTop: 10,
    textAlign: 'center',
  },
  emptyChartTitleDark: {
    color: '#E5E7EB',
  },
  emptyChartSub: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
  emptyChartSubDark: {
    color: '#9CA3AF',
  },
});
