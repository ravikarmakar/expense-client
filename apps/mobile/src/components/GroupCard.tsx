import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native';
import { COLORS } from '../constants/theme';

interface GroupCardProps {
  name: string;
  activity: string;
  memberAvatars: string[];
  totalMembersCount?: number;
  balanceText: string;
  balanceType: 'owed' | 'owe' | 'settled';
  onPress?: () => void;
}

export function GroupCard({
  name,
  activity,
  memberAvatars,
  totalMembersCount = memberAvatars.length,
  balanceText,
  balanceType,
  onPress,
}: GroupCardProps) {
  const isOwe = balanceType === 'owe';
  const isOwed = balanceType === 'owed';

  const getBadgeStyle = () => {
    if (isOwed) return styles.groupOweBadge;
    if (isOwe) return styles.groupOweBadgeError;
    return styles.groupNeutralBadge;
  };

  const getBadgeTextStyle = () => {
    if (isOwed) return styles.groupOweBadgeText;
    if (isOwe) return styles.groupOweBadgeTextError;
    return styles.groupNeutralBadgeText;
  };

  return (
    <TouchableOpacity style={styles.groupCard} activeOpacity={0.9} onPress={onPress}>
      <View style={styles.groupCardHeader}>
        <View style={styles.avatarOverlapContainer}>
          {memberAvatars.slice(0, 2).map((uri, idx) => (
            <Image
              key={idx}
              source={{ uri }}
              style={[styles.overlapAvatar, idx > 0 && styles.overlapAvatar2]}
            />
          ))}
          {totalMembersCount > 2 && (
            <View style={[styles.overlapAvatar, styles.overlapAvatarCount]}>
              <Text style={styles.overlapAvatarCountText}>+{totalMembersCount - 2}</Text>
            </View>
          )}
        </View>
        <View style={getBadgeStyle()}>
          <Text style={getBadgeTextStyle()}>{balanceText}</Text>
        </View>
      </View>
      <View style={styles.groupCardFooter}>
        <Text style={styles.groupName}>{name}</Text>
        <Text style={styles.groupActivity}>{activity}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  groupCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainer,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    marginBottom: 12,
  },
  groupCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarOverlapContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  overlapAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#ffffff',
    backgroundColor: COLORS.surfaceContainer,
  },
  overlapAvatar2: {
    marginLeft: -12,
  },
  overlapAvatarCount: {
    marginLeft: -12,
    backgroundColor: COLORS.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlapAvatarCountText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.outline,
  },
  groupOweBadge: {
    backgroundColor: COLORS.primaryFixed,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  groupOweBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.onPrimaryFixedVariant,
  },
  groupOweBadgeError: {
    backgroundColor: COLORS.errorContainer,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  groupOweBadgeTextError: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.onErrorContainer,
  },
  groupNeutralBadge: {
    backgroundColor: COLORS.surfaceContainerHigh,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  groupNeutralBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.onSurfaceVariant,
  },
  groupCardFooter: {
    marginTop: 4,
  },
  groupName: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.onSurface,
  },
  groupActivity: {
    fontSize: 14,
    color: COLORS.outline,
    marginTop: 4,
  },
});
