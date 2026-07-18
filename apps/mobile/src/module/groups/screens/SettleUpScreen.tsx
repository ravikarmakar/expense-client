import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { TopAppBar } from '../../../components/TopAppBar';
import { COLORS, CURRENCY_SYMBOL, resolveAvatar } from '../../../constants/theme';
import { useDebtBalances, settleUpApi, analyticsKeys, useSendReminder } from '@workspace/api';
import { useRouteParams, settleUpParamsSchema } from '../../../hooks/useRouteParams';
import { SettleUpSkeleton } from '../components/SettleUpSkeleton';
import { useReminderCooldown } from '../../../hooks/useReminderCooldown';

interface SettleUpItemProps {
  userId: string;
  name: string;
  email: string;
  image: string | null;
  groupId: string;
  groupName: string;
  groupEmoji: string;
  balance: number;
  activeTab: 'owed' | 'owe';
  onSettlePress: (
    groupId: string,
    withUserId: string,
    withUserName: string,
    groupName: string,
    groupEmoji: string,
    balance: number,
    direction: 'owed' | 'owe'
  ) => void;
  isCooldown: boolean;
  onReminderSent: () => void;
}

function SettleUpItem({
  userId,
  name,
  email,
  image,
  groupId,
  groupName,
  groupEmoji,
  balance,
  activeTab,
  onSettlePress,
  isCooldown,
  onReminderSent,
}: SettleUpItemProps) {
  const sendReminder = useSendReminder(groupId);

  const handleRemindPress = () => {
    sendReminder.mutate(userId, {
      onSuccess: () => {
        Alert.alert(
          'Reminder Sent! 🔔',
          `We've sent a settle up reminder notification to ${name}.`
        );
        onReminderSent();
      },
      onError: (err) => {
        Alert.alert('Failed to send reminder', err.message || 'Something went wrong.');
        if (
          err.message?.includes('429') ||
          err.message?.toLowerCase().includes('cooldown') ||
          err.message?.toLowerCase().includes('one reminder per day')
        ) {
          onReminderSent(); // Set local cooldown if server rejects with rate limit/cooldown
        }
      },
    });
  };

  const displayBalance = Math.abs(balance);

  return (
    <View style={styles.userCard}>
      <View style={styles.userHeader}>
        <View style={styles.userInfo}>
          <Image source={{ uri: resolveAvatar(image) }} style={styles.avatarImage} />
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{name}</Text>
            <Text style={styles.userEmail}>{email}</Text>
            <View style={styles.groupMeta}>
              <Text style={styles.groupEmoji}>{groupEmoji}</Text>
              <Text style={styles.groupName} numberOfLines={1}>
                {groupName}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.userBalance}>
          <Text
            style={[
              styles.balanceText,
              { color: activeTab === 'owed' ? COLORS.primaryContainer : COLORS.error },
            ]}
          >
            {activeTab === 'owed' ? '+' : '-'}
            {CURRENCY_SYMBOL}
            {displayBalance.toFixed(2)}
          </Text>

          {activeTab === 'owed' ? (
            <TouchableOpacity
              style={[
                styles.inlineButton,
                styles.remindButton,
                isCooldown && styles.disabledButton,
              ]}
              onPress={handleRemindPress}
              disabled={sendReminder.isPending || isCooldown}
              activeOpacity={0.7}
            >
              {sendReminder.isPending ? (
                <ActivityIndicator size="small" color={COLORS.primary} style={{ marginRight: 3 }} />
              ) : (
                <Ionicons
                  name={isCooldown ? 'notifications' : 'notifications-outline'}
                  size={12}
                  color={isCooldown ? COLORS.outline : COLORS.primary}
                  style={{ marginRight: 3 }}
                />
              )}
              <Text
                style={[
                  styles.inlineButtonText,
                  { color: isCooldown ? COLORS.outline : COLORS.primary },
                ]}
              >
                {isCooldown ? 'Reminded' : 'Remind'}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.inlineButton, styles.settleButton]}
              onPress={() =>
                onSettlePress(groupId, userId, name, groupName, groupEmoji, balance, activeTab)
              }
              activeOpacity={0.8}
            >
              <Ionicons
                name="checkmark-circle-outline"
                size={12}
                color="#ffffff"
                style={{ marginRight: 3 }}
              />
              <Text style={[styles.inlineButtonText, { color: '#ffffff' }]}>Settle</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

export default function SettleUpScreen() {
  const router = useRouter();
  const searchParams = useRouteParams(settleUpParamsSchema);
  const queryClient = useQueryClient();

  // Tab filter state: 'owed' (Who owes you) | 'owe' (Who you owe)
  const defaultTab = searchParams.type || 'owed';
  const [activeTab, setActiveTab] = useState<'owed' | 'owe'>(defaultTab);

  const { cooldowns, triggerCooldown } = useReminderCooldown();

  // Fetch debts
  const { data: debts, isLoading } = useDebtBalances();

  // Settle Up modal state (matches group page flow)
  const [settleModalVisible, setSettleModalVisible] = useState(false);
  const [settleGroupId, setSettleGroupId] = useState<string | null>(null);
  const [settleUserId, setSettleUserId] = useState<string | null>(null);
  const [settleUserName, setSettleUserName] = useState('');
  const [settleGroupName, setSettleGroupName] = useState('');
  const [settleGroupEmoji, setSettleGroupEmoji] = useState('');
  const [settleBalance, setSettleBalance] = useState(0);
  const [settleAmount, setSettleAmount] = useState('');
  const [settleDirection, setSettleDirection] = useState<'owed' | 'owe'>('owed');

  // Settle Up Mutation
  const settleMutation = useMutation({
    mutationFn: settleUpApi,
    onSuccess: () => {
      setSettleModalVisible(false);
      setSettleAmount('');
      Alert.alert('Done! 🎉', 'Settlement recorded successfully.');
      // Invalidate queries to refresh values across screens
      queryClient.invalidateQueries({ queryKey: analyticsKeys.all });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
    },
    onError: (error: Error) => {
      Alert.alert('Error', error.message || 'Failed to settle balance. Please try again.');
    },
  });

  const handleSettlePress = (
    groupId: string,
    withUserId: string,
    withUserName: string,
    groupName: string,
    groupEmoji: string,
    balance: number,
    direction: 'owed' | 'owe'
  ) => {
    setSettleGroupId(groupId);
    setSettleUserId(withUserId);
    setSettleUserName(withUserName);
    setSettleGroupName(groupName);
    setSettleGroupEmoji(groupEmoji);
    setSettleBalance(Math.abs(balance));
    setSettleAmount(Math.abs(balance).toFixed(2));
    setSettleDirection(direction);
    setSettleModalVisible(true);
  };

  const submitSettleUp = () => {
    if (!settleGroupId || !settleUserId) return;
    const amount = parseFloat(settleAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a positive settlement amount.');
      return;
    }

    settleMutation.mutate({
      groupId: settleGroupId,
      withUserId: settleUserId,
      amount,
    });
  };

  // Flatten and filter debts per group
  const flattenedDebts = useMemo(() => {
    if (!debts) return [];
    const list: {
      userId: string;
      name: string;
      email: string;
      image: string | null;
      groupId: string;
      groupName: string;
      groupEmoji: string;
      balance: number;
    }[] = [];

    for (const user of debts) {
      for (const group of user.groups) {
        const isOwed = group.balance > 0;
        if (activeTab === 'owed' && isOwed) {
          list.push({
            userId: user.userId,
            name: user.name,
            email: user.email,
            image: user.image,
            groupId: group.groupId,
            groupName: group.name,
            groupEmoji: group.emoji,
            balance: group.balance,
          });
        } else if (activeTab === 'owe' && !isOwed) {
          list.push({
            userId: user.userId,
            name: user.name,
            email: user.email,
            image: user.image,
            groupId: group.groupId,
            groupName: group.name,
            groupEmoji: group.emoji,
            balance: group.balance,
          });
        }
      }
    }
    return list;
  }, [debts, activeTab]);

  const isConfirmDisabled =
    !settleAmount ||
    parseFloat(settleAmount) <= 0 ||
    parseFloat(settleAmount) > settleBalance + 0.005;

  const showSkeleton = isLoading || !debts;

  return (
    <View style={styles.container}>
      <TopAppBar title="Settle Up" showBack={true} onBack={() => router.back()} />

      {/* Segment Tab Selectors */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'owed' && styles.tabButtonActive]}
          onPress={() => setActiveTab('owed')}
          activeOpacity={0.8}
        >
          <Ionicons
            name="arrow-down"
            size={16}
            color={activeTab === 'owed' ? '#ffffff' : COLORS.onSurfaceVariant}
          />
          <Text style={[styles.tabButtonText, activeTab === 'owed' && styles.tabButtonTextActive]}>
            Who Owes You
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'owe' && styles.tabButtonActive]}
          onPress={() => setActiveTab('owe')}
          activeOpacity={0.8}
        >
          <Ionicons
            name="arrow-up"
            size={16}
            color={activeTab === 'owe' ? '#ffffff' : COLORS.onSurfaceVariant}
          />
          <Text style={[styles.tabButtonText, activeTab === 'owe' && styles.tabButtonTextActive]}>
            Who You Owe
          </Text>
        </TouchableOpacity>
      </View>

      {showSkeleton ? (
        <SettleUpSkeleton />
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {flattenedDebts.length === 0 && (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconBg}>
                <Ionicons name="sparkles" size={32} color={COLORS.primary} />
              </View>
              <Text style={styles.emptyTitle}>{"You're All Clear!"}</Text>
              <Text style={styles.emptySubtitle}>
                {activeTab === 'owed'
                  ? 'Excellent! No one currently owes you money.'
                  : 'Great! You have no outstanding bills to settle.'}
              </Text>
            </View>
          )}

          {flattenedDebts.map((item, index) => {
            const key = `${item.userId}-${item.groupId}`;
            const isCooldown = !!cooldowns[key];
            return (
              <SettleUpItem
                key={`${item.userId}-${item.groupId}-${index}`}
                userId={item.userId}
                name={item.name}
                email={item.email}
                image={item.image}
                groupId={item.groupId}
                groupName={item.groupName}
                groupEmoji={item.groupEmoji}
                balance={item.balance}
                activeTab={activeTab}
                onSettlePress={handleSettlePress}
                isCooldown={isCooldown}
                onReminderSent={() => triggerCooldown(item.userId, item.groupId)}
              />
            );
          })}
        </ScrollView>
      )}

      {/* ── Modal: Settle Up ── */}
      <Modal
        visible={settleModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSettleModalVisible(false)}
        statusBarTranslucent={true}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.modalContainer}
          >
            <View style={[styles.modalContent, { maxHeight: '90%' }]}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Settle Up</Text>
                <TouchableOpacity
                  onPress={() => setSettleModalVisible(false)}
                  style={styles.modalCloseBtn}
                >
                  <Ionicons name="close" size={22} color={COLORS.outline} />
                </TouchableOpacity>
              </View>

              <ScrollView
                style={{ flexShrink: 1 }}
                contentContainerStyle={styles.modalBody}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                {/* Group & User Context */}
                <View style={styles.modalContextRow}>
                  <View style={styles.modalContextIcon}>
                    <Text style={styles.modalContextEmoji}>{settleGroupEmoji}</Text>
                  </View>
                  <View style={styles.modalContextInfo}>
                    <Text style={styles.modalContextName}>{settleUserName}</Text>
                    <Text style={styles.modalContextGroup}>{settleGroupName}</Text>
                  </View>
                </View>

                <Text style={styles.modalSub}>
                  {settleDirection === 'owed'
                    ? `Record the amount ${settleUserName} paid you:`
                    : `Record the amount you paid ${settleUserName}:`}
                </Text>

                <View style={styles.amountInputContainer}>
                  <Text style={styles.amountCurrency}>{CURRENCY_SYMBOL}</Text>
                  <TextInput
                    style={styles.amountInput}
                    keyboardType="decimal-pad"
                    placeholder="0.00"
                    placeholderTextColor={COLORS.outline}
                    value={settleAmount}
                    onChangeText={(val) => {
                      if (/^\d*\.?\d{0,2}$/.test(val)) {
                        setSettleAmount(val);
                      }
                    }}
                    autoFocus={true}
                  />
                </View>

                <View style={styles.balanceInfoBlock}>
                  <Text style={styles.balanceInfoLabel}>
                    Total Balance: {CURRENCY_SYMBOL}
                    {settleBalance.toFixed(2)}
                  </Text>
                  {(() => {
                    const inputVal = parseFloat(settleAmount) || 0;
                    const remaining = Math.max(0, settleBalance - inputVal);
                    return (
                      <Text style={styles.balanceInfoRemaining}>
                        Remaining Balance: {CURRENCY_SYMBOL}
                        {remaining.toFixed(2)}
                      </Text>
                    );
                  })()}
                </View>

                <View style={styles.modalActionButtons}>
                  <TouchableOpacity
                    style={styles.modalCancelBtn}
                    onPress={() => setSettleModalVisible(false)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.modalCancelText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.modalConfirmBtn,
                      isConfirmDisabled && styles.confirmButtonDisabled,
                    ]}
                    disabled={isConfirmDisabled}
                    onPress={submitSettleUp}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.modalConfirmText}>
                      {settleMutation.isPending ? 'Saving...' : 'Confirm'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background || '#f8f9fa',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  tabButtonActive: {
    backgroundColor: COLORS.primary || '#006948',
  },
  tabButtonText: {
    fontSize: 12,
    color: COLORS.onSurfaceVariant || '#3d4a42',
    fontWeight: '600',
  },
  tabButtonTextActive: {
    color: '#ffffff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  emptyContainer: {
    paddingVertical: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIconBg: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.04)',
  },
  emptyTitle: {
    color: COLORS.onSurface || '#191c1d',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  emptySubtitle: {
    color: COLORS.onSurfaceVariant || '#3d4a42',
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  userCard: {
    backgroundColor: COLORS.surface || '#ffffff',
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    overflow: 'hidden',
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    color: COLORS.onSurface || '#191c1d',
    fontSize: 15,
    fontWeight: '700',
  },
  userEmail: {
    color: COLORS.onSurfaceVariant || '#3d4a42',
    fontSize: 12,
    marginTop: 2,
    marginBottom: 4,
  },
  userBalance: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 6,
  },
  balanceText: {
    fontSize: 16,
    fontWeight: '800',
  },
  groupMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    backgroundColor: 'rgba(0,0,0,0.03)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  groupEmoji: {
    fontSize: 12,
    marginRight: 4,
  },
  groupName: {
    color: COLORS.onSurface || '#191c1d',
    fontSize: 11,
    fontWeight: '600',
  },
  inlineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  remindButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: COLORS.primary || '#006948',
  },
  settleButton: {
    backgroundColor: COLORS.primary || '#006948',
  },
  inlineButtonText: {
    fontSize: 11,
    fontWeight: '700',
  },

  // ── Modal Styles ──
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 340,
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: 24,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  modalBody: {
    gap: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.onSurface,
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalContextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainer,
  },
  modalContextIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  modalContextEmoji: {
    fontSize: 18,
  },
  modalContextInfo: {
    flex: 1,
  },
  modalContextName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  modalContextGroup: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.outline,
    marginTop: 1,
  },
  modalSub: {
    fontSize: 13,
    color: COLORS.outline,
    lineHeight: 18,
    fontWeight: '500',
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: COLORS.surfaceContainer,
    paddingHorizontal: 16,
    height: 56,
  },
  amountCurrency: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.onSurface,
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.onSurface,
    padding: 0,
  },
  balanceInfoBlock: {
    alignItems: 'center',
  },
  balanceInfoLabel: {
    fontSize: 13,
    color: COLORS.outline,
    fontWeight: '600',
  },
  balanceInfoRemaining: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '700',
    marginTop: 4,
  },
  modalActionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
  },
  modalCancelText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.onSurfaceVariant,
  },
  modalConfirmBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
  },
  modalConfirmText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  confirmButtonDisabled: {
    backgroundColor: COLORS.outlineVariant,
  },
  disabledButton: {
    borderColor: COLORS.outlineVariant || '#e0e0e0',
  },
});
