import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  GestureResponderEvent,
  LayoutAnimation,
  Platform,
  UIManager,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { BottomSheetModal } from './BottomSheetModal';
import { TactileButton } from './TactileButton';
import { useTheme } from '../context/ThemeContext';

const MONTH_NAMES = [
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

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface DatePickerModalProps {
  visible: boolean;
  onClose: () => void;
  selectedDate: string; // YYYY-MM-DD
  onSelectDate: (dateString: string) => void;
}

export function DatePickerModal({
  visible,
  onClose,
  selectedDate,
  onSelectDate,
}: DatePickerModalProps) {
  const { isDark } = useTheme();

  // Parse YYYY-MM-DD or default to today
  const parseDate = (str: string) => {
    const parts = str ? str.split('-').map(Number) : [];
    if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
      return new Date(parts[0], parts[1] - 1, parts[2]);
    }
    return new Date();
  };

  const initialDate = parseDate(selectedDate);
  const [currentYear, setCurrentYear] = useState(initialDate.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(initialDate.getMonth()); // 0-indexed
  const [activeDay, setActiveDay] = useState(initialDate.getDate());

  useEffect(() => {
    if (visible) {
      const d = parseDate(selectedDate);
      setCurrentYear(d.getFullYear());
      setCurrentMonth(d.getMonth());
      setActiveDay(d.getDate());
    }
  }, [visible, selectedDate]);

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const formatShortDate = (dateObj: Date) => {
    const yyyy = dateObj.getFullYear();
    const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
    const dd = String(dateObj.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const handleShortcutSelect = (offsetDays: number) => {
    const d = new Date();
    d.setDate(d.getDate() - offsetDays);
    const dateStr = formatShortDate(d);
    onSelectDate(dateStr);
    onClose();
  };

  const handleConfirm = () => {
    const mm = String(currentMonth + 1).padStart(2, '0');
    const dd = String(activeDay).padStart(2, '0');
    const dateStr = `${currentYear}-${mm}-${dd}`;
    onSelectDate(dateStr);
    onClose();
  };

  const todayStr = formatShortDate(new Date());
  const yesterdayStr = formatShortDate(new Date(Date.now() - 86400000));
  const twoDaysAgoStr = formatShortDate(new Date(Date.now() - 2 * 86400000));

  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const monthPickerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(monthPickerAnim, {
      toValue: showMonthPicker ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [showMonthPicker, monthPickerAnim]);

  const toggleMonthPicker = () => {
    if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowMonthPicker((prev) => !prev);
  };

  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const handleTouchStart = (e: GestureResponderEvent) => {
    setTouchStartX(e.nativeEvent.pageX);
  };

  const handleTouchEnd = (e: GestureResponderEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.nativeEvent.pageX;
    const deltaX = touchEndX - touchStartX;
    if (deltaX < -40) {
      handleNextMonth();
    } else if (deltaX > 40) {
      handlePrevMonth();
    }
    setTouchStartX(null);
  };

  return (
    <BottomSheetModal
      visible={visible}
      onClose={onClose}
      title="Select Date"
      variant={isDark ? 'dark' : 'light'}
    >
      <View style={styles.container} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
        {/* Quick Date Shortcuts */}
        <View style={styles.shortcutRow}>
          <TouchableOpacity
            style={[
              styles.shortcutChip,
              selectedDate === todayStr && styles.shortcutChipActive,
              isDark && selectedDate !== todayStr && styles.shortcutChipDark,
            ]}
            onPress={() => handleShortcutSelect(0)}
            activeOpacity={0.75}
          >
            <Ionicons
              name="today-outline"
              size={14}
              color={selectedDate === todayStr ? '#FFFFFF' : isDark ? '#9CA3AF' : '#374151'}
            />
            <Text
              style={[
                styles.shortcutText,
                selectedDate === todayStr && styles.shortcutTextActive,
                isDark && selectedDate !== todayStr && { color: '#9CA3AF' },
              ]}
            >
              Today
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.shortcutChip,
              selectedDate === yesterdayStr && styles.shortcutChipActive,
              isDark && selectedDate !== yesterdayStr && styles.shortcutChipDark,
            ]}
            onPress={() => handleShortcutSelect(1)}
            activeOpacity={0.75}
          >
            <Ionicons
              name="time-outline"
              size={14}
              color={selectedDate === yesterdayStr ? '#FFFFFF' : isDark ? '#9CA3AF' : '#374151'}
            />
            <Text
              style={[
                styles.shortcutText,
                selectedDate === yesterdayStr && styles.shortcutTextActive,
                isDark && selectedDate !== yesterdayStr && { color: '#9CA3AF' },
              ]}
            >
              Yesterday
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.shortcutChip,
              selectedDate === twoDaysAgoStr && styles.shortcutChipActive,
              isDark && selectedDate !== twoDaysAgoStr && styles.shortcutChipDark,
            ]}
            onPress={() => handleShortcutSelect(2)}
            activeOpacity={0.75}
          >
            <Ionicons
              name="calendar-outline"
              size={14}
              color={selectedDate === twoDaysAgoStr ? '#FFFFFF' : isDark ? '#9CA3AF' : '#374151'}
            />
            <Text
              style={[
                styles.shortcutText,
                selectedDate === twoDaysAgoStr && styles.shortcutTextActive,
                isDark && selectedDate !== twoDaysAgoStr && { color: '#9CA3AF' },
              ]}
            >
              2 Days Ago
            </Text>
          </TouchableOpacity>
        </View>

        {/* Month & Year Navigation Header Card */}
        <View
          style={[
            styles.calendarHeader,
            isDark && {
              backgroundColor: '#101917',
              borderColor: 'rgba(255, 255, 255, 0.08)',
              borderWidth: 1,
            },
          ]}
        >
          <View style={styles.calendarHeaderTopRow}>
            <TouchableOpacity onPress={handlePrevMonth} style={styles.navBtn} activeOpacity={0.7}>
              <Ionicons
                name="chevron-back"
                size={20}
                color={isDark ? '#FFFFFF' : COLORS.onSurface}
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={toggleMonthPicker}
              style={styles.monthHeaderToggle}
              activeOpacity={0.75}
            >
              <Text style={[styles.monthYearText, isDark && { color: '#FFFFFF' }]}>
                {MONTH_NAMES[currentMonth]} {currentYear}
              </Text>
              <Ionicons
                name={showMonthPicker ? 'chevron-up' : 'chevron-down'}
                size={16}
                color={isDark ? '#10B981' : COLORS.primary}
              />
            </TouchableOpacity>

            <TouchableOpacity onPress={handleNextMonth} style={styles.navBtn} activeOpacity={0.7}>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={isDark ? '#FFFFFF' : COLORS.onSurface}
              />
            </TouchableOpacity>
          </View>

          {/* Expanded Inline Month Selector */}
          {showMonthPicker && (
            <Animated.View
              style={[
                styles.expandedPickerContainer,
                isDark && { borderTopColor: 'rgba(255, 255, 255, 0.08)' },
                {
                  opacity: monthPickerAnim,
                  transform: [
                    {
                      translateY: monthPickerAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-6, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <View style={styles.monthsGrid}>
                {MONTH_NAMES.map((monthName, idx) => {
                  const isSelected = currentMonth === idx;
                  return (
                    <TouchableOpacity
                      key={monthName}
                      style={[
                        styles.monthChip,
                        isDark && {
                          backgroundColor: '#131D1A',
                          borderColor: 'rgba(255, 255, 255, 0.08)',
                        },
                        isSelected &&
                          (isDark
                            ? { backgroundColor: '#10B981', borderColor: '#10B981' }
                            : { backgroundColor: COLORS.primary, borderColor: COLORS.primary }),
                      ]}
                      onPress={() => {
                        setCurrentMonth(idx);
                        toggleMonthPicker();
                      }}
                      activeOpacity={0.75}
                    >
                      <Text
                        style={[
                          styles.monthChipText,
                          { color: isSelected ? '#FFFFFF' : isDark ? '#9CA3AF' : '#374151' },
                          isSelected && { fontWeight: '800' },
                        ]}
                      >
                        {monthName.slice(0, 3)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </Animated.View>
          )}
        </View>

        {/* Days of Week Header */}
        <View style={styles.weekHeader}>
          {DAYS_OF_WEEK.map((day) => (
            <Text key={day} style={[styles.weekDayText, isDark && { color: '#74817B' }]}>
              {day}
            </Text>
          ))}
        </View>

        {/* Calendar Day Grid */}
        <View style={styles.daysGrid}>
          {/* Empty slots before first day */}
          {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
            <View key={`empty-${idx}`} style={styles.dayCell} />
          ))}

          {/* Days 1..N */}
          {Array.from({ length: daysInMonth }).map((_, idx) => {
            const dayNum = idx + 1;
            const isSelected = activeDay === dayNum;
            return (
              <TouchableOpacity
                key={`day-${dayNum}`}
                style={[
                  styles.dayCell,
                  isSelected && styles.dayCellActive,
                  isSelected && isDark && styles.dayCellActiveDark,
                ]}
                onPress={() => setActiveDay(dayNum)}
                activeOpacity={0.75}
              >
                <Text
                  style={[
                    styles.dayNumText,
                    isDark
                      ? { color: isSelected ? '#FFFFFF' : '#9CA3AF' }
                      : { color: isSelected ? '#FFFFFF' : '#191C1D' },
                    isSelected && styles.dayNumTextActive,
                  ]}
                >
                  {dayNum}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <TactileButton
          title="Apply Date"
          icon="checkmark-circle"
          provider="emerald"
          onPress={handleConfirm}
          style={styles.applyBtn}
        />
      </View>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  shortcutRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  shortcutChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  shortcutChipDark: {
    backgroundColor: '#101917',
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  shortcutChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  shortcutText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#374151',
  },
  shortcutTextActive: {
    color: '#FFFFFF',
  },
  calendarHeader: {
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 14,
  },
  calendarHeaderTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  expandedPickerContainer: {
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceContainer,
    marginTop: 8,
    paddingTop: 10,
  },
  navBtn: {
    padding: 8,
  },
  monthHeaderToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  monthYearText: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.onSurface,
  },
  monthGridContainer: {
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: 16,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainer,
  },
  yearControlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  yearLabel: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.onSurface,
  },
  monthsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
  },
  monthChip: {
    width: '23%',
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainer,
  },
  monthChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  monthChipActiveDark: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  monthChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.onSurface,
  },
  monthChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  weekHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  weekDayText: {
    width: 40,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.outline,
    textTransform: 'uppercase',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  dayCell: {
    width: '14.28%',
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 21,
  },
  dayCellActive: {
    backgroundColor: COLORS.primary,
  },
  dayCellActiveDark: {
    backgroundColor: '#10B981',
  },
  dayNumText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.onSurface,
  },
  dayNumTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  applyBtn: {
    height: 52,
  },
});
