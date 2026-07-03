import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
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
  const { data: groups, isLoading, isError, refetch } = useGroups();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const insets = useSafeAreaInsets();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  const groupList = groups ?? [];

  const totalOwedToMe = groupList
    .filter((g) => g.myBalance > 0)
    .reduce((sum, g) => sum + g.myBalance, 0);
  const totalIOwe = groupList
    .filter((g) => g.myBalance < 0)
    .reduce((sum, g) => sum + Math.abs(g.myBalance), 0);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={globalStyles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
      >
        {/* Header row */}
        <View style={styles.tabHeaderRow}>
          <Text style={styles.tabTitle}>My Groups</Text>
          <TouchableOpacity
            style={styles.createGroupButton}
            activeOpacity={0.8}
            onPress={() => setCreateGroupVisible(true)}
          >
            <Ionicons name="add" size={18} color="#ffffff" />
            <Text style={styles.createGroupButtonText}>New Group</Text>
          </TouchableOpacity>
        </View>

        {/* Balance summary */}
        <View style={styles.groupsSummaryRow}>
          <View style={styles.groupsSummaryCard}>
            <Text style={styles.groupsSummaryLabel}>Owed to you</Text>
            <Text style={styles.groupsSummaryValueGreen}>
              {CURRENCY_SYMBOL}
              {totalOwedToMe.toFixed(2)}
            </Text>
          </View>
          <View style={styles.groupsSummaryCard}>
            <Text style={styles.groupsSummaryLabel}>You owe</Text>
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
                name={`${group.emoji ?? '👥'} ${group.name}`}
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
  tabHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  tabTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  createGroupButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    gap: 4,
  },
  createGroupButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  groupsSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 20,
  },
  groupsSummaryCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainer,
  },
  groupsSummaryLabel: {
    fontSize: 11,
    color: COLORS.outline,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  groupsSummaryValueGreen: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
  },
  groupsSummaryValueRed: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.error,
  },
  groupsList: {
    gap: 12,
  },
});
