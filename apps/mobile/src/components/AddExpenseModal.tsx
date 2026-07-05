import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
  TextInput,
  Platform,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { COLORS, CURRENCY_SYMBOL, PREDEFINED_AVATARS } from '../constants/theme';
import {
  useCreateExpense,
  clientCreateExpenseSchema,
  getErrorMessage,
  EXPENSE_CATEGORIES,
  type ExpenseCategory,
  useGroup,
  useGroups,
  useMe,
  useWallet,
} from '@workspace/api';
import { BottomSheetModal } from './BottomSheetModal';
import { FormInput } from './FormInput';

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
  initialExpenseType?: 'PERSONAL' | 'GROUP';
  onSuccess?: () => void;
}

interface SelectorGroupMember {
  userId: string;
  name: string;
  email: string;
  image: string | null;
  role: string;
}

const GroupDropdown = React.memo(function GroupDropdown({
  isOpen,
  onToggle,
  selectedGroupId,
  userGroups,
  onSelect,
}: {
  isOpen: boolean;
  onToggle: () => void;
  selectedGroupId: string | null;
  userGroups: { id: string; name: string }[];
  onSelect: (id: string) => void;
}) {
  return (
    <>
      <Text style={styles.inputLabel}>Group *</Text>
      <View style={styles.dropdownWrapper}>
        <TouchableOpacity style={styles.dropdownHeader} onPress={onToggle} activeOpacity={0.8}>
          <View style={styles.dropdownHeaderLeft}>
            {selectedGroupId ? (
              <>
                <View
                  style={[styles.dropdownHeaderIcon, { backgroundColor: COLORS.secondaryFixed }]}
                >
                  <Ionicons name="people" size={18} color={COLORS.secondary} />
                </View>
                <Text style={styles.dropdownHeaderText}>
                  {userGroups.find((g) => g.id === selectedGroupId)?.name}
                </Text>
              </>
            ) : (
              <>
                <View
                  style={[
                    styles.dropdownHeaderIcon,
                    { backgroundColor: COLORS.surfaceContainerLow },
                  ]}
                >
                  <Ionicons name="people-outline" size={18} color={COLORS.outline} />
                </View>
                <Text style={[styles.dropdownHeaderText, { color: COLORS.outlineVariant }]}>
                  Select Group
                </Text>
              </>
            )}
          </View>
          <Ionicons
            name={isOpen ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={COLORS.outline}
          />
        </TouchableOpacity>

        {isOpen && (
          <View style={styles.dropdownList}>
            {userGroups.map((grp) => {
              const isSelected = selectedGroupId === grp.id;
              return (
                <TouchableOpacity
                  key={grp.id}
                  style={[styles.dropdownItem, isSelected && styles.dropdownItemActive]}
                  onPress={() => onSelect(grp.id)}
                  activeOpacity={0.8}
                >
                  <View style={styles.dropdownItemLeft}>
                    <View
                      style={[styles.dropdownItemIcon, { backgroundColor: COLORS.secondaryFixed }]}
                    >
                      <Ionicons name="people" size={16} color={COLORS.secondary} />
                    </View>
                    <Text
                      style={[
                        styles.dropdownItemLabel,
                        isSelected && styles.dropdownItemLabelActive,
                      ]}
                    >
                      {grp.name}
                    </Text>
                  </View>
                  {isSelected && (
                    <Ionicons name="checkmark-sharp" size={18} color={COLORS.primary} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>
    </>
  );
});

const CategoryDropdown = React.memo(function CategoryDropdown({
  isOpen,
  onToggle,
  category,
  onSelect,
}: {
  isOpen: boolean;
  onToggle: () => void;
  category: ExpenseCategory | null;
  onSelect: (cat: ExpenseCategory) => void;
}) {
  return (
    <>
      <Text style={styles.inputLabel}>Category *</Text>
      <View style={styles.dropdownWrapper}>
        <TouchableOpacity style={styles.dropdownHeader} onPress={onToggle} activeOpacity={0.8}>
          <View style={styles.dropdownHeaderLeft}>
            {category ? (
              <>
                <View
                  style={[
                    styles.dropdownHeaderIcon,
                    { backgroundColor: CATEGORY_CONFIG[category].bg },
                  ]}
                >
                  <MaterialIcons
                    name={CATEGORY_CONFIG[category].icon as never}
                    size={18}
                    color={CATEGORY_CONFIG[category].color}
                  />
                </View>
                <Text style={styles.dropdownHeaderText}>{category}</Text>
              </>
            ) : (
              <>
                <View
                  style={[
                    styles.dropdownHeaderIcon,
                    { backgroundColor: COLORS.surfaceContainerLow },
                  ]}
                >
                  <Ionicons name="apps" size={18} color={COLORS.outline} />
                </View>
                <Text style={[styles.dropdownHeaderText, { color: COLORS.outlineVariant }]}>
                  Select Category
                </Text>
              </>
            )}
          </View>
          <Ionicons
            name={isOpen ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={COLORS.outline}
          />
        </TouchableOpacity>

        {isOpen && (
          <View style={styles.dropdownList}>
            {EXPENSE_CATEGORIES.map((cat) => {
              const isSelected = category === cat;
              const cfg = CATEGORY_CONFIG[cat];
              return (
                <TouchableOpacity
                  key={cat}
                  style={[styles.dropdownItem, isSelected && styles.dropdownItemActive]}
                  onPress={() => onSelect(cat)}
                  activeOpacity={0.8}
                >
                  <View style={styles.dropdownItemLeft}>
                    <View style={[styles.dropdownItemIcon, { backgroundColor: cfg.bg }]}>
                      <MaterialIcons name={cfg.icon as never} size={16} color={cfg.color} />
                    </View>
                    <Text
                      style={[
                        styles.dropdownItemLabel,
                        isSelected && styles.dropdownItemLabelActive,
                      ]}
                    >
                      {cat}
                    </Text>
                  </View>
                  {isSelected && (
                    <Ionicons name="checkmark-sharp" size={18} color={COLORS.primary} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>
    </>
  );
});

const MembersSelector = React.memo(function MembersSelector({
  groupMembers,
  sortedGroupMembers,
  splitMemberIds,
  currentUser,
  onToggleMember,
}: {
  groupMembers: SelectorGroupMember[];
  sortedGroupMembers: SelectorGroupMember[];
  splitMemberIds: string[];
  currentUser: { id: string } | null;
  onToggleMember: (userId: string) => void;
}) {
  return (
    <>
      <View style={styles.splitHeaderRow}>
        <Text style={styles.inputLabel}>Split among</Text>
        <Text style={styles.splitCount}>
          {splitMemberIds.length} / {groupMembers.length}
        </Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.membersRow}
      >
        {sortedGroupMembers.map((member) => {
          const isSelected = splitMemberIds.includes(member.userId);
          const isCurrentUser = currentUser?.id === member.userId;
          return (
            <TouchableOpacity
              key={member.userId}
              style={[
                styles.memberItem,
                isSelected && styles.memberItemActive,
                isCurrentUser && { opacity: 0.8 },
              ]}
              onPress={() => onToggleMember(member.userId)}
              activeOpacity={isCurrentUser ? 1 : 0.8}
              disabled={isCurrentUser}
            >
              <View style={styles.memberAvatarContainer}>
                <Image
                  source={{ uri: member.image || PREDEFINED_AVATARS[0] }}
                  style={styles.memberAvatar}
                />
                <View style={[styles.memberCheck, isSelected && styles.memberCheckActive]}>
                  {isSelected && <Ionicons name="checkmark" size={10} color="#fff" />}
                </View>
              </View>
              <Text
                style={[styles.memberName, isSelected && styles.memberNameActive]}
                numberOfLines={1}
              >
                {isCurrentUser ? `${member.name.split(' ')[0]} (You)` : member.name.split(' ')[0]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </>
  );
});

export function AddExpenseModal({
  visible,
  onClose,
  groupId,
  groupName,
  initialExpenseType,
  onSuccess,
}: AddExpenseModalProps) {
  // Form state
  const [expenseType, setExpenseType] = useState<'PERSONAL' | 'GROUP' | null>(
    groupId ? 'GROUP' : (initialExpenseType ?? null)
  );
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(groupId ?? null);
  const [isGroupDropdownOpen, setIsGroupDropdownOpen] = useState(false);

  const [category, setCategory] = useState<ExpenseCategory | null>(null);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);

  const [amount, setAmount] = useState('');
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [errorMessage, setErrorMessage] = useState('');

  const { data: currentUser } = useMe();

  const createExpense = useCreateExpense();

  const { data: groupsData } = useGroups();
  const userGroups = React.useMemo(() => {
    return groupsData?.pages.flatMap((page) => page.groups) ?? [];
  }, [groupsData]);

  const [hasManuallyToggled, setHasManuallyToggled] = useState(false);

  const activeGroupId = groupId || selectedGroupId || '';
  const { data: groupData, refetch: refetchGroup } = useGroup(activeGroupId);

  useEffect(() => {
    if (visible && activeGroupId) {
      refetchGroup();
    }
  }, [visible, activeGroupId, refetchGroup]);

  const groupMembers = React.useMemo(() => {
    return (groupData?.members ?? []).filter((m) => m.role !== 'invited');
  }, [groupData]);

  const { data: walletData } = useWallet(activeGroupId);
  const [useWalletBalance, setUseWalletBalance] = useState(false);

  const sortedGroupMembers = React.useMemo(() => {
    if (!currentUser || !groupMembers.length) return groupMembers;
    const self = groupMembers.find((m) => m.userId === currentUser.id);
    if (!self) return groupMembers;
    return [self, ...groupMembers.filter((m) => m.userId !== currentUser.id)];
  }, [groupMembers, currentUser]);

  const [splitMemberIds, setSplitMemberIds] = useState<string[]>([]);
  const [splitMode, setSplitMode] = useState<'equal' | 'exact'>('equal');
  const [customSplits, setCustomSplits] = useState<Record<string, string>>({});

  useEffect(() => {
    if (visible && (groupId || selectedGroupId) && groupMembers.length > 0 && !hasManuallyToggled) {
      setSplitMemberIds(groupMembers.map((m) => m.userId));
    }
  }, [visible, groupId, selectedGroupId, groupMembers, hasManuallyToggled]);

  const toggleMember = React.useCallback(
    (id: string) => {
      if (currentUser && id === currentUser.id) return; // Cannot toggle self
      setHasManuallyToggled(true);
      setSplitMemberIds((prev) => {
        const isDeselecting = prev.includes(id);
        if (isDeselecting) {
          const otherSelected = prev.filter((m) => m !== currentUser?.id && m !== id);
          if (otherSelected.length === 0) {
            return prev; // Prevent de-selection of the last remaining other member
          }
          // Clear custom split value when user is deselected
          setCustomSplits((current) => {
            const next = { ...current };
            delete next[id];
            return next;
          });
          return prev.filter((m) => m !== id);
        } else {
          return [...prev, id];
        }
      });
    },
    [currentUser]
  );

  const handleToggleGroupDropdown = React.useCallback(() => {
    setIsGroupDropdownOpen((prev) => !prev);
  }, []);

  const handleSelectGroup = React.useCallback((id: string) => {
    setSelectedGroupId(id);
    setIsGroupDropdownOpen(false);
    setSplitMemberIds([]);
    setCustomSplits({});
    setSplitMode('equal');
    setHasManuallyToggled(false);
  }, []);

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
    setSelectedGroupId(groupId ?? null);
    setIsGroupDropdownOpen(false);
    setCategory(null);
    setIsCategoryDropdownOpen(false);
    setAmount('');
    setTitle('');
    setNotes('');
    setDate(new Date().toISOString().split('T')[0]);
    setSplitMemberIds([]);
    setCustomSplits({});
    setSplitMode('equal');
    setErrorMessage('');
    setUseWalletBalance(false);
    setHasManuallyToggled(false);
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

    if (expenseType === 'GROUP') {
      if (splitMemberIds.length === 0) {
        setErrorMessage('Please select at least one member to split with');
        return;
      }
      const otherMembers = splitMemberIds.filter((id) => id !== currentUser?.id);
      if (otherMembers.length === 0) {
        setErrorMessage('A group expense must be split with at least one other member');
        return;
      }
    }

    let customSplitsPayload: { userId: string; amount: number }[] | undefined = undefined;

    if (expenseType === 'GROUP' && splitMode === 'exact') {
      const total = parsed;
      const walletDeduction =
        useWalletBalance && walletData ? Math.min(walletData.balance, total) : 0;
      const netAmountToSplit = total - walletDeduction;

      const activeMemberIds = splitMemberIds;
      const splitsArray = activeMemberIds.map((uid) => {
        const val = parseFloat(customSplits[uid]) || 0;
        return { userId: uid, amount: val };
      });

      const sumOfSplits = splitsArray.reduce((sum, s) => sum + s.amount, 0);
      const difference = Math.abs(netAmountToSplit - sumOfSplits);

      if (difference > 0.005) {
        setErrorMessage(
          `Sum of splits (₹${sumOfSplits.toFixed(2)}) must equal net expense amount (₹${netAmountToSplit.toFixed(2)})`
        );
        return;
      }

      customSplitsPayload = splitsArray;
    }

    const validation = clientCreateExpenseSchema.safeParse({
      title: title.trim(),
      amount: parsed,
      category: category as ExpenseCategory,
      date,
      notes: notes.trim() || undefined,
      groupId: expenseType === 'GROUP' ? activeGroupId || undefined : undefined,
      splitMemberIds: expenseType === 'GROUP' ? splitMemberIds : undefined,
      useWallet: expenseType === 'GROUP' ? useWalletBalance : undefined,
      splitMode: expenseType === 'GROUP' ? splitMode : undefined,
      splits: expenseType === 'GROUP' && splitMode === 'exact' ? customSplitsPayload : undefined,
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

  return (
    <BottomSheetModal
      visible={visible}
      onClose={handleClose}
      title={!expenseType ? 'Select Expense Type' : 'Add Expense'}
    >
      {expenseType === 'GROUP' && (groupId || selectedGroupId) && (
        <Text style={[styles.groupTag, { paddingHorizontal: 24, marginBottom: 8 }]}>
          📌 {groupData?.name || groupName || 'Group Expense'}
        </Text>
      )}

      {/* Error banner */}
      {errorMessage ? (
        <View style={styles.errorBanner}>
          <Ionicons name="alert-circle" size={16} color={COLORS.error} />
          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      ) : null}

      {/* Content */}
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
            {/* Amount Input */}
            <View style={styles.amountContainer}>
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
            </View>

            {/* Group Dropdown (only if not passed via props) */}
            {expenseType === 'GROUP' && !groupId && (
              <GroupDropdown
                isOpen={isGroupDropdownOpen}
                onToggle={handleToggleGroupDropdown}
                selectedGroupId={selectedGroupId}
                userGroups={userGroups}
                onSelect={handleSelectGroup}
              />
            )}

            {/* Group Wallet Toggle */}
            {expenseType === 'GROUP' && walletData && walletData.balance > 0 && (
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
            )}

            {/* Member Selector for Group Expense */}
            {expenseType === 'GROUP' && groupMembers.length > 0 && (
              <MembersSelector
                groupMembers={groupMembers as SelectorGroupMember[]}
                sortedGroupMembers={sortedGroupMembers as SelectorGroupMember[]}
                splitMemberIds={splitMemberIds}
                currentUser={currentUser as { id: string } | null}
                onToggleMember={toggleMember}
              />
            )}

            {/* Split Mode Selector (only show if group expense and members are selected) */}
            {expenseType === 'GROUP' && groupMembers.length > 0 && (
              <View style={styles.splitModeContainer}>
                <Text style={styles.inputLabel}>Split Option</Text>
                <View style={styles.splitModeToggleRow}>
                  <TouchableOpacity
                    style={[
                      styles.splitModeTab,
                      splitMode === 'equal' && styles.splitModeTabActive,
                    ]}
                    onPress={() => setSplitMode('equal')}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name="git-compare-outline"
                      size={16}
                      color={splitMode === 'equal' ? '#fff' : COLORS.onSurfaceVariant}
                    />
                    <Text
                      style={[
                        styles.splitModeTabText,
                        splitMode === 'equal' && styles.splitModeTabTextActive,
                      ]}
                    >
                      Split Equally
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.splitModeTab,
                      splitMode === 'exact' && styles.splitModeTabActive,
                    ]}
                    onPress={() => setSplitMode('exact')}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name="calculator-outline"
                      size={16}
                      color={splitMode === 'exact' ? '#fff' : COLORS.onSurfaceVariant}
                    />
                    <Text
                      style={[
                        styles.splitModeTabText,
                        splitMode === 'exact' && styles.splitModeTabTextActive,
                      ]}
                    >
                      Split Unequally
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Exact Split Input List */}
            {expenseType === 'GROUP' && splitMode === 'exact' && (
              <View style={styles.exactSplitsList}>
                <Text style={styles.inputLabel}>Custom Shares</Text>
                {sortedGroupMembers
                  .filter((member) => splitMemberIds.includes(member.userId))
                  .map((member) => {
                    const isCurrentUser = currentUser?.id === member.userId;
                    const currentValue = customSplits[member.userId] ?? '';
                    return (
                      <View key={member.userId} style={styles.exactSplitRow}>
                        <View style={styles.exactSplitMemberInfo}>
                          <Image
                            source={{ uri: member.image || PREDEFINED_AVATARS[0] }}
                            style={styles.exactSplitAvatar}
                          />
                          <Text style={styles.exactSplitName} numberOfLines={1}>
                            {isCurrentUser ? `${member.name} (You)` : member.name}
                          </Text>
                        </View>

                        <View style={styles.exactSplitInputWrapper}>
                          <Text style={styles.exactSplitCurrency}>{CURRENCY_SYMBOL}</Text>
                          <TextInput
                            style={styles.exactSplitInput}
                            keyboardType="decimal-pad"
                            placeholder="0.00"
                            placeholderTextColor={COLORS.outlineVariant}
                            value={currentValue}
                            onChangeText={(val) => {
                              // Allow only decimals
                              if (/^\d*\.?\d{0,2}$/.test(val)) {
                                setCustomSplits((prev) => ({
                                  ...prev,
                                  [member.userId]: val,
                                }));
                              }
                            }}
                          />
                        </View>
                      </View>
                    );
                  })}

                {/* Allocated sum indicator */}
                {(() => {
                  const total = parseFloat(amount.replace(',', '.')) || 0;
                  const walletDeduction =
                    useWalletBalance && walletData ? Math.min(walletData.balance, total) : 0;
                  const netAmountToSplit = total - walletDeduction;

                  const allocated = sortedGroupMembers
                    .filter((m) => splitMemberIds.includes(m.userId))
                    .reduce((sum, m) => sum + (parseFloat(customSplits[m.userId]) || 0), 0);
                  const difference = Math.abs(netAmountToSplit - allocated);
                  const isMatch = difference < 0.005;

                  if (netAmountToSplit <= 0 && useWalletBalance) {
                    return (
                      <View style={[styles.allocatedTally, styles.allocatedTallyMatch]}>
                        <Ionicons name="checkmark-circle" size={16} color="#2e7d32" />
                        <Text style={[styles.allocatedTallyText, { color: '#2e7d32' }]}>
                          Entire amount covered by wallet. No splits needed!
                        </Text>
                      </View>
                    );
                  }

                  return (
                    <View
                      style={[
                        styles.allocatedTally,
                        isMatch ? styles.allocatedTallyMatch : styles.allocatedTallyMismatch,
                      ]}
                    >
                      <Ionicons
                        name={isMatch ? 'checkmark-circle' : 'alert-circle'}
                        size={16}
                        color={isMatch ? '#2e7d32' : COLORS.error}
                      />
                      <Text
                        style={[
                          styles.allocatedTallyText,
                          { color: isMatch ? '#2e7d32' : COLORS.error },
                        ]}
                      >
                        {isMatch
                          ? `Total matched: ${CURRENCY_SYMBOL}${allocated.toFixed(2)}`
                          : `Allocated: ${CURRENCY_SYMBOL}${allocated.toFixed(2)} of ${CURRENCY_SYMBOL}${netAmountToSplit.toFixed(2)} (${netAmountToSplit > allocated ? '₹' + difference.toFixed(2) + ' left' : '₹' + difference.toFixed(2) + ' over'})`}
                      </Text>
                    </View>
                  );
                })()}
              </View>
            )}

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
              placeholder="e.g. Dinner at Taj"
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
              placeholder="Add any notes…"
              multiline
              numberOfLines={3}
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
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)' },
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
    paddingBottom: 16,
  },
  groupTag: { fontSize: 11, color: COLORS.secondary, fontWeight: '600', marginBottom: 2 },
  sheetTitle: { fontSize: 22, fontWeight: '700', color: COLORS.onSurface },
  closeBtn: { padding: 4, borderRadius: 20, backgroundColor: COLORS.surfaceContainerLow },

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
  typeBtnTextWrapper: { flex: 1 },
  typeBtnTitle: { fontSize: 17, fontWeight: '700', color: COLORS.onSurface, marginBottom: 4 },
  typeBtnSub: { fontSize: 13, color: COLORS.outline },

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

  splitHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  splitCount: { fontSize: 11, fontWeight: '600', color: COLORS.primary },
  membersRow: {
    gap: 12,
    paddingBottom: 20,
  },
  memberItem: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 64,
    gap: 6,
    opacity: 0.5,
  },
  memberItemActive: {
    opacity: 1,
  },
  memberAvatarContainer: {
    position: 'relative',
  },
  memberAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  memberCheck: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.surfaceContainerLow,
    borderWidth: 2,
    borderColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberCheckActive: {
    backgroundColor: COLORS.primary,
  },
  memberName: {
    fontSize: 12,
    color: COLORS.outline,
    fontWeight: '500',
    textAlign: 'center',
  },
  memberNameActive: {
    color: COLORS.primary,
  },
  walletToggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryContainer,
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
  },
  walletToggleIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  walletToggleInfo: {
    flex: 1,
  },
  walletToggleTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
  },
  walletToggleBalance: {
    fontSize: 13,
    color: '#ffffff',
    opacity: 0.8,
  },
  walletToggleCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  walletToggleCheckboxActive: {
    backgroundColor: COLORS.primary,
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
  dropdownHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dropdownHeaderIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropdownHeaderText: { fontSize: 15, fontWeight: '600', color: COLORS.onSurface },
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
  dropdownItemActive: { backgroundColor: COLORS.primaryFixed },
  dropdownItemLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dropdownItemIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropdownItemLabel: { fontSize: 14, fontWeight: '500', color: COLORS.onSurface },
  dropdownItemLabelActive: { color: COLORS.primary, fontWeight: '700' },

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
  inputRowMultiline: { height: 80, alignItems: 'flex-start', paddingVertical: 12 },
  inputIcon: { marginRight: 10 },
  textInput: { flex: 1, color: COLORS.onSurface, fontSize: 15, fontWeight: '500' },
  textInputMultiline: { height: '100%', textAlignVertical: 'top' },

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
  primaryBtnDisabled: { opacity: 0.5, elevation: 0 },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  submitBtn: { marginTop: 8 },

  // Split Mode Selector
  splitModeContainer: {
    marginBottom: 16,
  },
  splitModeToggleRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  splitModeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  splitModeTabActive: {
    backgroundColor: COLORS.primary,
  },
  splitModeTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.onSurfaceVariant,
  },
  splitModeTabTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },

  // Exact splits styling
  exactSplitsList: {
    marginBottom: 16,
    gap: 10,
  },
  exactSplitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surfaceContainerLow,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainer,
  },
  exactSplitMemberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  exactSplitAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  exactSplitName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.onSurface,
    flex: 1,
  },
  exactSplitInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    borderRadius: 8,
    paddingHorizontal: 8,
    backgroundColor: COLORS.surface,
    width: 100,
    height: 36,
  },
  exactSplitCurrency: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.outline,
    marginRight: 4,
  },
  exactSplitInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.onSurface,
    padding: 0,
    textAlign: 'right',
  },
  allocatedTally: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 10,
    borderRadius: 10,
    marginTop: 4,
  },
  allocatedTallyMatch: {
    backgroundColor: '#e8f5e9',
  },
  allocatedTallyMismatch: {
    backgroundColor: COLORS.errorContainer,
  },
  allocatedTallyText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
