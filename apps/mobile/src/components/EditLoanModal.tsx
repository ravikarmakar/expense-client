import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  TextInput,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, CURRENCY_SYMBOL } from '../constants/theme';
import { useUpdateLoan, type Loan, type UserSearchResult } from '@workspace/api';
import { BottomSheetModal } from './BottomSheetModal';
import { FormInput } from './FormInput';
import { PaymentMethodSelector } from './PaymentMethodSelector';
import { formatRupees } from '../utils/format';
import { SelectUserModal } from './SelectUserModal';

export type LenderCategory = 'PERSON' | 'BANK' | 'APP' | 'COMPANY';

const LENDER_CATEGORIES = [
  { id: 'PERSON', label: 'Person', icon: 'person-outline' },
  { id: 'BANK', label: 'Bank', icon: 'business-outline' },
  { id: 'APP', label: 'Loan App', icon: 'phone-portrait-outline' },
  { id: 'COMPANY', label: 'Company', icon: 'briefcase-outline' },
] as const;

const BANK_PRESETS = ['HDFC Bank', 'SBI', 'ICICI Bank', 'Axis Bank', 'Kotak Bank', 'PNB'];
const APP_PRESETS = ['Cred Cash', 'MoneyView', 'Navi', 'Slice', 'LazyPay', 'KreditBee'];

interface EditLoanModalProps {
  visible: boolean;
  onClose: () => void;
  loan: Loan | null;
  onSuccess?: () => void;
  variant?: 'light' | 'dark';
}

