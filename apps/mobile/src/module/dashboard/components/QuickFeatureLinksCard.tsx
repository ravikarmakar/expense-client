import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { globalStyles } from '../../../styles/globalStyles';

interface QuickFeatureLinksCardProps {
  variant?: 'light' | 'dark';
}

/**
 * Bottom Quick Navigation & Feature Shortcuts Component.
 * Displays "You're all caught up!" banner alongside direct 1-tap links to all core features & settlements.
 */
export const QuickFeatureLinksCard = React.memo(function QuickFeatureLinksCard({
  variant = 'light',
}: QuickFeatureLinksCardProps) {
  const isDark = variant === 'dark';

  const featureLinks = [
    {
      id: 'lend-borrow',
      title: 'Lend & Borrow',
      subtitle: 'Track loans & settlements',
      icon: 'hand-left',
      color: isDark ? '#34D399' : '#0F766E',
      bg: isDark ? 'rgba(52, 211, 153, 0.12)' : 'rgba(15, 118, 110, 0.08)',
      route: '/lend-borrow',
    },
    {
      id: 'analytics',
      title: 'Activity Analytics',
      subtitle: 'Charts & spending logs',
      icon: 'analytics-outline',
      color: isDark ? '#818CF8' : '#4F46E5',
      bg: isDark ? 'rgba(129, 140, 248, 0.12)' : 'rgba(79, 70, 229, 0.08)',
      route: '/activity-analytics',
    },
    {
      id: 'personal',
      title: 'Personal Expenses',
      subtitle: 'Individual budget',
      icon: 'wallet-outline',
      color: isDark ? '#F59E0B' : '#D97706',
      bg: isDark ? 'rgba(245, 158, 11, 0.12)' : 'rgba(217, 119, 6, 0.08)',
      route: '/(tabs)/personal',
    },
    {
      id: 'groups',
      title: 'Group Manager',
      subtitle: 'Shared bill splits',
      icon: 'people-outline',
      color: isDark ? '#EC4899' : '#DB2777',
      bg: isDark ? 'rgba(236, 72, 153, 0.12)' : 'rgba(219, 39, 119, 0.08)',
      route: '/(tabs)/groups',
    },
    {
      id: 'income',
      title: 'Income Tracker',
      subtitle: 'Salary & earnings',
      icon: 'cash-outline',
      color: isDark ? '#10B981' : '#059669',
      bg: isDark ? 'rgba(16, 185, 129, 0.12)' : 'rgba(5, 150, 105, 0.08)',
      route: '/income',
    },
    {
      id: 'history',
      title: 'Activity History',
      subtitle: 'All transaction logs',
      icon: 'time-outline',
      color: isDark ? '#38BDF8' : '#0284C7',
      bg: isDark ? 'rgba(56, 189, 248, 0.12)' : 'rgba(2, 132, 199, 0.08)',
      route: '/(tabs)/activity',
    },
  ];

  return (
    <View style={[globalStyles.sectionContainer, styles.container]}>
      {/* Caught Up Banner */}
      <View style={[styles.caughtUpCard, isDark ? styles.caughtUpDark : styles.caughtUpLight]}>
        <View style={styles.iconBg}>
          <Ionicons name="checkmark-circle" size={24} color={isDark ? '#34D399' : '#059669'} />
        </View>
        <View style={{ flex: 1 }}>
          <Text
            style={[styles.caughtUpTitle, isDark ? { color: '#FFFFFF' } : { color: '#0F172A' }]}
          >
            You&apos;re all caught up!
          </Text>
          <Text style={[styles.caughtUpSub, isDark ? { color: '#9CA3AF' } : { color: '#64748B' }]}>
            Quick access to all features & settlement logs below
          </Text>
        </View>
      </View>

      {/* Grid of Feature Shortcut Cards */}
      <View style={styles.grid}>
        {featureLinks.map((item) => (
          <TouchableOpacity
            key={item.id}
            activeOpacity={0.75}
            onPress={() => router.push(item.route as never)}
            style={[styles.gridItem, isDark ? styles.gridItemDark : styles.gridItemLight]}
          >
            <View style={[styles.itemIconBg, { backgroundColor: item.bg }]}>
              <Ionicons name={item.icon as never} size={18} color={item.color} />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={[styles.itemTitle, isDark ? { color: '#FFFFFF' } : { color: '#0F172A' }]}
                numberOfLines={1}
              >
                {item.title}
              </Text>
              <Text
                style={[styles.itemSub, isDark ? { color: '#9CA3AF' } : { color: '#64748B' }]}
                numberOfLines={1}
              >
                {item.subtitle}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={14} color={isDark ? '#6B7280' : '#94A3B8'} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  caughtUpCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 18,
    marginBottom: 14,
    borderWidth: 1,
  },
  caughtUpDark: {
    backgroundColor: '#101917',
    borderColor: 'rgba(52, 211, 153, 0.2)',
  },
  caughtUpLight: {
    backgroundColor: '#E6F4EA',
    borderColor: '#A7F3D0',
  },
  iconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  caughtUpTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  caughtUpSub: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 1,
  },
  grid: {
    gap: 8,
  },
  gridItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  gridItemDark: {
    backgroundColor: '#101917',
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  gridItemLight: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
  },
  itemIconBg: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemTitle: {
    fontSize: 13.5,
    fontWeight: '700',
  },
  itemSub: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 1,
  },
});
