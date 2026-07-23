import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, CURRENCY_SYMBOL } from '../../../constants/theme';
import { styles } from '../styles/add-expense.styles';
import { useAddGroupExpenseController } from '@workspace/api';
import { BottomSheetModal } from '../../../components/BottomSheetModal';
import { FormInput } from '../../../components/FormInput';
import { SplitSelector } from './SplitSelector';
import { GroupDropdown } from './GroupDropdown';
import { CategoryDropdown } from './CategoryDropdown';
import { SkeletonLoader } from '../../../components/SkeletonLoader';
import { TactileButton } from '../../../components/TactileButton';
import { LinearGradient } from 'expo-linear-gradient';
import { formatRupees } from '../../../utils/format';
import { ExpenseSuccessView } from '../../../components/ExpenseSuccessView';

interface AddGroupExpenseModalProps {
  visible: boolean;
  onClose: () => void;
  groupId?: string;
  groupName?: string;
  onSuccess?: (isWallet?: boolean) => void;
  variant?: 'light' | 'dark';
  standalone?: boolean;
}

export function AddGroupExpenseModal({
  visible,
  onClose,
  groupId,
  groupName,
  onSuccess,
  variant = 'light',
  standalone = false,
}: AddGroupExpenseModalProps) {
  const isDark = variant === 'dark';
  const {
    selectedGroupId,
    isGroupDropdownOpen,
    category,
    isCategoryDropdownOpen,
    amount,
    setAmount,
    title,
    setTitle,
    notes,
    setNotes,
    date,
    setDate,
    errorMessage,
    setErrorMessage,
    isSuccess,
    addedExpenseInfo,
    currentUser,
    createExpense,
    userGroups,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isLoadingMembers,
    isLoadingWallet,
    groupData,
    walletData,
    useWalletBalance,
    setUseWalletBalance,
    groupMembers,
    sortedGroupMembers,
    splitMemberIds,
    splitMode,
    setSplitMode,
    customSplits,
    setCustomSplits,
    toggleMember,
    handleToggleGroupDropdown,
    handleSelectGroup,
    handleToggleCategoryDropdown,
    handleSelectCategory,
    handleClose,
    handleSubmit,
  } = useAddGroupExpenseController({
    visible,
    onClose,
    groupId,
    groupName,
    onSuccess,
  });

  const handleAmountChange = (text: string) => {
    setErrorMessage('');
    const formatted = formatRupees(text);
    if (formatted !== null) {
      setAmount(formatted);
    }
  };

  const renderFormContents = () => (
    <>
      {(groupId || selectedGroupId) && (
        <Text
          style={[
            styles.groupTag,
            { paddingHorizontal: 24, marginBottom: 8 },
            isDark && { color: '#10B981' },
          ]}
        >
          📌 {groupData?.name || groupName || 'Group Expense'}
        </Text>
      )}

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

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View style={styles.formContainer}>
          <View
            style={[
              localStyles.amountCard,
              isDark && {
                backgroundColor: 'transparent',
                borderColor: 'transparent',
                borderWidth: 0,
                padding: 0,
                overflow: 'hidden',
                marginTop: 16,
              },
            ]}
          >
            {isDark ? (
              <View style={{ padding: 16, width: '100%', alignItems: 'center' }}>
                <Text style={[localStyles.amountLabel, { color: 'rgba(255, 255, 255, 0.65)' }]}>
                  Amount
                </Text>
                <View style={localStyles.amountRow}>
                  <Text
                    style={[localStyles.currencySymbol, { color: '#10B981', marginRight: 6 }]}
                    numberOfLines={1}
                  >
                    {CURRENCY_SYMBOL}
                  </Text>
                  <TextInput
                    style={[localStyles.amountInput, { color: '#FFFFFF' }]}
                    value={amount}
                    onChangeText={handleAmountChange}
                    placeholder="0.00"
                    placeholderTextColor="rgba(255, 255, 255, 0.55)"
                    keyboardType="decimal-pad"
                    autoFocus
                    selectionColor="#10B981"
                  />
                </View>
              </View>
            ) : (
              <>
                <Text style={localStyles.amountLabel}>Amount</Text>
                <View style={localStyles.amountRow}>
                  <Text style={localStyles.currencySymbol} numberOfLines={1}>
                    {CURRENCY_SYMBOL}
                  </Text>
                  <TextInput
                    style={localStyles.amountInput}
                    value={amount}
                    onChangeText={handleAmountChange}
                    placeholder="0.00"
                    placeholderTextColor={COLORS.outlineVariant}
                    keyboardType="decimal-pad"
                    autoFocus
                    selectionColor={COLORS.primary}
                  />
                </View>
              </>
            )}
          </View>

          {!groupId && (
            <GroupDropdown
              isOpen={isGroupDropdownOpen}
              onToggle={handleToggleGroupDropdown}
              selectedGroupId={selectedGroupId}
              userGroups={userGroups}
              onSelect={handleSelectGroup}
              selectedGroupName={groupData?.name || groupName}
              fetchNextPage={fetchNextPage}
              hasNextPage={hasNextPage}
              isFetchingNextPage={isFetchingNextPage}
              isLoading={isLoading}
              variant={variant}
            />
          )}

          {(groupId || selectedGroupId) &&
            (isLoadingWallet ? (
              <View
                style={[
                  styles.walletToggleCard,
                  { opacity: 0.8 },
                  isDark && {
                    backgroundColor: '#131D1A',
                    borderWidth: 1,
                    borderColor: 'rgba(255, 255, 255, 0.08)',
                  },
                ]}
              >
                <View style={[styles.walletToggleIcon, isDark && { backgroundColor: '#101917' }]}>
                  <Ionicons name="wallet" size={24} color={isDark ? '#74817B' : COLORS.outline} />
                </View>
                <View style={styles.walletToggleInfo}>
                  <SkeletonLoader
                    width={140}
                    height={16}
                    borderRadius={4}
                    style={{ marginBottom: 6 }}
                  />
                  <SkeletonLoader width={90} height={12} borderRadius={4} />
                </View>
                <View
                  style={[
                    styles.walletToggleCheckbox,
                    { borderColor: isDark ? '#74817B' : COLORS.surfaceContainer },
                  ]}
                />
              </View>
            ) : walletData && walletData.balance > 0 ? (
              <TouchableOpacity
                style={[
                  styles.walletToggleCard,
                  isDark && {
                    backgroundColor: 'transparent',
                    borderWidth: 1,
                    borderColor: useWalletBalance
                      ? 'rgba(16, 185, 129, 0.3)'
                      : 'rgba(255, 255, 255, 0.08)',
                    padding: 0,
                    overflow: 'hidden',
                  },
                ]}
                activeOpacity={0.8}
                onPress={() => setUseWalletBalance(!useWalletBalance)}
              >
                {isDark ? (
                  <LinearGradient
                    colors={
                      useWalletBalance
                        ? ['rgba(16, 185, 129, 0.16)', 'rgba(5, 150, 105, 0.04)']
                        : ['rgba(34, 48, 40, 0.85)', 'rgba(20, 30, 24, 0.95)']
                    }
                    start={{ x: 0.5, y: 0 }}
                    end={{ x: 0.5, y: 1 }}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      padding: 14,
                      width: '100%',
                    }}
                  >
                    <View style={styles.walletToggleIcon}>
                      <Ionicons
                        name="wallet"
                        size={24}
                        color={useWalletBalance ? '#10B981' : '#74817B'}
                      />
                    </View>
                    <View style={styles.walletToggleInfo}>
                      <Text style={[styles.walletToggleTitle, { color: '#FFFFFF' }]}>
                        Pay from Group Wallet
                      </Text>
                      <Text style={[styles.walletToggleBalance, { color: '#74817B' }]}>
                        Balance: {CURRENCY_SYMBOL}
                        {walletData.balance.toFixed(2)}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.walletToggleCheckbox,
                        { borderColor: '#74817B' },
                        useWalletBalance && { backgroundColor: '#10B981', borderColor: '#10B981' },
                      ]}
                    >
                      {useWalletBalance && <Ionicons name="checkmark" size={16} color="#fff" />}
                    </View>
                  </LinearGradient>
                ) : (
                  <>
                    <View style={styles.walletToggleIcon}>
                      <Ionicons name="wallet" size={24} color={COLORS.primary} />
                    </View>
                    <View style={styles.walletToggleInfo}>
                      <Text style={styles.walletToggleTitle}>Pay from Group Wallet</Text>
                      <Text style={styles.walletToggleBalance}>
                        Balance: {CURRENCY_SYMBOL}
                        {walletData.balance.toFixed(2)}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.walletToggleCheckbox,
                        useWalletBalance && styles.walletToggleCheckboxActive,
                      ]}
                    >
                      {useWalletBalance && <Ionicons name="checkmark" size={16} color="#fff" />}
                    </View>
                  </>
                )}
              </TouchableOpacity>
            ) : null)}

          {useWalletBalance && walletData && (parseFloat(amount) || 0) > walletData.balance && (
            <View style={styles.walletErrorRow}>
              <Ionicons name="alert-circle" size={14} color={isDark ? '#EF4444' : COLORS.error} />
              <Text style={[styles.walletErrorText, isDark && { color: '#EF4444' }]}>
                Amount exceeds wallet balance (₹{walletData.balance.toFixed(2)})
              </Text>
            </View>
          )}

          <SplitSelector
            groupMembers={groupMembers}
            sortedGroupMembers={sortedGroupMembers}
            splitMemberIds={splitMemberIds}
            currentUser={currentUser}
            onToggleMember={toggleMember}
            splitMode={splitMode}
            setSplitMode={setSplitMode}
            customSplits={customSplits}
            setCustomSplits={setCustomSplits}
            amount={amount}
            useWalletBalance={useWalletBalance}
            walletData={walletData}
            setErrorMessage={setErrorMessage}
            isLoading={isLoadingMembers}
            variant={variant}
          />

          <CategoryDropdown
            isOpen={isCategoryDropdownOpen}
            onToggle={handleToggleCategoryDropdown}
            category={category}
            onSelect={handleSelectCategory}
            groupId={(groupId || selectedGroupId) ?? undefined}
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
          />

          <TactileButton
            title="Add Expense"
            icon="checkmark-circle"
            variant="emerald"
            onPress={handleSubmit}
            loading={createExpense.isPending}
            disabled={
              !title.trim() ||
              !category ||
              !amount ||
              groupMembers.length <= 1 ||
              !!(useWalletBalance && walletData && (parseFloat(amount) || 0) > walletData.balance)
            }
            style={styles.submitBtn}
          />
        </View>
      </ScrollView>
    </>
  );

  if (standalone) {
    if (isSuccess && addedExpenseInfo) {
      return (
        <BottomSheetModal
          visible={visible}
          onClose={handleClose}
          title="Add Group Expense"
          variant={variant}
        >
          <ExpenseSuccessView
            title={addedExpenseInfo.title}
            amount={addedExpenseInfo.amount}
            category={addedExpenseInfo.category}
            groupName={addedExpenseInfo.groupName}
            onDone={handleClose}
            variant={variant}
          />
        </BottomSheetModal>
      );
    }
    return (
      <BottomSheetModal
        visible={visible}
        onClose={handleClose}
        title="Add Group Expense"
        variant={variant}
      >
        {renderFormContents()}
      </BottomSheetModal>
    );
  }

  // Non-standalone (inline) mode: render success view or form contents directly
  if (isSuccess && addedExpenseInfo) {
    return (
      <ExpenseSuccessView
        title={addedExpenseInfo.title}
        amount={addedExpenseInfo.amount}
        category={addedExpenseInfo.category}
        groupName={addedExpenseInfo.groupName}
        onDone={handleClose}
        variant={variant}
      />
    );
  }

  return renderFormContents();
}

const localStyles = StyleSheet.create({
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
    marginRight: 6,
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
});
