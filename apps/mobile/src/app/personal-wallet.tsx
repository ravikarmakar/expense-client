import React, { useState } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, CURRENCY_SYMBOL } from '../constants/theme';

interface WalletLog {
  id: string;
  type: 'DEPOSIT' | 'WITHDRAW' | 'TRANSFER';
  amount: number;
  time: string;
  description: string;
}

export default function PersonalWalletScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Stateful balance and logs
  const [balance, setBalance] = useState<number>(25480.0);
  const [logs, setLogs] = useState<WalletLog[]>([
    {
      id: '1',
      type: 'DEPOSIT',
      amount: 5000,
      time: 'Today, 2:30 PM',
      description: 'Salary deposit',
    },
    {
      id: '2',
      type: 'WITHDRAW',
      amount: 1200,
      time: 'Yesterday, 6:15 PM',
      description: 'ATM Cash Withdrawal',
    },
    {
      id: '4',
      type: 'DEPOSIT',
      amount: 1500,
      time: '5 days ago',
      description: 'Refund from Amazon',
    },
  ]);

  // Custom Modal States
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'DEPOSIT' | 'WITHDRAW' | null>(null);
  const [inputAmount, setInputAmount] = useState('');

  // Handle Add Money (Deposit)
  const handleAddMoney = () => {
    setModalType('DEPOSIT');
    setInputAmount('');
    setModalVisible(true);
  };

  // Handle Withdraw Money
  const handleWithdraw = () => {
    setModalType('WITHDRAW');
    setInputAmount('');
    setModalVisible(true);
  };

  const handleModalConfirm = () => {
    const amount = parseFloat(inputAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid positive number.');
      return;
    }

    if (modalType === 'WITHDRAW' && amount > balance) {
      Alert.alert(
        'Insufficient Balance',
        'You do not have enough funds to complete this withdrawal.'
      );
      return;
    }

    if (modalType === 'DEPOSIT') {
      setBalance((prev) => prev + amount);
      setLogs((prev) => [
        {
          id: Math.random().toString(),
          type: 'DEPOSIT',
          amount,
          time: 'Just now',
          description: 'Money added to wallet',
        },
        ...prev,
      ]);
      Alert.alert(
        'Success',
        `Successfully deposited ${CURRENCY_SYMBOL}${amount.toFixed(2)} into your wallet.`
      );
    } else if (modalType === 'WITHDRAW') {
      setBalance((prev) => prev - amount);
      setLogs((prev) => [
        {
          id: Math.random().toString(),
          type: 'WITHDRAW',
          amount,
          time: 'Just now',
          description: 'Withdrawal to Bank Account',
        },
        ...prev,
      ]);
      Alert.alert(
        'Success',
        `Successfully withdrew ${CURRENCY_SYMBOL}${amount.toFixed(2)} from your wallet.`
      );
    }

    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      {/* Header section */}
      <View style={[styles.header, { paddingTop: insets.top, height: 56 + insets.top }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          Personal Wallet
        </Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* ── Balance Card ── */}
        <View style={styles.balanceCard}>
          <View style={[styles.abstractCircle, styles.circleTopRight]} />
          <View style={[styles.abstractCircle, styles.circleBottomLeft]} />
          <Text style={styles.balanceLabel}>ACTIVE BALANCE</Text>
          <Text style={styles.balanceAmount}>
            {CURRENCY_SYMBOL}
            {balance.toFixed(2)}
          </Text>
          <View style={styles.balanceRow}>
            <Ionicons name="card-outline" size={14} color="rgba(255,255,255,0.8)" />
            <Text style={styles.balanceMeta}>Personal Wallet Account</Text>
          </View>
        </View>

        {/* Money management actions */}
        <Text style={styles.sectionHeader}>Manage Money</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity style={styles.actionCard} activeOpacity={0.8} onPress={handleAddMoney}>
            <View style={[styles.actionIconBg, { backgroundColor: COLORS.secondaryFixed }]}>
              <Ionicons name="arrow-down-circle" size={22} color={COLORS.secondary} />
            </View>
            <Text style={styles.actionTitle}>Add Money</Text>
            <Text style={styles.actionSubtitle}>Deposit funds</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard} activeOpacity={0.8} onPress={handleWithdraw}>
            <View style={[styles.actionIconBg, { backgroundColor: '#fce8e6' }]}>
              <Ionicons name="arrow-up-circle" size={22} color="#c5221f" />
            </View>
            <Text style={styles.actionTitle}>Withdraw</Text>
            <Text style={styles.actionSubtitle}>To bank account</Text>
          </TouchableOpacity>
        </View>

        {/* Transaction log history */}
        <Text style={styles.sectionHeader}>Transaction Log</Text>
        <View style={styles.logsList}>
          {logs.map((log) => {
            const isAdd = log.type === 'DEPOSIT';
            return (
              <View key={log.id} style={styles.logCard}>
                <View
                  style={[
                    styles.logIconBadge,
                    { backgroundColor: isAdd ? COLORS.secondaryFixed : '#fce8e6' },
                  ]}
                >
                  <Ionicons
                    name={isAdd ? 'add' : 'arrow-up'}
                    size={16}
                    color={isAdd ? COLORS.secondary : '#c5221f'}
                  />
                </View>
                <View style={styles.logInfo}>
                  <Text style={styles.logDescription}>{log.description}</Text>
                  <Text style={styles.logTime}>{log.time}</Text>
                </View>
                <Text style={[styles.logAmount, { color: isAdd ? COLORS.secondary : '#c5221f' }]}>
                  {isAdd ? '+' : '-'}
                  {CURRENCY_SYMBOL}
                  {log.amount.toFixed(2)}
                </Text>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Wallet Action Modal (Deposit/Withdrawal) */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
        statusBarTranslucent={true}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalContainer}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {modalType === 'DEPOSIT' ? 'Add Money' : 'Withdraw Money'}
                </Text>
                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  style={styles.modalCloseBtn}
                >
                  <Ionicons name="close" size={22} color={COLORS.outline} />
                </TouchableOpacity>
              </View>

              <Text style={styles.modalSub}>
                {modalType === 'DEPOSIT'
                  ? 'Enter the amount you want to deposit into your wallet:'
                  : 'Enter the amount you want to withdraw from your wallet:'}
              </Text>

              <View style={styles.amountInputContainer}>
                <Text style={styles.amountCurrency}>{CURRENCY_SYMBOL}</Text>
                <TextInput
                  style={styles.amountInput}
                  keyboardType="decimal-pad"
                  placeholder="0.00"
                  placeholderTextColor={COLORS.outline}
                  value={inputAmount}
                  onChangeText={setInputAmount}
                  autoFocus={true}
                />
              </View>

              <View style={styles.modalActionButtons}>
                <TouchableOpacity
                  style={styles.modalCancelBtn}
                  onPress={() => setModalVisible(false)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.modalConfirmBtn,
                    { backgroundColor: modalType === 'DEPOSIT' ? COLORS.secondary : COLORS.error },
                  ]}
                  onPress={handleModalConfirm}
                  activeOpacity={0.8}
                >
                  <Text style={styles.modalConfirmText}>
                    {modalType === 'DEPOSIT' ? 'Deposit' : 'Withdraw'}
                  </Text>
                </TouchableOpacity>
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
    backgroundColor: COLORS.background,
  },
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
    textAlign: 'center',
  },
  scrollContent: {
    padding: 20,
  },
  balanceCard: {
    backgroundColor: COLORS.secondary,
    borderRadius: 24,
    padding: 28,
    marginBottom: 28,
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
  sectionHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.outline,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
    paddingLeft: 4,
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 28,
  },
  actionCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 14,
    borderWidth: 1.5,
    borderColor: COLORS.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
  },
  actionIconBg: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  actionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.onSurface,
    textAlign: 'center',
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 10,
    color: COLORS.outline,
    textAlign: 'center',
  },
  logsList: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: COLORS.surfaceContainer,
    padding: 16,
    gap: 14,
  },
  logCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logInfo: {
    flex: 1,
  },
  logDescription: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.onSurface,
    marginBottom: 2,
  },
  logTime: {
    fontSize: 11,
    color: COLORS.outline,
  },
  logAmount: {
    fontSize: 14,
    fontWeight: '800',
  },

  // Custom Modal Styles
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
  },
  modalConfirmText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
});
