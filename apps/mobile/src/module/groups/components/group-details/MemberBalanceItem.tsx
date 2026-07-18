import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, CURRENCY_SYMBOL, resolveAvatar } from '../../../../constants/theme';
import type { GroupMember } from '@workspace/api';
import { useReminderCooldown } from '../../../../hooks/useReminderCooldown';

interface MemberBalanceItemProps {
  member: GroupMember;
  currentUserId?: string;
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
  onSettleUp,
  isSettling,
  onSendReminder,
  isReminding,
  isLast = false,
  groupId,
}) => {
  const { getIsCooldown } = useReminderCooldown();
  const isCooldown = groupId ? getIsCooldown(member.userId, groupId) : false;

  const isMe = member.userId === currentUserId;
  const isPositive = member.balance >= 0; // they owe you / you are owed
  const isSettled = Math.abs(member.balance) < 0.01;
  const balanceAbs = Math.abs(member.balance);

  return (
    <View style={[styles.row, !isLast && styles.rowBorder, isMe && styles.meRow]}>
      {/* Avatar */}
      <View style={styles.avatarContainer}>
        <Image source={{ uri: resolveAvatar(member.image) }} style={styles.avatarImage} />
      </View>

      {/* Name + status */}
      <View style={styles.memberInfo}>
        <Text style={styles.memberName}>{isMe ? `${member.name} (You)` : member.name}</Text>
        {member.role === 'invited' ? (
          <Text style={[styles.settledLabel, { color: '#b06000' }]}>Invitation pending ⏳</Text>
        ) : (
          !isMe &&
          (isSettled ? (
            <Text style={styles.settledLabel}>All settled ✓</Text>
          ) : isPositive ? (
            <Text style={[styles.balanceLabel, { color: COLORS.primary }]}>
              owes you {CURRENCY_SYMBOL}
              {balanceAbs.toFixed(2)}
            </Text>
          ) : (
            <Text style={[styles.balanceLabel, { color: COLORS.error }]}>
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
                isCooldown && { backgroundColor: 'transparent', opacity: 0.6 },
              ]}
              onPress={() => onSendReminder(member)}
              activeOpacity={0.85}
              disabled={isSettling || isReminding || isCooldown}
            >
              {isReminding ? (
                <ActivityIndicator size="small" color={COLORS.primary} />
              ) : (
                <Ionicons
                  name={isCooldown ? 'notifications' : 'notifications-outline'}
                  size={16}
                  color={isCooldown ? COLORS.outline : COLORS.primary}
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
  memberName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.onSurface,
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
    minWidth: 32,
    minHeight: 32,
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
