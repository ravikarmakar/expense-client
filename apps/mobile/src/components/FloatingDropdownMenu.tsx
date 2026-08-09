import React, { useState, useEffect, useMemo } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../constants/theme';

export interface FloatingMenuItem<T extends string = string> {
  label: string;
  value: T;
  icon?: string;
  description?: string;
  subMenuType?: 'month' | 'year' | 'date';
}

export interface FloatingDropdownMenuProps<T extends string = string> {
  visible: boolean;
  onClose: () => void;
  title?: string;
  options?: readonly FloatingMenuItem<T>[] | FloatingMenuItem<T>[];
  selectedValue?: T;
  isSelected?: (item: FloatingMenuItem<T>) => boolean;
  onSelect?: (item: FloatingMenuItem<T>) => void;
  topOffset?: number;
  rightOffset?: number;
  width?: number;
  enablePickerSubViews?: boolean;
  variant?: 'light' | 'dark';
  accentColor?: string;
  children?: React.ReactNode;
}

const MONTH_NAMES_LONG = [
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

const MONTH_NAMES_SHORT = [
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

const WEEKDAY_NAMES = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export function FloatingDropdownMenu<T extends string = string>({
  visible,
  onClose,
  title,
  options = [],
  selectedValue,
  isSelected,
  onSelect,
  topOffset,
  rightOffset = 20,
  width = 240,
  enablePickerSubViews = true,
  variant = 'light',
  accentColor,
  children,
}: FloatingDropdownMenuProps<T>) {
  const insets = useSafeAreaInsets();
  const isDark = variant === 'dark';
  const [currentView, setCurrentView] = useState<'main' | 'month' | 'year' | 'date'>('main');
  const [pickerYear, setPickerYear] = useState<number>(new Date().getFullYear());

  const now = new Date();
  const [calYear, setCalYear] = useState<number>(now.getFullYear());
  const [calMonth, setCalMonth] = useState<number>(now.getMonth());

  useEffect(() => {
    if (visible) {
      setCurrentView('main');
      const d = new Date();
      setPickerYear(d.getFullYear());
      setCalYear(d.getFullYear());
      setCalMonth(d.getMonth());
    }
  }, [visible]);

  const currentYear = now.getFullYear();
  const yearOptions = useMemo(() => {
    const years: number[] = [];
    for (let y = currentYear; y >= 2020; y--) {
      years.push(y);
    }
    return years;
  }, [currentYear]);

  // Calendar calculations
  const calendarDays = useMemo(() => {
    const firstDay = new Date(calYear, calMonth, 1).getDay();
    const totalDays = new Date(calYear, calMonth + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < firstDay; i++) {
      cells.push({ day: null, key: `empty-${i}` });
    }
    for (let d = 1; d <= totalDays; d++) {
      cells.push({ day: d, key: `day-${d}` });
    }
    return cells;
  }, [calYear, calMonth]);

  const handlePrevCalMonth = () => {
    if (calMonth === 0) {
      setCalMonth(11);
      setCalYear((y) => y - 1);
    } else {
      setCalMonth((m) => m - 1);
    }
  };

  const handleNextCalMonth = () => {
    if (calYear > currentYear || (calYear === currentYear && calMonth >= now.getMonth())) {
      return;
    }
    if (calMonth === 11) {
      setCalMonth(0);
      setCalYear((y) => y + 1);
    } else {
      setCalMonth((m) => m + 1);
    }
  };

  if (!visible) return null;

  const defaultTopOffset = insets.top + 110;
  const finalTopOffset = topOffset !== undefined ? topOffset : defaultTopOffset;

  const activeAccentColor = accentColor || (isDark ? '#34D399' : COLORS.secondary);
  const activeBgColor = isDark
    ? accentColor
      ? `${accentColor}25`
      : 'rgba(52, 211, 153, 0.15)'
    : accentColor
      ? `${accentColor}20`
      : COLORS.secondaryFixed + '40';
  const inactiveIconColor = isDark ? '#9CA3AF' : COLORS.outline;
  const primaryTextColor = isDark ? '#F9FAFB' : COLORS.onSurface;

  return (
    <View
      style={[
        styles.absoluteOverlayContainer,
        { paddingTop: finalTopOffset, paddingRight: rightOffset },
      ]}
      pointerEvents="box-none"
    >
      <TouchableOpacity
        style={[styles.absoluteBackdrop, isDark && { backgroundColor: 'rgba(0, 0, 0, 0.4)' }]}
        activeOpacity={1}
        onPress={onClose}
      />
      <View
        style={[
          styles.floatingMenuCard,
          isDark && { backgroundColor: '#1A2623', borderColor: 'rgba(255, 255, 255, 0.12)' },
          { width },
        ]}
      >
        {children ? (
          children
        ) : (
          <>
            {/* MAIN VIEW */}
            {currentView === 'main' && (
              <>
                {title ? (
                  <>
                    <Text style={[styles.floatingMenuTitle, isDark && { color: '#9CA3AF' }]}>
                      {title}
                    </Text>
                    <View
                      style={[
                        styles.floatingMenuDivider,
                        isDark && { backgroundColor: 'rgba(255, 255, 255, 0.08)' },
                      ]}
                    />
                  </>
                ) : null}

                {options.map((opt) => {
                  const active = isSelected
                    ? isSelected(opt)
                    : selectedValue !== undefined && selectedValue === opt.value;

                  const subType = enablePickerSubViews
                    ? opt.subMenuType ||
                      (opt.value === 'custom_month'
                        ? 'month'
                        : opt.value === 'custom_year'
                          ? 'year'
                          : opt.value === 'custom_date'
                            ? 'date'
                            : undefined)
                    : undefined;

                  return (
                    <TouchableOpacity
                      key={opt.value}
                      style={[
                        styles.floatingMenuItem,
                        active &&
                          (isDark
                            ? { backgroundColor: activeBgColor }
                            : { backgroundColor: activeBgColor }),
                      ]}
                      onPress={() => {
                        if (subType === 'month') {
                          setCurrentView('month');
                        } else if (subType === 'year') {
                          setCurrentView('year');
                        } else if (subType === 'date') {
                          setCurrentView('date');
                        } else {
                          onClose();
                          onSelect?.(opt);
                        }
                      }}
                      activeOpacity={0.7}
                    >
                      <View style={styles.floatingMenuItemLeft}>
                        {opt.icon && (
                          <Ionicons
                            name={opt.icon as never}
                            size={18}
                            color={active ? activeAccentColor : inactiveIconColor}
                          />
                        )}
                        <View>
                          <Text
                            style={[
                              styles.floatingMenuItemText,
                              isDark && { color: primaryTextColor },
                              active && { color: activeAccentColor, fontWeight: '800' },
                            ]}
                          >
                            {opt.label}
                          </Text>
                          {opt.description ? (
                            <Text
                              style={[styles.floatingMenuItemSub, isDark && { color: '#9CA3AF' }]}
                            >
                              {opt.description}
                            </Text>
                          ) : null}
                        </View>
                      </View>
                      {active ? (
                        <Ionicons name="checkmark-sharp" size={18} color={activeAccentColor} />
                      ) : subType ? (
                        <Ionicons name="chevron-forward" size={16} color={inactiveIconColor} />
                      ) : null}
                    </TouchableOpacity>
                  );
                })}
              </>
            )}

            {/* MONTH SUB-VIEW */}
            {currentView === 'month' && enablePickerSubViews && (
              <View style={styles.subViewContainer}>
                <View style={styles.subHeaderRow}>
                  <TouchableOpacity
                    style={styles.backBtn}
                    onPress={() => setCurrentView('main')}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="chevron-back" size={18} color={activeAccentColor} />
                    <Text style={[styles.backBtnText, { color: activeAccentColor }]}>Back</Text>
                  </TouchableOpacity>
                  <Text style={[styles.subHeaderTitle, isDark && { color: primaryTextColor }]}>
                    Select Month
                  </Text>
                </View>
                <View
                  style={[
                    styles.floatingMenuDivider,
                    isDark && { backgroundColor: 'rgba(255, 255, 255, 0.08)' },
                  ]}
                />

                <View style={styles.yearNavRow}>
                  <TouchableOpacity
                    onPress={() => setPickerYear((y) => y - 1)}
                    style={styles.yearNavBtn}
                  >
                    <Ionicons name="chevron-back" size={18} color={primaryTextColor} />
                  </TouchableOpacity>
                  <Text style={[styles.yearTitleText, isDark && { color: primaryTextColor }]}>
                    {pickerYear}
                  </Text>
                  <TouchableOpacity
                    onPress={() => pickerYear < currentYear && setPickerYear((y) => y + 1)}
                    disabled={pickerYear >= currentYear}
                    style={[styles.yearNavBtn, pickerYear >= currentYear && { opacity: 0.3 }]}
                  >
                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color={pickerYear >= currentYear ? inactiveIconColor : primaryTextColor}
                    />
                  </TouchableOpacity>
                </View>

                <ScrollView style={{ maxHeight: 260 }} showsVerticalScrollIndicator={true}>
                  {MONTH_NAMES_LONG.map((mName, idx) => {
                    const mNum = idx + 1;
                    const monthVal = `month-${pickerYear}-${mNum}`;
                    const isCurrentMonthNow =
                      pickerYear === now.getFullYear() && idx === now.getMonth();
                    const isFutureMonth =
                      pickerYear > now.getFullYear() ||
                      (pickerYear === now.getFullYear() && idx > now.getMonth());

                    const itemActive =
                      selectedValue === monthVal ||
                      (selectedValue === 'this-month' && isCurrentMonthNow);

                    return (
                      <TouchableOpacity
                        key={mName}
                        disabled={isFutureMonth}
                        style={[
                          styles.floatingMenuItem,
                          isFutureMonth && { opacity: 0.3 },
                          itemActive && { backgroundColor: activeBgColor },
                        ]}
                        onPress={() => {
                          if (!isFutureMonth) {
                            onClose();
                            onSelect?.({
                              label: `${MONTH_NAMES_SHORT[idx]} ${pickerYear}`,
                              value: isCurrentMonthNow ? ('this-month' as T) : (monthVal as T),
                            });
                          }
                        }}
                        activeOpacity={0.7}
                      >
                        <View style={styles.floatingMenuItemLeft}>
                          <Ionicons
                            name="calendar-outline"
                            size={18}
                            color={itemActive ? activeAccentColor : inactiveIconColor}
                          />
                          <Text
                            style={[
                              styles.floatingMenuItemText,
                              isDark && { color: primaryTextColor },
                              itemActive && { color: activeAccentColor, fontWeight: '800' },
                            ]}
                          >
                            {mName}
                          </Text>
                        </View>
                        {itemActive && (
                          <Ionicons name="checkmark-sharp" size={18} color={activeAccentColor} />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            )}

            {/* YEAR SUB-VIEW */}
            {currentView === 'year' && enablePickerSubViews && (
              <View style={styles.subViewContainer}>
                <View style={styles.subHeaderRow}>
                  <TouchableOpacity
                    style={styles.backBtn}
                    onPress={() => setCurrentView('main')}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="chevron-back" size={18} color={activeAccentColor} />
                    <Text style={[styles.backBtnText, { color: activeAccentColor }]}>Back</Text>
                  </TouchableOpacity>
                  <Text style={[styles.subHeaderTitle, isDark && { color: primaryTextColor }]}>
                    Select Year
                  </Text>
                </View>
                <View
                  style={[
                    styles.floatingMenuDivider,
                    isDark && { backgroundColor: 'rgba(255, 255, 255, 0.08)' },
                  ]}
                />

                <ScrollView style={{ maxHeight: 260 }} showsVerticalScrollIndicator={true}>
                  {yearOptions.map((year) => {
                    const yearVal = `year-${year}`;
                    const itemActive = selectedValue === yearVal;
                    return (
                      <TouchableOpacity
                        key={year}
                        style={[
                          styles.floatingMenuItem,
                          itemActive && { backgroundColor: activeBgColor },
                        ]}
                        onPress={() => {
                          onClose();
                          onSelect?.({
                            label: `${year}`,
                            value: yearVal as T,
                          });
                        }}
                        activeOpacity={0.7}
                      >
                        <View style={styles.floatingMenuItemLeft}>
                          <Ionicons
                            name="ribbon-outline"
                            size={18}
                            color={itemActive ? activeAccentColor : inactiveIconColor}
                          />
                          <Text
                            style={[
                              styles.floatingMenuItemText,
                              isDark && { color: primaryTextColor },
                              itemActive && { color: activeAccentColor, fontWeight: '800' },
                            ]}
                          >
                            {year}
                          </Text>
                        </View>
                        {itemActive && (
                          <Ionicons name="checkmark-sharp" size={18} color={activeAccentColor} />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            )}

            {/* CHOOSE DATE SUB-VIEW */}
            {currentView === 'date' && enablePickerSubViews && (
              <View style={styles.subViewContainer}>
                <View style={styles.subHeaderRow}>
                  <TouchableOpacity
                    style={styles.backBtn}
                    onPress={() => setCurrentView('main')}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="chevron-back" size={18} color={activeAccentColor} />
                    <Text style={[styles.backBtnText, { color: activeAccentColor }]}>Back</Text>
                  </TouchableOpacity>
                  <Text style={[styles.subHeaderTitle, isDark && { color: primaryTextColor }]}>
                    Choose Date
                  </Text>
                </View>
                <View
                  style={[
                    styles.floatingMenuDivider,
                    isDark && { backgroundColor: 'rgba(255, 255, 255, 0.08)' },
                  ]}
                />

                <View style={styles.yearNavRow}>
                  <TouchableOpacity onPress={handlePrevCalMonth} style={styles.yearNavBtn}>
                    <Ionicons name="chevron-back" size={18} color={primaryTextColor} />
                  </TouchableOpacity>
                  <Text style={[styles.yearTitleText, isDark && { color: primaryTextColor }]}>
                    {MONTH_NAMES_SHORT[calMonth]} {calYear}
                  </Text>
                  <TouchableOpacity
                    onPress={handleNextCalMonth}
                    disabled={
                      calYear > currentYear ||
                      (calYear === currentYear && calMonth >= now.getMonth())
                    }
                    style={[
                      styles.yearNavBtn,
                      (calYear > currentYear ||
                        (calYear === currentYear && calMonth >= now.getMonth())) && {
                        opacity: 0.3,
                      },
                    ]}
                  >
                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color={
                        calYear > currentYear ||
                        (calYear === currentYear && calMonth >= now.getMonth())
                          ? inactiveIconColor
                          : primaryTextColor
                      }
                    />
                  </TouchableOpacity>
                </View>

                <View
                  style={[
                    styles.calWeekdayRow,
                    isDark && { borderBottomColor: 'rgba(255, 255, 255, 0.08)' },
                  ]}
                >
                  {WEEKDAY_NAMES.map((wd) => (
                    <Text key={wd} style={[styles.calWeekdayText, isDark && { color: '#9CA3AF' }]}>
                      {wd}
                    </Text>
                  ))}
                </View>

                <View style={styles.calGridContainer}>
                  {calendarDays.map((cell) => {
                    if (cell.day === null) {
                      return <View key={cell.key} style={styles.calCellEmpty} />;
                    }

                    const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(cell.day).padStart(2, '0')}`;
                    const cellDate = new Date(calYear, calMonth, cell.day);
                    const isFuture = cellDate > now;
                    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
                    const isToday = dateStr === todayStr;
                    const isSelectedDate =
                      selectedValue === dateStr ||
                      (isToday &&
                        (selectedValue === 'today' ||
                          selectedValue === 'custom_date' ||
                          !selectedValue));

                    return (
                      <TouchableOpacity
                        key={cell.key}
                        disabled={isFuture}
                        style={[
                          styles.calCell,
                          isFuture && { opacity: 0.25 },
                          isToday &&
                            !isSelectedDate &&
                            (isDark
                              ? {
                                  borderWidth: 1.5,
                                  borderColor: activeAccentColor,
                                  backgroundColor: activeBgColor,
                                }
                              : styles.calCellToday),
                          isSelectedDate &&
                            (isDark
                              ? { backgroundColor: activeAccentColor }
                              : styles.calCellSelected),
                        ]}
                        onPress={() => {
                          if (!isFuture) {
                            onClose();
                            onSelect?.({
                              label: `${cell.day} ${MONTH_NAMES_SHORT[calMonth]} ${calYear}`,
                              value: dateStr as T,
                            });
                          }
                        }}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.calCellText,
                            isDark && { color: primaryTextColor },
                            isToday &&
                              !isSelectedDate &&
                              (isDark
                                ? { color: activeAccentColor, fontWeight: '800' }
                                : styles.calCellTextToday),
                            isSelectedDate &&
                              (isDark
                                ? { color: '#ffffff', fontWeight: '800' }
                                : styles.calCellTextSelected),
                          ]}
                        >
                          {cell.day}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  absoluteOverlayContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    elevation: 9999,
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  absoluteBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  floatingMenuCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainer,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  floatingMenuTitle: {
    fontSize: 10.5,
    fontWeight: '800',
    color: COLORS.outline,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    paddingHorizontal: 12,
    paddingTop: 4,
    paddingBottom: 6,
  },
  floatingMenuDivider: {
    height: 1,
    backgroundColor: COLORS.surfaceContainerLow,
    marginBottom: 6,
    marginTop: 2,
  },
  floatingMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginVertical: 2,
  },
  floatingMenuItemActive: {
    backgroundColor: COLORS.secondaryFixed + '40',
  },
  floatingMenuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  floatingMenuItemText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: COLORS.onSurface,
  },
  floatingMenuItemTextActive: {
    fontWeight: '800',
    color: COLORS.secondary,
  },
  floatingMenuItemSub: {
    fontSize: 11,
    color: COLORS.outline,
    marginTop: 1,
  },
  subViewContainer: {
    paddingHorizontal: 2,
  },
  subHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  backBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  subHeaderTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.onSurface,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingRight: 6,
  },
  yearNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 4,
    marginBottom: 4,
  },
  yearNavBtn: {
    padding: 4,
  },
  yearTitleText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: COLORS.onSurface,
  },
  calWeekdayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceContainerLow,
    marginBottom: 4,
  },
  calWeekdayText: {
    width: 31,
    textAlign: 'center',
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.outline,
  },
  calGridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    paddingHorizontal: 2,
    paddingVertical: 4,
  },
  calCellEmpty: {
    width: 31,
    height: 30,
  },
  calCell: {
    width: 31,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 1,
  },
  calCellSelected: {
    backgroundColor: COLORS.secondary,
  },
  calCellToday: {
    borderWidth: 1.5,
    borderColor: COLORS.secondary,
    backgroundColor: COLORS.secondaryFixed + '40',
  },
  calCellText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.onSurface,
  },
  calCellTextToday: {
    fontWeight: '800',
    color: COLORS.secondary,
  },
  calCellTextSelected: {
    fontWeight: '800',
    color: '#ffffff',
  },
});
