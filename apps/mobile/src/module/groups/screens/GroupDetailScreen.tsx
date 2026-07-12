import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Modal,
  Pressable,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, CURRENCY_SYMBOL } from '../../../constants/theme';
import { globalStyles } from '../../../styles/globalStyles';
import { SplitSummaryCard } from '../../../components/SplitSummaryCard';
import { ExpenseItem } from '../../../components/ExpenseItem';
import { AddExpenseModal } from '../../../components/AddExpenseModal';
import { EditGroupModal } from '../../../components/EditGroupModal';
import { ErrorView } from '../../../components/ErrorView';
import { EmptyState } from '../../../components/EmptyState';
import { z } from 'zod';
import { useRouteParams } from '../../../hooks/useRouteParams';
import { useGroupDetailController } from '@workspace/api';
import { detailStyles as styles } from '../styles/group.styles';
import { SkeletonLoader } from '../../dashboard/components/SkeletonLoader';
import SettleUpModal from '../components/SettleUpModal';

const groupRouteSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  emoji: z.string().optional(),
});

export default function GroupDetailScreen() {
  const insets = useSafeAreaInsets();
  const { id, name: routeName, emoji: routeEmoji } = useRouteParams(groupRouteSchema);

  // Business logic hook
  const {
    user,
    group,
    expenses,
    settlements,
    myBalance,
    isAdmin,
    isFullySettled,
    isLoading,
    isError,
    refetch,
    isRefreshing,
    handleRefresh,
    activeTab,
    setActiveTab,
    addExpenseVisible,
    setAddExpenseVisible,
    editGroupVisible,
    setEditGroupVisible,
    menuVisible,
    setMenuVisible,
    settlingUserId,
    settleModalVisible,
    setSettleModalVisible,
    settleMember,
    settleAmount,
    setSettleAmount,
    handleSendReminder,
    handleSettleUp,
    submitSettleUp,
    executeLeaveGroup,
    executeDeactivateGroup,
    sendReminder,
    settleUp,
  } = useGroupDetailController({
    groupId: id,
    onSettleUpSuccess: () => {
      Alert.alert('Done! 🎉', 'Settlement recorded successfully.');
      refetch();
    },
    onSettleUpError: (err) => {
      Alert.alert('Error', err);
    },
    onLeaveGroupSuccess: () => {
      router.replace('/(tabs)/groups');
    },
    onLeaveGroupError: (err) => {
      Alert.alert('Error', err);
    },
    onDeactivateGroupSuccess: () => {
      Alert.alert('Success 🎉', 'Group deactivated successfully.');
      router.replace('/(tabs)/groups');
    },
    onDeactivateGroupError: (err) => {
      Alert.alert('Error', err);
    },
    onSendReminderSuccess: (name) => {
      Alert.alert('Reminder Sent! 🔔', `We've sent a settle up reminder notification to ${name}.`);
    },
    onSendReminderError: (err) => {
      Alert.alert('Failed to send reminder', err);
    },
  });

  const confirmLeaveGroup = () => {
    Alert.alert(
      'Leave Group',
      'Are you sure you want to leave this group? You will no longer see its expenses.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: executeLeaveGroup,
        },
      ]
    );
  };

  const confirmDeactivateGroup = () => {
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
          onPress: executeDeactivateGroup,
        },
      ]
    );
  };

  if (isError || (!group && !isLoading)) {
    return <ErrorView message="Failed to load group" onRetry={refetch} />;
  }

  return (
    <View style={styles.container}>
      {/* ── Header ── */}
      <View style={[styles.header, { paddingTop: insets.top, height: 56 + insets.top }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {group?.emoji ?? routeEmoji ?? '👥'} {group?.name ?? routeName ?? 'Group Detail'}
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
              {isLoading || !group
                ? 'Calculating balances...'
                : Math.abs(myBalance) < 0.01
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

          {isLoading || !group ? (
            <SkeletonLoader
              width={120}
              height={32}
              borderRadius={6}
              style={{ marginVertical: 4 }}
            />
          ) : (
            <Text style={[styles.balanceCardAmount, { color: '#ffffff' }]}>
              {Math.abs(myBalance) >= 0.01
                ? `${myBalance < 0 ? '-' : ''}${CURRENCY_SYMBOL}${Math.abs(myBalance).toFixed(2)}`
                : `${CURRENCY_SYMBOL}0.00`}
            </Text>
          )}

          <View style={styles.balanceCardDivider} />

          <View style={styles.balanceCardFooter}>
            <View style={styles.metaItem}>
              <Ionicons name="people" size={16} color="rgba(255,255,255,0.8)" />
              <Text style={[styles.balanceCardMeta, { color: 'rgba(255,255,255,0.9)' }]}>
                {isLoading || !group ? '... ' : `${group.memberCount} `}members
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="receipt" size={16} color="rgba(255,255,255,0.8)" />
              <Text style={[styles.balanceCardMeta, { color: 'rgba(255,255,255,0.9)' }]}>
                {isLoading || !group
                  ? '₹--.-- '
                  : `${CURRENCY_SYMBOL}${group.totalExpenses.toFixed(2)} `}
                spent
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
          {isLoading || !group ? (
            <View style={{ gap: 8 }}>
              <SkeletonLoader height={64} borderRadius={16} />
              <SkeletonLoader height={64} borderRadius={16} />
            </View>
          ) : (
            <SplitSummaryCard
              members={group.members}
              currentUserId={user?.id}
              onSettleUp={handleSettleUp}
              isSettling={settlingUserId}
              onSendReminder={handleSendReminder}
              isReminding={sendReminder.isPending ? sendReminder.variables : null}
            />
          )}
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

          {isLoading || !group ? (
            <View style={{ gap: 12, paddingVertical: 8 }}>
              <SkeletonLoader height={64} borderRadius={16} />
              <SkeletonLoader height={64} borderRadius={16} />
              <SkeletonLoader height={64} borderRadius={16} />
            </View>
          ) : activeTab === 'expenses' ? (
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
      {!isLoading && group && (
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
      )}

      <AddExpenseModal
        visible={addExpenseVisible}
        onClose={() => setAddExpenseVisible(false)}
        groupId={id}
        groupName={group?.name ?? routeName ?? 'Group'}
        onSuccess={() => {
          refetch();
        }}
      />

      {/* ── Modal: Settle Up ── */}
      <SettleUpModal
        visible={settleModalVisible}
        onClose={() => setSettleModalVisible(false)}
        settleMember={settleMember}
        settleAmount={settleAmount}
        setSettleAmount={setSettleAmount}
        onSubmit={submitSettleUp}
        isPending={settleUp.isPending}
      />

      {group && (
        <EditGroupModal
          visible={editGroupVisible}
          onClose={() => setEditGroupVisible(false)}
          group={group}
          onSuccess={() => {
            refetch();
          }}
        />
      )}

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
                    confirmDeactivateGroup();
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
                confirmLeaveGroup();
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
