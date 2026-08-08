import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { CURRENCY_SYMBOL } from '../constants/theme';
import type { Income } from '@workspace/api';
import { ScalePressable } from './ScalePressable';

interface IncomeItemProps {
  income: Income;
  onPress?: () => void;
  variant?: 'light' | 'dark';
}

const SOURCE_VISUALS: Record<string, { icon: string; color: string; bg: string }> = {
  Salary: { icon: 'cash-outline', color: '#10B981', bg: 'rgba(16, 185, 129, 0.12)' },
  'Parents / Family': { icon: 'heart-outline', color: '#EC4899', bg: 'rgba(236, 72, 153, 0.12)' },
  'Pocket Money': { icon: 'wallet-outline', color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.12)' },
  Freelance: { icon: 'laptop-outline', color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.12)' },
  Investment: { icon: 'trending-up-outline', color: '#8B5CF6', bg: 'rgba(139, 92, 246, 0.12)' },
  Bonus: { icon: 'gift-outline', color: '#10B981', bg: 'rgba(16, 185, 129, 0.12)' },
  Other: {
    icon: 'ellipsis-horizontal-circle-outline',
    color: '#6B7280',
    bg: 'rgba(107, 114, 128, 0.12)',
  },
};

function getSourceVisual(source: string) {
  return SOURCE_VISUALS[source] || SOURCE_VISUALS.Other;
}

export const IncomeItem = React.memo(function IncomeItem({
  income,
  onPress,
  variant = 'light',
}: IncomeItemProps) {
  const defaultOnPress = () => router.push(`/income/${income.id}`);
  const isDark = variant === 'dark';
  const visual = getSourceVisual(income.source);

  // Format payment source subtitle
  const sourceSubtitle = `Income • ${income.source}${income.paymentMethod ? ` • ${income.paymentMethod}` : ''}`;

  // Format timestamp (e.g. "13 Aug 2026, 08:29 AM")
  const dateObj = new Date(income.date);
  const dateStr = dateObj.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const createdObj = new Date(income.createdAt || income.date);
  let hours = createdObj.getHours();
  const minutes = createdObj.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  const timeStr = `${hours.toString().padStart(2, '0')}:${minutes} ${ampm}`;
  const fullDateTimeStr = `${dateStr}, ${timeStr}`;

  return (
    <ScalePressable
      style={[
        styles.container,
        !isDark && {
          backgroundColor: '#ffffff',
          paddingVertical: 14,
          paddingHorizontal: 20,
          borderBottomWidth: 1,
          borderBottomColor: '#f1f3f4',
        },
        isDark && {
          backgroundColor: 'transparent',
          paddingVertical: 14,
          paddingHorizontal: 20,
          borderBottomWidth: 1,
          borderBottomColor: 'rgba(255, 255, 255, 0.06)',
        },
      ]}
      onPress={onPress ?? defaultOnPress}
      hapticType="none"
    >
      {/* Left: Source Icon Avatar */}
      <View
        style={[
          styles.avatarCircle,
          { backgroundColor: visual.bg },
          isDark && {
            backgroundColor: '#101917',
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.06)',
          },
        ]}
      >
        <Ionicons name={visual.icon as never} size={22} color={visual.color} />
      </View>

      {/* Middle: Subtitle, Title, Date */}
      <View style={styles.middleSection}>
        <Text
          style={[styles.sourceText, isDark && { color: 'rgba(255, 255, 255, 0.45)' }]}
          numberOfLines={1}
        >
          {sourceSubtitle}
        </Text>
        <Text style={[styles.titleText, isDark && { color: '#ffffff' }]} numberOfLines={1}>
          {income.notes ? income.notes : income.source}
        </Text>
        <Text style={[styles.dateText, isDark && { color: 'rgba(255, 255, 255, 0.4)' }]}>
          {fullDateTimeStr}
        </Text>
      </View>

      {/* Right: Amount & Chevron */}
      <View style={styles.rightSection}>
        <View style={styles.amountContainer}>
          <Text style={[styles.amountText, isDark ? { color: '#34d399' } : { color: '#137333' }]}>
            +{CURRENCY_SYMBOL}
            {income.amount.toFixed(2)}
          </Text>
          <View
            style={[styles.incomeBadge, isDark && { backgroundColor: 'rgba(52, 211, 153, 0.15)' }]}
          >
            <Ionicons name="arrow-down-circle" size={9} color={isDark ? '#34d399' : '#10B981'} />
            <Text style={[styles.incomeBadgeText, isDark && { color: '#34d399' }]}>Income</Text>
          </View>
        </View>
        <Ionicons
          name="chevron-forward"
          size={16}
          color={isDark ? 'rgba(255, 255, 255, 0.3)' : '#000000'}
          style={styles.chevron}
        />
      </View>
    </ScalePressable>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  middleSection: {
    flex: 1,
    justifyContent: 'center',
  },
  sourceText: {
    fontSize: 11.5,
    color: '#70757a',
    marginBottom: 2,
    fontWeight: '400',
  },
  titleText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#202124',
    marginBottom: 3,
    letterSpacing: 0.3,
  },
  dateText: {
    fontSize: 11.5,
    color: '#70757a',
    fontWeight: '400',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    minWidth: 90,
  },
  amountContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  amountText: {
    fontSize: 15,
    fontWeight: '700',
  },
  incomeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 2.5,
    marginTop: 3,
  },
  incomeBadgeText: {
    fontSize: 8.5,
    fontWeight: '800',
    color: '#059669',
    lineHeight: 11,
    textTransform: 'uppercase',
  },
  chevron: {
    marginLeft: 10,
    opacity: 0.8,
  },
});
