import { useState, useCallback, useReducer, useMemo, useEffect } from 'react';
import { useCreateExpense } from '../expenses/expense.hooks';
import { useWallet } from '../wallet/wallet.hooks';
import { clientCreateExpenseSchema } from '../expenses/expense.validation';
import { type ExpenseCategory } from '../expenses/expense.types';
import { useMe } from '../auth/auth.hooks';
import {
  useGroupDetail,
  useAddMember,
  useSearchUsers,
  useLeaveGroup,
  useDeactivateGroup,
  useSendReminder,
  useGroup,
  useCreateGroup,
  useGroups,
  useGroupBalances,
  useActivateGroup,
} from './group.hooks';
import { useSettleUp } from '../settlements/settlements.hooks';
import { getErrorMessage } from '../auth/auth.api';
import { type GroupMember, type GroupType, GroupRole } from './group.types';
import { clientCreateGroupSchema } from './group.validation';

interface GroupDetailControllerConfig {
  groupId: string;
  onSettleUpSuccess?: () => void;
  onSettleUpError?: (error: string) => void;
  onLeaveGroupSuccess?: () => void;
  onLeaveGroupError?: (error: string) => void;
  onDeactivateGroupSuccess?: () => void;
  onDeactivateGroupError?: (error: string) => void;
  onActivateGroupSuccess?: () => void;
  onActivateGroupError?: (error: string) => void;
  onSendReminderSuccess?: (memberName: string) => void;
  onSendReminderError?: (error: string) => void;
}

/**
 * Query hook to manage data fetching and status calculations for GroupDetailScreen
 */
export function useGroupDetailQuery(groupId: string) {
  const { data: user } = useMe();
  const { data: detailData, isLoading, isError, refetch, isFetching } = useGroupDetail(groupId);

  const group = detailData?.group;
  const expenses = detailData?.expenses ?? [];
  const myBalance = group?.myBalance ?? 0;
  const isAdmin = group?.members.find((m) => m.userId === user?.id)?.role === GroupRole.ADMIN;
  const isFullySettled = group?.members.every((m) => Math.abs(m.balance ?? 0) < 0.01) ?? true;

  return {
    user,
    group,
    expenses,
    myBalance,
    isAdmin,
    isFullySettled,
    isLoading,
    isError,
    isFetching,
    refetch,
  };
}

/**
 * UI State hook to manage modal visibility, tab selection, and user interaction states
 */
export function useGroupDetailUi() {
  const initialState = {
    activeTab: 'expenses' as 'expenses' | 'settlements',
    isRefreshing: false,
    addExpenseVisible: false,
    editGroupVisible: false,
    menuVisible: false,
    settlingUserId: null as string | null,
    settleModalVisible: false,
    settleMember: null as GroupMember | null,
    settleAmount: '',
  };

  type State = typeof initialState;
  type Action =
    | { type: 'SET_ACTIVE_TAB'; payload: 'expenses' | 'settlements' }
    | { type: 'SET_REFRESHING'; payload: boolean }
    | { type: 'SET_ADD_EXPENSE_VISIBLE'; payload: boolean }
    | { type: 'SET_EDIT_GROUP_VISIBLE'; payload: boolean }
    | { type: 'SET_MENU_VISIBLE'; payload: boolean }
    | { type: 'SET_SETTLING_USER_ID'; payload: string | null }
    | { type: 'SET_SETTLE_MODAL_VISIBLE'; payload: boolean }
    | { type: 'SET_SETTLE_MEMBER'; payload: GroupMember | null }
    | { type: 'SET_SETTLE_AMOUNT'; payload: string };

  const reducer = (state: State, action: Action): State => {
    switch (action.type) {
      case 'SET_ACTIVE_TAB':
        return { ...state, activeTab: action.payload };
      case 'SET_REFRESHING':
        return { ...state, isRefreshing: action.payload };
      case 'SET_ADD_EXPENSE_VISIBLE':
        return { ...state, addExpenseVisible: action.payload };
      case 'SET_EDIT_GROUP_VISIBLE':
        return { ...state, editGroupVisible: action.payload };
      case 'SET_MENU_VISIBLE':
        return { ...state, menuVisible: action.payload };
      case 'SET_SETTLING_USER_ID':
        return { ...state, settlingUserId: action.payload };
      case 'SET_SETTLE_MODAL_VISIBLE':
        return { ...state, settleModalVisible: action.payload };
      case 'SET_SETTLE_MEMBER':
        return { ...state, settleMember: action.payload };
      case 'SET_SETTLE_AMOUNT':
        return { ...state, settleAmount: action.payload };
      default:
        return state;
    }
  };

  const [state, dispatch] = useReducer(reducer, initialState);

  return {
    state,
    setActiveTab: (tab: 'expenses' | 'settlements') =>
      dispatch({ type: 'SET_ACTIVE_TAB', payload: tab }),
    setIsRefreshing: (val: boolean) => dispatch({ type: 'SET_REFRESHING', payload: val }),
    setAddExpenseVisible: (val: boolean) =>
      dispatch({ type: 'SET_ADD_EXPENSE_VISIBLE', payload: val }),
    setEditGroupVisible: (val: boolean) =>
      dispatch({ type: 'SET_EDIT_GROUP_VISIBLE', payload: val }),
    setMenuVisible: (val: boolean) => dispatch({ type: 'SET_MENU_VISIBLE', payload: val }),
    setSettlingUserId: (id: string | null) =>
      dispatch({ type: 'SET_SETTLING_USER_ID', payload: id }),
    setSettleModalVisible: (val: boolean) =>
      dispatch({ type: 'SET_SETTLE_MODAL_VISIBLE', payload: val }),
    setSettleMember: (m: GroupMember | null) => dispatch({ type: 'SET_SETTLE_MEMBER', payload: m }),
    setSettleAmount: (val: string) => dispatch({ type: 'SET_SETTLE_AMOUNT', payload: val }),
  };
}

