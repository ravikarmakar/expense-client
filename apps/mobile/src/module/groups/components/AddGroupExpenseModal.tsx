import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  TextInput,
  Modal,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { COLORS, CURRENCY_SYMBOL } from '../../../constants/theme';
import { styles } from '../styles/add-expense.styles';
import { type ExpenseCategory, useAddGroupExpenseController } from '@workspace/api';
import { BottomSheetModal } from '../../../components/BottomSheetModal';
import { FormInput } from '../../../components/FormInput';
import { SplitSelector } from './SplitSelector';
import { GroupDropdown } from './GroupDropdown';
import { CategoryDropdown, CATEGORY_CONFIG } from './CategoryDropdown';
import { SkeletonLoader } from '../../../components/SkeletonLoader';

interface AddGroupExpenseModalProps {
  visible: boolean;
  onClose: () => void;
  groupId?: string;
  groupName?: string;
  onSuccess?: (isWallet?: boolean) => void;
}

export function AddGroupExpenseModal({
  visible,
  onClose,
  groupId,
  groupName,
  onSuccess,
}: AddGroupExpenseModalProps) {
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
                    const config =
                      CATEGORY_CONFIG[addedExpenseInfo.category as ExpenseCategory] ||
                      CATEGORY_CONFIG.Other;
                    return (
                      <View style={[styles.successIconBg, { backgroundColor: config.bg }]}>
                        <MaterialIcons name={config.icon as never} size={20} color={config.color} />
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

                {addedExpenseInfo.groupName && (
                  <View style={styles.successGroupRow}>
                    <Ionicons name="people" size={14} color={COLORS.outline} />
                    <Text style={styles.successGroupText} numberOfLines={1}>
                      Split in{' '}
                      <Text style={{ fontWeight: '700', color: COLORS.onSurface }}>
                        {addedExpenseInfo.groupName}
                      </Text>
                    </Text>
                  </View>
                )}
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
        <BottomSheetModal visible={visible} onClose={handleClose} title="Add Group Expense">
          {(groupId || selectedGroupId) && (
            <Text style={[styles.groupTag, { paddingHorizontal: 24, marginBottom: 8 }]}>
              📌 {groupData?.name || groupName || 'Group Expense'}
            </Text>
          )}

          {errorMessage ? (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={16} color={COLORS.error} />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

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
                />
              )}

              {(groupId || selectedGroupId) &&
                (isLoadingWallet ? (
                  <View style={[styles.walletToggleCard, { opacity: 0.8 }]}>
                    <View style={styles.walletToggleIcon}>
                      <Ionicons name="wallet" size={24} color={COLORS.outline} />
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
                        { borderColor: COLORS.surfaceContainer },
                      ]}
                    />
                  </View>
                ) : walletData && walletData.balance > 0 ? (
                  <TouchableOpacity
                    style={styles.walletToggleCard}
                    activeOpacity={0.8}
                    onPress={() => setUseWalletBalance(!useWalletBalance)}
                  >
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
                  </TouchableOpacity>
                ) : null)}

              {useWalletBalance && walletData && (parseFloat(amount) || 0) > walletData.balance && (
                <View style={styles.walletErrorRow}>
                  <Ionicons name="alert-circle" size={14} color={COLORS.error} />
                  <Text style={styles.walletErrorText}>
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
              />

              <CategoryDropdown
                isOpen={isCategoryDropdownOpen}
                onToggle={handleToggleCategoryDropdown}
                category={category}
                onSelect={handleSelectCategory}
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
                  (!title.trim() ||
                    !category ||
                    !amount ||
                    createExpense.isPending ||
                    groupMembers.length <= 1 ||
                    (useWalletBalance &&
                      walletData &&
                      (parseFloat(amount) || 0) > walletData.balance)) &&
                    styles.primaryBtnDisabled,
                ]}
                onPress={handleSubmit}
                disabled={
                  !title.trim() ||
                  !category ||
                  !amount ||
                  createExpense.isPending ||
                  groupMembers.length <= 1 ||
                  (useWalletBalance && walletData && (parseFloat(amount) || 0) > walletData.balance)
                }
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
        </BottomSheetModal>
      )}
    </>
  );
}
