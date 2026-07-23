import React from 'react';
import { StyleSheet, View, Text, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../../constants/theme';
import { SkeletonLoader } from '../../../components/SkeletonLoader';
import { ScalePressable } from '../../../components/ScalePressable';

interface GroupCardProps {
  name: string;
  emoji?: string;
  activity: string;
  memberAvatars: string[];
  totalMembersCount?: number;
  balance?: number;
  balanceText?: string;
  balanceType?: 'owed' | 'owe' | 'settled';
  isLoadingBalance?: boolean;
  onPress?: () => void;
  variant?: 'light' | 'dark';
}

export const GroupCard = React.memo(function GroupCard({
  name,
  emoji,
  activity,
  memberAvatars,
  totalMembersCount = memberAvatars.length,
  balance,
  balanceText,
  balanceType,
  isLoadingBalance,
  onPress,
  variant = 'light',
}: GroupCardProps) {
  const isDark = variant === 'dark';

  // Derive balance state
  let isOwe = false;
  let isOwed = false;
  let isSettled = true;
  let displayBalanceText = 'Settled ✓';

  if (balance !== undefined) {
    isOwe = balance < -0.01;
    isOwed = balance > 0.01;
    isSettled = !isOwe && !isOwed;
    if (isOwed) {
      displayBalanceText = `You are owed ₹${balance.toFixed(2)}`;
    } else if (isOwe) {
      displayBalanceText = `You owe ₹${Math.abs(balance).toFixed(2)}`;
    } else {
      displayBalanceText = 'Settled ✓';
    }
  } else {
    isOwe = balanceType === 'owe';
    isOwed = balanceType === 'owed';
    isSettled = !isOwe && !isOwed;
    displayBalanceText = balanceText || (isSettled ? 'Settled ✓' : '');
  }

  const getBadgeStyle = () => {
    if (isOwed) {
      return isDark ? { backgroundColor: 'rgba(52, 211, 153, 0.15)' } : styles.groupOweBadge;
    }
    if (isOwe) {
      return isDark ? { backgroundColor: 'rgba(248, 113, 113, 0.15)' } : styles.groupOweBadgeError;
    }
    return isDark ? { backgroundColor: 'rgba(255, 255, 255, 0.08)' } : styles.groupNeutralBadge;
  };

  const getBadgeTextStyle = () => {
    if (isOwed) {
      return isDark
        ? { color: '#34d399', fontSize: 11, fontWeight: '700' as const }
        : styles.groupOweBadgeText;
    }
    if (isOwe) {
      return isDark
        ? { color: '#f87171', fontSize: 11, fontWeight: '700' as const }
        : styles.groupOweBadgeTextError;
    }
    return isDark
      ? { color: 'rgba(255, 255, 255, 0.6)', fontSize: 11, fontWeight: '700' as const }
      : styles.groupNeutralBadgeText;
  };

  const getBadgeIcon = () => {
    if (isOwed)
      return (
        <Ionicons
          name="arrow-down-circle"
          size={13}
          color={isDark ? '#34d399' : COLORS.primary}
          style={styles.badgeIcon}
        />
      );
    if (isOwe)
      return (
        <Ionicons
          name="arrow-up-circle"
          size={13}
          color={isDark ? '#f87171' : COLORS.error}
          style={styles.badgeIcon}
        />
      );
    return (
      <Ionicons
        name="checkmark-circle"
        size={13}
        color={isDark ? 'rgba(255, 255, 255, 0.5)' : COLORS.outline}
        style={styles.badgeIcon}
      />
    );
  };

  const renderCardContent = () => (
    <>
      {/* Left circular emblem container */}
      <View
        style={[
          styles.emblemContainer,
          isDark && {
            backgroundColor: '#101917',
            borderColor: 'rgba(255, 255, 255, 0.06)',
          },
        ]}
      >
        <Text style={styles.emblemEmoji}>{emoji ?? '👥'}</Text>
      </View>

      {/* Center content container */}
      <View style={styles.centerContainer}>
        <Text style={[styles.groupName, isDark && { color: '#ffffff' }]} numberOfLines={1}>
          {name}
        </Text>
        <Text
          style={[styles.groupActivity, isDark && { color: 'rgba(255, 255, 255, 0.45)' }]}
          numberOfLines={1}
        >
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
              style={[
                styles.overlapAvatar,
                isDark && { borderColor: '#131D1A' },
                idx > 0 && styles.overlapAvatar2,
              ]}
            />
          ))}
          {totalMembersCount > 3 && (
            <View
              style={[
                styles.overlapAvatar,
                isDark && {
                  borderColor: '#131D1A',
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                },
                !isDark && styles.overlapAvatarCount,
                isDark && { alignItems: 'center', justifyContent: 'center', marginLeft: -6 },
              ]}
            >
              <Text style={[styles.overlapAvatarCountText, isDark && { color: '#ffffff' }]}>
                +{totalMembersCount - 3}
              </Text>
            </View>
          )}
          <Text style={[styles.memberCountText, isDark && { color: 'rgba(255, 255, 255, 0.45)' }]}>
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
              {displayBalanceText}
            </Text>
          </View>
        )}
      </View>
    </>
  );

  return (
    <ScalePressable
      style={[
        styles.groupCard,
        !isDark && {
          backgroundColor: '#ffffff',
          paddingVertical: 0,
          paddingHorizontal: 0,
          borderBottomWidth: 1,
          borderBottomColor: '#f1f3f4',
        },
        isDark && {
          borderRadius: 20,
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.08)',
          marginBottom: 12,
          paddingVertical: 0,
          paddingHorizontal: 0,
          overflow: 'hidden',
          backgroundColor: 'transparent',
          borderBottomWidth: 1,
          borderBottomColor: 'rgba(255, 255, 255, 0.08)',
        },
      ]}
      onPress={onPress}
    >
      {isDark ? (
        <LinearGradient
          colors={['rgba(34, 48, 40, 0.85)', 'rgba(20, 30, 24, 0.95)']}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 14,
            paddingVertical: 18,
            paddingHorizontal: 18,
            width: '100%',
          }}
        >
          {renderCardContent()}
        </LinearGradient>
      ) : (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            paddingVertical: 11,
            paddingHorizontal: 16,
            width: '100%',
          }}
        >
          {renderCardContent()}
        </View>
      )}
    </ScalePressable>
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
