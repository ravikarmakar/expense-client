import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { TopAppBar } from '../../../components/TopAppBar';
import { CURRENCY_SYMBOL } from '../../../constants/theme';
import { useGroupAnalytics } from '@workspace/api';
import { GroupsAnalyticsSkeleton } from '../components/GroupsAnalyticsSkeleton';
import { useTheme } from '../../../context/ThemeContext';

interface GroupAnalyticsItem {
  id: string;
  name: string;
  emoji?: string | null;
  type?: string | null;
  totalExpenses: number;
  myPayments: number;
  myShare: number;
  myBalance: number;
}

export default function GroupsAnalyticsScreen() {
  const router = useRouter();
  const { isDark } = useTheme();

  // Fetch group analytics
  const { data: groupsData, isLoading: isLoadingGroups } = useGroupAnalytics();
  const groups = groupsData as GroupAnalyticsItem[] | undefined;
  const showSkeleton = isLoadingGroups || !groups;

  // Filter State
  const [activeFilter, setActiveFilter] = React.useState<'ALL' | 'OWED' | 'OWE' | 'SETTLED'>('ALL');

  const filteredGroups = React.useMemo(() => {
    if (!groups) return [];
    if (activeFilter === 'OWED') return groups.filter((g) => g.myBalance > 0.01);
    if (activeFilter === 'OWE') return groups.filter((g) => g.myBalance < -0.01);
    if (activeFilter === 'SETTLED') return groups.filter((g) => Math.abs(g.myBalance) <= 0.01);
    return groups;
  }, [groups, activeFilter]);

  // Global aggregate stats across all groups
  const globalSummary = React.useMemo(() => {
    if (!groups || groups.length === 0) {
      return {
        totalExpenses: 0,
        totalMyPayments: 0,
        totalMyShare: 0,
        netBalance: 0,
        activeGroupsCount: 0,
      };
    }
    const totalExpenses = groups.reduce((acc, g) => acc + (g.totalExpenses || 0), 0);
    const totalMyPayments = groups.reduce((acc, g) => acc + (g.myPayments || 0), 0);
    const totalMyShare = groups.reduce((acc, g) => acc + (g.myShare || 0), 0);
    const netBalance = groups.reduce((acc, g) => acc + (g.myBalance || 0), 0);
    return {
      totalExpenses,
      totalMyPayments,
      totalMyShare,
      netBalance,
      activeGroupsCount: groups.length,
    };
  }, [groups]);

  const globalTotalCalculated = globalSummary.totalMyPayments + globalSummary.totalMyShare;
  const globalPaymentProgress =
    globalTotalCalculated > 0 ? globalSummary.totalMyPayments / globalTotalCalculated : 0;
  const globalShareProgress =
    globalTotalCalculated > 0 ? globalSummary.totalMyShare / globalTotalCalculated : 0;

  return (
    <View style={[styles.container, isDark && { backgroundColor: '#08110F' }]}>
      <TopAppBar
        title="Group Analytics"
        showBack={true}
        onBack={() => router.back()}
        variant={isDark ? 'dark' : 'light'}
        rightActions={
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => router.push('/activity-analytics')}
            style={[
              styles.aiTopBtn,
              isDark
                ? {
                    backgroundColor: 'rgba(52, 211, 153, 0.16)',
                    borderColor: 'rgba(52, 211, 153, 0.3)',
                  }
                : { backgroundColor: '#E6F4EA', borderColor: '#A7F3D0' },
            ]}
          >
            <Ionicons name="sparkles" size={13} color={isDark ? '#34D399' : '#0F766E'} />
            <Text
              style={[styles.aiTopBtnText, isDark ? { color: '#34D399' } : { color: '#0F766E' }]}
            >
              AI Insights
            </Text>
          </TouchableOpacity>
        }
      />

      {showSkeleton ? (
        <GroupsAnalyticsSkeleton />
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {(!groups || groups.length === 0) && (
            <View style={[styles.emptyContainer, isDark && { backgroundColor: 'transparent' }]}>
              <View
                style={[
                  styles.emptyIconBg,
                  isDark && { backgroundColor: '#101917', borderColor: 'rgba(255,255,255,0.08)' },
                ]}
              >
                <Ionicons name="people" size={32} color={isDark ? '#34D399' : '#0F766E'} />
              </View>
              <Text style={[styles.emptyTitle, isDark && { color: '#FFFFFF' }]}>No Groups Yet</Text>
              <Text style={[styles.emptySubtitle, isDark && { color: '#9CA3AF' }]}>
                Join or create a group to start tracking splits.
              </Text>
            </View>
          )}

          {groups && groups.length > 0 && (
            <>
              {/* TOP HERO OVERVIEW BANNER WITH RICH EMERALD GRADIENT */}
              <LinearGradient
                colors={
                  isDark ? ['#064E3B', '#022C22', '#091E19'] : ['#ECFDF5', '#D1FAE5', '#A7F3D0']
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.heroCard, isDark ? styles.heroCardDark : styles.heroCardLight]}
              >
                <View style={styles.heroGlowCircle} />

                {/* Hero Header Row */}
                <View style={styles.heroTopRow}>
                  <View style={styles.heroTitleGroup}>
                    <View
                      style={[
                        styles.heroIconBg,
                        isDark ? styles.heroIconDark : styles.heroIconLight,
                      ]}
                    >
                      <Ionicons
                        name="pie-chart-outline"
                        size={18}
                        color={isDark ? '#34D399' : '#0F766E'}
                      />
                    </View>
                    <View>
                      <Text
                        style={[
                          styles.heroTitle,
                          isDark ? { color: '#FFFFFF' } : { color: '#0F172A' },
                        ]}
                      >
                        All Groups Overview
                      </Text>
                      <Text
                        style={[
                          styles.heroSub,
                          isDark ? { color: '#9CA3AF' } : { color: '#64748B' },
                        ]}
                      >
                        {globalSummary.activeGroupsCount} Active{' '}
                        {globalSummary.activeGroupsCount === 1 ? 'Group' : 'Groups'}
                      </Text>
                    </View>
                  </View>

                  {/* Net Position Badge */}
                  <View
                    style={[
                      styles.heroBadge,
                      globalSummary.netBalance >= 0
                        ? isDark
                          ? styles.heroBadgeOwedDark
                          : styles.heroBadgeOwedLight
                        : isDark
                          ? styles.heroBadgeOweDark
                          : styles.heroBadgeOweLight,
                    ]}
                  >
                    <Text
                      style={[
                        styles.heroBadgeText,
                        {
                          color:
                            globalSummary.netBalance >= 0
                              ? isDark
                                ? '#34D399'
                                : '#059669'
                              : '#EF4444',
                        },
                      ]}
                    >
                      {globalSummary.netBalance >= 0 ? 'Net Owed: +' : 'Net Owe: -'}
                      {CURRENCY_SYMBOL}
                      {Math.abs(globalSummary.netBalance).toFixed(0)}
                    </Text>
                  </View>
                </View>

                {/* Aggregate Meta Grid */}
                <View
                  style={[styles.heroGrid, isDark ? styles.heroGridDark : styles.heroGridLight]}
                >
                  <View style={styles.heroGridCol}>
                    <Text
                      style={[
                        styles.heroGridLabel,
                        isDark ? { color: '#9CA3AF' } : { color: '#64748B' },
                      ]}
                    >
                      Total Paid
                    </Text>
                    <Text style={[styles.heroGridVal, { color: isDark ? '#34D399' : '#059669' }]}>
                      {CURRENCY_SYMBOL}
                      {globalSummary.totalMyPayments.toFixed(0)}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.heroGridSep,
                      isDark
                        ? { backgroundColor: 'rgba(255,255,255,0.08)' }
                        : { backgroundColor: '#E2E8F0' },
                    ]}
                  />

                  <View style={styles.heroGridCol}>
                    <Text
                      style={[
                        styles.heroGridLabel,
                        isDark ? { color: '#9CA3AF' } : { color: '#64748B' },
                      ]}
                    >
                      Total Share
                    </Text>
                    <Text style={[styles.heroGridVal, { color: '#EF4444' }]}>
                      {CURRENCY_SYMBOL}
                      {globalSummary.totalMyShare.toFixed(0)}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.heroGridSep,
                      isDark
                        ? { backgroundColor: 'rgba(255,255,255,0.08)' }
                        : { backgroundColor: '#E2E8F0' },
                    ]}
                  />

                  <View style={styles.heroGridCol}>
                    <Text
                      style={[
                        styles.heroGridLabel,
                        isDark ? { color: '#9CA3AF' } : { color: '#64748B' },
                      ]}
                    >
                      Group Total
                    </Text>
                    <Text
                      style={[
                        styles.heroGridVal,
                        isDark ? { color: '#FFFFFF' } : { color: '#0F172A' },
                      ]}
                    >
                      {CURRENCY_SYMBOL}
                      {globalSummary.totalExpenses.toFixed(0)}
                    </Text>
                  </View>
                </View>

                {/* Aggregate Ratio Track */}
                <View style={styles.heroTrackSection}>
                  <View style={styles.heroTrackBg}>
                    <View
                      style={[
                        styles.heroTrackSegment,
                        {
                          flex: globalPaymentProgress,
                          backgroundColor: isDark ? '#34D399' : '#059669',
                          borderTopLeftRadius: 4,
                          borderBottomLeftRadius: 4,
                        },
                      ]}
                    />
                    <View
                      style={[
                        styles.heroTrackSegment,
                        {
                          flex: globalShareProgress,
                          backgroundColor: '#EF4444',
                          borderTopRightRadius: 4,
                          borderBottomRightRadius: 4,
                        },
                      ]}
                    />
                  </View>
                  <View style={styles.heroTrackLabels}>
                    <Text
                      style={[styles.heroTrackLabelText, { color: isDark ? '#34D399' : '#059669' }]}
                    >
                      ● Overall Paid ({Math.round(globalPaymentProgress * 100)}%)
                    </Text>
                    <Text style={[styles.heroTrackLabelText, { color: '#EF4444' }]}>
                      ● Overall Share ({Math.round(globalShareProgress * 100)}%)
                    </Text>
                  </View>
                </View>
              </LinearGradient>

              {/* FILTER PILLS BAR */}
              <View style={styles.filterPillsRow}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.filterPillsContainer}
                >
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => setActiveFilter('ALL')}
                    style={[
                      styles.filterPill,
                      activeFilter === 'ALL'
                        ? isDark
                          ? styles.pillActiveDark
                          : styles.pillActiveLight
                        : isDark
                          ? styles.pillInactiveDark
                          : styles.pillInactiveLight,
                    ]}
                  >
                    <Ionicons
                      name="layers-outline"
                      size={13}
                      color={activeFilter === 'ALL' ? '#FFFFFF' : isDark ? '#9CA3AF' : '#64748B'}
                    />
                    <Text
                      style={[
                        styles.filterPillText,
                        activeFilter === 'ALL'
                          ? { color: '#FFFFFF', fontWeight: '800' }
                          : { color: isDark ? '#9CA3AF' : '#64748B' },
                      ]}
                    >
                      All ({groups.length})
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => setActiveFilter('OWED')}
                    style={[
                      styles.filterPill,
                      activeFilter === 'OWED'
                        ? isDark
                          ? styles.pillActiveDark
                          : styles.pillActiveLight
                        : isDark
                          ? styles.pillInactiveDark
                          : styles.pillInactiveLight,
                    ]}
                  >
                    <Ionicons
                      name="arrow-down-circle-outline"
                      size={13}
                      color={activeFilter === 'OWED' ? '#FFFFFF' : isDark ? '#34D399' : '#059669'}
                    />
                    <Text
                      style={[
                        styles.filterPillText,
                        activeFilter === 'OWED'
                          ? { color: '#FFFFFF', fontWeight: '800' }
                          : { color: isDark ? '#34D399' : '#059669' },
                      ]}
                    >
                      Owed to me
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => setActiveFilter('OWE')}
                    style={[
                      styles.filterPill,
                      activeFilter === 'OWE'
                        ? isDark
                          ? styles.pillActiveDark
                          : styles.pillActiveLight
                        : isDark
                          ? styles.pillInactiveDark
                          : styles.pillInactiveLight,
                    ]}
                  >
                    <Ionicons
                      name="arrow-up-circle-outline"
                      size={13}
                      color={activeFilter === 'OWE' ? '#FFFFFF' : '#EF4444'}
                    />
                    <Text
                      style={[
                        styles.filterPillText,
                        activeFilter === 'OWE'
                          ? { color: '#FFFFFF', fontWeight: '800' }
                          : { color: '#EF4444' },
                      ]}
                    >
                      I owe
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => setActiveFilter('SETTLED')}
                    style={[
                      styles.filterPill,
                      activeFilter === 'SETTLED'
                        ? isDark
                          ? styles.pillActiveDark
                          : styles.pillActiveLight
                        : isDark
                          ? styles.pillInactiveDark
                          : styles.pillInactiveLight,
                    ]}
                  >
                    <Ionicons
                      name="checkmark-circle-outline"
                      size={13}
                      color={
                        activeFilter === 'SETTLED' ? '#FFFFFF' : isDark ? '#9CA3AF' : '#64748B'
                      }
                    />
                    <Text
                      style={[
                        styles.filterPillText,
                        activeFilter === 'SETTLED'
                          ? { color: '#FFFFFF', fontWeight: '800' }
                          : { color: isDark ? '#9CA3AF' : '#64748B' },
                      ]}
                    >
                      Settled
                    </Text>
                  </TouchableOpacity>
                </ScrollView>
              </View>

              {/* SECTION TITLE */}
              <Text
                style={[styles.sectionTitle, isDark ? { color: '#FFFFFF' } : { color: '#0F172A' }]}
              >
                Group Breakdown ({filteredGroups.length})
              </Text>

              {/* INDIVIDUAL GROUP CARDS */}
              {filteredGroups.map((group: GroupAnalyticsItem) => {
                const isMyBalancePositive = group.myBalance > 0;
                const hasBalance = Math.abs(group.myBalance) >= 0.01;

                // Spend Share progress calculations
                const totalCalculated = group.myPayments + group.myShare;
                const paymentProgress =
                  totalCalculated > 0 ? group.myPayments / totalCalculated : 0;
                const shareProgress = totalCalculated > 0 ? group.myShare / totalCalculated : 0;

                return (
                  <TouchableOpacity
                    key={group.id}
                    activeOpacity={0.88}
                    onPress={() =>
                      router.push(
                        `/groups/${group.id}?name=${encodeURIComponent(group.name)}&emoji=${encodeURIComponent(group.emoji ?? '👥')}`
                      )
                    }
                    style={[styles.groupSpentCard, isDark ? styles.cardDark : styles.cardLight]}
                  >
                    {/* Header Row */}
                    <View style={styles.groupSpentHeader}>
                      <View style={styles.groupTitleBlock}>
                        <View
                          style={[
                            styles.groupEmojiCircle,
                            isDark ? styles.emojiDark : styles.emojiLight,
                          ]}
                        >
                          <Text style={styles.groupEmojiText}>{group.emoji ?? '👥'}</Text>
                        </View>
                        <View>
                          <Text
                            style={[
                              styles.groupSpentName,
                              isDark ? { color: '#FFFFFF' } : { color: '#0F172A' },
                            ]}
                          >
                            {group.name}
                          </Text>
                          <Text
                            style={[
                              styles.groupSpentType,
                              isDark ? { color: '#9CA3AF' } : { color: '#64748B' },
                            ]}
                          >
                            {group.type ? group.type.toUpperCase() : 'OTHER'} GROUP
                          </Text>
                        </View>
                      </View>

                      {/* Balance Status Badge */}
                      {hasBalance ? (
                        <View
                          style={[
                            styles.groupBalanceBadge,
                            isMyBalancePositive
                              ? isDark
                                ? styles.badgeOwedDark
                                : styles.badgeOwedLight
                              : isDark
                                ? styles.badgeOweDark
                                : styles.badgeOweLight,
                          ]}
                        >
                          <Text
                            style={[
                              styles.groupBalanceBadgeText,
                              {
                                color: isMyBalancePositive
                                  ? isDark
                                    ? '#34D399'
                                    : '#059669'
                                  : '#EF4444',
                              },
                            ]}
                          >
                            {isMyBalancePositive ? 'Owed: ' : 'Owe: '}
                            {CURRENCY_SYMBOL}
                            {Math.abs(group.myBalance).toFixed(2)}
                          </Text>
                        </View>
                      ) : (
                        <View
                          style={[
                            styles.groupBalanceBadge,
                            isDark ? styles.badgeSettledDark : styles.badgeSettledLight,
                          ]}
                        >
                          <Text
                            style={[
                              styles.groupBalanceBadgeText,
                              isDark ? { color: '#9CA3AF' } : { color: '#64748B' },
                            ]}
                          >
                            Settled
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* Spend Comparison Meta Grid */}
                    <View
                      style={[styles.spentMetaGrid, isDark ? styles.gridDark : styles.gridLight]}
                    >
                      <View style={styles.spentMetaColumn}>
                        <Text
                          style={[
                            styles.spentMetaLabel,
                            isDark ? { color: '#9CA3AF' } : { color: '#64748B' },
                          ]}
                        >
                          My Payments
                        </Text>
                        <Text
                          style={[styles.spentMetaVal, { color: isDark ? '#34D399' : '#059669' }]}
                        >
                          {CURRENCY_SYMBOL}
                          {group.myPayments.toFixed(2)}
                        </Text>
                      </View>

                      <View
                        style={[
                          styles.gridSep,
                          isDark
                            ? { backgroundColor: 'rgba(255,255,255,0.08)' }
                            : { backgroundColor: '#E2E8F0' },
                        ]}
                      />

                      <View style={styles.spentMetaColumn}>
                        <Text
                          style={[
                            styles.spentMetaLabel,
                            isDark ? { color: '#9CA3AF' } : { color: '#64748B' },
                          ]}
                        >
                          My Share
                        </Text>
                        <Text style={[styles.spentMetaVal, { color: '#EF4444' }]}>
                          {CURRENCY_SYMBOL}
                          {group.myShare.toFixed(2)}
                        </Text>
                      </View>

                      <View
                        style={[
                          styles.gridSep,
                          isDark
                            ? { backgroundColor: 'rgba(255,255,255,0.08)' }
                            : { backgroundColor: '#E2E8F0' },
                        ]}
                      />

                      <View style={styles.spentMetaColumn}>
                        <Text
                          style={[
                            styles.spentMetaLabel,
                            isDark ? { color: '#9CA3AF' } : { color: '#64748B' },
                          ]}
                        >
                          Group Total
                        </Text>
                        <Text
                          style={[
                            styles.spentMetaVal,
                            isDark ? { color: '#FFFFFF' } : { color: '#0F172A' },
                          ]}
                        >
                          {CURRENCY_SYMBOL}
                          {group.totalExpenses.toFixed(2)}
                        </Text>
                      </View>
                    </View>

                    {/* Custom progress comparison bar */}
                    <View style={styles.progressContainer}>
                      <View
                        style={[
                          styles.progressBarWrapper,
                          isDark
                            ? { backgroundColor: 'rgba(255,255,255,0.06)' }
                            : { backgroundColor: '#E2E8F0' },
                        ]}
                      >
                        {group.totalExpenses > 0 ? (
                          <>
                            <View
                              style={[
                                styles.progressSegment,
                                {
                                  flex: paymentProgress,
                                  backgroundColor: isDark ? '#34D399' : '#059669',
                                  borderTopLeftRadius: 5,
                                  borderBottomLeftRadius: 5,
                                },
                              ]}
                            />
                            <View
                              style={[
                                styles.progressSegment,
                                {
                                  flex: shareProgress,
                                  backgroundColor: '#EF4444',
                                  borderTopRightRadius: 5,
                                  borderBottomRightRadius: 5,
                                },
                              ]}
                            />
                          </>
                        ) : (
                          <View
                            style={[
                              styles.progressSegment,
                              {
                                flex: 1,
                                backgroundColor: 'rgba(255,255,255,0.08)',
                                borderRadius: 5,
                              },
                            ]}
                          />
                        )}
                      </View>
                      <View style={styles.progressLabels}>
                        <Text
                          style={[
                            styles.progressIndicatorLabel,
                            { color: isDark ? '#34D399' : '#059669' },
                          ]}
                        >
                          ● Paid ({Math.round(paymentProgress * 100)}%)
                        </Text>
                        <Text style={[styles.progressIndicatorLabel, { color: '#EF4444' }]}>
                          ● Share ({Math.round(shareProgress * 100)}%)
                        </Text>
                      </View>
                    </View>

                    {/* Direct Navigation Links Footer */}
                    <View
                      style={[
                        styles.cardFooterRow,
                        isDark ? styles.footerDark : styles.footerLight,
                      ]}
                    >
                      <TouchableOpacity
                        activeOpacity={0.75}
                        onPress={() => router.push('/(tabs)/activity')}
                        style={[
                          styles.footerBtn,
                          isDark ? styles.footerBtnDark : styles.footerBtnLight,
                        ]}
                      >
                        <Ionicons
                          name="receipt-outline"
                          size={13}
                          color={isDark ? '#34D399' : '#0F766E'}
                        />
                        <Text
                          style={[
                            styles.footerBtnText,
                            isDark ? { color: '#34D399' } : { color: '#0F766E' },
                          ]}
                        >
                          Activity Log
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        activeOpacity={0.75}
                        onPress={() =>
                          router.push(
                            `/groups/${group.id}?name=${encodeURIComponent(group.name)}&emoji=${encodeURIComponent(group.emoji ?? '👥')}`
                          )
                        }
                        style={[
                          styles.footerBtn,
                          isDark ? styles.footerBtnDark : styles.footerBtnLight,
                        ]}
                      >
                        <Ionicons
                          name="bar-chart-outline"
                          size={13}
                          color={isDark ? '#38BDF8' : '#0284C7'}
                        />
                        <Text
                          style={[
                            styles.footerBtnText,
                            isDark ? { color: '#38BDF8' } : { color: '#0284C7' },
                          ]}
                        >
                          Analytics
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        activeOpacity={0.75}
                        onPress={() =>
                          router.push(
                            `/groups/${group.id}?name=${encodeURIComponent(group.name)}&emoji=${encodeURIComponent(group.emoji ?? '👥')}`
                          )
                        }
                        style={[
                          styles.footerBtn,
                          isDark ? styles.footerBtnDark : styles.footerBtnLight,
                        ]}
                      >
                        <Ionicons
                          name="people-outline"
                          size={13}
                          color={isDark ? '#818CF8' : '#4F46E5'}
                        />
                        <Text
                          style={[
                            styles.footerBtnText,
                            isDark ? { color: '#818CF8' } : { color: '#4F46E5' },
                          ]}
                        >
                          Details
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  emptyContainer: {
    paddingVertical: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIconBg: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E6F4EA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  emptyTitle: {
    color: '#0F172A',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 6,
  },
  emptySubtitle: {
    color: '#64748B',
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  // HERO CARD STYLES (GOD-LEVEL VIBRANT EMERALD GREEN THEME)
  heroCard: {
    borderRadius: 22,
    padding: 18,
    marginBottom: 22,
    position: 'relative',
    overflow: 'hidden',
  },
  heroCardDark: {
    backgroundColor: '#0A241B',
    borderWidth: 1.5,
    borderColor: 'rgba(52, 211, 153, 0.48)',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  heroCardLight: {
    backgroundColor: '#DCFCE7',
    borderWidth: 1.5,
    borderColor: '#34D399',
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  heroGlowCircle: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    top: -60,
    right: -50,
    backgroundColor: 'rgba(52, 211, 153, 0.22)',
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  heroTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  heroIconBg: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroIconDark: {
    backgroundColor: 'rgba(52, 211, 153, 0.28)',
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.55)',
  },
  heroIconLight: {
    backgroundColor: '#A7F3D0',
    borderWidth: 1,
    borderColor: '#34D399',
  },
  heroTitle: {
    fontSize: 16.5,
    fontWeight: '900',
    letterSpacing: -0.2,
  },
  heroSub: {
    fontSize: 11.5,
    fontWeight: '700',
    marginTop: 1,
  },
  heroBadge: {
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 11,
  },
  heroBadgeOwedDark: {
    backgroundColor: 'rgba(52, 211, 153, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.6)',
  },
  heroBadgeOwedLight: {
    backgroundColor: '#BBF7D0',
    borderWidth: 1,
    borderColor: '#4ADE80',
  },
  heroBadgeOweDark: {
    backgroundColor: 'rgba(239, 68, 68, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.6)',
  },
  heroBadgeOweLight: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#F87171',
  },
  heroBadgeText: {
    fontSize: 11.5,
    fontWeight: '900',
  },
  heroGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 13,
    borderRadius: 15,
    marginBottom: 14,
    borderWidth: 1,
  },
  heroGridDark: {
    backgroundColor: '#041610',
    borderColor: 'rgba(52, 211, 153, 0.28)',
  },
  heroGridLight: {
    backgroundColor: '#FFFFFF',
    borderColor: '#A7F3D0',
  },
  heroGridCol: {
    flex: 1,
    alignItems: 'center',
  },
  heroGridSep: {
    width: 1,
    height: 22,
  },
  heroGridLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    marginBottom: 3,
  },
  heroGridVal: {
    fontSize: 14.5,
    fontWeight: '900',
  },
  heroTrackSection: {},
  heroTrackBg: {
    height: 8,
    borderRadius: 4,
    flexDirection: 'row',
    overflow: 'hidden',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  heroTrackSegment: {
    height: '100%',
  },
  heroTrackLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  heroTrackLabelText: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.2,
    marginBottom: 14,
    paddingHorizontal: 2,
  },

  // INDIVIDUAL GROUP CARDS STYLES
  groupSpentCard: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    position: 'relative',
    overflow: 'hidden',
  },
  cardDark: {
    backgroundColor: '#101917',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardLight: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  groupSpentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  groupTitleBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  groupEmojiCircle: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  emojiDark: {
    backgroundColor: '#0D1714',
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  emojiLight: {
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
  },
  groupEmojiText: {
    fontSize: 20,
  },
  groupSpentName: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  groupSpentType: {
    fontSize: 10.5,
    fontWeight: '700',
    marginTop: 2,
    letterSpacing: 0.4,
  },
  groupBalanceBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
  },
  badgeOwedDark: {
    backgroundColor: 'rgba(52, 211, 153, 0.15)',
    borderColor: 'rgba(52, 211, 153, 0.25)',
  },
  badgeOwedLight: {
    backgroundColor: '#E6F4EA',
    borderColor: '#A7F3D0',
  },
  badgeOweDark: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: 'rgba(239, 68, 68, 0.25)',
  },
  badgeOweLight: {
    backgroundColor: '#FCE8E6',
    borderColor: '#FCA5A5',
  },
  badgeSettledDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  badgeSettledLight: {
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
  },
  groupBalanceBadgeText: {
    fontSize: 11.5,
    fontWeight: '800',
  },
  spentMetaGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 14,
    marginBottom: 14,
    borderWidth: 1,
  },
  gridDark: {
    backgroundColor: '#0D1714',
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  gridLight: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
  },
  spentMetaColumn: {
    flex: 1,
    alignItems: 'center',
  },
  gridSep: {
    width: 1,
    height: 20,
  },
  spentMetaLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    marginBottom: 3,
  },
  spentMetaVal: {
    fontSize: 14,
    fontWeight: '900',
  },
  progressContainer: {
    marginTop: 2,
  },
  progressBarWrapper: {
    height: 8,
    borderRadius: 4,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  progressSegment: {
    height: '100%',
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  progressIndicatorLabel: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  cardFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  footerDark: {
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  footerLight: {
    borderTopColor: '#E2E8F0',
  },
  footerBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 7,
    paddingHorizontal: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  footerBtnDark: {
    backgroundColor: '#0D1714',
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  footerBtnLight: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
  },
  footerBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  // FILTER PILL STYLES
  filterPillsRow: {
    marginBottom: 14,
    marginHorizontal: -16,
  },
  filterPillsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  pillActiveDark: {
    backgroundColor: '#10B981',
    borderColor: '#34D399',
  },
  pillActiveLight: {
    backgroundColor: '#0F766E',
    borderColor: '#0F766E',
  },
  pillInactiveDark: {
    backgroundColor: '#101917',
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  pillInactiveLight: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  aiTopBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
  },
  aiTopBtnText: {
    fontSize: 11.5,
    fontWeight: '800',
  },
});
