import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  RefreshControl,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, CURRENCY_SYMBOL } from '../../../constants/theme';
import {
  useWallet,
  useSetupWallet,
  useContribute,
  useGroup,
  useMe,
  useUpdateWalletManager,
  useUpdateWalletTarget,
  type WalletContribution,
  type WalletTransaction,
} from '@workspace/api';
import { LoadingView } from '../../../components/LoadingView';
import { ErrorView } from '../../../components/ErrorView';
import { EmptyState } from '../../../components/EmptyState';

export default function WalletScreen() {
  const insets = useSafeAreaInsets();
  const { id: groupId } = useLocalSearchParams<{ id: string }>();
  const { data: user } = useMe();
  const { data: group } = useGroup(groupId);
  const { data: wallet, isLoading, isError, error, refetch } = useWallet(groupId);
  const setupWallet = useSetupWallet(groupId);
  const contribute = useContribute(groupId);

  const [contributeAmount, setContributeAmount] = useState('');
  const [showContributeInput, setShowContributeInput] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Settings Modal State
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [newTarget, setNewTarget] = useState('');
  const [newManagerId, setNewManagerId] = useState('');
  const updateManager = useUpdateWalletManager(groupId);
  const updateTarget = useUpdateWalletTarget(groupId);

  const isOwner = group?.createdBy === user?.id;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  const handleContribute = () => {
    const amount = parseFloat(contributeAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Invalid amount', 'Please enter a valid amount.');
      return;
    }

    contribute.mutate(
      { amount },
      {
        onSuccess: () => {
          setShowContributeInput(false);
          setContributeAmount('');
          refetch();
          Alert.alert(
            'Success! 🎉',
            `Contributed ${CURRENCY_SYMBOL}${amount.toFixed(2)} to the wallet.`
          );
        },
        onError: (err) => {
          const apiErr = err as { response?: { data?: { error?: string } } };
          const errorMsg = apiErr.response?.data?.error || 'Failed to record contribution.';
          Alert.alert('Error', errorMsg);
        },
      }
    );
  };

  const handleSaveSettings = () => {
    const parsedTarget = parseFloat(newTarget);
    if (
      !isNaN(parsedTarget) &&
      parsedTarget > 0 &&
      wallet &&
      parsedTarget !== wallet.targetContribution
    ) {
      updateTarget.mutate({ targetContribution: parsedTarget }, { onSuccess: () => refetch() });
    }

    if (newManagerId && wallet && newManagerId !== wallet.walletManagerId) {
      updateManager.mutate({ walletManagerId: newManagerId }, { onSuccess: () => refetch() });
    }

    setSettingsVisible(false);
  };

  const openSettings = () => {
    if (!wallet) return;
    setNewTarget(wallet.targetContribution.toString());
    setNewManagerId(wallet.walletManagerId);
    setSettingsVisible(true);
  };

  // ── Loading ──
  if (isLoading) {
    return <LoadingView />;
  }

  // ── Error ──
  if (isError) {
    const errorMsg =
      (error as { response?: { data?: { error?: string } } })?.response?.data?.error ||
      (error as Error)?.message ||
      'Failed to load wallet';
    return (
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top, height: 56 + insets.top }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={COLORS.onSurface} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Group Wallet</Text>
        </View>
        <ErrorView message={errorMsg} onRetry={refetch} />
      </View>
    );
  }

  // ── No Wallet — Setup ──
  if (!wallet) {
    return (
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top, height: 56 + insets.top }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={COLORS.onSurface} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Group Wallet</Text>
        </View>
        <EmptyState
          icon="wallet-outline"
          title="No Group Wallet"
          description="Set up a shared fund to collect contributions and pay group expenses directly."
          ctaText={isOwner ? 'Set Up Wallet' : undefined}
          ctaIcon="add-circle-outline"
          ctaColor={COLORS.secondary}
          onCtaPress={
            isOwner
              ? () => {
                  setupWallet.mutate(
                    {
                      walletManagerId: user!.id,
                      targetContribution: 500,
                    },
                    {
                      onSuccess: () => refetch(),
                      onError: (err: unknown) => {
                        const apiErr = err as { response?: { data?: { error?: string } } };
                        const errorMsg =
                          apiErr.response?.data?.error ||
                          (err as Error).message ||
                          'Failed to setup wallet';
                        Alert.alert('Error', errorMsg);
                      },
                    }
                  );
                }
              : undefined
          }
        />
      </View>
    );
  }

  // ── Wallet exists — full view ──
  const groupMembers = (group?.members ?? []).filter((m) => m.role !== 'invited');
  const myContribution = wallet.contributions.find(
    (c: WalletContribution) => c.userId === user?.id
  );
  const myPaid = myContribution?.amount ?? 0;
  const myPending = Math.max(0, wallet.targetContribution - myPaid);

  const sortedMembers = [...groupMembers].sort((a, b) => {
    if (a.userId === wallet.walletManagerId) return -1;
    if (b.userId === wallet.walletManagerId) return 1;
    if (a.userId === user?.id) return -1;
    if (b.userId === user?.id) return 1;
    return 0;
  });

  return (
    <View style={styles.container}>
      {/* ── Header ── */}
      <View style={[styles.header, { paddingTop: insets.top, height: 56 + insets.top }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Group Wallet</Text>
        {isOwner && (
          <TouchableOpacity onPress={openSettings} style={styles.settingsBtn}>
            <Ionicons name="settings-outline" size={22} color={COLORS.onSurface} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
      >
        {/* ── Balance Card ── */}
        <View style={styles.balanceCard}>
          <View style={[styles.abstractCircle, styles.circleTopRight]} />
          <View style={[styles.abstractCircle, styles.circleBottomLeft]} />
          <Text style={styles.balanceLabel}>WALLET BALANCE</Text>
          <Text style={styles.balanceAmount}>
            {CURRENCY_SYMBOL}
            {wallet.balance.toFixed(2)}
          </Text>
          <View style={styles.balanceRow}>
            <Ionicons name="person" size={14} color="rgba(255,255,255,0.8)" />
            <Text style={styles.balanceMeta}>Managed by {wallet.manager?.name || 'Unknown'}</Text>
          </View>
        </View>

        {/* ── Your Contribution Quick Action ── */}
        <View style={styles.yourContribCard}>
          <View style={styles.yourContribInfo}>
            <Text style={styles.yourContribLabel}>Your Contribution</Text>
            <Text style={styles.yourContribAmount}>
              {CURRENCY_SYMBOL}
              {myPaid.toFixed(2)}{' '}
              <Text style={styles.yourContribTarget}>
                / {CURRENCY_SYMBOL}
                {wallet.targetContribution.toFixed(2)}
              </Text>
            </Text>
            {myPending > 0 && (
              <Text style={styles.yourContribPending}>
                Remaining: {CURRENCY_SYMBOL}
                {myPending.toFixed(2)}
              </Text>
            )}
          </View>

          {myPending > 0 ? (
            showContributeInput ? (
              <View style={styles.contributeInputRow}>
                <TextInput
                  style={styles.contributeInput}
                  value={contributeAmount}
                  onChangeText={setContributeAmount}
                  keyboardType="decimal-pad"
                  placeholder="0.00"
                  placeholderTextColor={COLORS.outlineVariant}
                  autoFocus
                />
                <TouchableOpacity
                  onPress={handleContribute}
                  style={styles.contributeConfirmBtn}
                  disabled={contribute.isPending}
                >
                  {contribute.isPending ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Ionicons name="checkmark" size={18} color="#fff" />
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setShowContributeInput(false);
                    setContributeAmount('');
                  }}
                  style={styles.contributeCancelBtn}
                >
                  <Ionicons name="close" size={18} color={COLORS.outline} />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                onPress={() => setShowContributeInput(true)}
                style={styles.contributeBtn}
              >
                <Ionicons name="add" size={18} color="#fff" />
                <Text style={styles.contributeBtnText}>Contribute</Text>
              </TouchableOpacity>
            )
          ) : (
            <View style={styles.fullyPaidBadge}>
              <Ionicons name="checkmark-circle" size={18} color={COLORS.secondary} />
              <Text style={styles.fullyPaidText}>Paid</Text>
            </View>
          )}
        </View>

        {/* ── All Members Contributions ── */}
        <Text style={styles.sectionTitle}>
          Member Contributions (Target: {CURRENCY_SYMBOL}
          {wallet.targetContribution})
        </Text>
        <View style={styles.membersList}>
          {sortedMembers.map((member) => {
            const contrib = wallet.contributions.find(
              (c: WalletContribution) => c.userId === member.userId
            );
            const totalPaid = contrib?.amount ?? 0;
            const pending = Math.max(0, wallet.targetContribution - totalPaid);
            const isMe = member.userId === user?.id;

            return (
              <View key={member.userId} style={styles.memberItem}>
                <View style={styles.memberLeft}>
                  <View style={styles.memberNameRow}>
                    <Text style={styles.memberName}>
                      {member.name}
                      {isMe ? ' (You)' : ''}
                    </Text>
                    {wallet.walletManagerId === member.userId && (
                      <View style={styles.managerBadge}>
                        <Text style={styles.managerBadgeText}>Manager</Text>
                      </View>
                    )}
                  </View>
                  {pending > 0 ? (
                    <Text style={styles.owingText}>
                      Owes: {CURRENCY_SYMBOL}
                      {pending.toFixed(2)}
                    </Text>
                  ) : (
                    <Text style={styles.paidText}>Fully Paid ✓</Text>
                  )}
                </View>
                <Text style={styles.memberPaidAmount}>
                  {CURRENCY_SYMBOL}
                  {totalPaid.toFixed(2)}
                </Text>
              </View>
            );
          })}
        </View>

        {/* ── Transaction History ── */}
        <Text style={[styles.sectionTitle, { marginTop: 28 }]}>Transaction History</Text>
        <View style={styles.historyList}>
          {wallet.transactions.length === 0 ? (
            <EmptyState
              icon="receipt-outline"
              title="No transactions yet"
              description="Contributions and payments will show up here."
            />
          ) : (
            wallet.transactions.map((tx: WalletTransaction) => (
              <View key={tx.id} style={styles.txItem}>
                <View
                  style={[
                    styles.txIcon,
                    {
                      backgroundColor:
                        tx.type === 'DEPOSIT'
                          ? COLORS.secondaryFixed
                          : tx.type === 'EXPENSE'
                            ? COLORS.errorContainer
                            : COLORS.surfaceContainer,
                    },
                  ]}
                >
                  <Ionicons
                    name={
                      tx.type === 'DEPOSIT'
                        ? 'arrow-down'
                        : tx.type === 'EXPENSE'
                          ? 'arrow-up'
                          : 'swap-horizontal'
                    }
                    size={16}
                    color={
                      tx.type === 'DEPOSIT'
                        ? COLORS.secondary
                        : tx.type === 'EXPENSE'
                          ? COLORS.error
                          : COLORS.outline
                    }
                  />
                </View>
                <View style={styles.txInfo}>
                  <Text style={styles.txDesc}>
                    {tx.description}
                    {tx.user?.name ? ` (by ${tx.user.name})` : ''}
                  </Text>
                  <Text style={styles.txDate}>
                    {new Date(tx.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </Text>
                </View>
                {tx.amount !== null && (
                  <Text
                    style={[
                      styles.txAmount,
                      { color: tx.amount > 0 ? COLORS.primary : COLORS.error },
                    ]}
                  >
                    {tx.amount > 0 ? '+' : ''}
                    {CURRENCY_SYMBOL}
                    {Math.abs(tx.amount).toFixed(2)}
                  </Text>
                )}
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* ── Settings Modal ── */}
      <Modal
        visible={settingsVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSettingsVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setSettingsVisible(false)}>
          <Pressable style={styles.modalContent}>
            <Text style={styles.modalTitle}>Wallet Settings</Text>

            <Text style={styles.inputLabel}>Target Contribution ({CURRENCY_SYMBOL})</Text>
            <TextInput
              style={styles.textInput}
              value={newTarget}
              onChangeText={setNewTarget}
              keyboardType="decimal-pad"
              placeholder="e.g. 500"
              placeholderTextColor={COLORS.outlineVariant}
            />

            <Text style={[styles.inputLabel, { marginTop: 16 }]}>Wallet Manager</Text>
            <View style={styles.managerSelectBox}>
              {(group?.members ?? []).map((m) => (
                <TouchableOpacity
                  key={m.userId}
                  style={[
                    styles.managerOption,
                    newManagerId === m.userId && styles.managerOptionActive,
                  ]}
                  onPress={() => setNewManagerId(m.userId)}
                >
                  <Text
                    style={[
                      styles.managerOptionText,
                      newManagerId === m.userId && styles.managerOptionTextActive,
                    ]}
                  >
                    {m.name}
                  </Text>
                  {newManagerId === m.userId && (
                    <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setSettingsVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSaveBtn}
                onPress={handleSaveSettings}
                disabled={updateManager.isPending || updateTarget.isPending}
              >
                {updateManager.isPending || updateTarget.isPending ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.modalSaveText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </Pressable>
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
  settingsBtn: {
    padding: 4,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  // Error

  // Balance Card
  balanceCard: {
    backgroundColor: COLORS.secondary,
    borderRadius: 24,
    padding: 28,
    marginBottom: 20,
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
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
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
  balanceLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  balanceAmount: {
    fontSize: 38,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -1,
    marginBottom: 10,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  balanceMeta: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  // Your Contribution
  yourContribCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: 18,
    borderRadius: 18,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainer,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  yourContribInfo: {
    flex: 1,
  },
  yourContribLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.outline,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  yourContribAmount: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.onSurface,
  },
  yourContribTarget: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.outline,
  },
  yourContribPending: {
    fontSize: 12,
    color: COLORS.error,
    fontWeight: '600',
    marginTop: 2,
  },
  contributeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  contributeBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  contributeInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  contributeInput: {
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    width: 70,
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.onSurface,
    textAlign: 'center',
  },
  contributeConfirmBtn: {
    backgroundColor: COLORS.secondary,
    padding: 8,
    borderRadius: 8,
  },
  contributeCancelBtn: {
    padding: 8,
  },
  fullyPaidBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.secondaryFixed,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  fullyPaidText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  // Section
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.onSurfaceVariant,
    marginBottom: 12,
  },
  // Members
  membersList: {
    gap: 10,
  },
  memberItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainer,
  },
  memberLeft: {
    flex: 1,
  },
  memberNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  memberName: {
    fontWeight: '700',
    fontSize: 15,
    color: COLORS.onSurface,
  },
  managerBadge: {
    backgroundColor: COLORS.secondaryFixed,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  managerBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  owingText: {
    fontSize: 13,
    color: COLORS.error,
    fontWeight: '600',
    marginTop: 3,
  },
  paidText: {
    fontSize: 13,
    color: COLORS.secondary,
    fontWeight: '600',
    marginTop: 3,
  },
  memberPaidAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  // History
  historyList: {
    gap: 10,
    paddingBottom: 20,
  },
  txItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainer,
  },
  txIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  txInfo: {
    flex: 1,
  },
  txDesc: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.onSurface,
  },
  txDate: {
    fontSize: 12,
    color: COLORS.outline,
    marginTop: 2,
  },
  txAmount: {
    fontSize: 15,
    fontWeight: '700',
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 24,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.onSurface,
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.onSurfaceVariant,
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.onSurface,
  },
  managerSelectBox: {
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    borderRadius: 12,
    overflow: 'hidden',
  },
  managerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceContainer,
  },
  managerOptionActive: {
    backgroundColor: COLORS.primaryContainer,
  },
  managerOptionText: {
    fontSize: 15,
    color: COLORS.onSurface,
  },
  managerOptionTextActive: {
    fontWeight: '700',
    color: '#fff',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 24,
  },
  modalCancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  modalCancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.outline,
  },
  modalSaveBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  modalSaveText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
});
