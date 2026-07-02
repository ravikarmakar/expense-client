import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Animated,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { COLORS, CURRENCY_SYMBOL } from '../constants/theme';
import {
  useCreateExpense,
  clientCreateExpenseSchema,
  getErrorMessage,
  EXPENSE_CATEGORIES,
  type ExpenseCategory,
} from '@workspace/api';

// ─────────────────────────────────────────────────────
// Category config: icon + colour per category
// ─────────────────────────────────────────────────────

const CATEGORY_CONFIG: Record<ExpenseCategory, { icon: string; bg: string; color: string }> = {
  Food: { icon: 'restaurant', bg: '#fff3e0', color: '#e65100' },
  Transport: { icon: 'directions-car', bg: '#e3f2fd', color: '#1565c0' },
  Shopping: { icon: 'shopping-bag', bg: '#fce4ec', color: '#c62828' },
  Entertainment: { icon: 'movie', bg: '#f3e5f5', color: '#6a1b9a' },
  Bills: { icon: 'receipt-long', bg: '#e8f5e9', color: '#2e7d32' },
  Health: { icon: 'favorite', bg: '#ffebee', color: '#b71c1c' },
  Travel: { icon: 'flight', bg: '#e0f7fa', color: '#00695c' },
  Other: { icon: 'more-horiz', bg: '#f5f5f5', color: '#424242' },
};

interface AddExpenseModalProps {
  visible: boolean;
  onClose: () => void;
  groupId?: string;
  groupName?: string;
  onSuccess?: () => void;
}

type Step = 'CATEGORY' | 'AMOUNT' | 'DETAILS';

