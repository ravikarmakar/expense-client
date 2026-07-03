import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native';
import { COLORS } from '../constants/theme';

interface GroupCardProps {
  name: string;
  emoji?: string;
  activity: string;
  memberAvatars: string[];
  totalMembersCount?: number;
  balanceText: string;
  balanceType: 'owed' | 'owe' | 'settled';
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
    <TouchableOpacity style={styles.groupCard} activeOpacity={0.85} onPress={onPress}>
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
        </View>
      </View>

      {/* Right status badge container */}
      <View style={styles.rightContainer}>
        <View style={getBadgeStyle()}>
          <Text style={getBadgeTextStyle()}>{balanceText}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  groupCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainer,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    marginBottom: 8,
  },
  emblemContainer: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: COLORS.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  emblemEmoji: {
    fontSize: 26,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    gap: 2,
  },
  groupName: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.onSurface,
    letterSpacing: -0.2,
  },
  groupActivity: {
    fontSize: 12,
    color: COLORS.outline,
    fontWeight: '600',
  },
  avatarOverlapContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  overlapAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#ffffff',
    backgroundColor: COLORS.surfaceContainer,
  },
  overlapAvatar2: {
    marginLeft: -8,
  },
  overlapAvatarCount: {
    marginLeft: -8,
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
    minWidth: 90,
  },
  groupOweBadge: {
    backgroundColor: COLORS.primaryFixed,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  groupOweBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.onPrimaryFixedVariant,
    textAlign: 'center',
  },
  groupOweBadgeError: {
    backgroundColor: COLORS.errorContainer,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  groupOweBadgeTextError: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.onErrorContainer,
    textAlign: 'center',
  },
  groupNeutralBadge: {
    backgroundColor: COLORS.surfaceContainerHigh,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  groupNeutralBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.onSurfaceVariant,
    textAlign: 'center',
  },
});
