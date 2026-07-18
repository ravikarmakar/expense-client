import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  TextInput,
  Modal,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { COLORS, CURRENCY_SYMBOL } from '../constants/theme';
import {
  useCreateExpense,
  clientCreateExpenseSchema,
  getErrorMessage,
  useCategories,
  type ExpenseCategory,
} from '@workspace/api';
import { BottomSheetModal } from './BottomSheetModal';
import { FormInput } from './FormInput';
import { AddGroupExpenseModal } from '../module/groups/components/AddGroupExpenseModal';
import { CategoryDropdown } from '../module/groups/components/CategoryDropdown';
import { getCategoryVisuals } from '../constants/categories';

interface AddExpenseModalProps {
  visible: boolean;
  onClose: () => void;
  groupId?: string;
  groupName?: string;
  initialExpenseType?: 'PERSONAL' | 'GROUP';
  onSuccess?: (isWallet?: boolean) => void;
}

export function AddExpenseModal({
  visible,
  onClose,
  groupId,
  groupName,
  initialExpenseType,
  onSuccess,
}: AddExpenseModalProps) {
  const [expenseType, setExpenseType] = useState<'PERSONAL' | 'GROUP' | null>(
    groupId ? 'GROUP' : (initialExpenseType ?? null)
  );

  const [category, setCategory] = useState<ExpenseCategory | null>(null);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);

  const [amount, setAmount] = useState('');
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');

  const getLocalTodayString = () => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const [date, setDate] = useState(getLocalTodayString);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [addedExpenseInfo, setAddedExpenseInfo] = useState<{
    amount: number;
    title: string;
    category: string;
  } | null>(null);

  const createExpense = useCreateExpense();
  const { data: categoriesData } = useCategories();

  const handleToggleCategoryDropdown = React.useCallback(() => {
    setIsCategoryDropdownOpen((prev) => !prev);
  }, []);

  const handleSelectCategory = React.useCallback(
    (cat: ExpenseCategory) => {
      setCategory(cat);
      setIsCategoryDropdownOpen(false);
      if (!title) setTitle(cat);
    },
    [title]
  );

  const resetForm = () => {
    setExpenseType(groupId ? 'GROUP' : (initialExpenseType ?? null));
    setCategory(null);
    setIsCategoryDropdownOpen(false);
    setAmount('');
    setTitle('');
    setNotes('');
    setDate(getLocalTodayString());
    setErrorMessage('');
    setIsSuccess(false);
    setAddedExpenseInfo(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

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

    const validation = clientCreateExpenseSchema.safeParse({
      title: title.trim(),
      amount: parsed,
      category: category as ExpenseCategory,
      date,
      notes: notes.trim() || undefined,
    });

    if (!validation.success) {
      setErrorMessage(validation.error.issues[0].message);
      return;
    }

    createExpense.mutate(validation.data, {
      onSuccess: () => {
        setAddedExpenseInfo({
          amount: parsed,
          title: title.trim(),
          category: category as string,
        });
        setIsSuccess(true);
        onSuccess?.(false);
      },
      onError: (err) => {
        setErrorMessage(getErrorMessage(err, 'Failed to add expense. Please try again.'));
      },
    });
  };

  // Delegate rendering to AddGroupExpenseModal if in GROUP mode
  if (expenseType === 'GROUP' || groupId || initialExpenseType === 'GROUP') {
    return (
      <AddGroupExpenseModal
        visible={visible}
        onClose={() => {
          setExpenseType(null);
          onClose();
        }}
        groupId={groupId}
        groupName={groupName}
        onSuccess={onSuccess}
      />
    );
  }

  return (
    <>
      {isSuccess && addedExpenseInfo ? (
        <Modal
          visible={visible}
          transparent
          animationType="fade"
          onRequestClose={handleClose}
          statusBarTranslucent={true}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.successDialog}>
              <View style={styles.successBadge}>
                <Ionicons name="checkmark-circle" size={72} color={COLORS.primary} />
              </View>

              <Text style={styles.successTitle}>Expense Added!</Text>
              <Text style={styles.successSubtitle}>
                Your transaction has been recorded successfully.
              </Text>

              <View style={styles.successCard}>
                <View style={styles.successCardRow}>
                  {(() => {
                    const customCategories = categoriesData?.custom || [];
                    const config = getCategoryVisuals(addedExpenseInfo.category, customCategories);
                    return (
                      <View style={[styles.successIconBg, { backgroundColor: config.bg }]}>
                        {config.lib === 'Ionicons' ? (
                          <Ionicons name={config.icon as never} size={20} color={config.color} />
                        ) : (
                          <MaterialIcons
                            name={config.icon as never}
                            size={20}
                            color={config.color}
                          />
                        )}
                      </View>
                    );
                  })()}
                  <View style={{ flex: 1 }}>
                    <Text style={styles.successExpenseTitle} numberOfLines={1}>
                      {addedExpenseInfo.title}
                    </Text>
                    <Text style={styles.successExpenseCategory}>{addedExpenseInfo.category}</Text>
                  </View>
                  <Text style={styles.successExpenseAmount}>
                    {CURRENCY_SYMBOL}
                    {addedExpenseInfo.amount.toFixed(2)}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.successButton}
                onPress={handleClose}
                activeOpacity={0.8}
              >
                <Text style={styles.successButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      ) : (
        <BottomSheetModal
          visible={visible}
          onClose={handleClose}
          title={!expenseType ? 'Select Expense Type' : 'Add Expense'}
        >
          {errorMessage ? (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={16} color={COLORS.error} />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          {!expenseType ? (
            <View style={styles.typeSelectionContainer}>
              <TouchableOpacity
                style={styles.typeBtn}
                onPress={() => setExpenseType('PERSONAL')}
                activeOpacity={0.8}
              >
                <View style={[styles.typeIconBg, { backgroundColor: COLORS.primaryFixed }]}>
                  <Ionicons name="person" size={28} color={COLORS.primary} />
                </View>
                <View style={styles.typeBtnTextWrapper}>
                  <Text style={styles.typeBtnTitle}>Personal Expense</Text>
                  <Text style={styles.typeBtnSub}>Just for you, not shared.</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color={COLORS.outline} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.typeBtn}
                onPress={() => setExpenseType('GROUP')}
                activeOpacity={0.8}
              >
                <View style={[styles.typeIconBg, { backgroundColor: COLORS.secondaryFixed }]}>
                  <Ionicons name="people" size={28} color={COLORS.secondary} />
                </View>
                <View style={styles.typeBtnTextWrapper}>
                  <Text style={styles.typeBtnTitle}>Group Expense</Text>
                  <Text style={styles.typeBtnSub}>Split with friends or family.</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color={COLORS.outline} />
              </TouchableOpacity>
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <View style={styles.formContainer}>
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
                    autoFocus
                  />
                </View>

                <CategoryDropdown
                  isOpen={isCategoryDropdownOpen}
                  onToggle={handleToggleCategoryDropdown}
                  category={category}
                  onSelect={handleSelectCategory}
                  groupId={groupId}
                />

                <FormInput
                  label="Title *"
                  placeholder="What was this expense for?"
                  value={title}
                  onChangeText={(t) => {
                    setErrorMessage('');
                    setTitle(t);
                  }}
                  icon="document-text-outline"
                />

                <FormInput
                  label="Notes"
                  placeholder="Add more details (optional)"
                  value={notes}
                  onChangeText={setNotes}
                  icon="create-outline"
                  multiline
                  numberOfLines={3}
                />

                <FormInput
                  label="Date *"
                  placeholder="YYYY-MM-DD"
                  value={date}
                  onChangeText={(t) => {
                    setErrorMessage('');
                    setDate(t);
                  }}
                  icon="calendar-outline"
                />

                <TouchableOpacity
                  style={[
                    styles.primaryBtn,
                    styles.submitBtn,
                    (!title.trim() || !category || !amount || createExpense.isPending) &&
                      styles.primaryBtnDisabled,
                  ]}
                  onPress={handleSubmit}
                  disabled={!title.trim() || !category || !amount || createExpense.isPending}
                  activeOpacity={0.85}
                >
                  {createExpense.isPending ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <>
                      <Ionicons name="checkmark-circle" size={20} color="#fff" />
                      <Text style={[styles.primaryBtnText, { marginLeft: 8 }]}>Add Expense</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}
        </BottomSheetModal>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  successDialog: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  successBadge: {
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.onSurface,
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 14,
    color: COLORS.outline,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 16,
    lineHeight: 20,
    fontWeight: '500',
  },
  successCard: {
    width: '100%',
    backgroundColor: COLORS.surfaceContainerLow,
    borderWidth: 1.5,
    borderColor: COLORS.surfaceContainer,
    borderRadius: 20,
    padding: 16,
    marginBottom: 32,
    gap: 12,
  },
  successCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  successIconBg: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successExpenseTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  successExpenseCategory: {
    fontSize: 12,
    color: COLORS.outline,
    marginTop: 2,
    fontWeight: '500',
  },
  successExpenseAmount: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.onSurface,
  },
  successButton: {
    width: '100%',
    height: 52,
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
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
  errorText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.error,
    fontWeight: '600',
  },
  typeSelectionContainer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 32,
    gap: 16,
  },
  typeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceContainerLow,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainer,
  },
  typeIconBg: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  typeBtnTextWrapper: {
    flex: 1,
  },
  typeBtnTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.onSurface,
    marginBottom: 4,
  },
  typeBtnSub: {
    fontSize: 13,
    color: COLORS.outline,
  },
  formContainer: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
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
  dropdownWrapper: {
    marginBottom: 16,
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainer,
    overflow: 'hidden',
  },
  dropdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 52,
    paddingHorizontal: 14,
  },
  dropdownHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dropdownHeaderIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropdownHeaderText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.onSurface,
  },
  dropdownList: {
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceContainer,
    backgroundColor: COLORS.surface,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceContainerLow,
  },
  dropdownItemActive: {
    backgroundColor: COLORS.primaryFixed,
  },
  dropdownItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dropdownItemIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropdownItemLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.onSurface,
  },
  dropdownItemLabelActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.outline,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
    marginLeft: 4,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 20,
    width: '100%',
    elevation: 4,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  primaryBtnDisabled: {
    opacity: 0.5,
    elevation: 0,
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  submitBtn: {
    marginTop: 8,
  },
});
