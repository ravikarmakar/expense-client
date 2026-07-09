import React, { useState } from 'react';

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Modal,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, CURRENCY_SYMBOL } from '../../constants/theme';
import { globalStyles } from '../../styles/globalStyles';
import { SplitSummaryCard } from '../../components/SplitSummaryCard';
import { ExpenseItem } from '../../components/ExpenseItem';
import { AddExpenseModal } from '../../components/AddExpenseModal';
import { EditGroupModal } from '../../components/EditGroupModal';
import { LoadingView } from '../../components/LoadingView';
import { ErrorView } from '../../components/ErrorView';
import { EmptyState } from '../../components/EmptyState';
import { useRouteParams, idParamSchema } from '../../hooks/useRouteParams';

import {
  useGroupDetail,
  useSettleUp,
  useLeaveGroup,
  useDeactivateGroup,
  useMe,
  getErrorMessage,
  useSendReminder,
  type GroupMember,
} from '@workspace/api';

export default function GroupDetailScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useRouteParams(idParamSchema);
  const { data: user } = useMe();
  const { data: detailData, isLoading, isError, refetch } = useGroupDetail(id);

  const settleUp = useSettleUp(id);
  const leaveGroup = useLeaveGroup();
  const deactivateGroup = useDeactivateGroup();
  const sendReminder = useSendReminder(id);

  const handleSendReminder = (member: GroupMember) => {
    sendReminder.mutate(member.userId, {
      onSuccess: () => {
        Alert.alert(
          'Reminder Sent! 🔔',
          `We've sent a settle up reminder notification to ${member.name}.`
        );
      },
      onError: (err) => {
        Alert.alert('Failed to send reminder', getErrorMessage(err, 'Please try again.'));
      },
    });
  };

  const [activeTab, setActiveTab] = useState<'expenses' | 'settlements'>('expenses');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [addExpenseVisible, setAddExpenseVisible] = useState(false);
  const [editGroupVisible, setEditGroupVisible] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [settlingUserId, setSettlingUserId] = useState<string | null>(null);

  // Settle Up custom amount input state
  const [settleModalVisible, setSettleModalVisible] = useState(false);
  const [settleMember, setSettleMember] = useState<GroupMember | null>(null);
  const [settleAmount, setSettleAmount] = useState('');

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  const handleSettleUp = (member: GroupMember) => {
    if (!member.balance) return;
    setSettleMember(member);
    setSettleAmount(Math.abs(member.balance).toFixed(2));
    setSettleModalVisible(true);
  };

  const submitSettleUp = () => {
    if (!settleMember) return;
    const amount = parseFloat(settleAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a positive settlement amount.');
      return;
    }

    setSettleModalVisible(false);
    setSettlingUserId(settleMember.userId);
    settleUp.mutate(
      { withUserId: settleMember.userId, amount },
      {
        onSuccess: () => {
          setSettlingUserId(null);
          setSettleAmount('');
          setSettleMember(null);
          Alert.alert('Done! 🎉', 'Settlement recorded successfully.');
        },
        onError: (err) => {
          setSettlingUserId(null);
          Alert.alert('Error', getErrorMessage(err));
        },
      }
    );
  };

  const handleLeaveGroup = () => {
    Alert.alert(
      'Leave Group',
      'Are you sure you want to leave this group? You will no longer see its expenses.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: () => {
            leaveGroup.mutate(id, {
              onSuccess: () => router.replace('/(tabs)/groups'),
              onError: (err) => Alert.alert('Error', getErrorMessage(err, 'Failed to leave group')),
            });
          },
        },
      ]
    );
  };

  const handleDeactivateGroup = () => {
    if (!isFullySettled) {
      Alert.alert(
        'Cannot Deactivate Group',
        'All member balances must be fully settled (₹0.00) before deactivating the group.',
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      'Deactivate Group',
      'Are you sure you want to deactivate this group? This will hide the group and prevent new expenses, but keep records intact.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Deactivate',
          style: 'destructive',
          onPress: () => {
            deactivateGroup.mutate(id, {
              onSuccess: () => {
                Alert.alert('Success 🎉', 'Group deactivated successfully.');
                router.replace('/(tabs)/groups');
              },
              onError: (err) => {
                Alert.alert('Error', getErrorMessage(err, 'Failed to deactivate group.'));
              },
            });
          },
        },
      ]
    );
  };

  if (isLoading) {
    return <LoadingView />;
  }

  if (isError || !detailData?.group) {
    return <ErrorView message="Failed to load group" onRetry={refetch} />;
  }

  const group = detailData.group;
  const expenses = detailData.expenses;
  const settlements = detailData.settlements;
  const myBalance = group.myBalance ?? 0;
  const isAdmin = group.members.find((m) => m.userId === user?.id)?.role === 'admin';
  const isFullySettled = group.members.every((m) => Math.abs(m.balance ?? 0) < 0.01);

  return (
    <View style={styles.container}>
      {/* ── Header ── */}
      <View style={[styles.header, { paddingTop: insets.top, height: 56 + insets.top }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {group.emoji ?? '👥'} {group.name}
        </Text>
        <TouchableOpacity
          onPress={() => router.push(`/groups/${id}/analytics`)}
          style={styles.walletBtn}
        >
          <Ionicons name="bar-chart" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.push(`/groups/${id}/wallet`)}
          style={styles.walletBtn}
        >
          <Ionicons name="wallet" size={28} color={COLORS.primary} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setMenuVisible(true)} style={styles.moreBtn}>
          <Ionicons name="ellipsis-vertical" size={25} color={COLORS.onSurface} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[globalStyles.scrollContent, { paddingBottom: 100 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
      >
        {/* ── Balance Card ── */}
        <View
          style={[
            styles.balanceCard,
            {
              backgroundColor: COLORS.primary,
            },
          ]}
        >
          <View style={[styles.abstractCircle, styles.circleTopRight]} />
          <View style={[styles.abstractCircle, styles.circleBottomLeft]} />

          <View style={styles.balanceHeader}>
            <Text style={[styles.balanceCardLabel, { color: 'rgba(255,255,255,0.8)' }]}>
              {Math.abs(myBalance) < 0.01
                ? "You're all settled up!"
                : myBalance > 0
                  ? 'You are owed'
                  : 'You owe'}
            </Text>
            <View
              style={[
                styles.statusDot,
                {
                  backgroundColor: '#ffffff',
                },
              ]}
            />
          </View>

          <Text style={[styles.balanceCardAmount, { color: '#ffffff' }]}>
            {Math.abs(myBalance) >= 0.01
              ? `${myBalance < 0 ? '-' : ''}${CURRENCY_SYMBOL}${Math.abs(myBalance).toFixed(2)}`
              : `${CURRENCY_SYMBOL}0.00`}
          </Text>

          <View style={styles.balanceCardDivider} />

          <View style={styles.balanceCardFooter}>
            <View style={styles.metaItem}>
              <Ionicons name="people" size={16} color="rgba(255,255,255,0.8)" />
              <Text style={[styles.balanceCardMeta, { color: 'rgba(255,255,255,0.9)' }]}>
                {group.memberCount} members
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="receipt" size={16} color="rgba(255,255,255,0.8)" />
              <Text style={[styles.balanceCardMeta, { color: 'rgba(255,255,255,0.9)' }]}>
                {CURRENCY_SYMBOL}
                {group.totalExpenses.toFixed(2)} spent
              </Text>
            </View>
          </View>
        </View>

        {/* ── Member Balances ── */}
        <View style={globalStyles.sectionContainer}>
          <View style={globalStyles.sectionHeaderRow}>
            <Text style={globalStyles.sectionTitle}>Balances</Text>
            {isAdmin && (
              <TouchableOpacity
                onPress={() => router.push(`/groups/${id}/add-member`)}
                activeOpacity={0.7}
              >
                <View style={styles.addMemberBtn}>
                  <Ionicons name="person-add" size={14} color={COLORS.secondary} />
                  <Text style={styles.addMemberBtnText}>Add</Text>
                </View>
              </TouchableOpacity>
            )}
          </View>
          <SplitSummaryCard
            members={group.members}
            currentUserId={user?.id}
            onSettleUp={handleSettleUp}
            isSettling={settlingUserId}
            onSendReminder={handleSendReminder}
            isReminding={sendReminder.isPending ? sendReminder.variables : null}
          />
        </View>

        {/* ── Tabs Selector & History List ── */}
        <View style={[globalStyles.sectionContainer, styles.historySection]}>
          <View style={styles.tabsContainer}>
            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'expenses' && styles.tabActiveButton]}
              onPress={() => setActiveTab('expenses')}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.tabButtonText,
                  activeTab === 'expenses' && styles.tabActiveButtonText,
                ]}
              >
                Expenses
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'settlements' && styles.tabActiveButton]}
              onPress={() => setActiveTab('settlements')}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.tabButtonText,
                  activeTab === 'settlements' && styles.tabActiveButtonText,
                ]}
              >
                Settlements
              </Text>
            </TouchableOpacity>
          </View>

          {activeTab === 'expenses' ? (
            expenses.length === 0 ? (
              <EmptyState
                icon="receipt-outline"
                title="No expenses yet"
                description="Add the first expense to start splitting!"
              />
            ) : (
              <View style={styles.expensesList}>
                {expenses.map((expense) => (
                  <ExpenseItem key={expense.id} expense={expense} currentUserId={user?.id} />
                ))}
              </View>
            )
          ) : settlements.length === 0 ? (
            <EmptyState
              icon="checkmark-circle-outline"
              title="No settlements yet"
              description="Payments between members will show up here."
            />
          ) : (
            <View style={styles.settlementsList}>
              {settlements.map((s) => {
                const isFromMe = s.fromId === user?.id;
                const isToMe = s.toId === user?.id;
                const dateStr = new Date(s.createdAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                });
                return (
                  <View key={s.id} style={styles.settlementItem}>
                    <View style={styles.settlementIconBg}>
                      <Ionicons name="swap-horizontal" size={20} color={COLORS.primary} />
                    </View>
                    <View style={styles.settlementInfo}>
                      <Text style={styles.settlementText}>
                        <Text style={styles.boldText}>{isFromMe ? 'You' : s.from.name}</Text> paid{' '}
                        <Text style={styles.boldText}>{isToMe ? 'you' : s.to.name}</Text>
                      </Text>
                      <Text style={styles.settlementDate}>{dateStr}</Text>
                    </View>
                    <Text style={styles.settlementAmount}>
                      {CURRENCY_SYMBOL}
                      {s.amount.toFixed(2)}
                    </Text>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>

      {/* ── FAB: Add Expense ── */}
      <TouchableOpacity
        style={[
          styles.fab,
          { bottom: 24 + insets.bottom },
          group.memberCount <= 1 && styles.fabDisabled,
        ]}
        activeOpacity={0.85}
        onPress={() => {
          if (group.memberCount <= 1) {
            Alert.alert(
              'Add Member First',
              'You need at least one other member in the group to add split expenses. Please add a member to the group first.',
              [
                {
                  text: 'Add Member',
                  onPress: () => router.push(`/groups/${id}/add-member`),
                },
                { text: 'Cancel', style: 'cancel' },
              ]
            );
          } else {
            setAddExpenseVisible(true);
          }
        }}
      >
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>

      <AddExpenseModal
        visible={addExpenseVisible}
        onClose={() => setAddExpenseVisible(false)}
        groupId={id}
        groupName={group.name}
        onSuccess={() => {
          refetch();
        }}
      />

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

              {settleMember && (
                <View style={styles.modalBody}>
                  <Text style={styles.modalSub}>
                    {settleMember.balance >= 0
                      ? `Record the amount ${settleMember.name} paid you:`
                      : `Record the amount you paid ${settleMember.name}:`}
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

                  <View style={{ marginBottom: 20, alignItems: 'center' }}>
                    <Text style={{ fontSize: 13, color: COLORS.outline, fontWeight: '600' }}>
                      Total Balance: {CURRENCY_SYMBOL}
                      {Math.abs(settleMember.balance).toFixed(2)}
                    </Text>
                    {(() => {
                      const inputVal = parseFloat(settleAmount) || 0;
                      const originalVal = Math.abs(settleMember.balance);
                      const remaining = Math.max(0, originalVal - inputVal);
                      return (
                        <Text
                          style={{
                            fontSize: 14,
                            color: COLORS.primary,
                            fontWeight: '700',
                            marginTop: 4,
                          }}
                        >
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
                        (!settleAmount ||
                          parseFloat(settleAmount) <= 0 ||
                          parseFloat(settleAmount) > Math.abs(settleMember.balance) + 0.005) &&
                          styles.confirmButtonDisabled,
                      ]}
                      disabled={
                        !settleAmount ||
                        parseFloat(settleAmount) <= 0 ||
                        parseFloat(settleAmount) > Math.abs(settleMember.balance) + 0.005
                      }
                      onPress={submitSettleUp}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.modalConfirmText}>
                        {settleUp.isPending ? 'Saving...' : 'Confirm'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      <EditGroupModal
        visible={editGroupVisible}
        onClose={() => setEditGroupVisible(false)}
        group={group}
        onSuccess={() => {
          refetch();
        }}
      />

      {/* ── Overflow Menu Modal ── */}
      <Modal
        visible={menuVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable style={styles.menuOverlay} onPress={() => setMenuVisible(false)}>
          <View style={[styles.menuContainer, { top: insets.top + 50 }]}>
            {isAdmin && (
              <>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => {
                    setMenuVisible(false);
                    setEditGroupVisible(true);
                  }}
                >
                  <Ionicons name="pencil-outline" size={20} color={COLORS.onSurface} />
                  <Text style={styles.menuItemText}>Edit Group</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.menuItem, styles.menuItemBorder]}
                  onPress={() => {
                    setMenuVisible(false);
                    handleDeactivateGroup();
                  }}
                >
                  <Ionicons
                    name="power-outline"
                    size={20}
                    color={isFullySettled ? COLORS.error : COLORS.outline}
                  />
                  <Text
                    style={[
                      styles.menuItemText,
                      { color: isFullySettled ? COLORS.error : COLORS.outline },
                    ]}
                  >
                    Deactivate Group
                  </Text>
                </TouchableOpacity>
              </>
            )}
            <TouchableOpacity
              style={[styles.menuItem, isAdmin && styles.menuItemBorder]}
              onPress={() => {
                setMenuVisible(false);
                handleLeaveGroup();
              }}
            >
              <Ionicons name="log-out-outline" size={20} color={COLORS.error} />
              <Text style={[styles.menuItemText, { color: COLORS.error }]}>Leave Group</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f1f1',
  },
  backBtn: {
    padding: 4,
    marginRight: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  editBtn: {
    padding: 4,
    marginRight: 12,
  },
  walletBtn: {
    padding: 4,
    marginRight: 8,
  },
  moreBtn: {
    padding: 4,
  },
  // Balance card
  balanceCard: {
    backgroundColor: '#1E1E24', // Premium sleek dark card background
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    overflow: 'hidden',
    position: 'relative',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  abstractCircle: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.12)', // Subtle translucent white highlight
  },
  circleTopRight: {
    width: 140,
    height: 140,
    top: -50,
    right: -40,
  },
  circleBottomLeft: {
    width: 100,
    height: 100,
    bottom: -35,
    left: -30,
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  balanceCardLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.6)',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  balanceCardAmount: {
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 16,
  },
  balanceCardDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginBottom: 16,
  },
  balanceCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  balanceCardMeta: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '600',
  },
  // Add member button
  addMemberBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.secondaryFixed,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#c7c3ff',
  },
  addMemberBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  // History
  historySection: {
    paddingBottom: 80,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceContainer,
    borderRadius: 16,
    padding: 4,
    marginBottom: 20,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
  },
  tabActiveButton: {
    backgroundColor: COLORS.primaryFixed,
    elevation: 1,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.outline,
  },
  tabActiveButtonText: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  settlementsList: {
    gap: 10,
  },
  settlementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainer,
  },
  settlementIconBg: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.primaryFixed,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settlementInfo: {
    flex: 1,
  },
  settlementText: {
    fontSize: 14,
    color: COLORS.onSurface,
  },
  boldText: {
    fontWeight: '700',
  },
  settlementDate: {
    fontSize: 12,
    color: COLORS.outline,
    marginTop: 2,
  },
  settlementAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
  },
  expensesList: {
    gap: 10,
  },
  // FAB
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    zIndex: 40,
  },
  fabDisabled: {
    backgroundColor: COLORS.outlineVariant,
    shadowColor: COLORS.outlineVariant,
  },
  // Overflow Menu
  menuOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  menuContainer: {
    position: 'absolute',
    right: 16,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    minWidth: 160,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainer,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  menuItemBorder: {
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceContainer,
  },
  menuItemText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.onSurface,
  },

  // Settle Up Modal Styles
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
  modalSub: {
    fontSize: 13,
    color: COLORS.outline,
    lineHeight: 18,
    marginBottom: 20,
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
    marginBottom: 24,
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
