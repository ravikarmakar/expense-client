import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import { COLORS, CURRENCY_SYMBOL } from '../../constants/theme';
import { globalStyles } from '../../styles/globalStyles';
import { GroupCard } from '../../components/GroupCard';
import { CreateGroupModal } from '../../module/groups/components/CreateGroupModal';
import { SkeletonLoader } from '../../components/SkeletonLoader';
import { ErrorView } from '../../components/ErrorView';
import { EmptyState } from '../../components/EmptyState';
import { useGroups } from '@workspace/api';
import { styles } from '../../module/groups/styles/groups-tab.styles';

type FilterType = 'all' | 'owed' | 'owe' | 'settled' | 'deactivated';

export default function GroupsTabScreen() {
  const [createGroupVisible, setCreateGroupVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  // Fetch paginated groups from the server
  const { data, isLoading, isError, hasNextPage, fetchNextPage, isFetchingNextPage, refetch } =
    useGroups();

  const groupList = React.useMemo(() => {
    return data?.pages.flatMap((page) => page.groups) ?? [];
  }, [data]);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const insets = useSafeAreaInsets();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  // Segment to active groups only for statistics
  const activeGroupList = React.useMemo(() => {
    return groupList.filter((g) => g.isActive !== false);
  }, [groupList]);

  // Compute overall statistics on active groups
  const totalOwedToMe = activeGroupList
    .filter((g) => g.myBalance > 0)
    .reduce((sum, g) => sum + g.myBalance, 0);
  const totalIOwe = activeGroupList
    .filter((g) => g.myBalance < 0)
    .reduce((sum, g) => sum + Math.abs(g.myBalance), 0);

  const netBalance = totalOwedToMe - totalIOwe;

  // Filter and Search logic
  const filteredGroups = React.useMemo(() => {
    let list = groupList;

    // Apply text search
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      list = list.filter((g) => g.name.toLowerCase().includes(q));
    }

    // Apply tab filtering
    if (activeFilter === 'owed') {
      list = list.filter((g) => g.isActive !== false && g.myBalance > 0.01);
    } else if (activeFilter === 'owe') {
      list = list.filter((g) => g.isActive !== false && g.myBalance < -0.01);
    } else if (activeFilter === 'settled') {
      list = list.filter((g) => g.isActive !== false && Math.abs(g.myBalance) <= 0.01);
    } else if (activeFilter === 'deactivated') {
      list = list.filter((g) => g.isActive === false);
    } else {
      // By default ('all'), show only active groups
      list = list.filter((g) => g.isActive !== false);
    }

    return list;
  }, [groupList, searchQuery, activeFilter]);

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
      <LinearGradient
        colors={['rgba(75, 65, 225, 0.08)', 'rgba(75, 65, 225, 0.02)', 'transparent']}
        style={[styles.headerContainer, { paddingTop: insets.top + 12, paddingBottom: 16 }]}
      >
        <View style={styles.tabHeaderRow}>
          <View
            style={[
              styles.searchInner,
              {
                flex: 1,
                marginRight: 12,
                height: 48,
                elevation: 0,
                shadowOpacity: 0,
                borderWidth: 1,
                borderColor: '#e8ece9',
                borderRadius: 14,
                backgroundColor: '#ffffff',
              },
            ]}
          >
            <Ionicons
              name="search-outline"
              size={18}
              color={COLORS.outline}
              style={styles.searchIcon}
            />
            <TextInput
              placeholder="Search groups..."
              placeholderTextColor={COLORS.outline}
              style={[styles.searchInput, { fontSize: 15 }]}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCorrect={false}
            />
            {searchQuery.trim() !== '' && (
              <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
                <Ionicons name="close-circle" size={16} color={COLORS.outline} />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            style={[styles.createGroupButton, { width: 48, height: 48, borderRadius: 14 }]}
            activeOpacity={0.8}
            onPress={() => setCreateGroupVisible(true)}
          >
            <Ionicons name="add" size={26} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Scrollable Filter Pills */}
      <View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScrollView}
          contentContainerStyle={styles.filterContainer}
        >
          <TouchableOpacity
            style={[styles.filterPill, activeFilter === 'all' && styles.filterPillActive]}
            onPress={() => setActiveFilter('all')}
            activeOpacity={0.8}
          >
            <Text
              style={[styles.filterPillText, activeFilter === 'all' && styles.filterPillTextActive]}
            >
              All Groups ({activeGroupList.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterPill, activeFilter === 'owed' && styles.filterPillActive]}
            onPress={() => setActiveFilter('owed')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.filterPillText,
                activeFilter === 'owed' && styles.filterPillTextActive,
              ]}
            >
              Owed to me
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterPill, activeFilter === 'owe' && styles.filterPillActive]}
            onPress={() => setActiveFilter('owe')}
            activeOpacity={0.8}
          >
            <Text
              style={[styles.filterPillText, activeFilter === 'owe' && styles.filterPillTextActive]}
            >
              You owe
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterPill, activeFilter === 'settled' && styles.filterPillActive]}
            onPress={() => setActiveFilter('settled')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.filterPillText,
                activeFilter === 'settled' && styles.filterPillTextActive,
              ]}
            >
              Settled
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterPill, activeFilter === 'deactivated' && styles.filterPillActive]}
            onPress={() => setActiveFilter('deactivated')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.filterPillText,
                activeFilter === 'deactivated' && styles.filterPillTextActive,
              ]}
            >
              Deactivated ({groupList.filter((g) => g.isActive === false).length})
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <FlatList
        data={filteredGroups}
        keyExtractor={(item) => item.id}
        renderItem={({ item: group }) => (
          <GroupCard
            name={group.name}
            emoji={group.emoji ?? '👥'}
            activity={`${group.type ?? 'Other'} · ${group.memberCount} members`}
            memberAvatars={group.members.slice(0, 3).map((m) => m.image ?? '')}
            totalMembersCount={group.memberCount}
            balanceText={
              Math.abs(group.myBalance) < 0.01
                ? 'Settled up'
                : group.myBalance > 0
                  ? `Owes ${CURRENCY_SYMBOL}${group.myBalance.toFixed(0)}`
                  : `Owe ${CURRENCY_SYMBOL}${Math.abs(group.myBalance).toFixed(0)}`
            }
            balanceType={
              Math.abs(group.myBalance) < 0.01 ? 'settled' : group.myBalance > 0 ? 'owed' : 'owe'
            }
            onPress={() =>
              router.push(
                `/groups/${group.id}?name=${encodeURIComponent(group.name)}&emoji=${encodeURIComponent(group.emoji ?? '👥')}`
              )
            }
          />
        )}
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
            {!isLoading && !isError && groupList.length > 0 && (
              <View style={styles.netBalanceCard}>
                <View style={styles.netBalanceHeader}>
                  <View>
                    <Text style={styles.netBalanceLabel}>Net Balance</Text>
                    <Text
                      style={[
                        styles.netBalanceAmount,
                        {
                          color:
                            netBalance > 0
                              ? COLORS.primary
                              : netBalance < 0
                                ? COLORS.error
                                : COLORS.onSurface,
                        },
                      ]}
                    >
                      {netBalance > 0 ? '+' : ''}
                      {CURRENCY_SYMBOL}
                      {netBalance.toFixed(2)}
                    </Text>
                  </View>
                  <Ionicons
                    name={
                      netBalance > 0
                        ? 'trending-up'
                        : netBalance < 0
                          ? 'trending-down'
                          : 'checkmark-circle'
                    }
                    size={28}
                    color={
                      netBalance > 0
                        ? COLORS.primary
                        : netBalance < 0
                          ? COLORS.error
                          : COLORS.outline
                    }
                  />
                </View>

                <View style={styles.netBalanceRow}>
                  {/* Plus flow */}
                  <View style={styles.netBalanceCol}>
                    <View
                      style={[styles.iconRoundBg, { backgroundColor: 'rgba(0, 105, 72, 0.08)' }]}
                    >
                      <Ionicons name="arrow-down" size={14} color={COLORS.primary} />
                    </View>
                    <View style={styles.netBalanceTextContainer}>
                      <Text style={styles.netBalanceDetailLabel}>Owed to you:</Text>
                      <Text style={[styles.netBalanceDetailValue, { color: COLORS.primary }]}>
                        {CURRENCY_SYMBOL}
                        {totalOwedToMe.toFixed(2)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.netBalanceColSeparator} />

                  {/* Minus flow */}
                  <View style={styles.netBalanceCol}>
                    <View
                      style={[styles.iconRoundBg, { backgroundColor: 'rgba(186, 26, 26, 0.08)' }]}
                    >
                      <Ionicons name="arrow-up" size={14} color={COLORS.error} />
                    </View>
                    <View style={styles.netBalanceTextContainer}>
                      <Text style={styles.netBalanceDetailLabel}>You owe:</Text>
                      <Text style={[styles.netBalanceDetailValue, { color: COLORS.error }]}>
                        {CURRENCY_SYMBOL}
                        {totalIOwe.toFixed(2)}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            )}

            {/* Loading state */}
            {isLoading && (
              <View style={{ gap: 12, marginBottom: 12 }}>
                <SkeletonLoader height={84} />
                <SkeletonLoader height={84} />
                <SkeletonLoader height={84} />
              </View>
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
