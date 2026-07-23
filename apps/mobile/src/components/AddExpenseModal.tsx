import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, CURRENCY_SYMBOL } from '../constants/theme';
import {
  useCreateExpense,
  clientCreateExpenseSchema,
  getErrorMessage,
  type ExpenseCategory,
} from '@workspace/api';
import { DatePickerModal } from './DatePickerModal';
import { FormInput } from './FormInput';
import { AddGroupExpenseModal } from '../module/groups/components/AddGroupExpenseModal';
import { TactileButton } from './TactileButton';
import { CategoryDropdown } from '../module/groups/components/CategoryDropdown';
import { formatRupees } from '../utils/format';
import { ExpenseSuccessView } from './ExpenseSuccessView';
import { hapticFeedback } from '../utils/haptics';
import { BottomSheetModal } from './BottomSheetModal';

interface AddExpenseModalProps {
  visible: boolean;
  onClose: () => void;
  groupId?: string;
  groupName?: string;
  initialExpenseType?: 'PERSONAL' | 'GROUP';
  onSuccess?: (isWallet?: boolean) => void;
  variant?: 'light' | 'dark';
}

export function AddExpenseModal({
  visible,
  onClose,
  groupId,
  groupName,
  initialExpenseType,
  onSuccess,
  variant = 'light',
}: AddExpenseModalProps) {
  const isDark = variant === 'dark';
  const [expenseType, setExpenseType] = useState<'PERSONAL' | 'GROUP'>(
    groupId ? 'GROUP' : (initialExpenseType ?? 'PERSONAL')
  );

  const headerSwitcherWidth = 150;
  const activeTabTranslateX = React.useRef(
    new Animated.Value(expenseType === 'PERSONAL' ? 0 : (headerSwitcherWidth - 6) / 2)
  ).current;

  React.useEffect(() => {
    if (visible) {
      resetForm();
      const defaultType = groupId ? 'GROUP' : (initialExpenseType ?? 'PERSONAL');
      const initialVal = defaultType === 'PERSONAL' ? 0 : (headerSwitcherWidth - 6) / 2;
      activeTabTranslateX.setValue(initialVal);
    }
  }, [visible, groupId, initialExpenseType]);

  React.useEffect(() => {
    const targetValue = expenseType === 'PERSONAL' ? 0 : (headerSwitcherWidth - 6) / 2;
    Animated.timing(activeTabTranslateX, {
      toValue: targetValue,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [expenseType]);

  const [category, setCategory] = useState<ExpenseCategory | null>(null);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);

  const [amount, setAmount] = useState('');

  const handleAmountChange = (text: string) => {
    setErrorMessage('');
    const formatted = formatRupees(text);
    if (formatted !== null) {
      setAmount(formatted);
    }
  };

  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');

  const renderModeSwitcher = () => {
    if (groupId || initialExpenseType) return null;
    return (
      <View
        style={[
          styles.fullWidthSegmentedWrapper,
          isDark ? styles.fullWidthSegmentedDark : styles.fullWidthSegmentedLight,
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            hapticFeedback.selection();
            setExpenseType('PERSONAL');
          }}
          style={[
            styles.fullWidthTab,
            expenseType === 'PERSONAL' &&
              (isDark ? styles.fullWidthTabActiveDark : styles.fullWidthTabActiveLight),
          ]}
        >
          <Ionicons
            name="person"
            size={14}
            color={
              expenseType === 'PERSONAL'
                ? isDark
                  ? '#10B981'
                  : '#006948'
                : isDark
                  ? '#74817B'
                  : '#4B5563'
            }
          />
          <Text
            style={[
              styles.fullWidthTabText,
              expenseType === 'PERSONAL'
                ? { color: isDark ? '#10B981' : '#006948', fontWeight: '800' }
                : { color: isDark ? '#74817B' : '#4B5563' },
            ]}
          >
            Personal
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            hapticFeedback.selection();
            setExpenseType('GROUP');
          }}
          style={[
            styles.fullWidthTab,
            expenseType === 'GROUP' &&
              (isDark ? styles.fullWidthTabActiveDark : styles.fullWidthTabActiveLight),
          ]}
        >
          <Ionicons
            name="people"
            size={15}
            color={
              expenseType === 'GROUP'
                ? isDark
                  ? '#10B981'
                  : '#006948'
                : isDark
                  ? '#74817B'
                  : '#4B5563'
            }
          />
          <Text
            style={[
              styles.fullWidthTabText,
              expenseType === 'GROUP'
                ? { color: isDark ? '#10B981' : '#006948', fontWeight: '800' }
                : { color: isDark ? '#74817B' : '#4B5563' },
            ]}
          >
            Group
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderHeaderRight = () => null;

  const getLocalTodayString = () => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const [date, setDate] = useState(getLocalTodayString);
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [addedExpenseInfo, setAddedExpenseInfo] = useState<{
    amount: number;
    title: string;
    category: string;
  } | null>(null);

  const createExpense = useCreateExpense();

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
    setExpenseType(groupId ? 'GROUP' : (initialExpenseType ?? 'PERSONAL'));
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
    const parsed = parseFloat(amount.replace(/,/g, '').replace(',', '.'));

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

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      setErrorMessage('Please select a valid date (YYYY-MM-DD)');
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

  // Render AddExpenseModal form fields

  return (
    <BottomSheetModal
      visible={visible}
      onClose={handleClose}
      title={
        groupId
          ? 'Add Group Expense'
          : expenseType === 'GROUP'
            ? 'Add Group Expense'
            : 'Add Personal Expense'
      }
      variant={variant}
      headerRight={renderHeaderRight()}
      closeButtonPosition="right"
    >
      {errorMessage ? (
        <View
          style={[
            styles.errorBanner,
            isDark && {
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              borderColor: 'rgba(239, 68, 68, 0.2)',
              borderWidth: 1,
            },
          ]}
        >
          <Ionicons name="alert-circle" size={16} color={isDark ? '#EF4444' : COLORS.error} />
          <Text style={[styles.errorText, isDark && { color: '#EF4444' }]}>{errorMessage}</Text>
        </View>
      ) : null}

      {isSuccess && addedExpenseInfo ? (
        <ExpenseSuccessView
          title={addedExpenseInfo.title}
          amount={addedExpenseInfo.amount}
          category={addedExpenseInfo.category}
          onDone={handleClose}
          variant={variant}
        />
      ) : expenseType === 'GROUP' ? (
        <AddGroupExpenseModal
          visible={visible}
          onClose={handleClose}
          groupId={groupId}
          groupName={groupName}
          onSuccess={onSuccess}
          variant={variant}
          standalone={false}
          modeSwitcher={renderModeSwitcher()}
          initialAmount={amount}
          onAmountChange={setAmount}
        />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          <View style={styles.formContainer}>
            {renderModeSwitcher()}

            <View
              style={[
                styles.amountCard,
                isDark && {
                  backgroundColor: 'transparent',
                  borderColor: 'transparent',
                  borderWidth: 0,
                  padding: 0,
                  overflow: 'hidden',
                  marginTop: 8,
                },
              ]}
            >
              {isDark ? (
                <View style={{ padding: 16, width: '100%', alignItems: 'center' }}>
                  <Text style={[styles.amountLabel, { color: 'rgba(255, 255, 255, 0.65)' }]}>
                    Amount
                  </Text>
                  <View style={styles.amountRow}>
                    <Text
                      style={[styles.currencySymbol, { color: '#10B981', marginRight: 6 }]}
                      numberOfLines={1}
                    >
                      {CURRENCY_SYMBOL}
                    </Text>
                    <TextInput
                      style={[styles.amountInput, { color: '#FFFFFF' }]}
                      value={amount}
                      onChangeText={handleAmountChange}
                      placeholder="0.00"
                      placeholderTextColor="rgba(255, 255, 255, 0.55)"
                      keyboardType="decimal-pad"
                      selectionColor="#10B981"
                    />
                  </View>
                </View>
              ) : (
                <>
                  <Text style={styles.amountLabel}>Amount</Text>
                  <View style={styles.amountRow}>
                    <Text style={styles.currencySymbol} numberOfLines={1}>
                      {CURRENCY_SYMBOL}
                    </Text>
                    <TextInput
                      style={styles.amountInput}
                      value={amount}
                      onChangeText={handleAmountChange}
                      placeholder="0.00"
                      placeholderTextColor={COLORS.outlineVariant}
                      keyboardType="decimal-pad"
                      selectionColor={COLORS.primary}
                    />
                  </View>
                </>
              )}
            </View>

            <CategoryDropdown
              isOpen={isCategoryDropdownOpen}
              onToggle={handleToggleCategoryDropdown}
              category={category}
              onSelect={handleSelectCategory}
              groupId={groupId}
              variant={variant}
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
              variant={variant}
            />

            <TouchableOpacity onPress={() => setIsDatePickerVisible(true)} activeOpacity={0.8}>
              <View pointerEvents="none">
                <FormInput
                  label="Date *"
                  placeholder="YYYY-MM-DD"
                  value={date}
                  onChangeText={(t) => {
                    setErrorMessage('');
                    setDate(t);
                  }}
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

            <FormInput
              label="Notes"
              placeholder="Add more details (optional)"
              value={notes}
              onChangeText={setNotes}
              icon="create-outline"
              multiline
              numberOfLines={3}
              variant={variant}
            />

            <TactileButton
              title="Add Expense"
              icon="checkmark-circle"
              variant="emerald"
              onPress={handleSubmit}
              loading={createExpense.isPending}
              disabled={!title.trim() || !category || !amount}
              style={styles.submitBtn}
            />
          </View>
        </ScrollView>
      )}
    </BottomSheetModal>
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
  fullWidthSegmentedWrapper: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 4,
    marginTop: 12,
    marginBottom: 18,
    borderWidth: 1,
  },
  fullWidthSegmentedLight: {
    backgroundColor: '#f3f4f6',
    borderColor: '#e5e7eb',
  },
  fullWidthSegmentedDark: {
    backgroundColor: '#101917',
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  fullWidthTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  fullWidthTabActiveLight: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  fullWidthTabActiveDark: {
    backgroundColor: '#131D1A',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  fullWidthTabText: {
    fontSize: 14,
    fontWeight: '800',
  },
  amountCard: {
    padding: 16,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceContainerLow,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainer,
    marginBottom: 24,
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
    color: COLORS.outline,
    marginBottom: 2,
  },
  amountInput: {
    fontSize: 48,
    fontWeight: '800',
    color: COLORS.onSurface,
    textAlign: 'center',
    letterSpacing: -1,
    minWidth: 160,
    paddingVertical: 0,
  },
  segmentedWrapper: {
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: 14,
    padding: 4,
    marginHorizontal: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainer,
  },
  segmentedTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  segmentedTabActive: {
    backgroundColor: COLORS.primary,
  },
  segmentedText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.onSurfaceVariant,
  },
  segmentedTextActive: {
    color: '#ffffff',
    fontWeight: '700',
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
