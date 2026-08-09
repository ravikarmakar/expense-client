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
 * Premium Glassmorphic Budget & Spending Limit Card.
 * Features segmented timeframes, dynamic alert indicators, and hero progress metrics.
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
  const rawPercentage = (spent / Math.max(limit, 1)) * 100;
  const percentage = Math.min(rawPercentage, 100);
  const displayFillWidth = Math.max(percentage, 4);
  const remaining = Math.max(limit - spent, 0);
  const isExceeded = spent >= limit;

  // Dynamic alert colors & badge styles
  const getAlertTheme = () => {
    if (isExceeded) {
      return {
        color: '#EF4444',
        badgeBg: isDark ? 'rgba(239, 68, 68, 0.18)' : '#FCE8E6',
        badgeText: isDark ? '#F87171' : '#DC2626',
        label: 'EXCEEDED',
        icon: 'alert-circle',
      };
    }
    if (rawPercentage >= 75) {
      return {
        color: '#F59E0B',
        badgeBg: isDark ? 'rgba(245, 158, 11, 0.18)' : '#FEF3C7',
        badgeText: isDark ? '#FBBF24' : '#D97706',
        label: `${rawPercentage.toFixed(0)}% USED`,
        icon: 'warning-outline',
      };
    }
    return {
      color: isDark ? '#10B981' : '#0F766E',
      badgeBg: isDark ? 'rgba(16, 185, 129, 0.15)' : '#E6F4EA',
      badgeText: isDark ? '#34D399' : '#0F766E',
      label: `${rawPercentage.toFixed(0)}% USED`,
      icon: 'checkmark-circle-outline',
    };
  };

  const alertTheme = getAlertTheme();

  return (
    <View style={[styles.card, isDark ? styles.cardDark : styles.cardLight]}>
      {/* Background glow decoration */}
      <View style={styles.bgGlow} />

      {/* Header Row: Title Badge, Period Switcher & Edit Button */}
      <View style={styles.header}>
        <View style={styles.titleBadgeRow}>
          <View style={[styles.badgePill, isDark ? styles.badgePillDark : styles.badgePillLight]}>
            <Ionicons name="speedometer-outline" size={13} color={isDark ? '#34D399' : '#0F766E'} />
            <Text style={[styles.badgeText, isDark ? { color: '#34D399' } : { color: '#0F766E' }]}>
              {period === 'weekly' ? 'WEEKLY LIMIT' : 'MONTHLY LIMIT'}
            </Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          {/* Segmented Switcher */}
          <View
            style={[styles.segmentContainer, isDark ? styles.segmentDark : styles.segmentLight]}
          >
            <TouchableOpacity
              activeOpacity={0.8}
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
                    ? { color: '#FFFFFF', fontWeight: '800' }
                    : { color: isDark ? '#9CA3AF' : '#64748B' },
                ]}
              >
                Weekly
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
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
                    ? { color: '#FFFFFF', fontWeight: '800' }
                    : { color: isDark ? '#9CA3AF' : '#64748B' },
                ]}
              >
                Monthly
              </Text>
            </TouchableOpacity>
          </View>

          {/* Edit Limit Button */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onEditLimitPress}
            style={[styles.editBtn, isDark ? styles.editBtnDark : styles.editBtnLight]}
          >
            <Ionicons name="pencil" size={13} color={isDark ? '#34D399' : '#0F766E'} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Hero Figures Row */}
      <View style={styles.heroRow}>
        <View style={styles.amountGroup}>
          <Text style={[styles.spentAmount, isDark ? { color: '#FFFFFF' } : { color: '#0F172A' }]}>
            {CURRENCY_SYMBOL}
            {spent.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </Text>
          <Text style={[styles.limitSubText, isDark ? { color: '#9CA3AF' } : { color: '#64748B' }]}>
            of {CURRENCY_SYMBOL}
            {limit.toLocaleString('en-IN', { maximumFractionDigits: 0 })} limit
          </Text>
        </View>

        {/* Dynamic Percentage Badge */}
        <View style={[styles.statusBadge, { backgroundColor: alertTheme.badgeBg }]}>
          <Ionicons name={alertTheme.icon as never} size={13} color={alertTheme.badgeText} />
          <Text style={[styles.statusBadgeText, { color: alertTheme.badgeText }]}>
            {alertTheme.label}
          </Text>
        </View>
      </View>

      {/* Enhanced Progress Track */}
      <View style={[styles.progressTrack, isDark ? styles.trackDark : styles.trackLight]}>
        <View
          style={[
            styles.progressFill,
            { width: `${displayFillWidth}%`, backgroundColor: alertTheme.color },
          ]}
        />
      </View>

      {/* Footer Info */}
      <View style={styles.footerRow}>
        <Text style={[styles.footerStatusText, { color: alertTheme.color }]}>
          {isExceeded
            ? `Limit exceeded by ${CURRENCY_SYMBOL}${(spent - limit).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
            : `${CURRENCY_SYMBOL}${remaining.toLocaleString('en-IN', { maximumFractionDigits: 0 })} remaining for this ${period === 'weekly' ? 'week' : 'month'}`}
        </Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    borderRadius: 22,
    padding: 20,
    marginBottom: 24,
    position: 'relative',
    overflow: 'hidden',
  },
  cardDark: {
    backgroundColor: '#101917',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  cardLight: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(15, 118, 110, 0.12)',
    shadowColor: '#0F766E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  bgGlow: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    top: -50,
    right: -40,
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  badgePillDark: {
    backgroundColor: 'rgba(52, 211, 153, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.25)',
  },
  badgePillLight: {
    backgroundColor: 'rgba(15, 118, 110, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(15, 118, 110, 0.16)',
  },
  badgeText: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  segmentContainer: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 3,
    borderWidth: 1,
  },
  segmentLight: {
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
  },
  segmentDark: {
    backgroundColor: '#0D1714',
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  segmentPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9,
  },
  segmentPillActiveLight: {
    backgroundColor: '#0F766E',
  },
  segmentPillActiveDark: {
    backgroundColor: '#10B981',
  },
  segmentText: {
    fontSize: 11.5,
    fontWeight: '600',
  },
  editBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  editBtnLight: {
    backgroundColor: 'rgba(15, 118, 110, 0.08)',
    borderColor: 'rgba(15, 118, 110, 0.18)',
  },
  editBtnDark: {
    backgroundColor: 'rgba(52, 211, 153, 0.15)',
    borderColor: 'rgba(52, 211, 153, 0.3)',
  },
  heroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 14,
  },
  amountGroup: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  spentAmount: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.6,
  },
  limitSubText: {
    fontSize: 13,
    fontWeight: '600',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  progressTrack: {
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 10,
  },
  trackLight: {
    backgroundColor: '#E2E8F0',
  },
  trackDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerStatusText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
