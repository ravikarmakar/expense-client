import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  NativeScrollEvent,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, CURRENCY_SYMBOL } from '../../constants/theme';
import { globalStyles } from '../../styles/globalStyles';
import { GroupCard } from '../../components/GroupCard';
import { CreateGroupModal } from '../../components/CreateGroupModal';
import { LoadingView } from '../../components/LoadingView';
import { ErrorView } from '../../components/ErrorView';
import { EmptyState } from '../../components/EmptyState';
import { useGroups } from '@workspace/api';

export default function GroupsTabScreen() {
  const [createGroupVisible, setCreateGroupVisible] = useState(false);
  const {
    data: groupsData,
    isLoading,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useGroups();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const insets = useSafeAreaInsets();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  const groupList = React.useMemo(() => {
    return groupsData?.pages.flatMap((page) => page.groups) ?? [];
  }, [groupsData]);

  const totalOwedToMe = groupList
    .filter((g) => g.myBalance > 0)
    .reduce((sum, g) => sum + g.myBalance, 0);
  const totalIOwe = groupList
    .filter((g) => g.myBalance < 0)
    .reduce((sum, g) => sum + Math.abs(g.myBalance), 0);

  const isCloseToBottom = ({
    layoutMeasurement,
    contentOffset,
    contentSize,
  }: NativeScrollEvent) => {
    const paddingToBottom = 50;
    return layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;
  };

  return (
    <View style={styles.container}>
      {/* Header Container with Bottom Divider line */}
      <View style={[styles.headerContainer, { paddingTop: insets.top + 16 }]}>
        <View style={styles.tabHeaderRow}>
          <View>
            <Text style={styles.tabTitle}>My Groups</Text>
            <Text style={styles.tabSubtitle}>Shared Budgets & Splits</Text>
          </View>
          <TouchableOpacity
            style={styles.createGroupButton}
            activeOpacity={0.7}
            onPress={() => setCreateGroupVisible(true)}
          >
            <Ionicons name="add" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={globalStyles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
        onScroll={({ nativeEvent }) => {
          if (isCloseToBottom(nativeEvent) && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        }}
        scrollEventThrottle={400}
      >
        {/* Balance summary */}
        <View style={styles.groupsSummaryRow}>
          <View style={[styles.groupsSummaryCard, styles.summaryCardGreen]}>
            <View style={styles.summaryCardHeader}>
              <Text style={styles.groupsSummaryLabel}>Owed to you</Text>
              <View style={[styles.summaryIconBg, styles.summaryIconBgGreen]}>
                <Ionicons name="arrow-down" size={12} color={COLORS.primary} />
              </View>
            </View>
            <Text style={styles.groupsSummaryValueGreen}>
              {CURRENCY_SYMBOL}
              {totalOwedToMe.toFixed(2)}
            </Text>
          </View>
          <View style={[styles.groupsSummaryCard, styles.summaryCardRed]}>
            <View style={styles.summaryCardHeader}>
              <Text style={styles.groupsSummaryLabel}>You owe</Text>
              <View style={[styles.summaryIconBg, styles.summaryIconBgRed]}>
                <Ionicons name="arrow-up" size={12} color={COLORS.error} />
              </View>
            </View>
            <Text style={styles.groupsSummaryValueRed}>
              {CURRENCY_SYMBOL}
              {totalIOwe.toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Loading state */}
        {isLoading && <LoadingView />}

        {/* Error state */}
        {isError && <ErrorView message="Failed to load groups" onRetry={refetch} />}

        {/* Empty state */}
        {!isLoading && !isError && groupList.length === 0 && (
          <EmptyState
            emoji="👥"
            title="No groups yet"
            description="Create a group to start splitting expenses with friends, roommates, or colleagues."
            ctaText="Create First Group"
            onCtaPress={() => setCreateGroupVisible(true)}
            ctaIcon="add-circle"
          />
        )}

        {/* Group list */}
        {groupList.length > 0 && (
          <View style={styles.groupsList}>
            {groupList.map((group) => (
              <GroupCard
                key={group.id}
                name={group.name}
                emoji={group.emoji ?? '👥'}
                activity={`${group.type ?? 'Other'} · ${group.memberCount} members`}
                memberAvatars={group.members.slice(0, 3).map((m) => m.image ?? '')}
                totalMembersCount={group.memberCount}
                balanceText={
                  Math.abs(group.myBalance) < 0.01
                    ? 'All settled'
                    : group.myBalance > 0
                      ? `Owed ${CURRENCY_SYMBOL}${group.myBalance.toFixed(2)}`
                      : `You owe ${CURRENCY_SYMBOL}${Math.abs(group.myBalance).toFixed(2)}`
                }
                balanceType={
                  Math.abs(group.myBalance) < 0.01
                    ? 'settled'
                    : group.myBalance > 0
                      ? 'owed'
                      : 'owe'
                }
                onPress={() => router.push(`/groups/${group.id}`)}
              />
            ))}
          </View>
        )}

        {isFetchingNextPage && (
          <View style={styles.loadingMore}>
            <ActivityIndicator size="small" color={COLORS.primary} />
            <Text style={styles.loadingMoreText}>Loading more...</Text>
          </View>
        )}
      </ScrollView>

      <CreateGroupModal
        visible={createGroupVisible}
        onClose={() => setCreateGroupVisible(false)}
        onSuccess={(groupId) => {
          setCreateGroupVisible(false);
          router.push(`/groups/${groupId}`);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerContainer: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f1f1',
  },
  tabHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tabTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.onSurface,
    letterSpacing: -0.5,
  },
  tabSubtitle: {
    fontSize: 12,
    color: COLORS.outline,
    fontWeight: '600',
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  createGroupButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  groupsSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 24,
  },
  groupsSummaryCard: {
    flex: 1,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },
  summaryCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryCardGreen: {
    backgroundColor: '#e6f4ea',
    borderColor: '#c2e7cd',
  },
  summaryCardRed: {
    backgroundColor: '#fce8e6',
    borderColor: '#f9c2bd',
  },
  summaryIconBg: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryIconBgGreen: {
    backgroundColor: 'rgba(0, 105, 72, 0.1)',
  },
  summaryIconBgRed: {
    backgroundColor: 'rgba(186, 26, 26, 0.1)',
  },
  groupsSummaryLabel: {
    fontSize: 11,
    color: COLORS.outline,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  groupsSummaryValueGreen: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.primary,
  },
  groupsSummaryValueRed: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.error,
  },
  groupsList: {
    gap: 12,
  },
  loadingMore: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  loadingMoreText: {
    fontSize: 13,
    color: COLORS.outline,
    fontWeight: '500',
  },
});
