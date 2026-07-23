import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../constants/theme';
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
  variant?: 'light' | 'dark';
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
  variant = 'light',
}: ActiveGroupsCardProps) {
  if (recentGroups.length === 0) {
    return null;
  }

  const isDark = variant === 'dark';

  return (
    <View style={globalStyles.sectionContainer}>
      <View style={[globalStyles.sectionHeaderRow, styles.sectionHeaderRow]}>
        <Text
          style={[globalStyles.sectionTitle, styles.sectionTitle, isDark && { color: '#ffffff' }]}
        >
          Active Groups
        </Text>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.push('/(tabs)/groups')}
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
      <View
        style={[
          styles.listContainer,
          !isDark && {
            backgroundColor: '#ffffff',
            borderRadius: 20,
            borderWidth: 1,
            borderColor: '#edeeef',
            overflow: 'hidden',
          },
        ]}
      >
        {recentGroups.map((group) => (
          <GroupCard
            key={group.id}
            name={group.name}
            emoji={group.emoji ?? '👥'}
            activity={`${group.type ?? 'Other'} • Active ${formatLastActive(group.updatedAt)}`}
            memberAvatars={group.members.slice(0, 2).map((m) => m.image ?? '')}
            totalMembersCount={group.memberCount}
            balance={group.myBalance}
            onPress={() => router.push(`/groups/${group.id}`)}
            variant={variant}
          />
        ))}
        {recentGroups.length > 0 && (
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/groups')}
            style={[
              styles.viewAllBtn,
              !isDark && {
                backgroundColor: '#ffffff',
                paddingVertical: 14,
                borderTopWidth: 1,
                borderTopColor: '#f1f3f4',
                borderBottomWidth: 0,
              },
              isDark && {
                backgroundColor: '#131D1A',
                borderRadius: 20,
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.08)',
                paddingVertical: 16,
                marginTop: 4,
                borderBottomWidth: 1,
                borderBottomColor: 'rgba(255, 255, 255, 0.08)',
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
              See All Groups
            </Text>
            <Ionicons name="chevron-forward" size={15} color={isDark ? '#D1D5DB' : '#4B5563'} />
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
