import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../constants/theme';
import { SkeletonLoader } from '../../../components/SkeletonLoader';

interface GroupCardProps {
  name: string;
  emoji?: string;
  activity: string;
  memberAvatars: string[];
  totalMembersCount?: number;
  balanceText: string;
  balanceType: 'owed' | 'owe' | 'settled';
  isLoadingBalance?: boolean;
  onPress?: () => void;
}

export const GroupCard = React.memo(function GroupCard({
  name,
  emoji,
  activity,
  memberAvatars,
  totalMembersCount = memberAvatars.length,
  balanceText,
  balanceType,
  isLoadingBalance,
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

  const getBadgeIcon = () => {
    if (isOwed)
      return (
        <Ionicons
          name="arrow-down-circle"
          size={13}
          color={COLORS.primary}
          style={styles.badgeIcon}
        />
      );
    if (isOwe)
      return (
        <Ionicons name="arrow-up-circle" size={13} color={COLORS.error} style={styles.badgeIcon} />
      );
    return (
      <Ionicons name="checkmark-circle" size={13} color={COLORS.outline} style={styles.badgeIcon} />
    );
  };

  return (
    <TouchableOpacity style={styles.groupCard} activeOpacity={0.8} onPress={onPress}>
      {/* Left circular emblem container */}
      <View style={styles.emblemContainer}>
        <Text style={styles.emblemEmoji}>{emoji ?? '👥'}</Text>
      </View>

      {/* Center content container */}
      <View style={styles.centerContainer}>
        <Text style={styles.groupName} numberOfLines={1}>
          {name}
        </Text>
        <Text style={styles.groupActivity} numberOfLines={1}>
          {activity}
        </Text>
        {/* Avatars overlap row */}
        <View style={styles.avatarOverlapContainer}>
          {memberAvatars.slice(0, 3).map((uri, idx) => (
            <Image
              key={idx}
              source={{
                uri:
                  uri && uri.trim() !== ''
                    ? uri
                    : 'https://lh3.googleusercontent.com/aida-public/AB6AXuD5T5AJUovvhA_WnRPgEHHUebHGXF5_1EiHG95y-QfKq2nOO07Mu6O3nzSp4AjHOG8hjAGd0Le9T3VMsQ554EcRvn-FBqlSpjy3oLYsJUgXfzsRNskrMk9B58aBpvnyrr9dunlwrQ3t-uLtHtQ5AeVKOCn-64fTFblLeVHlXrsHWRLrpvOIYhhnMeriv4c4aLSPUpLcih10KZ6yXzN32ixRZd3TUiAozHsESLzxhXawBgffwZTpUF4UXguT6m8ijF1N9kQL0fwVx9xM',
              }}
              style={[styles.overlapAvatar, idx > 0 && styles.overlapAvatar2]}
            />
          ))}
          {totalMembersCount > 3 && (
            <View style={[styles.overlapAvatar, styles.overlapAvatarCount]}>
              <Text style={styles.overlapAvatarCountText}>+{totalMembersCount - 3}</Text>
            </View>
          )}
          <Text style={styles.memberCountText}>
            {totalMembersCount} {totalMembersCount === 1 ? 'member' : 'members'}
          </Text>
        </View>
      </View>

      {/* Right status badge container */}
      <View style={styles.rightContainer}>
        {isLoadingBalance ? (
          <SkeletonLoader width={70} height={22} borderRadius={10} />
        ) : (
          <View style={[styles.badgeBase, getBadgeStyle()]}>
            {getBadgeIcon()}
            <Text style={getBadgeTextStyle()} numberOfLines={1}>
              {balanceText}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  groupCard: {
    backgroundColor: COLORS.surface,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.surfaceContainer,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  emblemContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#f0f2f0',
  },
  emblemEmoji: {
    fontSize: 22,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    gap: 2,
  },
  groupName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.onSurface,
    letterSpacing: -0.1,
  },
  groupActivity: {
    fontSize: 13,
    color: COLORS.outline,
    fontWeight: '400',
  },
  avatarOverlapContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  overlapAvatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: '#ffffff',
    backgroundColor: COLORS.surfaceContainer,
  },
  overlapAvatar2: {
    marginLeft: -6,
  },
  overlapAvatarCount: {
    marginLeft: -6,
    backgroundColor: COLORS.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlapAvatarCountText: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.outline,
  },
  rightContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    maxWidth: 120,
  },
  badgeBase: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 10,
  },
  badgeIcon: {
    marginRight: 4,
  },
  groupOweBadge: {
    backgroundColor: 'rgba(0, 105, 72, 0.08)',
  },
  groupOweBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  groupOweBadgeError: {
    backgroundColor: 'rgba(186, 26, 26, 0.08)',
  },
  groupOweBadgeTextError: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.error,
  },
  groupNeutralBadge: {
    backgroundColor: COLORS.surfaceContainerLow,
  },
  groupNeutralBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.outline,
  },
  memberCountText: {
    fontSize: 12,
    color: COLORS.outline,
    fontWeight: '500',
    marginLeft: 8,
  },
});
