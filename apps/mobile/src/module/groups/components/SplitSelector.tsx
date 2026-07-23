import React from 'react';
import { View, Text, TouchableOpacity, TextInput, Image, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, CURRENCY_SYMBOL, resolveAvatar } from '../../../constants/theme';
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
  variant?: 'light' | 'dark';
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
  variant = 'light',
}: SplitSelectorProps) {
  const isDark = variant === 'dark';

  const { width: screenWidth } = Dimensions.get('window');
  const containerWidth = screenWidth - 48;
  const activeTabTranslateX = React.useRef(
    new Animated.Value(splitMode === 'equal' ? 0 : (containerWidth - 8) / 2)
  ).current;

  React.useEffect(() => {
    const targetValue = splitMode === 'equal' ? 0 : (containerWidth - 8) / 2;
    Animated.timing(activeTabTranslateX, {
      toValue: targetValue,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [splitMode, containerWidth]);

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
        <Text style={[styles.inputLabel, isDark && { color: '#B3C3BD' }]}>Splitting</Text>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: isDark ? '#16221F' : COLORS.surfaceContainerLow,
            borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : COLORS.outlineVariant,
            borderWidth: 1,
            borderRadius: 12,
            padding: 14,
            gap: 10,
            marginTop: 4,
          }}
        >
          <Ionicons
            name="information-circle-outline"
            size={20}
            color={isDark ? '#10B981' : COLORS.primary}
          />
          <Text
            style={{
              fontSize: 13,
              fontWeight: '500',
              color: isDark ? '#8FA39C' : COLORS.onSurfaceVariant,
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
          variant={variant}
        />
      )}

      {splitMemberIds.length > 0 && (
        <View style={styles.splitModeContainer}>
          <Text style={[styles.inputLabel, isDark && { color: '#74817B' }]}>Split Option</Text>
          <View
            style={[
              styles.splitModeToggleRow,
              isDark && {
                backgroundColor: '#101917',
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.12)',
                position: 'relative',
              },
            ]}
          >
            {isDark && (
              <Animated.View
                style={{
                  position: 'absolute',
                  top: 3,
                  bottom: 3,
                  left: 4,
                  width: (containerWidth - 8) / 2,
                  borderRadius: 8,
                  backgroundColor: '#131D1A',
                  borderWidth: 1,
                  borderColor: 'rgba(255, 255, 255, 0.12)',
                  transform: [{ translateX: activeTabTranslateX }],
                }}
              />
            )}
            <TouchableOpacity
              style={styles.splitModeTab}
              onPress={() => setSplitMode('equal')}
              activeOpacity={0.8}
            >
              <Ionicons
                name="pie-chart-outline"
                size={16}
                color={
                  splitMode === 'equal'
                    ? isDark
                      ? '#10B981'
                      : '#fff'
                    : isDark
                      ? 'rgba(255, 255, 255, 0.65)'
                      : COLORS.onSurfaceVariant
                }
              />
              <Text
                style={[
                  styles.splitModeTabText,
                  isDark && {
                    color: splitMode === 'equal' ? '#10B981' : 'rgba(255, 255, 255, 0.65)',
                  },
                  splitMode === 'equal' && !isDark && styles.splitModeTabTextActive,
                  splitMode === 'equal' && isDark && { fontWeight: '700' },
                ]}
              >
                Split Equally
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.splitModeTab}
              onPress={() => setSplitMode('exact')}
              activeOpacity={0.8}
            >
              <Ionicons
                name="cash-outline"
                size={16}
                color={
                  splitMode === 'exact'
                    ? isDark
                      ? '#10B981'
                      : '#fff'
                    : isDark
                      ? 'rgba(255, 255, 255, 0.65)'
                      : COLORS.onSurfaceVariant
                }
              />
              <Text
                style={[
                  styles.splitModeTabText,
                  isDark && {
                    color: splitMode === 'exact' ? '#10B981' : 'rgba(255, 255, 255, 0.65)',
                  },
                  splitMode === 'exact' && !isDark && styles.splitModeTabTextActive,
                  splitMode === 'exact' && isDark && { fontWeight: '700' },
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
          <Text style={[styles.inputLabel, isDark && { color: '#74817B' }]}>Specify Amounts</Text>
          {sortedGroupMembers
            .filter((m) => splitMemberIds.includes(m.userId))
            .map((member) => (
              <View
                key={member.userId}
                style={[
                  styles.exactSplitRow,
                  isDark && {
                    backgroundColor: '#101917',
                    borderColor: 'rgba(255, 255, 255, 0.06)',
                    borderWidth: 1,
                  },
                ]}
              >
                <View style={styles.exactSplitMemberInfo}>
                  <Image
                    source={{ uri: resolveAvatar(member.image) }}
                    style={styles.exactSplitAvatar}
                  />
                  <Text
                    style={[styles.exactSplitName, isDark && { color: '#FFFFFF' }]}
                    numberOfLines={1}
                  >
                    {currentUser?.id === member.userId ? 'You' : member.name}
                  </Text>
                </View>
                <View
                  style={[
                    styles.exactSplitInputWrapper,
                    isDark && {
                      backgroundColor: '#131D1A',
                      borderColor: 'rgba(255, 255, 255, 0.12)',
                      borderWidth: 1,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.exactSplitCurrency,
                      isDark && { color: 'rgba(255, 255, 255, 0.65)' },
                    ]}
                  >
                    {CURRENCY_SYMBOL}
                  </Text>
                  <TextInput
                    style={[styles.exactSplitInput, isDark && { color: '#FFFFFF' }]}
                    placeholder="0.00"
                    placeholderTextColor={
                      isDark ? 'rgba(255, 255, 255, 0.35)' : COLORS.outlineVariant
                    }
                    keyboardType="numeric"
                    value={customSplits[member.userId] || ''}
                    onChangeText={(val) => {
                      setErrorMessage('');
                      if (/^\d{0,7}\.?\d{0,2}$/.test(val)) {
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
                  isMatched
                    ? isDark
                      ? { backgroundColor: 'rgba(16, 185, 129, 0.1)' }
                      : styles.allocatedTallyMatch
                    : isDark
                      ? { backgroundColor: 'rgba(239, 68, 68, 0.1)' }
                      : styles.allocatedTallyMismatch,
                ]}
              >
                <Ionicons
                  name={isMatched ? 'checkmark-circle' : 'alert-circle'}
                  size={16}
                  color={
                    isMatched ? (isDark ? '#10B981' : '#2e7d32') : isDark ? '#EF4444' : COLORS.error
                  }
                />
                <Text
                  style={[
                    styles.allocatedTallyText,
                    {
                      color: isMatched
                        ? isDark
                          ? '#10B981'
                          : '#2e7d32'
                        : isDark
                          ? '#EF4444'
                          : COLORS.error,
                    },
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
