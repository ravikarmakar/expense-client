import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { ExportDateRange, ExportFormat } from '../services/export/types';
import { getDateRangeLabelText } from '../hooks/useExport';
import { BottomSheetModal } from './BottomSheetModal';

interface ExportModalBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  dateRange: ExportDateRange;
  setDateRange: (range: ExportDateRange) => void;
  customStartDate: Date;
  setCustomStartDate: (date: Date) => void;
  customEndDate: Date;
  setCustomEndDate: (date: Date) => void;
  format: ExportFormat;
  setFormat: (format: ExportFormat) => void;
  onConfirmExport: () => void;
}

const DATE_RANGE_OPTIONS: { label: string; value: ExportDateRange; icon: string }[] = [
  { label: 'Last 7 Days', value: 'last-7-days', icon: 'time-outline' },
  { label: 'Last 30 Days', value: 'last-30-days', icon: 'calendar-outline' },
  { label: 'Last 3 Months', value: 'last-3-months', icon: 'timer-outline' },
  { label: 'Custom Range', value: 'custom', icon: 'options-outline' },
];

const FORMAT_OPTIONS: {
  label: string;
  value: ExportFormat;
  ext: string;
  sub: string;
  iconLib: 'Ionicons' | 'MaterialIcons';
  icon: string;
  color: string;
  bg: string;
}[] = [
  {
    label: 'PDF Document',
    value: 'pdf',
    ext: '.pdf',
    sub: 'Formatted statement report with summary & tables',
    iconLib: 'Ionicons',
    icon: 'document-text-outline',
    color: '#dc2626',
    bg: '#fee2e2',
  },
  {
    label: 'Excel Sheet',
    value: 'excel',
    ext: '.xlsx',
    sub: 'Multi-column spreadsheet workbook for analytics',
    iconLib: 'MaterialIcons',
    icon: 'grid-on',
    color: '#16a34a',
    bg: '#dcfce7',
  },
  {
    label: 'CSV Data',
    value: 'csv',
    ext: '.csv',
    sub: 'Universal raw comma-separated dataset',
    iconLib: 'Ionicons',
    icon: 'grid-outline',
    color: '#2563eb',
    bg: '#dbeafe',
  },
];

