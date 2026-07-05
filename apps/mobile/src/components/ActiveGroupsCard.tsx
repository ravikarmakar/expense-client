import React from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { CURRENCY_SYMBOL } from '../constants/theme';
import { globalStyles } from '../styles/globalStyles';
import { GroupCard } from './GroupCard';

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
}

interface ActiveGroupsCardProps {
  recentGroups: ActiveGroup[];
}

export function ActiveGroupsCard({ recentGroups }: ActiveGroupsCardProps) {
  if (recentGroups.length === 0) {
    return null;
  }

  return (
    <View style={globalStyles.sectionContainer}>
      <View style={globalStyles.sectionHeaderRow}>
        <Text style={globalStyles.sectionTitle}>Active Groups</Text>
        <TouchableOpacity activeOpacity={0.7} onPress={() => router.push('/(tabs)/groups')}>
          <Text style={globalStyles.seeAllText}>See All</Text>
        </TouchableOpacity>
      </View>
      {recentGroups.map((group) => (
        <GroupCard
          key={group.id}
          name={group.name}
          emoji={group.emoji ?? '👥'}
          activity={`${group.memberCount} members`}
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
    </View>
  );
}
