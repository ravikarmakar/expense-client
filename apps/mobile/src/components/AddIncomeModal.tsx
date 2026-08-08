import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, CURRENCY_SYMBOL } from '../constants/theme';
import { useCreateIncome, useUpdateIncome, getErrorMessage, type Income } from '@workspace/api';
import { DatePickerModal } from './DatePickerModal';
import { FormInput } from './FormInput';
import { TactileButton } from './TactileButton';
import { formatRupees } from '../utils/format';
import { BottomSheetModal } from './BottomSheetModal';
import { hapticFeedback } from '../utils/haptics';

interface AddIncomeModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  variant?: 'light' | 'dark';
  editingIncome?: Income | null;
}

const INCOME_SOURCES = [
  { label: 'Salary', icon: 'cash-outline', color: '#10B981' },
  { label: 'Parents / Family', icon: 'heart-outline', color: '#EC4899' },
  { label: 'Pocket Money', icon: 'wallet-outline', color: '#F59E0B' },
  { label: 'Freelance', icon: 'laptop-outline', color: '#3B82F6' },
  { label: 'Investment', icon: 'trending-up-outline', color: '#8B5CF6' },
  { label: 'Bonus', icon: 'gift-outline', color: '#10B981' },
  { label: 'Other', icon: 'ellipsis-horizontal-circle-outline', color: '#6B7280' },
];

const PAYMENT_METHODS = [
  { label: 'Cash', icon: 'cash-outline' },
  { label: 'UPI', icon: 'qr-code-outline' },
  { label: 'Credit Card', icon: 'card-outline' },
  { label: 'Debit Card', icon: 'card-outline' },
  { label: 'Net Banking', icon: 'business-outline' },
  { label: 'Cheque', icon: 'document-text-outline' },
  { label: 'Other', icon: 'ellipsis-horizontal-circle-outline' },
];

