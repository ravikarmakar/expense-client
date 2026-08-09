import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, CURRENCY_SYMBOL, resolveAvatar } from '../../../../constants/theme';
import type { GroupMember } from '@workspace/api';
import { useReminderCooldown } from '../../../../hooks/useReminderCooldown';

import { useTheme } from '../../../../context/ThemeContext';

interface MemberBalanceItemProps {
  member: GroupMember;
  currentUserId?: string;
  createdBy?: string;
  onSettleUp?: (member: GroupMember) => void;
  isSettling?: boolean;
  onSendReminder?: (member: GroupMember) => void;
  isReminding?: boolean;
  isLast?: boolean;
  groupId?: string;
}

export const MemberBalanceItem: React.FC<MemberBalanceItemProps> = ({
  member,
  currentUserId,
  createdBy,
  onSettleUp,
  isSettling,
  onSendReminder,
  isReminding,
  isLast = false,
  groupId,
}) => {
  const { isDark } = useTheme();
  const { getIsCooldown } = useReminderCooldown();
  const isCooldown = groupId ? getIsCooldown(member.userId, groupId) : false;

  const isMe = member.userId === currentUserId;
  const isCreator = createdBy ? member.userId === createdBy : member.role === 'admin';
  const isPositive = member.balance >= 0; // they owe you / you are owed
  const isSettled = Math.abs(member.balance) < 0.01;
  const balanceAbs = Math.abs(member.balance);

  return (
    <View
      style={[
        styles.row,
        !isLast && styles.rowBorder,
        isDark && !isLast && { borderBottomColor: 'rgba(255, 255, 255, 0.08)' },
        isMe && (isDark ? { backgroundColor: 'rgba(255, 255, 255, 0.03)' } : styles.meRow),
      ]}
    >
      {/* Avatar */}
      <View style={styles.avatarContainer}>
        <Image source={{ uri: resolveAvatar(member.image) }} style={styles.avatarImage} />
      </View>

      {/* Name + status */}
      <View style={styles.memberInfo}>
        <View style={styles.nameRow}>
          <Text style={[styles.memberName, isDark && { color: '#F9FAFB' }]} numberOfLines={1}>
            {isMe ? `${member.name} (You)` : member.name}
          </Text>
          {isCreator && (
            <View style={[styles.creatorBadge, isDark && styles.creatorBadgeDark]}>
              <MaterialCommunityIcons
                name="crown"
                size={11}
                color={isDark ? '#FBBF24' : '#D97706'}
              />
              <Text style={[styles.creatorBadgeText, isDark && { color: '#FBBF24' }]}>Admin</Text>
            </View>
          )}
        </View>
        {member.role === 'invited' ? (
          <Text style={[styles.settledLabel, { color: isDark ? '#FBBF24' : '#b06000' }]}>
            Invitation pending ⏳
          </Text>
        ) : (
          !isMe &&
          (isSettled ? (
            <Text style={[styles.settledLabel, isDark && { color: '#9CA3AF' }]}>All settled ✓</Text>
          ) : isPositive ? (
            <Text style={[styles.balanceLabel, { color: isDark ? '#34D399' : COLORS.primary }]}>
              owes you {CURRENCY_SYMBOL}
              {balanceAbs.toFixed(2)}
            </Text>
          ) : (
            <Text style={[styles.balanceLabel, { color: isDark ? '#F87171' : COLORS.error }]}>
              you owe {CURRENCY_SYMBOL}
              {balanceAbs.toFixed(2)}
            </Text>
          ))
        )}
      </View>

      {/* Settle button / Nudge button */}
      {!isSettled && !isMe && member.role !== 'invited' && (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          {isPositive && onSendReminder && (
            <TouchableOpacity
              style={[
                styles.nudgeBtn,
                isDark && { backgroundColor: 'rgba(255, 255, 255, 0.08)' },
                isCooldown && { backgroundColor: 'transparent', opacity: 0.6 },
              ]}
              onPress={() => onSendReminder(member)}
              activeOpacity={0.85}
              disabled={isSettling || isReminding || isCooldown}
            >
              {isReminding ? (
                <ActivityIndicator size="small" color={isDark ? '#34D399' : COLORS.primary} />
              ) : (
                <Ionicons
                  name={isCooldown ? 'notifications' : 'notifications-outline'}
                  size={24}
                  color={
                    isCooldown
                      ? isDark
                        ? '#6B7280'
                        : COLORS.outline
                      : isDark
                        ? '#34D399'
                        : COLORS.primary
                  }
                />
              )}
            </TouchableOpacity>
          )}

          {!isPositive && onSettleUp && (
            <TouchableOpacity
              style={[styles.settleBtn, styles.settleBtnNegative]}
              onPress={() => onSettleUp(member)}
              activeOpacity={0.8}
              disabled={isSettling}
            >
              {isSettling ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.settleBtnText}>Settle</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Settled badge */}
      {isSettled && !isMe && member.role !== 'invited' && (
        <View style={styles.settledBadge}>
          <Ionicons name="checkmark" size={14} color={COLORS.primary} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceContainerLow,
  },
  meRow: {
    backgroundColor: COLORS.surfaceContainerLow,
  },
  avatarContainer: {
    width: 44,
    height: 44,
    position: 'relative',
  },
  avatarImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surfaceContainer,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
  },
  memberInfo: {
    flex: 1,
    gap: 2,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  memberName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.onSurface,
  },
  creatorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  creatorBadgeDark: {
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
    borderColor: 'rgba(251, 191, 36, 0.3)',
  },
  creatorBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#D97706',
    letterSpacing: 0.2,
  },
  balanceLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  settledLabel: {
    fontSize: 12,
    color: COLORS.outline,
    fontWeight: '500',
  },
  settleBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    minWidth: 60,
    alignItems: 'center',
  },
  nudgeBtn: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 40,
    minHeight: 40,
  },
  settleBtnPositive: {
    backgroundColor: COLORS.primary,
  },
  settleBtnNegative: {
    backgroundColor: COLORS.error,
  },
  settleBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  settledBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primaryFixed,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledNudgeBtn: {
    backgroundColor: 'transparent',
    opacity: 0.6,
  },
});
