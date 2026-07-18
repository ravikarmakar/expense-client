import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, resolveAvatar } from '../../../constants/theme';

export interface SelectorGroupMember {
  userId: string;
  name: string;
  email: string;
  image?: string | null;
  role: string;
}

interface MembersSelectorProps {
  groupMembers: SelectorGroupMember[];
  sortedGroupMembers: SelectorGroupMember[];
  splitMemberIds: string[];
  currentUser: { id: string } | null | undefined;
  onToggleMember: (userId: string) => void;
}

export const MembersSelector = React.memo(function MembersSelector({
  groupMembers,
  sortedGroupMembers,
  splitMemberIds,
  currentUser,
  onToggleMember,
}: MembersSelectorProps) {
  return (
    <>
      <View style={styles.splitHeaderRow}>
        <Text style={styles.inputLabel}>Split among</Text>
        <Text style={styles.splitCount}>
          {splitMemberIds.length} / {groupMembers.length}
        </Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.membersRow}
        keyboardShouldPersistTaps="handled"
      >
        {sortedGroupMembers.map((member) => {
          const isSelected = splitMemberIds.includes(member.userId);
          const isCurrentUser = currentUser?.id === member.userId;
          return (
            <TouchableOpacity
              key={member.userId}
              style={[
                styles.memberItem,
                isSelected && styles.memberItemActive,
                isCurrentUser && { opacity: 0.8 },
              ]}
              onPress={() => onToggleMember(member.userId)}
              activeOpacity={isCurrentUser ? 1 : 0.8}
              disabled={isCurrentUser}
            >
              <View style={styles.memberAvatarContainer}>
                <Image source={{ uri: resolveAvatar(member.image) }} style={styles.memberAvatar} />
                <View style={[styles.memberCheck, isSelected && styles.memberCheckActive]}>
                  {isSelected && <Ionicons name="checkmark" size={10} color="#fff" />}
                </View>
              </View>
              <Text
                style={[styles.memberName, isSelected && styles.memberNameActive]}
                numberOfLines={1}
              >
                {isCurrentUser ? `${member.name.split(' ')[0]} (You)` : member.name.split(' ')[0]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </>
  );
});

const styles = StyleSheet.create({
  splitHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.outline,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
    marginLeft: 4,
  },
  splitCount: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.primary,
  },
  membersRow: {
    gap: 12,
    paddingBottom: 20,
  },
  memberItem: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 64,
    gap: 6,
    opacity: 0.5,
  },
  memberItemActive: {
    opacity: 1,
  },
  memberAvatarContainer: {
    position: 'relative',
  },
  memberAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  memberCheck: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.surfaceContainerLow,
    borderWidth: 2,
    borderColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberCheckActive: {
    backgroundColor: COLORS.primary,
  },
  memberName: {
    fontSize: 12,
    color: COLORS.outline,
    fontWeight: '500',
    textAlign: 'center',
  },
  memberNameActive: {
    color: COLORS.primary,
  },
});
