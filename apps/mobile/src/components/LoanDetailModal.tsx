import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, CURRENCY_SYMBOL } from '../constants/theme';
import { useDeleteLoan, useSendLoanReminder, type Loan } from '@workspace/api';
import { BottomSheetModal } from './BottomSheetModal';
import { RecordLoanPaymentModal } from './RecordLoanPaymentModal';
import { EditLoanModal } from './EditLoanModal';
import { CustomAlertDialog } from './CustomAlertDialog';

interface LoanDetailModalProps {
  visible: boolean;
  onClose: () => void;
  loan: Loan | null;
  onSuccess?: () => void;
  variant?: 'light' | 'dark';
}

export function LoanDetailModal({
  visible,
  onClose,
  loan,
  onSuccess,
  variant = 'light',
}: LoanDetailModalProps) {
  const isDark = variant === 'dark';

  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    showCancel?: boolean;
    onConfirm: () => void;
    icon?: keyof typeof Ionicons.glyphMap;
    iconColor?: string;
  }>({
    visible: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const deleteLoan = useDeleteLoan();
  const sendReminder = useSendLoanReminder();

  if (!loan) return null;

  const isLend = loan.type === 'LEND';
  const isSettled = loan.status === 'SETTLED';

  const handleConfirmDelete = () => {
    setAlertConfig({
      visible: true,
      title: 'Delete Record',
      message:
        'Are you sure you want to delete this Lend/Borrow record? This action cannot be undone.',
      showCancel: true,
      icon: 'trash',
      iconColor: COLORS.error,
      onConfirm: () => {
        setAlertConfig((prev) => ({ ...prev, visible: false }));
        deleteLoan.mutate(loan.id, {
          onSuccess: () => {
            Alert.alert('Deleted', 'Record deleted successfully.');
            onClose();
            onSuccess?.();
          },
          onError: (err: unknown) => {
            Alert.alert('Error', (err as Error).message || 'Failed to delete record.');
          },
        });
      },
    });
  };

  const handleSendReminder = () => {
    sendReminder.mutate(loan.id, {
      onSuccess: (res) => {
        Alert.alert('Reminder Dispatched 🔔', res.message || 'Payment reminder sent!');
      },
      onError: (err: unknown) => {
        Alert.alert('Error', (err as Error).message || 'Failed to send reminder.');
      },
    });
  };

  return (
    <>
      <BottomSheetModal
        visible={visible}
        onClose={onClose}
        title={isLend ? 'Lend Details' : 'Borrow Details'}
        variant={variant}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.container}>
            {/* Header Hero Card */}
            <View style={[styles.heroCard, isDark && styles.heroCardDark]}>
              <View style={styles.personRow}>
                <Image
                  source={{
                    uri:
                      loan.personImage ||
                      'https://lh3.googleusercontent.com/aida-public/AB6AXuD5T5AJUovvhA_WnRPgEHHUebHGXF5_1EiHG95y-QfKq2nOO07Mu6O3nzSp4AjHOG8hjAGd0Le9T3VMsQ554EcRvn-FBqlSpjy3oLYsJUgXfzsRNskrMk9B58aBpvnyrr9dunlwrQ3t-uLtHtQ5AeVKOCn-64fTFblLeVHlXrsHWRLrpvOIYhhnMeriv4c4aLSPUpLcih10KZ6yXzN32ixRZd3TUiAozHsESLzxhXawBgffwZTpUF4UXguT6m8ijF1N9kQL0fwVx9xM',
                  }}
                  style={styles.personAvatar}
                />
                <View style={{ flex: 1 }}>
                  <View
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}
                  >
                    <Text style={[styles.personName, isDark && { color: '#F9FAFB' }]}>
                      {loan.personName}
                    </Text>
                    {loan.isRegisteredUser ? (
                      <View style={styles.appUserTag}>
                        <Ionicons name="checkmark-circle" size={10} color="#10B981" />
                        <Text style={styles.appUserTagText}>App User</Text>
                      </View>
                    ) : loan.personName.toLowerCase().includes('bank') ||
                      loan.personName.toLowerCase().includes('hdfc') ||
                      loan.personName.toLowerCase().includes('sbi') ||
                      loan.personName.toLowerCase().includes('icici') ? (
                      <View
                        style={[styles.appUserTag, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}
                      >
                        <Ionicons name="business-outline" size={10} color="#3B82F6" />
                        <Text style={[styles.appUserTagText, { color: '#3B82F6' }]}>Bank Loan</Text>
                      </View>
                    ) : loan.personName.toLowerCase().includes('cred') ||
                      loan.personName.toLowerCase().includes('navi') ||
                      loan.personName.toLowerCase().includes('slice') ||
                      loan.personName.toLowerCase().includes('moneyview') ||
                      loan.personName.toLowerCase().includes('pay') ? (
                      <View
                        style={[styles.appUserTag, { backgroundColor: 'rgba(139, 92, 246, 0.15)' }]}
                      >
                        <Ionicons name="phone-portrait-outline" size={10} color="#8B5CF6" />
                        <Text style={[styles.appUserTagText, { color: '#8B5CF6' }]}>Loan App</Text>
                      </View>
                    ) : (
                      <View style={styles.unlinkedTag}>
                        <Text style={styles.unlinkedTagText}>Unlinked</Text>
                      </View>
                    )}
                  </View>
                  {loan.personEmail && (
                    <Text style={[styles.personEmail, isDark && { color: '#9CA3AF' }]}>
                      {loan.personEmail}
                    </Text>
                  )}
                </View>
                <View
                  style={[
                    styles.typeBadge,
                    isLend
                      ? isDark
                        ? styles.typeBadgeLendDark
                        : styles.typeBadgeLendLight
                      : isDark
                        ? styles.typeBadgeBorrowDark
                        : styles.typeBadgeBorrowLight,
                  ]}
                >
                  <Text
                    style={[
                      styles.typeBadgeText,
                      isLend
                        ? { color: isDark ? '#34D399' : '#10B981' }
                        : { color: isDark ? '#F87171' : '#EF4444' },
                    ]}
                  >
                    {isLend ? 'You Lent' : 'You Borrowed'}
                  </Text>
                </View>
              </View>

              <View
                style={[styles.divider, isDark && { backgroundColor: 'rgba(255, 255, 255, 0.08)' }]}
              />

              {/* Amount Breakdown */}
              <View style={styles.amountGrid}>
                <View style={styles.amountItem}>
                  <Text style={[styles.amountLabel, isDark && { color: '#9CA3AF' }]}>
                    Principal Amount
                  </Text>
                  <Text style={[styles.amountValue, isDark && { color: '#F9FAFB' }]}>
                    {CURRENCY_SYMBOL}
                    {loan.amount.toFixed(2)}
                  </Text>
                </View>

                <View style={styles.amountItem}>
                  <Text style={[styles.amountLabel, isDark && { color: '#9CA3AF' }]}>
                    Paid Amount
                  </Text>
                  <Text style={[styles.amountValue, { color: isDark ? '#34D399' : '#10B981' }]}>
                    {CURRENCY_SYMBOL}
                    {loan.paidAmount.toFixed(2)}
                  </Text>
                </View>

                <View style={styles.amountItem}>
                  <Text style={[styles.amountLabel, isDark && { color: '#9CA3AF' }]}>
                    Remaining Balance
                  </Text>
                  <Text
                    style={[
                      styles.amountValue,
                      {
                        color:
                          loan.remainingAmount > 0
                            ? isLend
                              ? isDark
                                ? '#34D399'
                                : '#10B981'
                              : isDark
                                ? '#F87171'
                                : '#EF4444'
                            : isDark
                              ? '#9CA3AF'
                              : COLORS.outline,
                      },
                    ]}
                  >
                    {CURRENCY_SYMBOL}
                    {loan.remainingAmount.toFixed(2)}
                  </Text>
                </View>
              </View>

              {/* Status and Metadata Badges */}
              <View style={styles.metaRow}>
                <View
                  style={[
                    styles.statusBadge,
                    isSettled
                      ? isDark
                        ? styles.statusBadgeSettledDark
                        : styles.statusBadgeSettledLight
                      : isDark
                        ? styles.statusBadgePendingDark
                        : styles.statusBadgePendingLight,
                  ]}
                >
                  <Ionicons
                    name={isSettled ? 'checkmark-circle' : 'time-outline'}
                    size={13}
                    color={
                      isSettled ? (isDark ? '#34D399' : '#10B981') : isDark ? '#FBBF24' : '#D97706'
                    }
                  />
                  <Text
                    style={[
                      styles.statusBadgeText,
                      {
                        color: isSettled
                          ? isDark
                            ? '#34D399'
                            : '#10B981'
                          : isDark
                            ? '#FBBF24'
                            : '#D97706',
                      },
                    ]}
                  >
                    {loan.status}
                  </Text>
                </View>

                <View style={[styles.metaPill, isDark && styles.metaPillDark]}>
                  <Ionicons
                    name="card-outline"
                    size={13}
                    color={isDark ? '#9CA3AF' : COLORS.outline}
                  />
                  <Text style={[styles.metaPillText, isDark && { color: '#9CA3AF' }]}>
                    {loan.paymentMethod}
                  </Text>
                </View>

                {loan.dueDate ? (
                  <View style={[styles.metaPill, isDark && styles.metaPillDark]}>
                    <Ionicons
                      name="calendar-outline"
                      size={13}
                      color={isDark ? '#38BDF8' : '#0284c7'}
                    />
                    <Text style={[styles.metaPillText, { color: isDark ? '#38BDF8' : '#0284c7' }]}>
                      Due: {loan.dueDate}
                    </Text>
                  </View>
                ) : null}
              </View>

              {loan.notes ? (
                <View style={[styles.notesBox, isDark && styles.notesBoxDark]}>
                  <Ionicons
                    name="document-text-outline"
                    size={14}
                    color={isDark ? '#9CA3AF' : COLORS.outline}
                  />
                  <Text style={[styles.notesText, isDark && { color: '#9CA3AF' }]}>
                    {loan.notes}
                  </Text>
                </View>
              ) : null}
            </View>

            {/* Repayment Timeline */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, isDark && { color: '#F9FAFB' }]}>
                Repayment Timeline ({loan.payments?.length || 0})
              </Text>

              {loan.payments && loan.payments.length > 0 ? (
                <View style={styles.paymentsList}>
                  {loan.payments.map((p) => (
                    <View key={p.id} style={[styles.paymentItem, isDark && styles.paymentItemDark]}>
                      <View style={styles.paymentIconCircle}>
                        <Ionicons name="checkmark-sharp" size={14} color="#10B981" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.paymentMethodText, isDark && { color: '#F9FAFB' }]}>
                          Payment via {p.paymentMethod}
                        </Text>
                        <Text style={[styles.paymentDateText, isDark && { color: '#9CA3AF' }]}>
                          {p.date} {p.notes ? `• ${p.notes}` : ''}
                        </Text>
                      </View>
                      <Text style={[styles.paymentAmountText, isDark && { color: '#34D399' }]}>
                        +{CURRENCY_SYMBOL}
                        {p.amount.toFixed(2)}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : (
                <View style={[styles.emptyTimelineCard, isDark && styles.emptyTimelineCardDark]}>
                  <Ionicons
                    name="cash-outline"
                    size={28}
                    color={isDark ? '#74817B' : COLORS.outline}
                  />
                  <Text style={[styles.emptyTimelineText, isDark && { color: '#9CA3AF' }]}>
                    No repayments recorded yet.
                  </Text>
                </View>
              )}
            </View>

            {/* Actions Bar */}
            <View style={styles.actionsBar}>
              {!isSettled && (
                <TouchableOpacity
                  style={[styles.primaryActionBtn, { backgroundColor: '#10B981' }]}
                  onPress={() => setPaymentModalVisible(true)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="add-circle-outline" size={18} color="#fff" />
                  <Text style={styles.primaryActionText}>Record Repayment</Text>
                </TouchableOpacity>
              )}

              {/* Edit / Link App User Button */}
              {loan.isOwner && (
                <TouchableOpacity
                  style={[styles.secondaryActionBtn, isDark && styles.secondaryActionBtnDark]}
                  onPress={() => setEditModalVisible(true)}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name="create-outline"
                    size={16}
                    color={isDark ? '#F9FAFB' : COLORS.onSurface}
                  />
                  <Text style={[styles.secondaryActionText, isDark && { color: '#F9FAFB' }]}>
                    {loan.isRegisteredUser ? 'Edit Record' : 'Edit / Link App User'}
                  </Text>
                </TouchableOpacity>
              )}

              {!isSettled && (
                <TouchableOpacity
                  style={[styles.secondaryActionBtn, isDark && styles.secondaryActionBtnDark]}
                  onPress={handleSendReminder}
                  disabled={sendReminder.isPending}
                  activeOpacity={0.8}
                >
                  {sendReminder.isPending ? (
                    <ActivityIndicator size="small" color={COLORS.primary} />
                  ) : (
                    <>
                      <Ionicons
                        name="notifications-outline"
                        size={16}
                        color={isDark ? '#38BDF8' : COLORS.primary}
                      />
                      <Text style={[styles.secondaryActionText, isDark && { color: '#38BDF8' }]}>
                        Send Reminder
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              )}

              {loan.isOwner && (
                <TouchableOpacity
                  style={[
                    styles.secondaryActionBtn,
                    styles.deleteActionBtn,
                    isDark && styles.deleteActionBtnDark,
                  ]}
                  onPress={handleConfirmDelete}
                  disabled={deleteLoan.isPending}
                  activeOpacity={0.8}
                >
                  {deleteLoan.isPending ? (
                    <ActivityIndicator size="small" color={COLORS.error} />
                  ) : (
                    <>
                      <Ionicons name="trash-outline" size={16} color={COLORS.error} />
                      <Text style={styles.deleteActionText}>Delete</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
            </View>
          </View>
        </ScrollView>
      </BottomSheetModal>

      {/* Record Repayment Modal */}
      {loan && (
        <RecordLoanPaymentModal
          visible={paymentModalVisible}
          onClose={() => setPaymentModalVisible(false)}
          loan={loan}
          onSuccess={() => {
            onSuccess?.();
            onClose();
          }}
          variant={variant}
        />
      )}

      {/* Edit Loan Modal */}
      {loan && (
        <EditLoanModal
          visible={editModalVisible}
          onClose={() => setEditModalVisible(false)}
          loan={loan}
          onSuccess={() => {
            onSuccess?.();
            onClose();
          }}
          variant={variant}
        />
      )}

      {/* Alert Dialog */}
      <CustomAlertDialog
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        onConfirm={alertConfig.onConfirm}
        showCancel={alertConfig.showCancel}
        onCancel={() => setAlertConfig((prev) => ({ ...prev, visible: false }))}
        icon={alertConfig.icon}
        iconColor={alertConfig.iconColor}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 24, paddingBottom: 24 },
  heroCard: {
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainer,
    marginBottom: 20,
  },
  heroCardDark: {
    backgroundColor: '#101917',
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  personRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  personAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  personName: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.onSurface,
  },
  appUserTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(52, 211, 153, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  appUserTagText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#10B981',
  },
  unlinkedTag: {
    backgroundColor: COLORS.surfaceContainer,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  unlinkedTagText: {
    fontSize: 9.5,
    fontWeight: '600',
    color: COLORS.outline,
  },
  personEmail: {
    fontSize: 12,
    color: COLORS.outline,
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeBadgeLendLight: { backgroundColor: '#E6F4EA' },
  typeBadgeLendDark: { backgroundColor: 'rgba(52, 211, 153, 0.15)' },
  typeBadgeBorrowLight: { backgroundColor: '#FCE8E6' },
  typeBadgeBorrowDark: { backgroundColor: 'rgba(248, 113, 113, 0.15)' },
  typeBadgeText: { fontSize: 11.5, fontWeight: '800' },
  divider: {
    height: 1,
    backgroundColor: COLORS.surfaceContainer,
    marginVertical: 14,
  },
  amountGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  amountItem: {
    flex: 1,
  },
  amountLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.outline,
    marginBottom: 2,
  },
  amountValue: {
    fontSize: 15,
    fontWeight: '800',
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  statusBadgeSettledLight: { backgroundColor: '#E6F4EA' },
  statusBadgeSettledDark: { backgroundColor: 'rgba(52, 211, 153, 0.15)' },
  statusBadgePendingLight: { backgroundColor: '#FEF3C7' },
  statusBadgePendingDark: { backgroundColor: 'rgba(251, 191, 36, 0.15)' },
  statusBadgeText: { fontSize: 11, fontWeight: '800' },
  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.surfaceContainer,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  metaPillDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  metaPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.onSurface,
  },
  notesBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginTop: 12,
    backgroundColor: COLORS.surfaceContainer,
    padding: 10,
    borderRadius: 12,
  },
  notesBoxDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  notesText: {
    fontSize: 12,
    color: COLORS.outline,
    flex: 1,
    lineHeight: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.onSurface,
    marginBottom: 10,
  },
  paymentsList: {
    gap: 8,
  },
  paymentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: COLORS.surfaceContainerLow,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainer,
  },
  paymentItemDark: {
    backgroundColor: '#101917',
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  paymentIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E6F4EA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentMethodText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  paymentDateText: {
    fontSize: 11,
    color: COLORS.outline,
  },
  paymentAmountText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#10B981',
  },
  emptyTimelineCard: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: 20,
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainer,
  },
  emptyTimelineCardDark: {
    backgroundColor: '#101917',
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  emptyTimelineText: {
    fontSize: 12,
    color: COLORS.outline,
  },
  actionsBar: {
    gap: 10,
  },
  primaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 16,
    elevation: 2,
  },
  primaryActionText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  secondaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: COLORS.surfaceContainerLow,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainer,
  },
  secondaryActionBtnDark: {
    backgroundColor: '#101917',
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  secondaryActionText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  deleteActionBtn: {
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  deleteActionBtnDark: {
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  deleteActionText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.error,
  },
});
