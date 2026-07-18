import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../../constants/theme';
import type { GroupMember } from '@workspace/api';
import { MemberBalanceItem } from './MemberBalanceItem';

interface SplitSummaryCardProps {
  members: GroupMember[];
  currentUserId?: string;
  onSettleUp?: (member: GroupMember) => void;
  isSettling?: string | null; // userId being settled
  onSendReminder?: (member: GroupMember) => void;
  isReminding?: string | null; // userId being reminded
  groupId?: string;
}

export function SplitSummaryCard({
  members,
  currentUserId,
  onSettleUp,
  isSettling,
  onSendReminder,
  isReminding,
  groupId,
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
      {renderedMembers.map((member, index) => (
        <MemberBalanceItem
          key={member.userId}
          member={member}
          currentUserId={currentUserId}
          onSettleUp={onSettleUp}
          isSettling={isSettling === member.userId}
          onSendReminder={onSendReminder}
          isReminding={isReminding === member.userId}
          isLast={index === renderedMembers.length - 1}
          groupId={groupId}
        />
      ))}

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
