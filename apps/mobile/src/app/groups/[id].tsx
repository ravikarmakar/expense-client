import React, { useState } from 'react';

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, CURRENCY_SYMBOL } from '../../constants/theme';
import { globalStyles } from '../../styles/globalStyles';
import { SplitSummaryCard } from '../../components/SplitSummaryCard';
import { ExpenseItem } from '../../components/ExpenseItem';
import { AddExpenseModal } from '../../components/AddExpenseModal';
import { EditGroupModal } from '../../components/EditGroupModal';

import {
  useGroupDetail,
  useSettleUp,
  useLeaveGroup,
  useMe,
  getErrorMessage,
  type GroupMember,
} from '@workspace/api';

export default function GroupDetailScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: user } = useMe();
  const { data: detailData, isLoading, isError, refetch } = useGroupDetail(id);

  const settleUp = useSettleUp(id);
  const leaveGroup = useLeaveGroup();

  const [activeTab, setActiveTab] = useState<'expenses' | 'settlements'>('expenses');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [addExpenseVisible, setAddExpenseVisible] = useState(false);
  const [editGroupVisible, setEditGroupVisible] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [settlingUserId, setSettlingUserId] = useState<string | null>(null);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  const handleSettleUp = (member: GroupMember) => {
    if (!member.balance) return;

    const amount = Math.abs(member.balance);
    const isPositive = member.balance >= 0;
    const message = isPositive
      ? `Record that ${member.name} paid you ${CURRENCY_SYMBOL}${amount.toFixed(2)}?`
      : `Record that you paid ${member.name} ${CURRENCY_SYMBOL}${amount.toFixed(2)}?`;

    Alert.alert('Settle Up', message, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Confirm',
        style: 'default',
        onPress: () => {
          setSettlingUserId(member.userId);
          settleUp.mutate(
            { withUserId: member.userId, amount },
            {
              onSuccess: () => {
                setSettlingUserId(null);
                Alert.alert('Done! 🎉', 'Settlement recorded successfully.');
              },
              onError: (err) => {
                setSettlingUserId(null);
                Alert.alert('Error', getErrorMessage(err));
              },
            }
          );
        },
      },
    ]);
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

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.secondary} />
      </View>
    );
  }

  if (isError || !detailData?.group) {
    return (
      <View style={styles.centered}>
        <Ionicons name="alert-circle-outline" size={48} color={COLORS.error} />
        <Text style={styles.errorText}>Failed to load group</Text>
        <TouchableOpacity onPress={() => refetch()} style={styles.retryBtn}>
          <Text style={styles.retryBtnText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const group = detailData.group;
  const expenses = detailData.expenses;
  const settlements = detailData.settlements;
  const myBalance = group.myBalance ?? 0;
  const isAdmin = group.members.find((m) => m.userId === user?.id)?.role === 'admin';

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
          onPress={() => router.push(`/groups/${id}/wallet`)}
          style={styles.walletBtn}
        >
          <Ionicons name="wallet-outline" size={22} color={COLORS.onSurface} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setMenuVisible(true)} style={styles.moreBtn}>
          <Ionicons name="ellipsis-vertical" size={24} color={COLORS.onSurface} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={globalStyles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
      >
        {/* ── Balance Card ── */}
        <View
          style={[
            styles.balanceCard,
            myBalance >= -0.01 ? styles.balanceCardPositive : styles.balanceCardNegative,
          ]}
        >
          <View style={styles.balanceCardCircle} />
          <Text style={styles.balanceCardLabel}>
            {Math.abs(myBalance) < 0.01
              ? "You're all settled up!"
              : myBalance > 0
                ? 'You are owed'
                : 'You owe'}
          </Text>
          {Math.abs(myBalance) >= 0.01 && (
            <Text style={styles.balanceCardAmount}>
              {CURRENCY_SYMBOL}
              {Math.abs(myBalance).toFixed(2)}
            </Text>
          )}
          <View style={styles.balanceCardRow}>
            <Ionicons name="people" size={14} color="rgba(255,255,255,0.8)" />
            <Text style={styles.balanceCardMeta}>
              {group.memberCount} members · {CURRENCY_SYMBOL}
              {group.totalExpenses.toFixed(2)} total
            </Text>
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
              <View style={styles.emptyExpenses}>
                <Ionicons name="receipt-outline" size={40} color={COLORS.outlineVariant} />
                <Text style={styles.emptyExpensesText}>No expenses yet</Text>
                <Text style={styles.emptyExpensesSubText}>
                  Add the first expense to start splitting!
                </Text>
              </View>
            ) : (
              <View style={styles.expensesList}>
                {expenses.map((expense) => (
                  <ExpenseItem key={expense.id} expense={expense} currentUserId={user?.id} />
                ))}
              </View>
            )
          ) : settlements.length === 0 ? (
            <View style={styles.emptyExpenses}>
              <Ionicons name="checkmark-circle-outline" size={40} color={COLORS.outlineVariant} />
              <Text style={styles.emptyExpensesText}>No settlements yet</Text>
              <Text style={styles.emptyExpensesSubText}>
                Payments between members will show up here.
              </Text>
            </View>
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
        style={[styles.fab, group.memberCount <= 1 && styles.fabDisabled]}
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
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: COLORS.background,
  },
  errorText: {
    fontSize: 15,
    color: COLORS.error,
    fontWeight: '600',
  },
  retryBtn: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
  },
  retryBtnText: {
    color: '#fff',
    fontWeight: '700',
  },
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceContainer,
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
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    overflow: 'hidden',
    position: 'relative',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  balanceCardPositive: {
    backgroundColor: COLORS.primary,
  },
  balanceCardNegative: {
    backgroundColor: COLORS.error,
  },
  balanceCardCircle: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.08)',
    top: -60,
    right: -40,
  },
  balanceCardLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.8)',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  balanceCardAmount: {
    fontSize: 36,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
    letterSpacing: -1,
  },
  balanceCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  balanceCardMeta: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  // Add member button
  addMemberBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.secondaryFixed,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
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
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabActiveButton: {
    backgroundColor: COLORS.surface,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.outline,
  },
  tabActiveButtonText: {
    color: COLORS.onSurface,
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
  emptyExpenses: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 8,
  },
  emptyExpensesText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.onSurfaceVariant,
  },
  emptyExpensesSubText: {
    fontSize: 13,
    color: COLORS.outline,
    textAlign: 'center',
    fontWeight: '500',
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
});