export const ExportModalBottomSheet: React.FC<ExportModalBottomSheetProps> = ({
  visible,
  onClose,
  dateRange,
  setDateRange,
  customStartDate,
  setCustomStartDate,
  customEndDate,
  setCustomEndDate,
  format,
  setFormat,
  onConfirmExport,
}) => {
  const currentRangeLabel = getDateRangeLabelText(dateRange, customStartDate, customEndDate);

  return (
    <BottomSheetModal
      visible={visible}
      onClose={onClose}
      title="Export Statement"
      description="Select date range and format to save statement to device"
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Step 1: Date Range Horizontal Pills */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Select Timeframe</Text>
          <Text style={styles.selectedBadgeText}>{currentRangeLabel}</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.pillsContainer}
        >
          {DATE_RANGE_OPTIONS.map((opt) => {
            const isSelected = dateRange === opt.value;
            return (
              <TouchableOpacity
                key={opt.value}
                style={[styles.pillCard, isSelected && styles.pillCardActive]}
                activeOpacity={0.75}
                onPress={() => setDateRange(opt.value)}
              >
                <Ionicons
                  name={opt.icon as never}
                  size={15}
                  color={isSelected ? COLORS.secondary : COLORS.outline}
                />
                <Text style={[styles.pillText, isSelected && styles.pillTextActive]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Custom Date Pickers if 'custom' is active */}
        {dateRange === 'custom' && (
          <View style={styles.customRangeCard}>
            <Text style={styles.customRangeTitle}>Pick Custom Date Range</Text>
            <View style={styles.customDateRow}>
              <TouchableOpacity
                style={styles.dateSelectorBtn}
                onPress={() => {
                  setCustomStartDate(new Date(customStartDate.getTime() - 7 * 24 * 60 * 60 * 1000));
                }}
              >
                <Text style={styles.dateSelectorLabel}>From Date</Text>
                <Text style={styles.dateSelectorValue}>
                  {customStartDate.toLocaleDateString('en-IN', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </Text>
              </TouchableOpacity>

              <Ionicons name="arrow-forward" size={16} color={COLORS.outline} />

              <TouchableOpacity
                style={styles.dateSelectorBtn}
                onPress={() => setCustomEndDate(new Date())}
              >
                <Text style={styles.dateSelectorLabel}>To Date</Text>
                <Text style={styles.dateSelectorValue}>
                  {customEndDate.toLocaleDateString('en-IN', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Step 2: Format Selection Cards */}
        <Text style={[styles.sectionTitle, { marginTop: 22, marginBottom: 12 }]}>
          Select File Format
        </Text>

        <View style={styles.formatCardsGrid}>
          {FORMAT_OPTIONS.map((opt) => {
            const isSelected = format === opt.value;
            return (
              <TouchableOpacity
                key={opt.value}
                style={[styles.formatCard, isSelected && styles.formatCardActive]}
                activeOpacity={0.8}
                onPress={() => setFormat(opt.value)}
              >
                <View style={styles.formatLeftRow}>
                  <View style={[styles.formatIconCircle, { backgroundColor: opt.bg }]}>
                    {opt.iconLib === 'Ionicons' ? (
                      <Ionicons name={opt.icon as never} size={19} color={opt.color} />
                    ) : (
                      <MaterialIcons name={opt.icon as never} size={19} color={opt.color} />
                    )}
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={styles.formatLabelRow}>
                      <Text
                        style={[
                          styles.formatTitle,
                          isSelected && { color: COLORS.secondary, fontWeight: '800' },
                        ]}
                      >
                        {opt.label}
                      </Text>
                      <Text style={styles.formatExtBadge}>{opt.ext}</Text>
                    </View>
                    <Text style={styles.formatSubText}>{opt.sub}</Text>
                  </View>
                </View>

                <Ionicons
                  name={isSelected ? 'checkmark-circle' : 'ellipse-outline'}
                  size={20}
                  color={isSelected ? COLORS.secondary : COLORS.outlineVariant}
                />
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Premium Confirm Export Button */}
        <TouchableOpacity
          style={styles.exportSubmitBtn}
          activeOpacity={0.85}
          onPress={onConfirmExport}
        >
          <Ionicons name="cloud-download-outline" size={22} color="#ffffff" />
          <Text style={styles.exportSubmitBtnText}>Download {format.toUpperCase()} Statement</Text>
        </TouchableOpacity>
      </ScrollView>
    </BottomSheetModal>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    color: COLORS.outline,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  selectedBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.secondary,
    backgroundColor: COLORS.secondaryFixed + '40',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  pillsContainer: {
    gap: 10,
    paddingRight: 10,
    paddingBottom: 4,
  },
  pillCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceContainerLow,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainer,
  },
  pillCardActive: {
    backgroundColor: COLORS.secondaryFixed + '50',
    borderColor: COLORS.secondary,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.onSurfaceVariant,
  },
  pillTextActive: {
    fontWeight: '800',
    color: COLORS.secondary,
  },
  customRangeCard: {
    marginTop: 12,
    padding: 14,
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainer,
  },
  customRangeTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.outline,
    marginBottom: 8,
  },
  customDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  dateSelectorBtn: {
    flex: 1,
    paddingVertical: 9,
    paddingHorizontal: 12,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },
  dateSelectorLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.outline,
  },
  dateSelectorValue: {
    fontSize: 12.5,
    fontWeight: '800',
    color: COLORS.onSurface,
    marginTop: 2,
  },
  formatCardsGrid: {
    gap: 10,
  },
  formatCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainer,
  },
  formatCardActive: {
    backgroundColor: COLORS.secondaryFixed + '35',
    borderColor: COLORS.secondary,
  },
  formatLeftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    marginRight: 8,
  },
  formatIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formatLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  formatTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  formatExtBadge: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.outline,
    backgroundColor: COLORS.surfaceContainer,
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  formatSubText: {
    fontSize: 11,
    color: COLORS.outline,
    marginTop: 2,
  },
  exportSubmitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: COLORS.secondary,
    paddingVertical: 16,
    borderRadius: 20,
    marginTop: 24,
    elevation: 4,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  exportSubmitBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#ffffff',
  },
});
