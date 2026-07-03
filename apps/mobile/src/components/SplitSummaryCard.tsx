import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, CURRENCY_SYMBOL } from '../constants/theme';
import type { GroupMember } from '@workspace/api';

interface SplitSummaryCardProps {
  members: GroupMember[];
  currentUserId?: string;
  onSettleUp?: (member: GroupMember) => void;
  isSettling?: string | null; // userId being settled
}

export function SplitSummaryCard({
  members,
  currentUserId,
  onSettleUp,
  isSettling,
}: SplitSummaryCardProps) {
  const currentUser = members.find((m) => m.userId === currentUserId);
  const otherMembers = members.filter((m) => m.userId !== currentUserId);
  const displayMembers = currentUser ? [currentUser, ...otherMembers] : otherMembers;

  const [isCollapsed, setIsCollapsed] = React.useState(true);
  const COLLAPSE_THRESHOLD = 3;
  const shouldShowCollapseToggle = displayMembers.length > COLLAPSE_THRESHOLD;
  const renderedMembers =
    shouldShowCollapseToggle && isCollapsed
      ? displayMembers.slice(0, COLLAPSE_THRESHOLD)
      : displayMembers;

  if (displayMembers.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="checkmark-circle" size={32} color={COLORS.primary} />
        <Text style={styles.emptyText}>No members yet</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderedMembers.map((member, index) => {
        const isMe = member.userId === currentUserId;
        const isPositive = member.balance >= 0; // they owe you / you are owed
        const isSettled = Math.abs(member.balance) < 0.01;
        const balanceAbs = Math.abs(member.balance);
        const isThisSettling = isSettling === member.userId;

        return (
          <View
            key={member.userId}
            style={[
              styles.row,
              index < displayMembers.length - 1 && styles.rowBorder,
              isMe && styles.meRow,
            ]}
          >
            {/* Avatar */}
            <View style={styles.avatarContainer}>
              {member.image ? (
                <Image source={{ uri: member.image }} style={styles.avatarImage} />
              ) : (
                <View
                  style={[
                    styles.avatar,
                    {
                      backgroundColor:
                        member.role === 'invited'
                          ? '#feefe3'
                          : isSettled
                            ? COLORS.surfaceContainer
                            : isPositive
                              ? COLORS.primaryFixed
                              : COLORS.errorContainer,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.avatarText,
                      {
                        color:
                          member.role === 'invited'
                            ? '#b06000'
                            : isSettled
                              ? COLORS.outline
                              : isPositive
                                ? COLORS.primary
                                : COLORS.error,
                      },
                    ]}
                  >
                    {member.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
            </View>

            {/* Name + status */}
            <View style={styles.memberInfo}>
              <Text style={styles.memberName}>{isMe ? `${member.name} (You)` : member.name}</Text>
              {member.role === 'invited' ? (
                <Text style={[styles.settledLabel, { color: '#b06000' }]}>
                  Invitation pending ⏳
                </Text>
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

            {/* Settle button */}
            {!isSettled && !isMe && member.role !== 'invited' && onSettleUp && (
              <TouchableOpacity
                style={[
                  styles.settleBtn,
                  isPositive ? styles.settleBtnPositive : styles.settleBtnNegative,
                ]}
                onPress={() => onSettleUp(member)}
                activeOpacity={0.8}
                disabled={isThisSettling}
              >
                {isThisSettling ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.settleBtnText}>Settle</Text>
                )}
              </TouchableOpacity>
            )}

            {/* Settled badge */}
            {isSettled && !isMe && member.role !== 'invited' && (
              <View style={styles.settledBadge}>
                <Ionicons name="checkmark" size={14} color={COLORS.primary} />
              </View>
            )}
          </View>
        );
      })}

      {shouldShowCollapseToggle && (
        <TouchableOpacity
          style={styles.collapseToggleBtn}
          onPress={() => setIsCollapsed(!isCollapsed)}
          activeOpacity={0.7}
        >
          <Text style={styles.collapseToggleText}>
            {isCollapsed ? `Show all ${displayMembers.length} members` : 'Show less'}
          </Text>
          <Ionicons
            name={isCollapsed ? 'chevron-down' : 'chevron-up'}
            size={14}
            color={COLORS.primary}
          />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainer,
    overflow: 'hidden',
  },
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
  emptyContainer: {
    alignItems: 'center',
    padding: 24,
    gap: 8,
  },
  emptyText: {
    fontSize: 13,
    color: COLORS.outline,
    fontWeight: '500',
  },
  collapseToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 6,
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceContainerLow,
  },
  collapseToggleText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
});
