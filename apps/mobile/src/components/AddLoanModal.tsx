import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FormInput } from './FormInput';
import { BottomSheetModal } from './BottomSheetModal';
import { COLORS, CURRENCY_SYMBOL } from '../constants/theme';
import { useCreateLoan, type LoanType, type UserSearchResult } from '@workspace/api';
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

interface AddLoanModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  variant?: 'light' | 'dark';
}

export function AddLoanModal({
  visible,
  onClose,
  onSuccess,
  variant = 'light',
}: AddLoanModalProps) {
  const isDark = variant === 'dark';

  const [type, setType] = useState<LoanType>('LEND');
  const [lenderCategory, setLenderCategory] = useState<LenderCategory>('PERSON');
  const [personName, setPersonName] = useState('');
  const [personEmail, setPersonEmail] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserSearchResult | null>(null);
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [errorMessage, setErrorMessage] = useState('');
  const [showUserSelector, setShowUserSelector] = useState(false);

  const createLoan = useCreateLoan();

  const handleSelectUser = (user: UserSearchResult) => {
    setSelectedUser(user);
    setPersonName(user.name);
    setPersonEmail(user.email);
    setLenderCategory('PERSON');
    setShowUserSelector(false);
  };

  const handleClearSelectedUser = () => {
    setSelectedUser(null);
    setPersonEmail('');
  };

  const handleSubmit = () => {
    if (!personName.trim()) {
      setErrorMessage('Please enter a person name.');
      return;
    }

    const numAmount = parseFloat(amount.replace(/,/g, ''));
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      setErrorMessage('Please enter a valid positive amount.');
      return;
    }

    createLoan.mutate(
      {
        type,
        personName: personName.trim(),
        personEmail: personEmail.trim() || undefined,
        counterpartyId: selectedUser?.id,
        amount: numAmount,
        date: date || new Date().toISOString().split('T')[0],
        dueDate: dueDate.trim() || undefined,
        notes: notes.trim() || undefined,
        paymentMethod,
      },
      {
        onSuccess: () => {
          Alert.alert(
            'Success! 🎉',
            `Record saved successfully as ${type === 'LEND' ? 'Lend' : 'Borrow'}.`
          );
          setPersonName('');
          setPersonEmail('');
          setSelectedUser(null);
          setAmount('');
          setDueDate('');
          setNotes('');
          setErrorMessage('');
          onSuccess();
          onClose();
        },
        onError: (err: unknown) => {
          const error = err as { response?: { data?: { message?: string } }; message?: string };
          setErrorMessage(error.response?.data?.message || error.message || 'Failed to save loan');
        },
      }
    );
  };

  return (
    <>
      <BottomSheetModal
        visible={visible}
        onClose={onClose}
        title="Record Lend / Borrow"
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
            {/* Segmented Type Switcher */}
            <View style={[styles.segmentedContainer, isDark && styles.segmentedContainerDark]}>
              <TouchableOpacity
                style={[
                  styles.segmentedBtn,
                  type === 'LEND' &&
                    (isDark ? styles.lendBtnActiveDark : styles.lendBtnActiveLight),
                ]}
                onPress={() => {
                  setType('LEND');
                  setLenderCategory('PERSON');
                }}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="arrow-down-circle-outline"
                  size={16}
                  color={
                    type === 'LEND'
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
                    styles.segmentedBtnText,
                    isDark && { color: '#9CA3AF' },
                    type === 'LEND' &&
                      (isDark
                        ? { color: '#34D399', fontWeight: '800' }
                        : { color: '#10B981', fontWeight: '800' }),
                  ]}
                >
                  I Lent Money
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.segmentedBtn,
                  type === 'BORROW' &&
                    (isDark ? styles.borrowBtnActiveDark : styles.borrowBtnActiveLight),
                ]}
                onPress={() => setType('BORROW')}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="arrow-up-circle-outline"
                  size={16}
                  color={
                    type === 'BORROW'
                      ? isDark
                        ? '#F87171'
                        : '#EF4444'
                      : isDark
                        ? '#9CA3AF'
                        : COLORS.outline
                  }
                />
                <Text
                  style={[
                    styles.segmentedBtnText,
                    isDark && { color: '#9CA3AF' },
                    type === 'BORROW' &&
                      (isDark
                        ? { color: '#F87171', fontWeight: '800' }
                        : { color: '#EF4444', fontWeight: '800' }),
                  ]}
                >
                  I Borrowed Money
                </Text>
              </TouchableOpacity>
            </View>

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

            {/* Borrow Category Switcher (only shown when borrowing) */}
            {type === 'BORROW' ? (
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
                                ? '#818CF8'
                                : '#6366F1'
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
                                ? { color: '#818CF8', fontWeight: '800' }
                                : { color: '#6366F1', fontWeight: '800' }),
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
            {type === 'BORROW' && (lenderCategory === 'BANK' || lenderCategory === 'APP') ? (
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
                    ✨ Automatic {type === 'LEND' ? 'BORROW' : 'LEND'} record will show for{' '}
                    {selectedUser.name.split(' ')[0]}
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
                      Select Registered App User
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
                type === 'LEND' ? { backgroundColor: '#10B981' } : { backgroundColor: '#EF4444' },
                (!personName.trim() || !amount || createLoan.isPending) && styles.submitBtnDisabled,
              ]}
              onPress={handleSubmit}
              disabled={!personName.trim() || !amount || createLoan.isPending}
              activeOpacity={0.85}
            >
              {createLoan.isPending ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitBtnText}>
                  Save {type === 'LEND' ? 'Lend' : 'Borrow'} Record
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </BottomSheetModal>

      {/* Dedicated Full Select User Modal */}
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
  formContainer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    gap: 16,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FCE8E6',
    borderRadius: 12,
    padding: 12,
    marginBottom: 4,
    gap: 8,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 13,
    fontWeight: '600',
  },
  segmentedContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: 16,
    padding: 4,
    gap: 4,
  },
  segmentedContainerDark: {
    backgroundColor: '#101917',
  },
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
  segmentedBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
  },
  lendBtnActiveLight: {
    backgroundColor: '#E6F4EA',
  },
  lendBtnActiveDark: {
    backgroundColor: 'rgba(52, 211, 153, 0.18)',
  },
  borrowBtnActiveLight: {
    backgroundColor: '#FCE8E6',
  },
  borrowBtnActiveDark: {
    backgroundColor: 'rgba(248, 113, 113, 0.18)',
  },
  segmentedBtnText: {
    fontSize: 13,
    fontWeight: '600',
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
  rowTwoInputs: {
    flexDirection: 'row',
    gap: 12,
  },
  findUserBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(99, 102, 241, 0.08)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
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
  submitBtn: {
    borderRadius: 16,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  submitBtnDisabled: {
    opacity: 0.5,
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
});
