import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../constants/theme';
import { globalStyles } from '../../../styles/globalStyles';
import { useIncomes, type Income } from '@workspace/api';
import { SkeletonLoader } from '../../../components/SkeletonLoader';
import { IncomeItem } from '../../../components/IncomeItem';

interface RecentIncomeProps {
  variant?: 'light' | 'dark';
  onAddIncomePress?: () => void;
  limit?: number;
}

export const RecentIncome = React.memo(function RecentIncome({
  variant = 'light',
  onAddIncomePress,
  limit = 4,
}: RecentIncomeProps) {
  const isDark = variant === 'dark';
  const { data, isLoading } = useIncomes();
  const incomes: Income[] = data?.incomes ?? [];
  const recentIncomes = incomes.slice(0, limit);

  return (
    <View style={[globalStyles.sectionContainer, styles.pbHighlight, { marginHorizontal: -16 }]}>
      {/* Section Header */}
      <View style={[globalStyles.sectionHeaderRow, styles.sectionHeaderRow]}>
        <Text
          style={[globalStyles.sectionTitle, styles.sectionTitle, isDark && { color: '#ffffff' }]}
        >
          Recent Income
        </Text>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.push('/income')}
          style={styles.seeAllContainer}
        >
          <Text
            style={[
              globalStyles.seeAllText,
              styles.seeAllText,
              { color: isDark ? '#D1D5DB' : '#4B5563', fontWeight: '700' },
            ]}
          >
            See All
          </Text>
          <Ionicons
            name="chevron-forward"
            size={14}
            color={isDark ? '#D1D5DB' : '#4B5563'}
            style={styles.seeAllIcon}
          />
        </TouchableOpacity>
      </View>

      {/* Loading Skeleton */}
      {isLoading ? (
        <View style={{ paddingHorizontal: 16, gap: 10 }}>
          {[1, 2, 3].map((i) => (
            <View
              key={i}
              style={[styles.incomeItemRow, isDark ? styles.incomeRowDark : styles.incomeRowLight]}
            >
              <SkeletonLoader
                width={44}
                height={44}
                borderRadius={22}
                style={{ marginRight: 12 }}
              />
              <View style={{ flex: 1, gap: 6 }}>
                <SkeletonLoader width={100} height={13} borderRadius={4} />
                <SkeletonLoader width={130} height={11} borderRadius={4} />
              </View>
              <SkeletonLoader width={70} height={16} borderRadius={4} />
            </View>
          ))}
        </View>
      ) : recentIncomes.length === 0 ? (
        /* Empty State */
        <View style={{ paddingHorizontal: 16 }}>
          <View style={[styles.emptyCard, isDark ? styles.emptyCardDark : styles.emptyCardLight]}>
            <View style={styles.emptyIconBg}>
              <Ionicons name="cash-outline" size={24} color="#10B981" />
            </View>
            <Text style={[styles.emptyTitle, isDark && { color: '#ffffff' }]}>
              No Recent Income
            </Text>
            <Text style={[styles.emptySub, isDark && { color: 'rgba(255, 255, 255, 0.55)' }]}>
              Track your salary, freelance, or pocket money in one place.
            </Text>
            {onAddIncomePress && (
              <TouchableOpacity
                style={styles.emptyAddBtn}
                onPress={onAddIncomePress}
                activeOpacity={0.8}
              >
                <Ionicons name="add" size={16} color="#ffffff" />
                <Text style={styles.emptyAddBtnText}>Add Income</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      ) : (
        /* Income List */
        <View
          style={[
            styles.highlightsContainer,
            !isDark && {
              backgroundColor: '#ffffff',
              borderTopWidth: 1,
              borderBottomWidth: 1,
              borderColor: '#edeeef',
            },
            isDark && {
              backgroundColor: '#101917',
              borderTopWidth: 1,
              borderBottomWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.08)',
            },
          ]}
        >
          {recentIncomes.map((item) => (
            <IncomeItem
              key={item.id}
              income={item}
              variant={variant}
              onPress={() => router.push(`/income/${item.id}`)}
            />
          ))}

          {/* View All Button */}
          <TouchableOpacity
            onPress={() => router.push('/income')}
            style={[
              styles.viewAllBtn,
              !isDark && {
                backgroundColor: '#ffffff',
                borderTopWidth: 1,
                borderTopColor: '#f1f3f4',
              },
              isDark && {
                backgroundColor: '#101917',
                borderTopWidth: 1,
                borderTopColor: 'rgba(255, 255, 255, 0.06)',
              },
            ]}
            activeOpacity={0.75}
          >
            <Text
              style={[
                styles.viewAllBtnText,
                isDark
                  ? { color: '#ffffff', fontWeight: '700' }
                  : { color: '#191c1d', fontWeight: '700' },
              ]}
            >
              See All Income Records
            </Text>
            <Ionicons name="chevron-forward" size={15} color={isDark ? '#D1D5DB' : '#4B5563'} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  pbHighlight: {
    paddingBottom: 8,
    marginBottom: 12,
  },
  highlightsContainer: {},
  sectionHeaderRow: {
    marginBottom: 14,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.onSurface,
    textTransform: 'none',
    letterSpacing: 0,
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
  seeAllIcon: {
    marginLeft: 2,
  },
  incomeItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  incomeRowLight: {
    backgroundColor: '#ffffff',
  },
  incomeRowDark: {
    backgroundColor: 'transparent',
  },
  borderBottomLight: {
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
  },
  borderBottomDark: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  middleSection: {
    flex: 1,
    justifyContent: 'center',
    paddingRight: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  sourceText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#191c1d',
  },
  methodBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  methodBadgeDark: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  methodBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#059669',
  },
  methodBadgeTextDark: {
    color: '#34D399',
  },
  subText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '400',
  },
  rightSection: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  amountText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#10B981',
    marginBottom: 2,
  },
  dateText: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 4,
  },
  viewAllBtnText: {
    fontSize: 14,
  },
  emptyCard: {
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
  },
  emptyCardLight: {
    backgroundColor: '#ffffff',
    borderColor: '#e5e7eb',
  },
  emptyCardDark: {
    backgroundColor: '#101917',
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  emptyIconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#191c1d',
    marginBottom: 4,
  },
  emptySub: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 12,
  },
  emptyAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#10B981',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  emptyAddBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  },
});