export interface GroupDetailActionsConfig extends GroupDetailControllerConfig {
  setSettleMember: (m: GroupMember | null) => void;
  setSettleAmount: (val: string) => void;
  setSettleModalVisible: (val: boolean) => void;
  setSettlingUserId: (id: string | null) => void;
  settleAmount: string;
  settleMember: GroupMember | null;
}

/**
 * Action/Mutation hook to manage server mutations and user actions (settlements, reminders, deactivations)
 */
export function useGroupDetailActions({
  groupId,
  onSettleUpSuccess,
  onSettleUpError,
  onLeaveGroupSuccess,
  onLeaveGroupError,
  onDeactivateGroupSuccess,
  onDeactivateGroupError,
  onActivateGroupSuccess,
  onActivateGroupError,
  onSendReminderSuccess,
  onSendReminderError,
  setSettleMember,
  setSettleAmount,
  setSettleModalVisible,
  setSettlingUserId,
  settleAmount,
  settleMember,
}: GroupDetailActionsConfig) {
  const settleUp = useSettleUp(groupId);
  const leaveGroup = useLeaveGroup();
  const deactivateGroup = useDeactivateGroup();
  const activateGroup = useActivateGroup();
  const sendReminder = useSendReminder(groupId);

  const handleSendReminder = (member: GroupMember) => {
    sendReminder.mutate(member.userId, {
      onSuccess: () => {
        onSendReminderSuccess?.(member.name);
      },
      onError: (err) => {
        onSendReminderError?.(getErrorMessage(err, 'Please try again.'));
      },
    });
  };

  const handleSettleUp = (member: GroupMember) => {
    if (!member.balance) return;
    setSettleMember(member);
    setSettleAmount(Math.abs(member.balance).toFixed(2));
    setSettleModalVisible(true);
  };

  const submitSettleUp = () => {
    if (!settleMember) return;
    const amount = parseFloat(settleAmount);
    if (isNaN(amount) || amount <= 0) {
      onSettleUpError?.('Please enter a positive settlement amount.');
      return;
    }

    setSettleModalVisible(false);
    setSettlingUserId(settleMember.userId);
    settleUp.mutate(
      { withUserId: settleMember.userId, amount },
      {
        onSuccess: () => {
          setSettlingUserId(null);
          setSettleAmount('');
          setSettleMember(null);
          onSettleUpSuccess?.();
        },
        onError: (err) => {
          setSettlingUserId(null);
          onSettleUpError?.(getErrorMessage(err));
        },
      }
    );
  };

  const executeLeaveGroup = () => {
    leaveGroup.mutate(groupId, {
      onSuccess: () => {
        onLeaveGroupSuccess?.();
      },
      onError: (err) => {
        onLeaveGroupError?.(getErrorMessage(err, 'Failed to leave group'));
      },
    });
  };

  const executeDeactivateGroup = () => {
    deactivateGroup.mutate(groupId, {
      onSuccess: () => {
        onDeactivateGroupSuccess?.();
      },
      onError: (err) => {
        onDeactivateGroupError?.(getErrorMessage(err, 'Failed to deactivate group.'));
      },
    });
  };

  const executeActivateGroup = () => {
    activateGroup.mutate(groupId, {
      onSuccess: () => {
        onActivateGroupSuccess?.();
      },
      onError: (err) => {
        onActivateGroupError?.(getErrorMessage(err, 'Failed to activate group.'));
      },
    });
  };

  return {
    settleUp,
    leaveGroup,
    deactivateGroup,
    activateGroup,
    sendReminder,
    handleSendReminder,
    handleSettleUp,
    submitSettleUp,
    executeLeaveGroup,
    executeDeactivateGroup,
    executeActivateGroup,
  };
}