export function EditLoanModal({
  visible,
  onClose,
  loan,
  onSuccess,
  variant = 'light',
}: EditLoanModalProps) {
  const isDark = variant === 'dark';

  const [lenderCategory, setLenderCategory] = useState<LenderCategory>('PERSON');
  const [personName, setPersonName] = useState('');
  const [personEmail, setPersonEmail] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserSearchResult | null>(null);

  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [date, setDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showUserSelector, setShowUserSelector] = useState(false);

  const updateLoan = useUpdateLoan();

  useEffect(() => {
    if (visible && loan) {
      setPersonName(loan.personName);
      setPersonEmail(loan.personEmail || '');
      setAmount(loan.amount.toString());
      setPaymentMethod(
        (loan.paymentMethod as 'CASH' | 'UPI' | 'NET_BANKING' | 'CARD' | 'OTHER') || 'UPI'
      );
      setDate(loan.date);
      setDueDate(loan.dueDate || '');
      setNotes(loan.notes || '');
      setErrorMessage('');

      // Auto-detect category based on name
      const nameLower = loan.personName.toLowerCase();
      if (
        BANK_PRESETS.some((b) => nameLower.includes(b.toLowerCase())) ||
        nameLower.includes('bank')
      ) {
        setLenderCategory('BANK');
      } else if (
        APP_PRESETS.some((a) => nameLower.includes(a.toLowerCase())) ||
        nameLower.includes('cash') ||
        nameLower.includes('pay')
      ) {
        setLenderCategory('APP');
      } else {
        setLenderCategory('PERSON');
      }

      if (loan.counterpartyId) {
        setSelectedUser({
          id: loan.counterpartyId,
          name: loan.personName,
          email: loan.personEmail || '',
          image: loan.personImage || null,
        });
      } else {
        setSelectedUser(null);
      }
    }
  }, [visible, loan]);

  if (!loan) return null;

  const isLend = loan.type === 'LEND';

  const handleSelectUser = (user: UserSearchResult) => {
    setSelectedUser(user);
    setPersonName(user.name);
    setPersonEmail(user.email);
    setShowUserSelector(false);
  };

  const handleClearSelectedUser = () => {
    setSelectedUser(null);
    setPersonName('');
    setPersonEmail('');
  };

  const handleSubmit = () => {
    setErrorMessage('');
    const parsedAmount = parseFloat(amount.replace(/,/g, ''));

    if (!personName.trim()) {
      setErrorMessage('Please enter a person name');
      return;
    }

    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      setErrorMessage('Please enter a valid amount greater than 0');
      return;
    }

    updateLoan.mutate(
      {
        id: loan.id,
        personName: personName.trim(),
        personEmail: personEmail.trim() || undefined,
        counterpartyId: selectedUser?.id || null,
        amount: parsedAmount,
        paymentMethod,
        date,
        dueDate: dueDate.trim() || undefined,
        notes: notes.trim() || undefined,
      },
      {
        onSuccess: () => {
          Alert.alert('Updated! 🎉', 'Record updated successfully.');
          onClose();
          onSuccess?.();
        },
        onError: (err: unknown) => {
          const error = err as { response?: { data?: { message?: string } }; message?: string };
          setErrorMessage(
            error.response?.data?.message || error.message || 'Failed to update record.'
          );
        },
      }
    );
  };

  return (
    <>
      <BottomSheetModal
        visible={visible}
        onClose={onClose}
        title={isLend ? 'Edit Lend Record' : 'Edit Borrow Record'}
        variant={variant}
      >
        {errorMessage ? (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle" size={16} color={COLORS.error} />
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={styles.formContainer}>
            {/* Amount Input */}
            <View style={[styles.amountContainer, isDark && styles.amountContainerDark]}>
              <Text style={[styles.currencySymbol, isDark && { color: '#818CF8' }]}>
                {CURRENCY_SYMBOL}
              </Text>
              <TextInput
                style={[styles.amountInput, isDark && { color: '#F9FAFB' }]}
                value={amount}
                onChangeText={(t) => {
                  setErrorMessage('');
                  const formatted = formatRupees(t);
                  if (formatted !== null) setAmount(formatted);
                }}
                placeholder="0.00"
                placeholderTextColor={isDark ? 'rgba(255, 255, 255, 0.45)' : COLORS.outlineVariant}
                keyboardType="decimal-pad"
              />
            </View>

            {/* Borrow Category Switcher (only shown when editing a Borrow record) */}
            {!isLend ? (
              <View style={styles.categoryContainer}>
                <Text style={[styles.inputLabel, isDark && { color: '#9CA3AF' }]}>
                  Borrow Source Category
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ gap: 8 }}
                >
                  {LENDER_CATEGORIES.map((cat) => {
                    const isSelected = lenderCategory === cat.id;
                    return (
                      <TouchableOpacity
                        key={cat.id}
                        style={[
                          styles.categoryChip,
                          isDark && styles.categoryChipDark,
                          isSelected &&
                            (isDark
                              ? styles.categoryChipActiveDark
                              : styles.categoryChipActiveLight),
                        ]}
                        onPress={() => {
                          setLenderCategory(cat.id);
                          if (cat.id !== 'PERSON') {
                            setSelectedUser(null);
                          }
                        }}
                        activeOpacity={0.8}
                      >
                        <Ionicons
                          name={cat.icon as never}
                          size={15}
                          color={
                            isSelected
                              ? isDark
                                ? '#34D399'
                                : '#10B981'
                              : isDark
                                ? '#9CA3AF'
                                : COLORS.outline
                          }
                        />
                        <Text
                          style={[
                            styles.categoryChipText,
                            isDark && { color: '#9CA3AF' },
                            isSelected &&
                              (isDark
                                ? { color: '#34D399', fontWeight: '800' }
                                : { color: '#10B981', fontWeight: '800' }),
                          ]}
                        >
                          {cat.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            ) : null}

            {/* Quick Institution Presets for Bank & Loan App */}
            {!isLend && (lenderCategory === 'BANK' || lenderCategory === 'APP') ? (
              <View style={styles.presetsContainer}>
                <Text style={[styles.presetTitle, isDark && { color: '#9CA3AF' }]}>
                  Popular {lenderCategory === 'BANK' ? 'Banks' : 'Loan Apps'}
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ gap: 6 }}
                >
                  {(lenderCategory === 'BANK' ? BANK_PRESETS : APP_PRESETS).map((name) => (
                    <TouchableOpacity
                      key={name}
                      style={[styles.presetChip, isDark && styles.presetChipDark]}
                      onPress={() => {
                        setPersonName(name);
                        setErrorMessage('');
                      }}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.presetChipText, isDark && { color: '#F9FAFB' }]}>
                        {name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            ) : null}

            {/* Person / Contact Field */}
            {selectedUser ? (
              <View style={[styles.selectedUserCard, isDark && styles.selectedUserCardDark]}>
                <Image
                  source={{
                    uri:
                      selectedUser.image ||
                      'https://lh3.googleusercontent.com/aida-public/AB6AXuD5T5AJUovvhA_WnRPgEHHUebHGXF5_1EiHG95y-QfKq2nOO07Mu6O3nzSp4AjHOG8hjAGd0Le9T3VMsQ554EcRvn-FBqlSpjy3oLYsJUgXfzsRNskrMk9B58aBpvnyrr9dunlwrQ3t-uLtHtQ5AeVKOCn-64fTFblLeVHlXrsHWRLrpvOIYhhnMeriv4c4aLSPUpLcih10KZ6yXzN32ixRZd3TUiAozHsESLzxhXawBgffwZTpUF4UXguT6m8ijF1N9kQL0fwVx9xM',
                  }}
                  style={styles.selectedUserAvatar}
                />
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={[styles.selectedUserName, isDark && { color: '#F9FAFB' }]}>
                      {selectedUser.name}
                    </Text>
                    <View style={styles.appUserBadge}>
                      <Ionicons name="checkmark-circle" size={10} color="#6366F1" />
                      <Text style={styles.appUserBadgeText}>App User (Linked)</Text>
                    </View>
                  </View>
                  <Text style={[styles.selectedUserEmail, isDark && { color: '#9CA3AF' }]}>
                    {selectedUser.email}
                  </Text>
                  <Text style={[styles.reciprocalHint, isDark && { color: '#818CF8' }]}>
                    ✨ Automatic dual record linked to this user
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={handleClearSelectedUser}
                  style={{ padding: 4 }}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="close-circle"
                    size={22}
                    color={isDark ? '#9CA3AF' : COLORS.outline}
                  />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={{ gap: 8 }}>
                <FormInput
                  label={
                    lenderCategory === 'BANK'
                      ? 'Bank Name *'
                      : lenderCategory === 'APP'
                        ? 'Loan App Name *'
                        : lenderCategory === 'COMPANY'
                          ? 'Company Name *'
                          : 'Person / Contact Name *'
                  }
                  value={personName}
                  onChangeText={(t) => {
                    setPersonName(t);
                    setErrorMessage('');
                  }}
                  placeholder={
                    lenderCategory === 'BANK'
                      ? 'e.g. HDFC Bank Personal Loan'
                      : lenderCategory === 'APP'
                        ? 'e.g. Cred Cash'
                        : lenderCategory === 'COMPANY'
                          ? 'e.g. Acme Corp Salary Advance'
                          : 'Enter person name...'
                  }
                  icon={
                    lenderCategory === 'BANK'
                      ? 'business-outline'
                      : lenderCategory === 'APP'
                        ? 'phone-portrait-outline'
                        : lenderCategory === 'COMPANY'
                          ? 'briefcase-outline'
                          : 'person-outline'
                  }
                  variant={variant}
                />

                {lenderCategory === 'PERSON' && (
                  <TouchableOpacity
                    style={[styles.findUserBtn, isDark && styles.findUserBtnDark]}
                    onPress={() => setShowUserSelector(true)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="search" size={16} color="#6366F1" />
                    <Text style={[styles.findUserBtnText, isDark && { color: '#818CF8' }]}>
                      Select Registered App User (Link Record)
                    </Text>
                    <Ionicons
                      name="chevron-forward"
                      size={16}
                      color={isDark ? '#9CA3AF' : COLORS.outline}
                    />
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* Payment Method Selector */}
            <PaymentMethodSelector
              selectedMethod={paymentMethod}
              onSelect={setPaymentMethod}
              variant={variant}
            />

            {/* Date & Due Date Inputs */}
            <View style={styles.rowTwoInputs}>
              <View style={{ flex: 1 }}>
                <FormInput
                  label="Date *"
                  value={date}
                  onChangeText={setDate}
                  placeholder="YYYY-MM-DD"
                  icon="calendar-outline"
                  variant={variant}
                />
              </View>
              <View style={{ flex: 1 }}>
                <FormInput
                  label="Due Date (optional)"
                  value={dueDate}
                  onChangeText={setDueDate}
                  placeholder="YYYY-MM-DD"
                  icon="alarm-outline"
                  variant={variant}
                />
              </View>
            </View>

            {/* Notes Input */}
            <FormInput
              label="Notes (optional)"
              value={notes}
              onChangeText={setNotes}
              placeholder="Reason or extra details..."
              multiline
              numberOfLines={2}
              variant={variant}
            />

            {/* Submit Button */}
            <TouchableOpacity
              style={[
                styles.submitBtn,
                isLend ? { backgroundColor: '#10B981' } : { backgroundColor: '#EF4444' },
                (!personName.trim() || !amount || updateLoan.isPending) && styles.submitBtnDisabled,
              ]}
              onPress={handleSubmit}
              disabled={!personName.trim() || !amount || updateLoan.isPending}
              activeOpacity={0.85}
            >
              {updateLoan.isPending ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={20} color="#fff" />
                  <Text style={styles.submitBtnText}>Save Changes</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </BottomSheetModal>

      {/* Dedicated Select User Modal */}
      <SelectUserModal
        visible={showUserSelector}
        onClose={() => setShowUserSelector(false)}
        onSelectUser={handleSelectUser}
        isDark={isDark}
      />
    </>
  );
}

const styles = StyleSheet.create({
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.errorContainer,
    padding: 12,
    borderRadius: 12,
    marginBottom: 4,
  },
  errorText: { flex: 1, fontSize: 12, color: COLORS.error, fontWeight: '600' },
  formContainer: { paddingHorizontal: 24, paddingBottom: 24, gap: 16 },
  categoryContainer: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.outline,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceContainerLow,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainer,
  },
  categoryChipDark: {
    backgroundColor: '#101917',
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  categoryChipActiveLight: {
    backgroundColor: '#E6F4EA',
    borderColor: '#10B981',
  },
  categoryChipActiveDark: {
    backgroundColor: 'rgba(52, 211, 153, 0.15)',
    borderColor: '#34D399',
  },
  categoryChipText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: COLORS.onSurface,
  },
  presetsContainer: {
    gap: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.04)',
    padding: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.15)',
  },
  presetTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.outline,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  presetChip: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainer,
  },
  presetChipDark: {
    backgroundColor: '#101917',
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  presetChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: 20,
    paddingHorizontal: 20,
    height: 70,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainer,
  },
  amountContainerDark: {
    backgroundColor: '#101917',
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  currencySymbol: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.primary,
    marginRight: 6,
  },
  amountInput: {
    fontSize: 34,
    fontWeight: '800',
    color: COLORS.onSurface,
    minWidth: 120,
  },
  findUserBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(99, 102, 241, 0.08)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.2)',
  },
  findUserBtnDark: {
    backgroundColor: 'rgba(129, 140, 248, 0.12)',
    borderColor: 'rgba(129, 140, 248, 0.25)',
  },
  findUserBtnText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: '#6366F1',
    marginLeft: 8,
  },
  selectedUserCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(99, 102, 241, 0.08)',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
    gap: 10,
  },
  selectedUserCardDark: {
    backgroundColor: 'rgba(129, 140, 248, 0.1)',
    borderColor: 'rgba(129, 140, 248, 0.25)',
  },
  selectedUserAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  selectedUserName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  selectedUserEmail: {
    fontSize: 11,
    color: COLORS.outline,
  },
  appUserBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: 'rgba(99, 102, 241, 0.18)',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  appUserBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#6366F1',
  },
  reciprocalHint: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#6366F1',
    marginTop: 2,
  },
  rowTwoInputs: {
    flexDirection: 'row',
    gap: 12,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 18,
    marginTop: 8,
    elevation: 3,
  },
  submitBtnDisabled: { opacity: 0.5, elevation: 0 },
  submitBtnText: { color: '#fff', fontSize: 15, fontWeight: '800' },
});
