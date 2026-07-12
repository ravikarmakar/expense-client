import { useState, useCallback, useReducer } from 'react';
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
  onSendReminderSuccess?: (memberName: string) => void;
  onSendReminderError?: (error: string) => void;
}

/**
 * Query hook to manage data fetching and status calculations for GroupDetailScreen
 */
export function useGroupDetailQuery(groupId: string) {
  const { data: user } = useMe();
  const { data: detailData, isLoading, isError, refetch } = useGroupDetail(groupId);

  const group = detailData?.group;
  const expenses = detailData?.expenses ?? [];
  const settlements = detailData?.settlements ?? [];
  const myBalance = group?.myBalance ?? 0;
  const isAdmin = group?.members.find((m) => m.userId === user?.id)?.role === GroupRole.ADMIN;
  const isFullySettled = group?.members.every((m) => Math.abs(m.balance ?? 0) < 0.01) ?? true;

  return {
    user,
    group,
    expenses,
    settlements,
    myBalance,
    isAdmin,
    isFullySettled,
    isLoading,
    isError,
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

  return {
    settleUp,
    leaveGroup,
    deactivateGroup,
    sendReminder,
    handleSendReminder,
    handleSettleUp,
    submitSettleUp,
    executeLeaveGroup,
    executeDeactivateGroup,
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