/**
 * Controller hook to manage the business logic and state for GroupDetailScreen (Wrapper for backward compatibility)
 */
export function useGroupDetailController(config: GroupDetailControllerConfig) {
  const query = useGroupDetailQuery(config.groupId);
  const ui = useGroupDetailUi();
  const actions = useGroupDetailActions({
    ...config,
    setSettleMember: ui.setSettleMember,
    setSettleAmount: ui.setSettleAmount,
    setSettleModalVisible: ui.setSettleModalVisible,
    setSettlingUserId: ui.setSettlingUserId,
    settleAmount: ui.state.settleAmount,
    settleMember: ui.state.settleMember,
  });

  const handleRefresh = async () => {
    ui.setIsRefreshing(true);
    await query.refetch();
    ui.setIsRefreshing(false);
  };

  return {
    ...query,
    ...ui,
    ...ui.state,
    ...actions,
    handleRefresh,
  };
}

interface GroupAddMemberControllerConfig {
  groupId: string;
  onAddMemberSuccess?: (email: string) => void;
  onAddMemberError?: (error: string) => void;
}

/**
 * Controller hook to manage adding a member to a group
 */
export function useGroupAddMemberController({
  groupId,
  onAddMemberSuccess,
  onAddMemberError,
}: GroupAddMemberControllerConfig) {
  const { data: group } = useGroup(groupId);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: searchResults, isLoading: isSearching } = useSearchUsers(searchQuery);
  const addMember = useAddMember(groupId);

  const handleAddMember = (email: string) => {
    // Check if user is already a member
    const isAlreadyMember = group?.members.some(
      (m) => m.email.toLowerCase() === email.toLowerCase()
    );
    if (isAlreadyMember) {
      onAddMemberError?.('This user is already a member of the group.');
      return;
    }

    setIsSubmitting(true);
    addMember.mutate(
      { email },
      {
        onSuccess: () => {
          setIsSubmitting(false);
          onAddMemberSuccess?.(email);
        },
        onError: (err) => {
          setIsSubmitting(false);
          onAddMemberError?.(getErrorMessage(err, 'Failed to add member.'));
        },
      }
    );
  };

  return {
    group,
    searchQuery,
    setSearchQuery,
    isSubmitting,
    searchResults,
    isSearching,
    handleAddMember,
  };
}

interface CreateGroupControllerConfig {
  onSuccess?: (groupId: string) => void;
  onError?: (error: string) => void;
  onClose?: () => void;
}

/**
 * Controller hook to manage the state and business logic of CreateGroupModal
 */
export function useCreateGroupController({
  onSuccess,
  onError,
  onClose,
}: CreateGroupControllerConfig = {}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<GroupType>('Other');
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const createGroup = useCreateGroup();

  const resetForm = useCallback(() => {
    setName('');
    setDescription('');
    setType('Other');
    setIsTypeDropdownOpen(false);
    setErrorMessage('');
  }, []);

  const handleClose = useCallback(() => {
    resetForm();
    onClose?.();
  }, [resetForm, onClose]);

  const handleSubmit = useCallback(() => {
    setErrorMessage('');
    const TYPE_EMOJIS: Record<GroupType, string> = {
      Roommates: '🏠',
      Travel: '✈️',
      Friends: '👥',
      Family: '🏠',
      Office: '💼',
      Event: '🎉',
      Couple: '👥',
      Study: '📚',
      'Food / Mess': '🍽️',
      Gaming: '🎮',
      Other: '👥',
    };
    const validation = clientCreateGroupSchema.safeParse({
      name,
      description: description.trim() || undefined,
      emoji: TYPE_EMOJIS[type] || '👥',
      type,
      memberEmails: [],
    });

    if (!validation.success) {
      setErrorMessage(validation.error.issues[0].message);
      return;
    }

    createGroup.mutate(validation.data, {
      onSuccess: (group) => {
        handleClose();
        onSuccess?.(group.id);
      },
      onError: (err) => {
        setErrorMessage(getErrorMessage(err, 'Failed to create group. Please try again.'));
        onError?.(getErrorMessage(err, 'Failed to create group. Please try again.'));
      },
    });
  }, [name, description, type, handleClose, onSuccess, onError, createGroup]);

  const handleChangeName = useCallback(
    (t: string) => {
      setName(t);
      if (errorMessage) setErrorMessage('');
    },
    [errorMessage]
  );

  const handleChangeDescription = useCallback((t: string) => {
    setDescription(t);
  }, []);

  const handleChangeType = useCallback((t: GroupType) => {
    setType(t);
    setIsTypeDropdownOpen(false);
  }, []);

  const handleToggleTypeDropdown = useCallback(() => {
    setIsTypeDropdownOpen((prev) => !prev);
  }, []);

  return {
    name,
    setName,
    description,
    setDescription,
    type,
    setType,
    isTypeDropdownOpen,
    setIsTypeDropdownOpen,
    errorMessage,
    setErrorMessage,
    isPending: createGroup.isPending,
    resetForm,
    handleClose,
    handleSubmit,
    handleChangeName,
    handleChangeDescription,
    handleChangeType,
    handleToggleTypeDropdown,
  };
}

