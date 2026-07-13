import React from 'react';
import { View, Text, TouchableOpacity, TextInput, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, CURRENCY_SYMBOL, PREDEFINED_AVATARS } from '../../../constants/theme';
import { styles } from '../styles/add-expense.styles';
import { MembersSelector, type SelectorGroupMember } from './MembersSelector';
import { SkeletonLoader } from '../../../components/SkeletonLoader';

interface SplitSelectorProps {
  groupMembers: SelectorGroupMember[];
  sortedGroupMembers: SelectorGroupMember[];
  splitMemberIds: string[];
  currentUser: { id: string; name: string } | null | undefined;
  onToggleMember: (userId: string) => void;
  splitMode: 'equal' | 'exact';
  setSplitMode: (mode: 'equal' | 'exact') => void;
  customSplits: Record<string, string>;
  setCustomSplits: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  amount: string;
  useWalletBalance: boolean;
  walletData: { balance: number } | null | undefined;
  setErrorMessage: (msg: string) => void;
  isLoading?: boolean;
}

export const SplitSelector = React.memo(function SplitSelector({
  groupMembers,
  sortedGroupMembers,
  splitMemberIds,
  currentUser,
  onToggleMember,
  splitMode,
  setSplitMode,
  customSplits,
  setCustomSplits,
  amount,
  useWalletBalance,
  walletData,
  setErrorMessage,
  isLoading,
}: SplitSelectorProps) {
  if (isLoading) {
    return (
      <View style={{ marginBottom: 20 }}>
        {/* Header Skeleton */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 12,
            paddingHorizontal: 4,
          }}
        >
          <SkeletonLoader width={80} height={12} borderRadius={4} />
          <SkeletonLoader width={40} height={12} borderRadius={4} />
        </View>
        {/* Horizontal Members Skeleton */}
        <View style={{ flexDirection: 'row', gap: 12, paddingBottom: 20 }}>
          {[1, 2, 3, 4].map((i) => (
            <View key={i} style={{ alignItems: 'center', width: 64, gap: 6 }}>
              <SkeletonLoader width={48} height={48} borderRadius={24} />
              <SkeletonLoader width={40} height={10} borderRadius={3} />
            </View>
          ))}
        </View>
      </View>
    );
  }

  if (groupMembers.length === 1) {
    return (
      <View style={{ marginBottom: 16 }}>
        <Text style={styles.inputLabel}>Splitting</Text>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: COLORS.surfaceContainerLow,
            borderColor: COLORS.outlineVariant,
            borderWidth: 1,
            borderRadius: 12,
            padding: 14,
            gap: 10,
            marginTop: 4,
          }}
        >
          <Ionicons name="information-circle-outline" size={20} color={COLORS.primary} />
          <Text
            style={{
              fontSize: 13,
              fontWeight: '500',
              color: COLORS.onSurfaceVariant,
              flex: 1,
              lineHeight: 18,
            }}
          >
            You are the only member in this group. You need at least one other member to split
            expenses.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <>
      {groupMembers.length > 0 && (
        <MembersSelector
          groupMembers={groupMembers}
          sortedGroupMembers={sortedGroupMembers}
          splitMemberIds={splitMemberIds}
          currentUser={currentUser}
          onToggleMember={onToggleMember}
        />
      )}

      {splitMemberIds.length > 0 && (
        <View style={styles.splitModeContainer}>
          <Text style={styles.inputLabel}>Split Option</Text>
          <View style={styles.splitModeToggleRow}>
            <TouchableOpacity
              style={[styles.splitModeTab, splitMode === 'equal' && styles.splitModeTabActive]}
              onPress={() => setSplitMode('equal')}
              activeOpacity={0.8}
            >
              <Ionicons
                name="pie-chart-outline"
                size={16}
                color={splitMode === 'equal' ? '#fff' : COLORS.onSurfaceVariant}
              />
              <Text
                style={[
                  styles.splitModeTabText,
                  splitMode === 'equal' && styles.splitModeTabTextActive,
                ]}
              >
                Split Equally
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.splitModeTab, splitMode === 'exact' && styles.splitModeTabActive]}
              onPress={() => setSplitMode('exact')}
              activeOpacity={0.8}
            >
              <Ionicons
                name="cash-outline"
                size={16}
                color={splitMode === 'exact' ? '#fff' : COLORS.onSurfaceVariant}
              />
              <Text
                style={[
                  styles.splitModeTabText,
                  splitMode === 'exact' && styles.splitModeTabTextActive,
                ]}
              >
                Exact Shares
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {splitMode === 'exact' && splitMemberIds.length > 0 && (
        <View style={styles.exactSplitsList}>
          <Text style={styles.inputLabel}>Specify Amounts</Text>
          {sortedGroupMembers
            .filter((m) => splitMemberIds.includes(m.userId))
            .map((member) => (
              <View key={member.userId} style={styles.exactSplitRow}>
                <View style={styles.exactSplitMemberInfo}>
                  <Image
                    source={{ uri: member.image || PREDEFINED_AVATARS[0] }}
                    style={styles.exactSplitAvatar}
                  />
                  <Text style={styles.exactSplitName} numberOfLines={1}>
                    {currentUser?.id === member.userId ? 'You' : member.name}
                  </Text>
                </View>
                <View style={styles.exactSplitInputWrapper}>
                  <Text style={styles.exactSplitCurrency}>{CURRENCY_SYMBOL}</Text>
                  <TextInput
                    style={styles.exactSplitInput}
                    placeholder="0.00"
                    placeholderTextColor={COLORS.outlineVariant}
                    keyboardType="numeric"
                    value={customSplits[member.userId] || ''}
                    onChangeText={(val) => {
                      setErrorMessage('');
                      if (/^\d*\.?\d{0,2}$/.test(val)) {
                        setCustomSplits((current) => ({
                          ...current,
                          [member.userId]: val,
                        }));
                      }
                    }}
                  />
                </View>
              </View>
            ))}

          {(() => {
            const total = parseFloat(amount.replace(',', '.')) || 0;
            const walletDeduction =
              useWalletBalance && walletData ? Math.min(walletData.balance, total) : 0;
            const netAmountToSplit = total - walletDeduction;

            const sumOfSplits = splitMemberIds.reduce((sum, uid) => {
              return sum + (parseFloat(customSplits[uid]) || 0);
            }, 0);

            const difference = netAmountToSplit - sumOfSplits;
            const isMatched = Math.abs(difference) <= 0.005;

            return (
              <View
                style={[
                  styles.allocatedTally,
                  isMatched ? styles.allocatedTallyMatch : styles.allocatedTallyMismatch,
                ]}
              >
                <Ionicons
                  name={isMatched ? 'checkmark-circle' : 'alert-circle'}
                  size={16}
                  color={isMatched ? '#2e7d32' : COLORS.error}
                />
                <Text
                  style={[
                    styles.allocatedTallyText,
                    { color: isMatched ? '#2e7d32' : COLORS.error },
                  ]}
                >
                  {isMatched
                    ? `Total allocated matched ₹${netAmountToSplit.toFixed(2)}`
                    : difference > 0
                      ? `₹${difference.toFixed(2)} left to allocate`
                      : `₹${Math.abs(difference).toFixed(2)} over allocated`}
                </Text>
              </View>
            );
          })()}
        </View>
      )}
    </>
  );
});
