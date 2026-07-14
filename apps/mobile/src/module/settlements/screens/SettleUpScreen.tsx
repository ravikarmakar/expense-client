import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { TopAppBar } from '../../../components/TopAppBar';
import { COLORS, CURRENCY_SYMBOL } from '../../../constants/theme';
import { useDebtBalances, settleUpApi, analyticsKeys } from '@workspace/api';
import { useRouteParams, settleUpParamsSchema } from '../../../hooks/useRouteParams';

export default function SettleUpScreen() {
  const router = useRouter();
  const searchParams = useRouteParams(settleUpParamsSchema);
  const queryClient = useQueryClient();

  // Tab filter state: 'owed' (Who owes you) | 'owe' (Who you owe)
  const defaultTab = searchParams.type || 'owed';
  const [activeTab, setActiveTab] = useState<'owed' | 'owe'>(defaultTab);

  // Track expanded users
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);

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

  // Filter debts depending on active filter
  const filteredDebts = useMemo(() => {
    if (!debts) return [];
    if (activeTab === 'owed') {
      return debts.filter((d) => d.netBalance > 0);
    }
    if (activeTab === 'owe') {
      return debts.filter((d) => d.netBalance < 0);
    }
    return [];
  }, [debts, activeTab]);

  const toggleExpandUser = (userId: string) => {
    setExpandedUserId((prev) => (prev === userId ? null : userId));
  };

  // Render initial fallback avatar helper
  const renderAvatar = (name: string) => {
    const initials = name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();

    const colors = [
      '#FF6B6B',
      '#4D96FF',
      '#6BCB77',
      '#FFD93D',
      '#B388FF',
      '#FF8A80',
      '#00E676',
      '#E040FB',
    ];
    let sum = 0;
    for (let i = 0; i < name.length; i++) {
      sum += name.charCodeAt(i);
    }
    const bgColor = colors[sum % colors.length] || COLORS.primary;

    return (
      <View style={[styles.avatarContainer, { backgroundColor: bgColor }]}>
        <Text style={styles.avatarText}>{initials}</Text>
      </View>
    );
  };

  const isConfirmDisabled =
    !settleAmount ||
    parseFloat(settleAmount) <= 0 ||
    parseFloat(settleAmount) > settleBalance + 0.005;

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

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Loading balances...</Text>
          </View>
        )}

        {!isLoading && filteredDebts.length === 0 && (
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

        {!isLoading &&
          filteredDebts.map((user) => {
            const isExpanded = expandedUserId === user.userId;
            const displayBalance = Math.abs(user.netBalance);

            return (
              <View key={user.userId} style={styles.userCard}>
                <TouchableOpacity
                  style={styles.userHeader}
                  activeOpacity={0.85}
                  onPress={() => toggleExpandUser(user.userId)}
                >
                  <View style={styles.userInfo}>
                    {renderAvatar(user.name)}
                    <View style={styles.userDetails}>
                      <Text style={styles.userName}>{user.name}</Text>
                      <Text style={styles.userEmail}>{user.email}</Text>
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
                    <Ionicons
                      name={isExpanded ? 'chevron-up' : 'chevron-down'}
                      size={18}
                      color={COLORS.onSurfaceVariant}
                      style={styles.expandIcon}
                    />
                  </View>
                </TouchableOpacity>

                {isExpanded && (
                  <View style={styles.groupBreakdown}>
                    <Text style={styles.breakdownTitle}>Settle per Group</Text>
                    {user.groups.map((group) => {
                      const isOwedInGroup = group.balance > 0;
                      const showSettle =
                        (activeTab === 'owed' && isOwedInGroup) ||
                        (activeTab === 'owe' && !isOwedInGroup);

                      return (
                        <View key={group.groupId} style={styles.groupRow}>
                          <View style={styles.groupMeta}>
                            <Text style={styles.groupEmoji}>{group.emoji}</Text>
                            <Text style={styles.groupName} numberOfLines={1}>
                              {group.name}
                            </Text>
                          </View>

                          <View style={styles.groupActionWrapper}>
                            <Text
                              style={[
                                styles.groupBalanceText,
                                {
                                  color: group.balance > 0 ? COLORS.primaryContainer : COLORS.error,
                                },
                              ]}
                            >
                              {group.balance > 0 ? '+' : ''}
                              {CURRENCY_SYMBOL}
                              {group.balance.toFixed(2)}
                            </Text>

                            {showSettle && (
                              <TouchableOpacity
                                style={styles.settleButton}
                                onPress={() =>
                                  handleSettlePress(
                                    group.groupId,
                                    user.userId,
                                    user.name,
                                    group.name,
                                    group.emoji,
                                    group.balance,
                                    activeTab
                                  )
                                }
                                activeOpacity={0.8}
                              >
                                <Text style={styles.settleButtonText}>Settle</Text>
                              </TouchableOpacity>
                            )}
                          </View>
                        </View>
                      );
                    })}
                  </View>
                )}
              </View>
            );
          })}
      </ScrollView>

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
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalContainer}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Settle Up</Text>
                <TouchableOpacity
                  onPress={() => setSettleModalVisible(false)}
                  style={styles.modalCloseBtn}
                >
                  <Ionicons name="close" size={22} color={COLORS.outline} />
                </TouchableOpacity>
              </View>

              <View style={styles.modalBody}>
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
              </View>
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
  loadingContainer: {
    paddingVertical: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: COLORS.onSurfaceVariant || '#3d4a42',
    marginTop: 12,
    fontSize: 14,
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
  },
  userBalance: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  balanceText: {
    fontSize: 16,
    fontWeight: '800',
  },
  expandIcon: {
    marginLeft: 4,
  },
  groupBreakdown: {
    backgroundColor: 'rgba(0, 0, 0, 0.015)',
    borderTopWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.03)',
    padding: 16,
  },
  breakdownTitle: {
    color: COLORS.onSurfaceVariant || '#3d4a42',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  groupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.03)',
  },
  groupMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  groupEmoji: {
    fontSize: 16,
    marginRight: 8,
  },
  groupName: {
    color: COLORS.onSurface || '#191c1d',
    fontSize: 14,
    fontWeight: '600',
  },
  groupActionWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  groupBalanceText: {
    fontSize: 14,
    fontWeight: '700',
  },
  settleButton: {
    backgroundColor: COLORS.primary || '#006948',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    minWidth: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settleButtonText: {
    color: '#ffffff',
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
});
