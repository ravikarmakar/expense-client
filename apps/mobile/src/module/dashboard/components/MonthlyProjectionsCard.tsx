import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { CURRENCY_SYMBOL } from '../../../constants/theme';
import { globalStyles } from '../../../styles/globalStyles';

interface MonthlyProjectionsCardProps {
  totalSpent: number;
  monthlyLimit?: number;
  variant?: 'light' | 'dark';
  onEditLimitPress?: () => void;
}

/**
 * Premium "Safe-to-Spend & Month Projection" Card.
 * Inspired by top personal finance apps (Revolut, PocketGuard, YNAB).
 * Provides clear financial guidance: Safe-to-Spend, Daily Allowance, and Month-End Projection.
 */
export const MonthlyProjectionsCard = React.memo(function MonthlyProjectionsCard({
  totalSpent,
  monthlyLimit = 25000,
  variant = 'light',
  onEditLimitPress,
}: MonthlyProjectionsCardProps) {
  const isDark = variant === 'dark';

  // Calculate days left in current month
  const now = new Date();
  const currentDay = now.getDate();
  const totalDaysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysLeft = Math.max(totalDaysInMonth - currentDay, 1);

  // Effective limit fallback if 0
  const effectiveLimit = monthlyLimit > 0 ? monthlyLimit : 25000;
  const safeToSpend = Math.max(effectiveLimit - totalSpent, 0);
  const dailyAllowance = safeToSpend / daysLeft;
  const percentageSpent = Math.min((totalSpent / effectiveLimit) * 100, 100);

  const isOverBudget = totalSpent > effectiveLimit;

  return (
    <View style={[globalStyles.sectionContainer, styles.pbHighlight]}>
      {/* Section Header */}
      <View style={styles.sectionHeaderRow}>
        <Text style={[styles.sectionTitle, isDark ? { color: '#ffffff' } : { color: '#191c1d' }]}>
          Financial Health & Guidance
        </Text>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.push('/activity-analytics')}
          style={styles.seeAllContainer}
        >
          <Text
            style={[
              globalStyles.seeAllText,
              styles.seeAllText,
              { color: isDark ? '#34D399' : '#0F766E', fontWeight: '800' },
            ]}
          >
            Analytics
          </Text>
          <Ionicons
            name="chevron-forward"
            size={14}
            color={isDark ? '#34D399' : '#0F766E'}
            style={{ marginLeft: 2 }}
          />
        </TouchableOpacity>
      </View>

      {/* Main Glassmorphic Projection Card */}
      <View style={[styles.card, isDark ? styles.cardDark : styles.cardLight]}>
        {/* Background glow circle */}
        <View style={styles.bgGlowCircle} />

        {/* Top Header Badge & Action */}
        <View style={styles.cardHeaderRow}>
          <View style={[styles.badgePill, isDark ? styles.badgePillDark : styles.badgePillLight]}>
            <Ionicons
              name={isOverBudget ? 'alert-circle' : 'shield-checkmark'}
              size={13}
              color={isOverBudget ? '#EF4444' : isDark ? '#34D399' : '#0F766E'}
            />
            <Text
              style={[
                styles.badgeText,
                isOverBudget
                  ? { color: '#EF4444' }
                  : isDark
                    ? { color: '#34D399' }
                    : { color: '#0F766E' },
              ]}
            >
              {isOverBudget ? 'Exceeded Budget' : 'Safe to Spend'}
            </Text>
          </View>

          {onEditLimitPress && (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onEditLimitPress}
              style={[styles.editBtn, isDark ? styles.editBtnDark : styles.editBtnLight]}
            >
              <Ionicons name="pencil" size={12} color={isDark ? '#34D399' : '#0F766E'} />
              <Text
                style={[styles.editBtnText, isDark ? { color: '#34D399' } : { color: '#0F766E' }]}
              >
                Adjust Limit
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Hero Figure: Safe to Spend */}
        <View style={styles.heroSection}>
          <Text style={[styles.heroLabel, isDark ? { color: '#9CA3AF' } : { color: '#64748B' }]}>
            {isOverBudget ? 'Over budget by' : 'Remaining Safe to Spend'}
          </Text>
          <Text
            style={[
              styles.heroAmount,
              isOverBudget
                ? { color: '#EF4444' }
                : isDark
                  ? { color: '#FFFFFF' }
                  : { color: '#0F172A' },
            ]}
          >
            {CURRENCY_SYMBOL}
            {isOverBudget
              ? (totalSpent - effectiveLimit).toLocaleString('en-IN', { maximumFractionDigits: 0 })
              : safeToSpend.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </Text>

          {/* Daily Allowance Tag */}
          <View
            style={[styles.allowancePill, isDark ? styles.allowanceDark : styles.allowanceLight]}
          >
            <Ionicons name="time-outline" size={13} color={isDark ? '#34D399' : '#0F766E'} />
            <Text
              style={[styles.allowanceText, isDark ? { color: '#E5E7EB' } : { color: '#334155' }]}
            >
              {CURRENCY_SYMBOL}
              {dailyAllowance.toFixed(0)}/day left for remaining {daysLeft} days
            </Text>
          </View>
        </View>

        {/* Progress Bar Track */}
        <View style={styles.progressSection}>
          <View style={styles.progressHeaderRow}>
            <Text
              style={[styles.progressTitle, isDark ? { color: '#9CA3AF' } : { color: '#64748B' }]}
            >
              Monthly Budget Usage
            </Text>
            <Text
              style={[styles.progressValue, isDark ? { color: '#FFFFFF' } : { color: '#0F172A' }]}
            >
              {percentageSpent.toFixed(0)}% used
            </Text>
          </View>
          <View style={[styles.trackBg, isDark ? styles.trackBgDark : styles.trackBgLight]}>
            <View
              style={[
                styles.trackFill,
                {
                  width: `${Math.max(percentageSpent, 4)}%`,
                  backgroundColor: isOverBudget
                    ? '#EF4444'
                    : percentageSpent > 80
                      ? '#F59E0B'
                      : '#10B981',
                },
              ]}
            />
          </View>
        </View>

        {/* Smart Financial Tip Box */}
        <View style={[styles.tipBox, isDark ? styles.tipBoxDark : styles.tipBoxLight]}>
          <Ionicons name="bulb-outline" size={16} color={isDark ? '#F59E0B' : '#D97706'} />
          <Text style={[styles.tipText, isDark ? { color: '#E5E7EB' } : { color: '#451A03' }]}>
            Spending{' '}
            <Text style={{ fontWeight: '800' }}>
              {CURRENCY_SYMBOL}
              {dailyAllowance.toFixed(0)}/day
            </Text>{' '}
            or less will keep you safely within your monthly budget.
          </Text>
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  pbHighlight: {
    paddingBottom: 20,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    textTransform: 'none',
    letterSpacing: -0.2,
    marginBottom: 0,
    marginLeft: 0,
  },
  seeAllContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
    fontSize: 14,
  },
  card: {
    borderRadius: 22,
    padding: 18,
    position: 'relative',
    overflow: 'hidden',
  },
  cardDark: {
    backgroundColor: '#101917',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  cardLight: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F766E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  bgGlowCircle: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    top: -45,
    right: -35,
    backgroundColor: 'rgba(16, 185, 129, 0.04)',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
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
    fontSize: 11,
    fontWeight: '700',
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 10,
  },
  editBtnDark: {
    backgroundColor: 'rgba(52, 211, 153, 0.12)',
  },
  editBtnLight: {
    backgroundColor: 'rgba(15, 118, 110, 0.08)',
  },
  editBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  heroSection: {
    marginBottom: 16,
  },
  heroLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  heroAmount: {
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -0.8,
    marginBottom: 10,
  },
  allowancePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  allowanceDark: {
    backgroundColor: '#0D1714',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  allowanceLight: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  allowanceText: {
    fontSize: 12,
    fontWeight: '700',
  },
  progressSection: {
    marginBottom: 14,
  },
  progressHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  progressTitle: {
    fontSize: 12,
    fontWeight: '600',
  },
  progressValue: {
    fontSize: 12,
    fontWeight: '700',
  },
  trackBg: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  trackBgDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  trackBgLight: {
    backgroundColor: '#E2E8F0',
  },
  trackFill: {
    height: '100%',
    borderRadius: 4,
  },
  tipBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  tipBoxDark: {
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderColor: 'rgba(245, 158, 11, 0.25)',
  },
  tipBoxLight: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FDE68A',
  },
  tipText: {
    fontSize: 12,
    lineHeight: 16,
    flex: 1,
  },
});
