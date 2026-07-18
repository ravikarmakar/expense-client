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
import {
  useUpdateExpense,
  clientUpdateExpenseSchema,
  getErrorMessage,
  type ExpenseCategory,
  type Expense,
} from '@workspace/api';
import { BottomSheetModal } from './BottomSheetModal';
import { FormInput } from './FormInput';
import { CategoryDropdown } from '../module/groups/components/CategoryDropdown';

interface EditExpenseModalProps {
  visible: boolean;
  onClose: () => void;
  expense: Expense;
  onSuccess?: () => void;
}

export function EditExpenseModal({ visible, onClose, expense, onSuccess }: EditExpenseModalProps) {
  const [category, setCategory] = useState<ExpenseCategory>(expense.category);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);

  const [amount, setAmount] = useState(() => expense.amount.toString());
  const [title, setTitle] = useState(() => expense.title);
  const [notes, setNotes] = useState(() => expense.notes || '');
  const [date, setDate] = useState(() => expense.date);
  const [errorMessage, setErrorMessage] = useState('');

  const updateExpense = useUpdateExpense();

  // Reset fields when the expense prop changes or modal becomes visible
  useEffect(() => {
    if (visible && expense) {
      setCategory(expense.category);
      setAmount(expense.amount.toString());
      setTitle(expense.title);
      setNotes(expense.notes || '');
      setDate(expense.date);
      setErrorMessage('');
    }
  }, [visible, expense]);

  const handleToggleCategoryDropdown = React.useCallback(() => {
    setIsCategoryDropdownOpen((prev) => !prev);
  }, []);

  const handleSelectCategory = React.useCallback((cat: ExpenseCategory) => {
    setCategory(cat);
    setIsCategoryDropdownOpen(false);
  }, []);

  const handleSubmit = () => {
    setErrorMessage('');
    const parsed = parseFloat(amount.replace(',', '.'));

    if (!amount || isNaN(parsed) || parsed <= 0) {
      setErrorMessage('Please enter a valid amount greater than 0');
      return;
    }

    if (!category) {
      setErrorMessage('Please pick a category');
      return;
    }

    if (!title.trim()) {
      setErrorMessage('Title is required');
      return;
    }

    const validation = clientUpdateExpenseSchema.safeParse({
      title: title.trim(),
      amount: parsed,
      category,
      date,
      notes: notes.trim() || undefined,
    });

    if (!validation.success) {
      setErrorMessage(validation.error.issues[0].message);
      return;
    }

    updateExpense.mutate(
      {
        id: expense.id,
        ...validation.data,
      },
      {
        onSuccess: () => {
          Alert.alert('Success! 🎉', 'Expense updated successfully.');
          onClose();
          onSuccess?.();
        },
        onError: (err) => {
          setErrorMessage(getErrorMessage(err, 'Failed to update expense. Please try again.'));
        },
      }
    );
  };

  return (
    <BottomSheetModal visible={visible} onClose={onClose} title="Edit Expense">
      {errorMessage ? (
        <View style={styles.errorBanner}>
          <Ionicons name="alert-circle" size={16} color={COLORS.error} />
          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      ) : null}

      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.formContainer}>
          {/* Amount Input */}
          <View style={styles.amountContainer}>
            <Text style={styles.currencySymbol}>{CURRENCY_SYMBOL}</Text>
            <TextInput
              style={styles.amountInput}
              value={amount}
              onChangeText={(t) => {
                setErrorMessage('');
                if (/^\d*\.?\d{0,2}$/.test(t)) setAmount(t);
              }}
              placeholder="0.00"
              placeholderTextColor={COLORS.outlineVariant}
              keyboardType="decimal-pad"
            />
          </View>

          {/* Category Dropdown */}
          <CategoryDropdown
            isOpen={isCategoryDropdownOpen}
            onToggle={handleToggleCategoryDropdown}
            category={category}
            onSelect={handleSelectCategory}
          />

          <FormInput
            label="Title *"
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. Dinner"
            icon="pencil-outline"
          />

          <FormInput
            label="Date"
            value={date}
            onChangeText={setDate}
            placeholder="YYYY-MM-DD"
            icon="calendar-outline"
            keyboardType="numbers-and-punctuation"
          />

          <FormInput
            label="Notes (optional)"
            value={notes}
            onChangeText={setNotes}
            placeholder="Add notes…"
            multiline
            numberOfLines={3}
          />

          <TouchableOpacity
            style={[
              styles.primaryBtn,
              styles.submitBtn,
              (!title.trim() || !category || !amount || updateExpense.isPending) &&
                styles.primaryBtnDisabled,
            ]}
            onPress={handleSubmit}
            disabled={!title.trim() || !category || !amount || updateExpense.isPending}
            activeOpacity={0.85}
          >
            {updateExpense.isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={20} color="#fff" />
                <Text style={[styles.primaryBtnText, { marginLeft: 8 }]}>Save Changes</Text>
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
  formContainer: { paddingHorizontal: 24, paddingBottom: 20 },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  currencySymbol: {
    fontSize: 36,
    fontWeight: '700',
    color: COLORS.outline,
    marginBottom: 4,
    marginRight: 8,
  },
  amountInput: {
    fontSize: 56,
    fontWeight: '800',
    color: COLORS.onSurface,
    textAlign: 'center',
    letterSpacing: -1,
    minWidth: 160,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.outline,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
    marginLeft: 4,
  },
  dropdownWrapper: {
    marginBottom: 20,
  },
  dropdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surfaceContainerLow,
    height: 52,
    borderRadius: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainer,
  },
  dropdownHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dropdownHeaderIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropdownHeaderText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.onSurface,
  },
  dropdownList: {
    marginTop: 6,
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainer,
    padding: 6,
    gap: 4,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  dropdownItemActive: {
    backgroundColor: COLORS.surfaceContainer,
  },
  dropdownItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dropdownItemIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropdownItemLabel: {
    fontSize: 14,
    color: COLORS.onSurfaceVariant,
    fontWeight: '500',
  },
  dropdownItemLabelActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 20,
    width: '100%',
    elevation: 4,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  primaryBtnDisabled: { opacity: 0.5, elevation: 0 },
  primaryBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  submitBtn: {
    marginTop: 16,
  },
});
