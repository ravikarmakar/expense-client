import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  Modal,
  ScrollView,
} from 'react-native';
import Svg, { Path, Line, Text as SvgText, G } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, CURRENCY_SYMBOL } from '../constants/theme';
import { getCategoryVisuals } from '../constants/categories';
import { useCategories, type Income, type Settlement, type Expense } from '@workspace/api';

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
  onDateRangeChange,
}: ActivityOverviewChartCardProps) {
  const [chartTab, setChartTab] = useState<'category' | 'type'>('category');
  const [datePickerModalVisible, setDatePickerModalVisible] = useState(false);
  const [pickerYear, setPickerYear] = useState<number>(new Date().getFullYear());

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
      {/* Top Controls Header */}
      <View style={styles.headerRow}>
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
              chartTab === 'type' && (isDark ? styles.tabBtnActiveDark : styles.tabBtnActiveLight),
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

        {onDateRangeChange && (
          <TouchableOpacity
            style={[styles.datePickerBtn, isDark && styles.datePickerBtnDark]}
            onPress={() => setDatePickerModalVisible(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="calendar" size={16} color={isDark ? '#34D399' : COLORS.primary} />
            <Text style={[styles.datePickerBtnText, isDark && styles.datePickerBtnTextDark]}>
              {getDateRangeLabel(dateRange)}
            </Text>
            <Ionicons name="chevron-down" size={16} color={isDark ? '#9CA3AF' : COLORS.outline} />
          </TouchableOpacity>
        )}
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

      {/* Date Range & Month Selector Modal */}
      <Modal
        animationType="fade"
        transparent
        visible={datePickerModalVisible}
        onRequestClose={() => setDatePickerModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setDatePickerModalVisible(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={[styles.dateModalCard, isDark && styles.dateModalCardDark]}
          >
            <View style={styles.dateModalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="calendar" size={20} color={isDark ? '#34D399' : COLORS.primary} />
                <Text style={[styles.dateModalTitle, isDark && styles.dateModalTitleDark]}>
                  Select Period / Month
                </Text>
              </View>
              <TouchableOpacity onPress={() => setDatePickerModalVisible(false)}>
                <Ionicons
                  name="close-circle"
                  size={22}
                  color={isDark ? '#9CA3AF' : COLORS.outline}
                />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 420 }} showsVerticalScrollIndicator={false}>
              {/* Presets Section */}
              <Text style={[styles.sectionHeading, isDark && styles.sectionHeadingDark]}>
                Quick Presets
              </Text>
              <View style={styles.presetsRow}>
                {[
                  { label: 'This Month', value: 'this-month', icon: 'calendar-number-outline' },
                  { label: 'Last Month', value: 'last-month', icon: 'play-back-outline' },
                  { label: 'Last 7 Days', value: 'last-7-days', icon: 'time-outline' },
                  { label: 'Last 30 Days', value: 'last-30-days', icon: 'timer-outline' },
                  { label: 'All Time', value: 'all-time', icon: 'infinite-outline' },
                ].map((preset) => {
                  const isSelected = dateRange === preset.value;
                  return (
                    <TouchableOpacity
                      key={preset.value}
                      style={[
                        styles.presetChip,
                        isDark && styles.presetChipDark,
                        isSelected &&
                          (isDark ? styles.presetChipSelectedDark : styles.presetChipSelected),
                      ]}
                      onPress={() => {
                        onDateRangeChange?.(preset.value);
                        setDatePickerModalVisible(false);
                      }}
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name={preset.icon as never}
                        size={14}
                        color={
                          isSelected
                            ? isDark
                              ? '#101917'
                              : '#ffffff'
                            : isDark
                              ? '#9CA3AF'
                              : COLORS.secondary
                        }
                      />
                      <Text
                        style={[
                          styles.presetChipText,
                          isDark && styles.presetChipTextDark,
                          isSelected &&
                            (isDark
                              ? styles.presetChipTextSelectedDark
                              : styles.presetChipTextSelected),
                        ]}
                      >
                        {preset.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Specific Month Selector Section */}
              <Text
                style={[
                  styles.sectionHeading,
                  isDark && styles.sectionHeadingDark,
                  { marginTop: 16 },
                ]}
              >
                Specific Month
              </Text>

              {/* Year Switcher Header */}
              <View style={[styles.yearSelectorRow, isDark && styles.yearSelectorRowDark]}>
                <TouchableOpacity
                  onPress={() => setPickerYear((y) => y - 1)}
                  style={styles.yearNavBtn}
                >
                  <Ionicons name="chevron-back" size={18} color={isDark ? '#E5E7EB' : '#374151'} />
                </TouchableOpacity>
                <Text style={[styles.yearText, isDark && styles.yearTextDark]}>{pickerYear}</Text>
                <TouchableOpacity
                  onPress={() => setPickerYear((y) => y + 1)}
                  style={styles.yearNavBtn}
                >
                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color={isDark ? '#E5E7EB' : '#374151'}
                  />
                </TouchableOpacity>
              </View>

              {/* 12 Month Grid */}
              <View style={styles.monthGrid}>
                {[
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
                ].map((mName, idx) => {
                  const mNum = (idx + 1).toString().padStart(2, '0');
                  const monthVal = `month-${pickerYear}-${mNum}`;
                  const now = new Date();
                  const isCurrentMonthNow =
                    pickerYear === now.getFullYear() && idx === now.getMonth();

                  const isSelected =
                    dateRange === monthVal || (isCurrentMonthNow && dateRange === 'this-month');

                  return (
                    <TouchableOpacity
                      key={mName}
                      style={[
                        styles.monthGridCell,
                        isDark && styles.monthGridCellDark,
                        isSelected &&
                          (isDark ? styles.monthCellSelectedDark : styles.monthCellSelected),
                      ]}
                      onPress={() => {
                        if (isCurrentMonthNow) {
                          onDateRangeChange?.('this-month');
                        } else {
                          onDateRangeChange?.(monthVal);
                        }
                        setDatePickerModalVisible(false);
                      }}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.monthCellText,
                          isDark && styles.monthCellTextDark,
                          isSelected &&
                            (isDark
                              ? styles.monthCellTextSelectedDark
                              : styles.monthCellTextSelected),
                        ]}
                      >
                        {mName}
                      </Text>
                      {isCurrentMonthNow && (
                        <View
                          style={[
                            styles.currentMonthDot,
                            isSelected && { backgroundColor: isDark ? '#101917' : '#ffffff' },
                          ]}
                        />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
});

const styles = StyleSheet.create({
  cardContainer: {
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  tabSelector: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderRadius: 14,
    padding: 4,
    gap: 4,
  },
  tabSelectorDark: {
    backgroundColor: '#131D1A',
  },
  tabBtn: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 10,
  },
  tabBtnActiveLight: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  tabBtnActiveDark: {
    backgroundColor: '#101917',
  },
  tabBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  dateModalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  dateModalCardDark: {
    backgroundColor: '#101917',
  },
  dateModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  dateModalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  dateModalTitleDark: {
    color: '#F9FAFB',
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  sectionHeadingDark: {
    color: '#9CA3AF',
  },
  presetsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  presetChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  presetChipDark: {
    backgroundColor: '#1E292B',
  },
  presetChipSelected: {
    backgroundColor: COLORS.primary,
  },
  presetChipSelectedDark: {
    backgroundColor: '#34D399',
  },
  presetChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  presetChipTextDark: {
    color: '#D1D5DB',
  },
  presetChipTextSelected: {
    color: '#ffffff',
  },
  presetChipTextSelectedDark: {
    color: '#101917',
    fontWeight: '800',
  },
  yearSelectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 10,
  },
  yearSelectorRowDark: {
    backgroundColor: '#1E292B',
  },
  yearNavBtn: {
    padding: 4,
  },
  yearText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  yearTextDark: {
    color: '#F3F4F6',
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  monthGridCell: {
    width: '31%',
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  monthGridCellDark: {
    backgroundColor: '#1E292B',
  },
  monthCellSelected: {
    backgroundColor: COLORS.primary,
  },
  monthCellSelectedDark: {
    backgroundColor: '#34D399',
  },
  monthCellText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  monthCellTextDark: {
    color: '#D1D5DB',
  },
  monthCellTextSelected: {
    color: '#ffffff',
    fontWeight: '700',
  },
  monthCellTextSelectedDark: {
    color: '#101917',
    fontWeight: '800',
  },
  currentMonthDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.primary,
    position: 'absolute',
    bottom: 4,
  },
});
