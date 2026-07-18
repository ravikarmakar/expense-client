import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, CURRENCY_SYMBOL } from '../../../constants/theme';

interface SpentHeroCardProps {
  filterType: 'all' | 'personal' | 'group';
  activeSpent: number;
  prevSpent: number;
  percentChange: number;
  spendingIncreased: boolean;
  timeframe: 'today' | 'week' | 'month' | 'year';
  activePersonalSpent: number;
  activeGroupSpent: number;
  myPayments: number;
  myShare: number;
}

export const SpentHeroCard: React.FC<SpentHeroCardProps> = ({
  filterType,
  activeSpent,
  prevSpent,
  percentChange,
  spendingIncreased,
  timeframe,
  activePersonalSpent,
  activeGroupSpent,
  myPayments,
  myShare,
}) => {
  return (
    <LinearGradient
      colors={[COLORS.primary, '#004d34']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.heroCard}
    >
      <View style={styles.heroCardMain}>
        <View>
          <Text style={styles.heroLabel}>
            {filterType === 'all'
              ? 'Total Spent'
              : filterType === 'personal'
                ? 'Personal Spent'
                : 'Group Spent'}
          </Text>
          <Text style={styles.heroAmount}>
            {CURRENCY_SYMBOL}
            {activeSpent.toFixed(2)}
          </Text>
        </View>
        {prevSpent > 0 ? (
          <View
            style={[
              styles.trendBadge,
              {
                backgroundColor: spendingIncreased
                  ? 'rgba(186, 26, 26, 0.2)'
                  : 'rgba(133, 248, 196, 0.15)',
              },
            ]}
          >
            <Ionicons
              name={spendingIncreased ? 'trending-up' : 'trending-down'}
              size={14}
              color={spendingIncreased ? '#ff8a8a' : '#85f8c4'}
            />
            <Text style={[styles.trendText, { color: spendingIncreased ? '#ff8a8a' : '#85f8c4' }]}>
              {Math.abs(percentChange).toFixed(1)}%
            </Text>
          </View>
        ) : null}
      </View>

      {prevSpent > 0 ? (
        <Text style={styles.comparisonSubtext}>
          {spendingIncreased ? 'Spent ' : 'Saved '}
          <Text style={{ fontWeight: '700', color: '#ffffff' }}>
            {CURRENCY_SYMBOL}
            {Math.abs(activeSpent - prevSpent).toFixed(2)}
          </Text>{' '}
          compared to previous {timeframe} ({CURRENCY_SYMBOL}
          {prevSpent.toFixed(0)})
        </Text>
      ) : (
        <Text style={styles.comparisonSubtext}>No history for previous {timeframe}</Text>
      )}

      {filterType === 'all' && (
        <>
          <View style={styles.balanceDivider} />

          {/* Breakdown Personal vs Group */}
          <View style={styles.breakdownRow}>
            <View style={styles.breakdownCol}>
              <View
                style={[styles.breakdownIconBg, { backgroundColor: 'rgba(255, 255, 255, 0.15)' }]}
              >
                <Ionicons name="person" size={14} color="#ffffff" />
              </View>
              <View>
                <Text style={styles.breakdownLabel}>Personal</Text>
                <Text style={styles.breakdownAmount}>
                  {CURRENCY_SYMBOL}
                  {activePersonalSpent.toFixed(2)}
                </Text>
              </View>
            </View>

            <View style={styles.breakdownDivider} />

            <View style={styles.breakdownCol}>
              <View
                style={[styles.breakdownIconBg, { backgroundColor: 'rgba(255, 255, 255, 0.15)' }]}
              >
                <Ionicons name="people" size={14} color="#ffffff" />
              </View>
              <View>
                <Text style={styles.breakdownLabel}>Group Share</Text>
                <Text style={styles.breakdownAmount}>
                  {CURRENCY_SYMBOL}
                  {activeGroupSpent.toFixed(2)}
                </Text>
              </View>
            </View>
          </View>
        </>
      )}

      {filterType === 'group' && (
        <>
          <View style={styles.balanceDivider} />

          {/* Breakdown My Payments vs My Share */}
          <View style={styles.breakdownRow}>
            <View style={styles.breakdownCol}>
              <View
                style={[styles.breakdownIconBg, { backgroundColor: 'rgba(255, 255, 255, 0.15)' }]}
              >
                <Ionicons name="card-outline" size={14} color="#ffffff" />
              </View>
              <View>
                <Text style={styles.breakdownLabel}>My Payments</Text>
                <Text style={styles.breakdownAmount}>
                  {CURRENCY_SYMBOL}
                  {myPayments.toFixed(2)}
                </Text>
              </View>
            </View>

            <View style={styles.breakdownDivider} />

            <View style={styles.breakdownCol}>
              <View
                style={[styles.breakdownIconBg, { backgroundColor: 'rgba(255, 255, 255, 0.15)' }]}
              >
                <Ionicons name="pie-chart-outline" size={14} color="#ffffff" />
              </View>
              <View>
                <Text style={styles.breakdownLabel}>My Share</Text>
                <Text style={styles.breakdownAmount}>
                  {CURRENCY_SYMBOL}
                  {myShare.toFixed(2)}
                </Text>
              </View>
            </View>
          </View>
        </>
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  heroCard: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
    elevation: 4,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  heroCardMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  heroLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.7)',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  heroAmount: {
    fontSize: 34,
    fontWeight: '800',
    color: '#ffffff',
    marginTop: 4,
    letterSpacing: 0.5,
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  trendText: {
    fontSize: 12,
    fontWeight: '700',
  },
  comparisonSubtext: {
    fontSize: 12.5,
    color: 'rgba(255, 255, 255, 0.75)',
    lineHeight: 18,
  },
  balanceDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    marginVertical: 16,
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  breakdownCol: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  breakdownIconBg: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  breakdownLabel: {
    fontSize: 10.5,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.65)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  breakdownAmount: {
    fontSize: 15,
    fontWeight: '800',
    color: '#ffffff',
  },
  breakdownDivider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    marginHorizontal: 16,
  },
});
