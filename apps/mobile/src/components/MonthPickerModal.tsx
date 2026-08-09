import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
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

interface MonthPickerModalProps {
  visible: boolean;
  onClose: () => void;
  selectedDate: string; // YYYY-MM-DD
  onSelectMonth: (dateString: string) => void;
}

export function MonthPickerModal({
  visible,
  onClose,
  selectedDate,
  onSelectMonth,
}: MonthPickerModalProps) {
  const { isDark } = useTheme();

  const today = new Date();
  const todayYear = today.getFullYear();
  const todayMonth = today.getMonth(); // 0-indexed

  const parseDate = (str: string) => {
    const parts = str ? str.split('-').map(Number) : [];
    if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      return { year: parts[0], month: parts[1] - 1 };
    }
    return { year: todayYear, month: todayMonth };
  };

  const initial = parseDate(selectedDate);
  const [currentYear, setCurrentYear] = useState(initial.year);
  const [selectedMonth, setSelectedMonth] = useState(initial.month);

  useEffect(() => {
    if (visible) {
      const d = parseDate(selectedDate);
      const initialYear = d.year > todayYear ? todayYear : d.year;
      const initialMonth = initialYear === todayYear && d.month > todayMonth ? todayMonth : d.month;
      setCurrentYear(initialYear);
      setSelectedMonth(initialMonth);
    }
  }, [visible, selectedDate]);

  const isNextYearDisabled = currentYear >= todayYear;

  const isFutureMonth = (monthIdx: number) => {
    if (currentYear > todayYear) return true;
    if (currentYear === todayYear && monthIdx > todayMonth) return true;
    return false;
  };

  const handlePrevYear = () => setCurrentYear((y) => y - 1);
  const handleNextYear = () => {
    if (!isNextYearDisabled) {
      setCurrentYear((y) => y + 1);
    }
  };

  const handleConfirm = () => {
    const validMonth = isFutureMonth(selectedMonth) ? todayMonth : selectedMonth;
    const mm = String(validMonth + 1).padStart(2, '0');
    // Set to 1st of selected month
    const dateStr = `${currentYear}-${mm}-01`;
    onSelectMonth(dateStr);
    onClose();
  };

  return (
    <BottomSheetModal
      visible={visible}
      onClose={onClose}
      title="Select Month"
      variant={isDark ? 'dark' : 'light'}
    >
      <View style={styles.container}>
        {/* Year Navigation Bar */}
        <View style={[styles.yearHeader, isDark && styles.yearHeaderDark]}>
          <TouchableOpacity onPress={handlePrevYear} style={styles.navBtn} activeOpacity={0.7}>
            <Ionicons name="chevron-back" size={20} color={isDark ? '#FFFFFF' : COLORS.onSurface} />
          </TouchableOpacity>

          <Text style={[styles.yearText, isDark && { color: '#FFFFFF' }]}>{currentYear}</Text>

          <TouchableOpacity
            onPress={handleNextYear}
            disabled={isNextYearDisabled}
            style={[styles.navBtn, isNextYearDisabled && { opacity: 0.3 }]}
            activeOpacity={0.7}
          >
            <Ionicons
              name="chevron-forward"
              size={20}
              color={isNextYearDisabled ? COLORS.outline : isDark ? '#FFFFFF' : COLORS.onSurface}
            />
          </TouchableOpacity>
        </View>

        {/* 12 Months Grid */}
        <View style={styles.monthsGrid}>
          {MONTH_NAMES.map((name, idx) => {
            const isFuture = isFutureMonth(idx);
            const isSelected = selectedMonth === idx && !isFuture;
            return (
              <TouchableOpacity
                key={name}
                disabled={isFuture}
                style={[
                  styles.monthChip,
                  isDark && styles.monthChipDark,
                  isFuture && {
                    opacity: 0.35,
                    backgroundColor: isDark ? '#111816' : COLORS.surfaceContainerLow,
                  },
                  isSelected &&
                    (isDark
                      ? { backgroundColor: '#10B981', borderColor: '#10B981' }
                      : { backgroundColor: COLORS.secondary, borderColor: COLORS.secondary }),
                ]}
                onPress={() => !isFuture && setSelectedMonth(idx)}
                activeOpacity={0.75}
              >
                <Text
                  style={[
                    styles.monthChipText,
                    {
                      color: isFuture
                        ? isDark
                          ? '#4B5563'
                          : COLORS.outline
                        : isSelected
                          ? '#FFFFFF'
                          : isDark
                            ? '#9CA3AF'
                            : COLORS.onSurface,
                    },
                    isSelected && { fontWeight: '800' },
                  ]}
                >
                  {name.slice(0, 3)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <TactileButton
          title="Apply Month"
          icon="calendar-outline"
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
  yearHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 20,
  },
  yearHeaderDark: {
    backgroundColor: '#101917',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  navBtn: {
    padding: 6,
  },
  yearText: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.onSurface,
  },
  monthsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  monthChip: {
    width: '30%',
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainer,
  },
  monthChipDark: {
    backgroundColor: '#131D1A',
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  monthChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.onSurface,
  },
  applyBtn: {
    height: 52,
  },
});
