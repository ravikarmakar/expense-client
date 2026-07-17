import React from 'react';
import { View, RefreshControl, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import { COLORS } from '../../../constants/theme';
import { globalStyles } from '../../../styles/globalStyles';
import { GroupCard } from '../components/GroupCard';
import { GroupCardSkeleton } from '../components/GroupCardSkeleton';
import { CreateGroupModal } from '../components/CreateGroupModal';
import { ErrorView } from '../../../components/ErrorView';
import { EmptyState } from '../../../components/EmptyState';
import { useGroupsController } from '@workspace/api';
import { styles } from '../styles/groups-tab.styles';
import { NetBalanceCard } from '../components/NetBalanceCard';
import { NetBalanceCardSkeleton } from '../components/NetBalanceCardSkeleton';
import { GroupsFilterPills } from '../components/GroupsFilterPills';
import { GroupsHeader } from '../components/GroupsHeader';

function formatLastActive(dateStr?: string | Date) {
  if (!dateStr) return 'recently';
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 5) {
    return 'just now';
  } else if (diffMins < 60) {
    return `${diffMins}m ago`;
  } else if (diffHours < 24) {
    return `${diffHours}h ago`;
  } else if (diffDays === 1) {
    return 'yesterday';
  } else if (diffDays < 7) {
    return `${diffDays}d ago`;
  } else {
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  }
}

export default function GroupsScreen() {
  const {
    createGroupVisible,
    setCreateGroupVisible,
    searchQuery,
    setSearchQuery,
    activeFilter,
    setActiveFilter,
    isLoading,
    isError,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    refetch,
    balancesData,
    isBalancesLoading,
    isFetchingGroups,
    isFetchingBalances,
    groupList,
    activeGroupList,
    totalOwedToMe,
    totalIOwe,
    filteredGroups,
    isRefreshing,
    handleRefresh,
  } = useGroupsController();

  const showSkeleton = isLoading || (isFetchingGroups && !isRefreshing);
  const showBalancesSkeleton = isBalancesLoading || (isFetchingBalances && !isRefreshing);

  return (
    <View style={styles.container}>
      {/* Premium Background Gradient */}
      <LinearGradient
        colors={['#ffffff', '#fafafa', '#f5f6f8']}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Decorative Background SVGs */}
      <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
        <Svg
          height="400"
          width="400"
          style={{ position: 'absolute', bottom: -100, left: -100, opacity: 0.15 }}
        >
          <Circle cx="150" cy="250" r="180" fill="url(#grad2)" />
          <Defs>
            <RadialGradient id="grad2" cx="50%" cy="50%" rx="50%" ry="50%">
              <Stop offset="0%" stopColor="#4b41e1" stopOpacity="0.15" />
              <Stop offset="100%" stopColor="#4b41e1" stopOpacity="0" />
            </RadialGradient>
          </Defs>
        </Svg>
      </View>
      {/* Header Container */}
      <GroupsHeader
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onCreateGroupPress={() => setCreateGroupVisible(true)}
      />

      {/* Scrollable Filter Pills */}
      <GroupsFilterPills
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
        activeCount={activeGroupList.length}
        deactivatedCount={groupList.filter((g) => g.isActive === false).length}
      />

      <FlatList
        data={filteredGroups}
        keyExtractor={(item) => item.id}
        renderItem={({ item: group }) => {
          const bal = balancesData ? (balancesData[group.id]?.myBalance ?? 0) : 0;
          return (
            <View style={{ marginHorizontal: -20 }}>
              <GroupCard
                name={group.name}
                emoji={group.emoji ?? '👥'}
                activity={`${group.type ?? 'Other'} · Active ${formatLastActive(group.updatedAt)}`}
                memberAvatars={group.members.slice(0, 3).map((m) => m.image ?? '')}
                totalMembersCount={group.memberCount}
                isLoadingBalance={showBalancesSkeleton}
                balance={bal}
                onPress={() =>
                  router.push(
                    `/groups/${group.id}?name=${encodeURIComponent(group.name)}&emoji=${encodeURIComponent(group.emoji ?? '👥')}`
                  )
                }
              />
            </View>
          );
        }}
        contentContainerStyle={globalStyles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.primary}
          />
        }
        ListHeaderComponent={
          <>
            {/* Premium Net Balance Card */}
            {!showSkeleton && !isError && !showBalancesSkeleton && groupList.length > 0 && (
              <NetBalanceCard totalOwedToMe={totalOwedToMe} totalIOwe={totalIOwe} />
            )}

            {showBalancesSkeleton && !showSkeleton && groupList.length > 0 && (
              <NetBalanceCardSkeleton />
            )}

            {/* Loading state */}
            {showSkeleton && (
              <>
                <NetBalanceCardSkeleton />
                <View style={{ marginHorizontal: -20, marginBottom: 12 }}>
                  <GroupCardSkeleton />
                  <GroupCardSkeleton />
                  <GroupCardSkeleton />
                  <GroupCardSkeleton />
                </View>
              </>
            )}

            {/* Error state */}
            {isError && <ErrorView message="Failed to load groups" onRetry={refetch} />}
          </>
        }
        ListEmptyComponent={
          !isLoading && !isError && filteredGroups.length === 0 ? (
            <EmptyState
              emoji={searchQuery.trim() !== '' || activeFilter !== 'all' ? '🔍' : '👥'}
              title={
                searchQuery.trim() !== '' || activeFilter !== 'all'
                  ? 'No matching groups'
                  : 'No groups yet'
              }
              description={
                searchQuery.trim() !== '' || activeFilter !== 'all'
                  ? 'Try adjusting your filters or search keywords.'
                  : 'Create a group to start splitting expenses with friends, roommates, or colleagues.'
              }
              ctaText={
                searchQuery.trim() !== '' || activeFilter !== 'all'
                  ? 'Clear Filters'
                  : 'Create First Group'
              }
              onCtaPress={() => {
                if (searchQuery.trim() !== '' || activeFilter !== 'all') {
                  setSearchQuery('');
                  setActiveFilter('all');
                } else {
                  setCreateGroupVisible(true);
                }
              }}
              ctaIcon={
                searchQuery.trim() !== '' || activeFilter !== 'all'
                  ? 'refresh-circle'
                  : 'add-circle'
              }
            />
          ) : null
        }
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.4}
        ListFooterComponent={
          isFetchingNextPage ? (
            <View style={{ paddingVertical: 16 }}>
              <ActivityIndicator size="small" color={COLORS.primary} />
            </View>
          ) : null
        }
        style={{ flex: 1 }}
      />

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