export type GroupsFilterType = 'all' | 'owed' | 'owe' | 'settled' | 'deactivated';

/**
 * Controller hook to manage state, filtering, searching, and balance calculations for GroupsScreen
 */
export function useGroupsController() {
  const [createGroupVisible, setCreateGroupVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<GroupsFilterType>('all');

  // Debounce search input to avoid hitting database on every keystroke
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Fetch paginated groups from the server, filtered by search query
  const { data, isLoading, isError, hasNextPage, fetchNextPage, isFetchingNextPage, refetch } =
    useGroups(debouncedSearchQuery);

  // Fetch dynamic group balances in background
  const {
    data: balancesData,
    isLoading: isBalancesLoading,
    refetch: refetchBalances,
  } = useGroupBalances();

  const groupList = useMemo(() => {
    return data?.pages.flatMap((page) => page.groups) ?? [];
  }, [data]);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await Promise.all([refetch(), refetchBalances()]);
    setIsRefreshing(false);
  }, [refetch, refetchBalances]);

  // Segment to active groups only for statistics
  const activeGroupList = useMemo(() => {
    return groupList.filter((g) => g.isActive !== false);
  }, [groupList]);

  // Compute overall statistics on active groups
  const totalOwedToMe = useMemo(() => {
    if (!balancesData) return 0;
    return activeGroupList
      .map((g) => balancesData[g.id]?.myBalance ?? 0)
      .filter((bal) => bal > 0)
      .reduce((sum, bal) => sum + bal, 0);
  }, [activeGroupList, balancesData]);

  const totalIOwe = useMemo(() => {
    if (!balancesData) return 0;
    return activeGroupList
      .map((g) => balancesData[g.id]?.myBalance ?? 0)
      .filter((bal) => bal < 0)
      .reduce((sum, bal) => sum + Math.abs(bal), 0);
  }, [activeGroupList, balancesData]);

  // Filter and Search logic (Search query is now handled server-side)
  const filteredGroups = useMemo(() => {
    let list = groupList;

    // Apply tab filtering
    if (activeFilter === 'owed') {
      list = list.filter((g) => {
        const bal = balancesData ? (balancesData[g.id]?.myBalance ?? 0) : 0;
        return g.isActive !== false && bal > 0.01;
      });
    } else if (activeFilter === 'owe') {
      list = list.filter((g) => {
        const bal = balancesData ? (balancesData[g.id]?.myBalance ?? 0) : 0;
        return g.isActive !== false && bal < -0.01;
      });
    } else if (activeFilter === 'settled') {
      list = list.filter((g) => {
        const bal = balancesData ? (balancesData[g.id]?.myBalance ?? 0) : 0;
        return g.isActive !== false && Math.abs(bal) <= 0.01;
      });
    } else if (activeFilter === 'deactivated') {
      list = list.filter((g) => g.isActive === false);
    } else {
      // By default ('all'), show only active groups
      list = list.filter((g) => g.isActive !== false);
    }

    return list;
  }, [groupList, activeFilter, balancesData]);

  return {
    createGroupVisible,
    setCreateGroupVisible,
    searchQuery,
    setSearchQuery,
    activeFilter,
    setActiveFilter,
    isLoading,
    isError,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    refetch,
    balancesData,
    isBalancesLoading,
    refetchBalances,
    groupList,
    activeGroupList,
    totalOwedToMe,
    totalIOwe,
    filteredGroups,
    isRefreshing,
    handleRefresh,
  };
}

export interface UseAddGroupExpenseControllerProps {
  visible: boolean;
  onClose: () => void;
  groupId?: string;
  groupName?: string;
  onSuccess?: () => void;
}