export function AddIncomeModal({
  visible,
  onClose,
  onSuccess,
  variant = 'light',
  editingIncome,
}: AddIncomeModalProps) {
  const isDark = variant === 'dark';

  const getLocalTodayString = () => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const [source, setSource] = useState('Salary');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState(getLocalTodayString);
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const createIncome = useCreateIncome();
  const updateIncome = useUpdateIncome();

  React.useEffect(() => {
    if (visible) {
      if (editingIncome) {
        setSource(editingIncome.source);
        setPaymentMethod(editingIncome.paymentMethod || 'Cash');
        setAmount(editingIncome.amount.toString());
        setDate(editingIncome.date);
        setNotes(editingIncome.notes || '');
        setErrorMessage('');
      } else {
        resetForm();
      }
    }
  }, [visible, editingIncome]);

  const handleAmountChange = (text: string) => {
    setErrorMessage('');
    const formatted = formatRupees(text);
    if (formatted !== null) {
      setAmount(formatted);
    }
  };

  const resetForm = () => {
    setSource('Salary');
    setPaymentMethod('Cash');
    setAmount('');
    setNotes('');
    setDate(getLocalTodayString());
    setErrorMessage('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = () => {
    setErrorMessage('');
    const parsed = parseFloat(amount.replace(/,/g, '').replace(',', '.'));

    if (!amount || isNaN(parsed) || parsed <= 0) {
      setErrorMessage('Please enter a valid income amount greater than 0');
      return;
    }

    if (!source) {
      setErrorMessage('Please select an income source');
      return;
    }

    if (editingIncome) {
      updateIncome.mutate(
        {
          id: editingIncome.id,
          source,
          amount: parsed,
          category: source,
          paymentMethod,
          date,
          notes: notes.trim() || undefined,
        },
        {
          onSuccess: () => {
            hapticFeedback.success();
            resetForm();
            onSuccess?.();
            onClose();
          },
          onError: (err) => {
            setErrorMessage(getErrorMessage(err, 'Failed to update income. Please try again.'));
          },
        }
      );
    } else {
      createIncome.mutate(
        {
          source,
          amount: parsed,
          category: source,
          paymentMethod,
          date,
          notes: notes.trim() || undefined,
        },
        {
          onSuccess: () => {
            hapticFeedback.success();
            resetForm();
            onSuccess?.();
            onClose();
          },
          onError: (err) => {
            setErrorMessage(getErrorMessage(err, 'Failed to add income. Please try again.'));
          },
        }
      );
    }
  };

  const isSubmitting = createIncome.isPending || updateIncome.isPending;

  return (
    <BottomSheetModal
      visible={visible}
      onClose={handleClose}
      title={editingIncome ? 'Edit Income' : 'Add Income'}
      variant={variant}
      closeButtonPosition="right"
    >
      {errorMessage ? (
        <View style={styles.errorBanner}>
          <Ionicons name="alert-circle" size={16} color="#EF4444" />
          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      ) : null}

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View style={styles.formContainer}>
          {/* Source Chips */}
          <Text style={[styles.sectionLabel, isDark && { color: 'rgba(255, 255, 255, 0.7)' }]}>
            INCOME SOURCE
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipRow}
          >
            {INCOME_SOURCES.map((item) => {
              const selected = source === item.label;
              return (
                <TouchableOpacity
                  key={item.label}
                  activeOpacity={0.8}
                  onPress={() => {
                    hapticFeedback.selection();
                    setSource(item.label);
                  }}
                  style={[
                    styles.chip,
                    isDark
                      ? selected
                        ? { backgroundColor: '#064e3b', borderColor: '#10B981' }
                        : { backgroundColor: '#131D1A', borderColor: 'rgba(255, 255, 255, 0.08)' }
                      : selected
                        ? { backgroundColor: 'rgba(16, 185, 129, 0.12)', borderColor: '#10B981' }
                        : { backgroundColor: '#f3f4f6', borderColor: '#e5e7eb' },
                  ]}
                >
                  <Ionicons
                    name={item.icon as never}
                    size={16}
                    color={selected ? '#10B981' : isDark ? '#9CA3AF' : '#4B5563'}
                  />
                  <Text
                    style={[
                      styles.chipText,
                      selected
                        ? { color: '#10B981', fontWeight: '800' }
                        : { color: isDark ? '#9CA3AF' : '#4B5563' },
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Payment Method Chips */}
          <Text style={[styles.sectionLabel, isDark && { color: 'rgba(255, 255, 255, 0.7)' }]}>
            PAYMENT METHOD
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipRow}
          >
            {PAYMENT_METHODS.map((item) => {
              const selected = paymentMethod === item.label;
              return (
                <TouchableOpacity
                  key={item.label}
                  activeOpacity={0.8}
                  onPress={() => {
                    hapticFeedback.selection();
                    setPaymentMethod(item.label);
                  }}
                  style={[
                    styles.chip,
                    isDark
                      ? selected
                        ? { backgroundColor: '#064e3b', borderColor: '#10B981' }
                        : { backgroundColor: '#131D1A', borderColor: 'rgba(255, 255, 255, 0.08)' }
                      : selected
                        ? { backgroundColor: 'rgba(16, 185, 129, 0.12)', borderColor: '#10B981' }
                        : { backgroundColor: '#f3f4f6', borderColor: '#e5e7eb' },
                  ]}
                >
                  <Ionicons
                    name={item.icon as never}
                    size={16}
                    color={selected ? '#10B981' : isDark ? '#9CA3AF' : '#4B5563'}
                  />
                  <Text
                    style={[
                      styles.chipText,
                      selected
                        ? { color: '#10B981', fontWeight: '800' }
                        : { color: isDark ? '#9CA3AF' : '#4B5563' },
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Amount Card */}
          <View
            style={[
              styles.amountCard,
              isDark && {
                backgroundColor: 'transparent',
                borderColor: 'transparent',
              },
            ]}
          >
            <Text style={[styles.amountLabel, isDark && { color: 'rgba(255, 255, 255, 0.65)' }]}>
              Amount Received
            </Text>
            <View style={styles.amountRow}>
              <Text
                style={[styles.currencySymbol, { color: '#10B981', marginRight: 6 }]}
                numberOfLines={1}
              >
                {CURRENCY_SYMBOL}
              </Text>
              <TextInput
                style={[styles.amountInput, isDark ? { color: '#FFFFFF' } : { color: '#111827' }]}
                value={amount}
                onChangeText={handleAmountChange}
                placeholder="0.00"
                placeholderTextColor={isDark ? 'rgba(255, 255, 255, 0.4)' : COLORS.outlineVariant}
                keyboardType="decimal-pad"
                selectionColor="#10B981"
              />
            </View>
          </View>

          {/* Date Selector */}
          <TouchableOpacity onPress={() => setIsDatePickerVisible(true)} activeOpacity={0.8}>
            <View pointerEvents="none">
              <FormInput
                label="Date *"
                placeholder="YYYY-MM-DD"
                value={date}
                onChangeText={setDate}
                icon="calendar-outline"
                variant={variant}
                editable={false}
              />
            </View>
          </TouchableOpacity>

          <DatePickerModal
            visible={isDatePickerVisible}
            onClose={() => setIsDatePickerVisible(false)}
            selectedDate={date}
            onSelectDate={(newDate) => {
              setErrorMessage('');
              setDate(newDate);
            }}
          />

          {/* Notes */}
          <FormInput
            label="Notes"
            placeholder="Add details (e.g. Project name, bonus details)"
            value={notes}
            onChangeText={setNotes}
            icon="create-outline"
            multiline
            numberOfLines={3}
            variant={variant}
          />

          {/* Submit Button */}
          <TactileButton
            title={editingIncome ? 'Update Income' : 'Add Income'}
            icon="checkmark-circle"
            variant="emerald"
            onPress={handleSubmit}
            loading={isSubmitting}
            disabled={!source || !amount}
            style={styles.submitBtn}
          />
        </View>
      </ScrollView>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: 'rgba(239, 68, 68, 0.2)',
    borderWidth: 1,
    marginHorizontal: 24,
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  errorText: {
    flex: 1,
    fontSize: 12,
    color: '#EF4444',
    fontWeight: '600',
  },
  formContainer: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.outline,
    letterSpacing: 1.2,
    marginBottom: 10,
    marginTop: 6,
  },
  chipRow: {
    gap: 8,
    marginBottom: 20,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    gap: 6,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '700',
  },
  amountCard: {
    padding: 16,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceContainerLow,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainer,
    marginBottom: 20,
    width: '100%',
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.outline,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  currencySymbol: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 2,
  },
  amountInput: {
    fontSize: 44,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -1,
    minWidth: 160,
    paddingVertical: 0,
  },
  submitBtn: {
    marginTop: 12,
  },
});