export function AddExpenseModal({
  visible,
  onClose,
  groupId,
  groupName,
  onSuccess,
}: AddExpenseModalProps) {
  // Step state
  const [step, setStep] = useState<Step>('CATEGORY');

  // Form state
  const [category, setCategory] = useState<ExpenseCategory | null>(null);
  const [amount, setAmount] = useState('');
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [errorMessage, setErrorMessage] = useState('');

  const createExpense = useCreateExpense();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const resetForm = () => {
    setStep('CATEGORY');
    setCategory(null);
    setAmount('');
    setTitle('');
    setNotes('');
    setDate(new Date().toISOString().split('T')[0]);
    setErrorMessage('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleCategorySelect = (cat: ExpenseCategory) => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.95, duration: 80, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start();
    setCategory(cat);
    // Pre-fill title with category name
    if (!title) setTitle(cat);
    setTimeout(() => setStep('AMOUNT'), 150);
  };

  const handleAmountNext = () => {
    const parsed = parseFloat(amount.replace(',', '.'));
    if (!amount || isNaN(parsed) || parsed <= 0) {
      setErrorMessage('Please enter a valid amount greater than 0');
      return;
    }
    setErrorMessage('');
    setStep('DETAILS');
  };

  const handleSubmit = () => {
    setErrorMessage('');
    const parsed = parseFloat(amount.replace(',', '.'));

    const validation = clientCreateExpenseSchema.safeParse({
      title: title.trim(),
      amount: parsed,
      category: category as ExpenseCategory,
      date,
      notes: notes.trim() || undefined,
      groupId: groupId ?? undefined,
    });

    if (!validation.success) {
      setErrorMessage(validation.error.issues[0].message);
      return;
    }

    createExpense.mutate(validation.data, {
      onSuccess: () => {
        Alert.alert('Success! 🎉', `₹${parsed.toFixed(2)} expense added successfully.`);
        handleClose();
        onSuccess?.();
      },
      onError: (err) => {
        setErrorMessage(getErrorMessage(err, 'Failed to add expense. Please try again.'));
      },
    });
  };

  const stepTitle = {
    CATEGORY: 'Pick a Category',
    AMOUNT: 'Enter Amount',
    DETAILS: 'Add Details',
  }[step];

  const progress = step === 'CATEGORY' ? 1 : step === 'AMOUNT' ? 2 : 3;

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={handleClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={handleClose} />

        <View style={styles.sheet}>
          {/* Drag handle */}
          <View style={styles.handle} />

          {/* Header */}
          <View style={styles.header}>
            <View>
              {groupId && <Text style={styles.groupTag}>📌 {groupName ?? 'Group Expense'}</Text>}
              <Text style={styles.sheetTitle}>{stepTitle}</Text>
            </View>
            <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={COLORS.onSurface} />
            </TouchableOpacity>
          </View>

          {/* Progress dots */}
          <View style={styles.progressRow}>
            {[1, 2, 3].map((n) => (
              <View
                key={n}
                style={[styles.progressDot, n <= progress && styles.progressDotActive]}
              />
            ))}
          </View>

          {/* Error banner */}
          {errorMessage ? (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={16} color={COLORS.error} />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          {/* ── Step 1: Category ─── */}
          {step === 'CATEGORY' && (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.categoryGrid}
            >
              {EXPENSE_CATEGORIES.map((cat) => {
                const cfg = CATEGORY_CONFIG[cat];
                const isSelected = category === cat;
                return (
                  <Animated.View key={cat} style={{ transform: [{ scale: scaleAnim }] }}>
                    <TouchableOpacity
                      style={[
                        styles.categoryCard,
                        isSelected && styles.categoryCardSelected,
                        { borderColor: isSelected ? cfg.color : COLORS.surfaceContainer },
                      ]}
                      onPress={() => handleCategorySelect(cat)}
                      activeOpacity={0.8}
                    >
                      <View style={[styles.categoryIcon, { backgroundColor: cfg.bg }]}>
                        <MaterialIcons name={cfg.icon as never} size={28} color={cfg.color} />
                      </View>
                      <Text
                        style={[
                          styles.categoryLabel,
                          isSelected && { color: cfg.color, fontWeight: '700' },
                        ]}
                      >
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  </Animated.View>
                );
              })}
            </ScrollView>
          )}

          {/* ── Step 2: Amount ─── */}
          {step === 'AMOUNT' && (
            <View style={styles.amountStep}>
              {/* Category chip */}
              {category && (
                <View
                  style={[
                    styles.selectedCategoryChip,
                    { backgroundColor: CATEGORY_CONFIG[category].bg },
                  ]}
                >
                  <MaterialIcons
                    name={CATEGORY_CONFIG[category].icon as never}
                    size={16}
                    color={CATEGORY_CONFIG[category].color}
                  />
                  <Text
                    style={[
                      styles.selectedCategoryText,
                      { color: CATEGORY_CONFIG[category].color },
                    ]}
                  >
                    {category}
                  </Text>
                </View>
              )}

              <Text style={styles.currencySymbol}>{CURRENCY_SYMBOL}</Text>
              <TextInput
                style={styles.amountInput}
                value={amount}
                onChangeText={(t) => {
                  setErrorMessage('');
                  // Allow only numbers and one decimal point
                  if (/^\d*\.?\d{0,2}$/.test(t)) setAmount(t);
                }}
                placeholder="0.00"
                placeholderTextColor={COLORS.outlineVariant}
                keyboardType="decimal-pad"
                autoFocus
              />

              <TouchableOpacity
                style={[styles.primaryBtn, !amount && styles.primaryBtnDisabled]}
                onPress={handleAmountNext}
                disabled={!amount}
                activeOpacity={0.85}
              >
                <Text style={styles.primaryBtnText}>Next →</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setStep('CATEGORY')} style={styles.backBtn}>
                <Text style={styles.backBtnText}>← Back</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ── Step 3: Details ─── */}
          {step === 'DETAILS' && (
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <View style={styles.detailsStep}>
                {/* Amount display */}
                <View style={styles.amountSummary}>
                  <Text style={styles.amountSummaryLabel}>Amount</Text>
                  <Text style={styles.amountSummaryValue}>
                    {CURRENCY_SYMBOL}
                    {parseFloat(amount || '0').toFixed(2)}
                  </Text>
                </View>

                <Text style={styles.inputLabel}>Title *</Text>
                <View style={styles.inputRow}>
                  <Ionicons
                    name="pencil-outline"
                    size={18}
                    color={COLORS.outline}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.textInput}
                    value={title}
                    onChangeText={setTitle}
                    placeholder="e.g. Dinner at Taj"
                    placeholderTextColor={COLORS.outlineVariant}
                    autoFocus
                  />
                </View>

                <Text style={styles.inputLabel}>Date</Text>
                <View style={styles.inputRow}>
                  <Ionicons
                    name="calendar-outline"
                    size={18}
                    color={COLORS.outline}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.textInput}
                    value={date}
                    onChangeText={setDate}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor={COLORS.outlineVariant}
                    keyboardType="numbers-and-punctuation"
                  />
                </View>

                <Text style={styles.inputLabel}>Notes (optional)</Text>
                <View style={[styles.inputRow, styles.inputRowMultiline]}>
                  <TextInput
                    style={[styles.textInput, styles.textInputMultiline]}
                    value={notes}
                    onChangeText={setNotes}
                    placeholder="Add any notes…"
                    placeholderTextColor={COLORS.outlineVariant}
                    multiline
                    numberOfLines={3}
                  />
                </View>

                <TouchableOpacity
                  style={[
                    styles.primaryBtn,
                    styles.submitBtn,
                    (!title.trim() || createExpense.isPending) && styles.primaryBtnDisabled,
                  ]}
                  onPress={handleSubmit}
                  disabled={!title.trim() || createExpense.isPending}
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

                <TouchableOpacity onPress={() => setStep('AMOUNT')} style={styles.backBtn}>
                  <Text style={styles.backBtnText}>← Back</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 20,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.outlineVariant,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 8,
  },
  groupTag: {
    fontSize: 11,
    color: COLORS.secondary,
    fontWeight: '600',
    marginBottom: 2,
  },
  sheetTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  closeBtn: {
    padding: 4,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceContainerLow,
  },
  progressRow: {
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 24,
    marginBottom: 12,
  },
  progressDot: {
    width: 32,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.surfaceContainer,
  },
  progressDotActive: {
    backgroundColor: COLORS.secondary,
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
  // Category grid
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 12,
    justifyContent: 'center',
  },
  categoryCard: {
    width: 80,
    alignItems: 'center',
    padding: 12,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceContainerLow,
    borderWidth: 2,
    borderColor: COLORS.surfaceContainer,
  },
  categoryCardSelected: {
    backgroundColor: COLORS.surface,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  categoryIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  categoryLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.onSurfaceVariant,
    textAlign: 'center',
  },
  // Amount step
  amountStep: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  selectedCategoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 24,
  },
  selectedCategoryText: {
    fontSize: 12,
    fontWeight: '700',
  },
  currencySymbol: {
    fontSize: 36,
    fontWeight: '700',
    color: COLORS.outline,
    marginBottom: 4,
  },
  amountInput: {
    fontSize: 56,
    fontWeight: '800',
    color: COLORS.onSurface,
    textAlign: 'center',
    letterSpacing: -1,
    minWidth: 200,
    marginBottom: 32,
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
  backBtn: {
    marginTop: 16,
    alignItems: 'center',
  },
  backBtnText: {
    fontSize: 13,
    color: COLORS.outline,
    fontWeight: '600',
  },
  // Details step
  detailsStep: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  amountSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.primaryFixed,
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
  },
  amountSummaryLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.onPrimaryFixedVariant,
  },
  amountSummaryValue: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.primary,
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
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 52,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainer,
    marginBottom: 16,
  },
  inputRowMultiline: {
    height: 80,
    alignItems: 'flex-start',
    paddingVertical: 12,
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    color: COLORS.onSurface,
    fontSize: 15,
    fontWeight: '500',
  },
  textInputMultiline: {
    height: '100%',
    textAlignVertical: 'top',
  },
  submitBtn: {
    marginTop: 8,
  },
});
