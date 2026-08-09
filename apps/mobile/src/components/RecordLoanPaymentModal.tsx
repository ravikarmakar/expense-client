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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, CURRENCY_SYMBOL } from '../constants/theme';
import { useRecordLoanPayment, type Loan } from '@workspace/api';
import { BottomSheetModal } from './BottomSheetModal';
import { FormInput } from './FormInput';
import { PaymentMethodSelector } from './PaymentMethodSelector';
import { formatRupees } from '../utils/format';

interface RecordLoanPaymentModalProps {
  visible: boolean;
  onClose: () => void;
  loan: Loan | null;
  onSuccess?: () => void;
  variant?: 'light' | 'dark';
}

export function RecordLoanPaymentModal({
  visible,
  onClose,
  loan,
  onSuccess,
  variant = 'light',
}: RecordLoanPaymentModalProps) {
  const isDark = variant === 'dark';

  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const recordPayment = useRecordLoanPayment();

  useEffect(() => {
    if (visible && loan) {
      setAmount(loan.remainingAmount.toString());
      setPaymentMethod('UPI');
      setDate(new Date().toISOString().split('T')[0]);
      setNotes('');
      setErrorMessage('');
    }
  }, [visible, loan]);

  if (!loan) return null;

  const handleSubmit = () => {
    setErrorMessage('');
    const parsed = parseFloat(amount.replace(/,/g, ''));

    if (!amount || isNaN(parsed) || parsed <= 0) {
      setErrorMessage('Please enter a valid repayment amount');
      return;
    }

    if (parsed > loan.remainingAmount + 0.01) {
      setErrorMessage(
        `Amount cannot exceed remaining balance of ${CURRENCY_SYMBOL}${loan.remainingAmount.toFixed(2)}`
      );
      return;
    }

    recordPayment.mutate(
      {
        loanId: loan.id,
        amount: parsed,
        paymentMethod,
        date,
        notes: notes.trim() || undefined,
      },
      {
        onSuccess: () => {
          Alert.alert('Payment Recorded! 🎉', 'Repayment saved successfully.');
          onClose();
          onSuccess?.();
        },
        onError: (err: unknown) => {
          setErrorMessage((err as Error).message || 'Failed to record repayment.');
        },
      }
    );
  };

  return (
    <BottomSheetModal
      visible={visible}
      onClose={onClose}
      title="Record Repayment"
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
          {/* Header Info */}
          <View style={[styles.infoBanner, isDark && styles.infoBannerDark]}>
            <Text style={[styles.infoTitle, isDark && { color: '#9CA3AF' }]}>
              {loan.type === 'LEND' ? 'Receiving Repayment from' : 'Making Repayment to'}
            </Text>
            <Text style={[styles.infoPersonName, isDark && { color: '#F9FAFB' }]}>
              {loan.personName}
            </Text>
            <Text style={[styles.infoRemainingText, isDark && { color: '#34D399' }]}>
              Remaining Balance: {CURRENCY_SYMBOL}
              {loan.remainingAmount.toFixed(2)}
            </Text>
          </View>

          {/* Amount Input */}
          <View style={styles.amountContainer}>
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

          {/* Quick Amount Buttons */}
          <View style={styles.quickBtnsRow}>
            <TouchableOpacity
              style={[styles.quickBtn, isDark && styles.quickBtnDark]}
              onPress={() => setAmount(loan.remainingAmount.toString())}
            >
              <Text style={[styles.quickBtnText, isDark && { color: '#34D399' }]}>Full Amount</Text>
            </TouchableOpacity>

            {loan.remainingAmount > 100 && (
              <TouchableOpacity
                style={[styles.quickBtn, isDark && styles.quickBtnDark]}
                onPress={() => setAmount((loan.remainingAmount / 2).toFixed(2))}
              >
                <Text style={[styles.quickBtnText, isDark && { color: '#34D399' }]}>50%</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Payment Method Selector */}
          <PaymentMethodSelector
            selectedMethod={paymentMethod}
            onSelect={setPaymentMethod}
            variant={variant}
          />

          {/* Date Input */}
          <FormInput
            label="Date *"
            value={date}
            onChangeText={setDate}
            placeholder="YYYY-MM-DD"
            icon="calendar-outline"
            variant={variant}
          />

          {/* Notes Input */}
          <FormInput
            label="Notes (optional)"
            value={notes}
            onChangeText={setNotes}
            placeholder="Add notes..."
            multiline
            numberOfLines={2}
            variant={variant}
          />

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.submitBtn,
              isDark ? { backgroundColor: '#10B981' } : { backgroundColor: '#10B981' },
              (!amount || recordPayment.isPending) && styles.submitBtnDisabled,
            ]}
            onPress={handleSubmit}
            disabled={!amount || recordPayment.isPending}
            activeOpacity={0.85}
          >
            {recordPayment.isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={20} color="#fff" />
                <Text style={styles.submitBtnText}>Confirm Repayment</Text>
              </>
            )}
          </TouchableOpacity>
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
    backgroundColor: COLORS.errorContainer,
    marginHorizontal: 24,
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  errorText: { flex: 1, fontSize: 12, color: COLORS.error, fontWeight: '600' },
  formContainer: { paddingHorizontal: 24, paddingBottom: 24 },
  infoBanner: {
    backgroundColor: COLORS.surfaceContainerLow,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainer,
    alignItems: 'center',
    marginBottom: 18,
  },
  infoBannerDark: {
    backgroundColor: '#101917',
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  infoTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.outline,
    textTransform: 'uppercase',
  },
  infoPersonName: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.onSurface,
    marginTop: 2,
  },
  infoRemainingText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: COLORS.primary,
    marginTop: 4,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  currencySymbol: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.outline,
    marginRight: 6,
  },
  amountInput: {
    fontSize: 44,
    fontWeight: '800',
    color: COLORS.onSurface,
    textAlign: 'center',
    minWidth: 140,
  },
  quickBtnsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 20,
  },
  quickBtn: {
    backgroundColor: '#E6F4EA',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  quickBtnDark: {
    backgroundColor: 'rgba(52, 211, 153, 0.15)',
    borderColor: '#34D399',
  },
  quickBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#10B981',
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 18,
    marginTop: 12,
    elevation: 3,
  },
  submitBtnDisabled: { opacity: 0.5, elevation: 0 },
  submitBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
