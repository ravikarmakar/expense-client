import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, CURRENCY_SYMBOL } from '../../../constants/theme';
import { globalStyles } from '../../../styles/globalStyles';
import { GroupCard } from '../../../module/groups/components/GroupCard';

interface GroupMember {
  userId: string;
  name: string;
  image?: string | null;
}

interface ActiveGroup {
  id: string;
  name: string;
  emoji?: string | null;
  memberCount: number;
  myBalance: number;
  members: GroupMember[];
  updatedAt?: string;
  type?: string;
}

interface ActiveGroupsCardProps {
  recentGroups: ActiveGroup[];
}

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

export const ActiveGroupsCard = React.memo(function ActiveGroupsCard({
  recentGroups,
}: ActiveGroupsCardProps) {
  if (recentGroups.length === 0) {
    return null;
  }

  return (
    <View style={globalStyles.sectionContainer}>
      <View style={[globalStyles.sectionHeaderRow, styles.sectionHeaderRow]}>
        <Text style={[globalStyles.sectionTitle, styles.sectionTitle]}>Active Groups</Text>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.push('/(tabs)/groups')}
          style={styles.seeAllContainer}
        >
          <Text style={[globalStyles.seeAllText, styles.seeAllText]}>See All</Text>
          <Ionicons
            name="chevron-forward"
            size={14}
            color={COLORS.secondary}
            style={styles.seeAllIcon}
          />
        </TouchableOpacity>
      </View>
      <View style={styles.listContainer}>
        {recentGroups.map((group) => (
          <GroupCard
            key={group.id}
            name={group.name}
            emoji={group.emoji ?? '👥'}
            activity={`${group.type ?? 'Other'} • Active ${formatLastActive(group.updatedAt)}`}
            memberAvatars={group.members.slice(0, 2).map((m) => m.image ?? '')}
            totalMembersCount={group.memberCount}
            balanceText={
              Math.abs(group.myBalance) < 0.01
                ? 'Settled'
                : group.myBalance > 0
                  ? `Owed ${CURRENCY_SYMBOL}${group.myBalance.toFixed(2)}`
                  : `You owe ${CURRENCY_SYMBOL}${Math.abs(group.myBalance).toFixed(2)}`
            }
            balanceType={
              Math.abs(group.myBalance) < 0.01 ? 'settled' : group.myBalance > 0 ? 'owed' : 'owe'
            }
            onPress={() => router.push(`/groups/${group.id}`)}
          />
        ))}
        {recentGroups.length > 0 && (
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/groups')}
            style={styles.viewAllBtn}
            activeOpacity={0.7}
          >
            <Text style={styles.viewAllBtnText}>See All Groups</Text>
            <Ionicons name="chevron-forward" size={15} color={COLORS.primary} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  sectionHeaderRow: {
    marginBottom: 14,
    paddingHorizontal: 16,
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
  listContainer: {},
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1.5,
    borderBottomColor: COLORS.surfaceContainer,
    gap: 4,
  },
  viewAllBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
});
