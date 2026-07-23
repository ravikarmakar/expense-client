import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CURRENCY_SYMBOL } from '../../../constants/theme';

interface BudgetProgressCardProps {
  spent: number;
  limit: number;
  period: 'weekly' | 'monthly';
  onPeriodChange: (period: 'weekly' | 'monthly') => void;
  onEditLimitPress: () => void;
  variant?: 'light' | 'dark';
}

/**
 * Premium Weekly / Monthly Budget Tracking Card.
 * Linear / Revolut inspired minimal progress design with dynamic alert thresholds.
 */
export const BudgetProgressCard = React.memo(function BudgetProgressCard({
  spent,
  limit,
  period,
  onPeriodChange,
  onEditLimitPress,
  variant = 'light',
}: BudgetProgressCardProps) {
  const isDark = variant === 'dark';
  const percentage = Math.min((spent / Math.max(limit, 1)) * 100, 100);
  const displayFillWidth = Math.max(percentage, 3); // Ensure track fill is visible
  const remaining = Math.max(limit - spent, 0);

  // Dynamic alert colors
  const getProgressColor = () => {
    if (spent >= limit) return isDark ? '#EF4444' : '#DC2626'; // Red Exceeded
    if (percentage >= 75) return isDark ? '#F59E0B' : '#D97706'; // Amber Warning
    return isDark ? '#10B981' : '#006948'; // Emerald Normal
  };

  const progressColor = getProgressColor();

  return (
    <View
      style={[
        styles.card,
        !isDark && {
          backgroundColor: '#ffffff',
          borderColor: '#d0e5dd',
          borderWidth: 1.5,
          elevation: 3,
          shadowColor: '#006948',
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
        },
      ]}
    >
      {/* Header Row */}
      <View style={styles.header}>
        <View style={styles.titleWrapper}>
          <View style={[styles.iconBg, !isDark && { backgroundColor: 'rgba(0, 105, 72, 0.12)' }]}>
            <Ionicons name="compass" size={16} color={isDark ? '#10B981' : '#006948'} />
          </View>
          <Text style={[styles.title, !isDark && { color: '#191c1d' }]}>
            {period === 'weekly' ? 'Weekly Limit' : 'Monthly Limit'} • {CURRENCY_SYMBOL}
            {limit.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </Text>
        </View>

        {/* Period Segmented Switcher & Edit Button */}
        <View style={styles.headerRight}>
          <View
            style={[styles.segmentContainer, isDark ? styles.segmentDark : styles.segmentLight]}
          >
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => onPeriodChange('weekly')}
              style={[
                styles.segmentPill,
                period === 'weekly' &&
                  (isDark ? styles.segmentPillActiveDark : styles.segmentPillActiveLight),
              ]}
            >
              <Text
                style={[
                  styles.segmentText,
                  period === 'weekly'
                    ? { color: isDark ? '#10B981' : '#006948', fontWeight: '800' }
                    : { color: isDark ? '#9CA3AF' : '#4B5563' },
                ]}
              >
                W
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => onPeriodChange('monthly')}
              style={[
                styles.segmentPill,
                period === 'monthly' &&
                  (isDark ? styles.segmentPillActiveDark : styles.segmentPillActiveLight),
              ]}
            >
              <Text
                style={[
                  styles.segmentText,
                  period === 'monthly'
                    ? { color: isDark ? '#10B981' : '#006948', fontWeight: '800' }
                    : { color: isDark ? '#9CA3AF' : '#4B5563' },
                ]}
              >
                M
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onEditLimitPress}
            style={[styles.editBtn, isDark ? styles.editBtnDark : styles.editBtnLight]}
          >
            <Ionicons name="pencil" size={12} color={isDark ? '#10B981' : '#006948'} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Progress Track */}
      <View style={[styles.progressTrack, !isDark && { backgroundColor: '#e6f4ea' }]}>
        <View
          style={[
            styles.progressFill,
            { width: `${displayFillWidth}%`, backgroundColor: progressColor },
          ]}
        />
      </View>

      {/* Footer Details */}
      <View style={styles.footer}>
        <Text style={[styles.spentText, !isDark && { color: '#191c1d' }]}>
          {CURRENCY_SYMBOL}
          {spent.toLocaleString('en-IN', { maximumFractionDigits: 0 })} spent of {CURRENCY_SYMBOL}
          {limit.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
        </Text>
        <Text style={[styles.remainingText, { color: progressColor }]}>
          {spent >= limit
            ? `Exceeded by ${CURRENCY_SYMBOL}${(spent - limit).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
            : `${CURRENCY_SYMBOL}${remaining.toLocaleString('en-IN', { maximumFractionDigits: 0 })} left`}
        </Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#131D1A',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 18,
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  titleWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBg: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 12,
    fontWeight: '800',
    color: '#74817B',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  segmentContainer: {
    flexDirection: 'row',
    borderRadius: 10,
    padding: 2,
    borderWidth: 1,
  },
  segmentLight: {
    backgroundColor: '#f3f4f6',
    borderColor: '#e5e7eb',
  },
  segmentDark: {
    backgroundColor: '#101917',
    borderColor: 'rgba(255,255,255,0.08)',
  },
  segmentPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  segmentPillActiveLight: {
    backgroundColor: '#ffffff',
  },
  segmentPillActiveDark: {
    backgroundColor: '#131D1A',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  segmentText: {
    fontSize: 11,
    fontWeight: '800',
  },
  editBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  editBtnLight: {
    backgroundColor: '#e6f4ea',
    borderColor: '#006948',
  },
  editBtnDark: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  progressTrack: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  spentText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  remainingText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