/**
 * Controller hook to manage form state, validation, splits, wallet deductions,
 * and mutations for the AddGroupExpenseModal presentational component.
 */
export function useAddGroupExpenseController({
  visible,
  onClose,
  groupId,
  groupName,
  onSuccess,
}: UseAddGroupExpenseControllerProps) {
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(groupId ?? null);
  const [isGroupDropdownOpen, setIsGroupDropdownOpen] = useState(false);

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
    type: 'GROUP';
    groupName?: string;
  } | null>(null);

  const { data: currentUser } = useMe();
  const createExpense = useCreateExpense();

  const {
    data: groupsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useGroups(undefined, { enabled: visible && isGroupDropdownOpen });
  const userGroups = useMemo(() => {
    return groupsData?.pages.flatMap((page) => page.groups) ?? [];
  }, [groupsData]);

  const [hasManuallyToggled, setHasManuallyToggled] = useState(false);
  const activeGroupId = groupId || selectedGroupId || '';
  const {
    data: groupData,
    refetch: refetchGroup,
    isLoading: isLoadingMembers,
  } = useGroup(visible ? activeGroupId : '');

  useEffect(() => {
    if (visible && activeGroupId) {
      refetchGroup();
    }
  }, [visible, activeGroupId, refetchGroup]);

  const groupMembers = useMemo(() => {
    return (groupData?.members ?? []).filter((m) => m.role !== 'invited');
  }, [groupData]);

  const { data: walletData, isLoading: isLoadingWallet } = useWallet(visible ? activeGroupId : '');
  const [useWalletBalance, setUseWalletBalance] = useState(false);

  const sortedGroupMembers = useMemo(() => {
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

  const toggleMember = useCallback(
    (id: string) => {
      if (currentUser && id === currentUser.id) return; // Cannot toggle self
      setHasManuallyToggled(true);
      setSplitMemberIds((prev) => {
        const isDeselecting = prev.includes(id);
        if (isDeselecting) {
          const otherSelected = prev.filter((m) => m !== currentUser?.id && m !== id);
          if (otherSelected.length === 0) {
            return prev;
          }
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

  const handleToggleGroupDropdown = useCallback(() => {
    setIsGroupDropdownOpen((prev) => !prev);
  }, []);

  const handleSelectGroup = useCallback((id: string) => {
    setSelectedGroupId(id);
    setIsGroupDropdownOpen(false);
    setSplitMemberIds([]);
    setCustomSplits({});
    setSplitMode('equal');
    setHasManuallyToggled(false);
  }, []);

  const handleToggleCategoryDropdown = useCallback(() => {
    setIsCategoryDropdownOpen((prev) => !prev);
  }, []);

  const handleSelectCategory = useCallback(
    (cat: ExpenseCategory) => {
      setCategory(cat);
      setIsCategoryDropdownOpen(false);
      if (!title) setTitle(cat);
    },
    [title]
  );

  const resetForm = () => {
    setSelectedGroupId(groupId ?? null);
    setIsGroupDropdownOpen(false);
    setCategory(null);
    setIsCategoryDropdownOpen(false);
    setAmount('');
    setTitle('');
    setNotes('');
    setDate(getLocalTodayString());
    setSplitMemberIds([]);
    setCustomSplits({});
    setSplitMode('equal');
    setErrorMessage('');
    setUseWalletBalance(false);
    setHasManuallyToggled(false);
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

    if (splitMemberIds.length === 0) {
      setErrorMessage('Please select at least one member to split with');
      return;
    }
    const otherMembers = splitMemberIds.filter((id) => id !== currentUser?.id);
    if (otherMembers.length === 0) {
      setErrorMessage('A group expense must be split with at least one other member');
      return;
    }

    let customSplitsPayload: { userId: string; amount: number }[] | undefined = undefined;

    if (splitMode === 'exact') {
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
      groupId: activeGroupId || undefined,
      splitMemberIds: splitMemberIds,
      useWallet: useWalletBalance,
      splitMode: splitMode,
      splits: splitMode === 'exact' ? customSplitsPayload : undefined,
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
          type: 'GROUP',
          groupName: groupData?.name || groupName || 'Group',
        });
        setIsSuccess(true);
        onSuccess?.();
      },
      onError: (err) => {
        setErrorMessage(getErrorMessage(err, 'Failed to add expense. Please try again.'));
      },
    });
  };

  return {
    selectedGroupId,
    isGroupDropdownOpen,
    category,
    setCategory,
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
    activeGroupId,
    groupData,
    walletData,
    isLoadingWallet,
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
  };
}
