import { useState, useMemo } from 'react';
import {
  useWallet,
  useSetupWallet,
  useContribute,
  useUpdateWalletManager,
  useUpdateWalletTarget,
  useWalletTransactions,
} from './wallet.hooks';
import { useGroup } from '../groups/group.hooks';
import { useMe } from '../auth/auth.hooks';
import type { WalletContribution } from './wallet.types';

export interface GroupWalletControllerConfig {
  groupId: string;
  onSetupWalletSuccess?: () => void;
  onSetupWalletError?: (error: string) => void;
  onContributeSuccess?: (amount: number) => void;
  onContributeError?: (error: string) => void;
  onUpdateManagerSuccess?: () => void;
  onUpdateManagerError?: (error: string) => void;
  onUpdateTargetSuccess?: () => void;
  onUpdateTargetError?: (error: string) => void;
}

export function useGroupWalletController({
  groupId,
  onSetupWalletSuccess,
  onSetupWalletError,
  onContributeSuccess,
  onContributeError,
  onUpdateManagerSuccess,
  onUpdateManagerError,
  onUpdateTargetSuccess,
  onUpdateTargetError,
}: GroupWalletControllerConfig) {
  const { data: user } = useMe();
  const { data: group } = useGroup(groupId);
  const { data: wallet, isLoading, isFetching, isError, error, refetch } = useWallet(groupId);
  const transactionsQuery = useWalletTransactions(groupId);
  const setupWallet = useSetupWallet(groupId);
  const contribute = useContribute(groupId);
  const updateManager = useUpdateWalletManager(groupId);
  const updateTarget = useUpdateWalletTarget(groupId);

  const [contributeAmount, setContributeAmount] = useState('');
  const [showContributeInput, setShowContributeInput] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Settings Modal State
  const [menuVisible, setMenuVisible] = useState(false);
  const [managerModalVisible, setManagerModalVisible] = useState(false);
  const [targetModalVisible, setTargetModalVisible] = useState(false);
  const [infoModalVisible, setInfoModalVisible] = useState(false);
  const [newTarget, setNewTarget] = useState('');
  const [newManagerId, setNewManagerId] = useState('');
  const [durationMode, setDurationMode] = useState<
    '4_DAYS' | '1_WEEK' | '2_WEEKS' | '1_MONTH' | 'CUSTOM'
  >('1_WEEK');
  const [customDate, setCustomDate] = useState('');

  const isOwner = group?.createdBy === user?.id;
  const isManager = wallet?.walletManagerId === user?.id;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([refetch(), transactionsQuery.refetch()]);
    setIsRefreshing(false);
  };

  // ── Wallet exists — full view calculations ──
  const groupMembers = useMemo(() => {
    return (group?.members ?? []).filter((m) => m.role !== 'invited');
  }, [group?.members]);

  const shareTarget = wallet ? wallet.targetContribution : 0;

  const myContribution = useMemo(() => {
    if (!wallet || !user) return null;
    return wallet.contributions.find((c: WalletContribution) => c.userId === user.id);
  }, [wallet?.contributions, user?.id]);

  const myPaid = myContribution?.amount ?? 0;
  const myPending = Math.max(0, shareTarget - myPaid);

  const getContributeError = () => {
    if (!contributeAmount) return '';
    const amount = parseFloat(contributeAmount);
    if (isNaN(amount)) return 'Please enter a valid number';
    if (amount <= 0) return 'Amount must be greater than 0';
    if (amount > myPending) {
      return `Exceeds pending target`;
    }
    return '';
  };

  const contributeError = getContributeError();

  const sortedMembers = useMemo(() => {
    if (!wallet) return [];
    return [...groupMembers].sort((a, b) => {
      if (a.userId === wallet.walletManagerId) return -1;
      if (b.userId === wallet.walletManagerId) return 1;
      if (a.userId === user?.id) return -1;
      if (b.userId === user?.id) return 1;
      return 0;
    });
  }, [groupMembers, wallet?.walletManagerId, user?.id]);

  const transactions = useMemo(() => {
    return transactionsQuery.data?.pages.flatMap((page) => page.transactions) ?? [];
  }, [transactionsQuery.data?.pages]);

  const handleSetupWallet = () => {
    if (!user) return;
    setupWallet.mutate(
      {
        walletManagerId: user.id,
        targetContribution: 0,
      },
      {
        onSuccess: () => {
          refetch();
          onSetupWalletSuccess?.();
        },
        onError: (err: unknown) => {
          const apiErr = err as { response?: { data?: { error?: string } } };
          const errorMsg =
            apiErr.response?.data?.error || (err as Error).message || 'Failed to setup wallet';
          onSetupWalletError?.(errorMsg);
        },
      }
    );
  };

  const handleContribute = () => {
    const amount = parseFloat(contributeAmount);
    if (isNaN(amount) || amount <= 0) {
      onContributeError?.('Please enter a valid amount.');
      return;
    }

    if (amount > myPending) {
      onContributeError?.(
        `Contribution limit exceeded. Your remaining target is ₹${myPending.toFixed(2)}.`
      );
      return;
    }

    contribute.mutate(
      { amount },
      {
        onSuccess: () => {
          setShowContributeInput(false);
          setContributeAmount('');
          refetch();
          onContributeSuccess?.(amount);
        },
        onError: (err) => {
          const apiErr = err as { response?: { data?: { error?: string } } };
          const errorMsg = apiErr.response?.data?.error || 'Failed to record contribution.';
          onContributeError?.(errorMsg);
        },
      }
    );
  };

  const handleSaveManager = () => {
    if (newManagerId && wallet && newManagerId !== wallet.walletManagerId) {
      updateManager.mutate(
        { walletManagerId: newManagerId },
        {
          onSuccess: () => {
            setManagerModalVisible(false);
            refetch();
            onUpdateManagerSuccess?.();
          },
          onError: (err) => {
            const apiErr = err as { response?: { data?: { error?: string } } };
            const errorMsg = apiErr.response?.data?.error || 'Failed to update manager.';
            onUpdateManagerError?.(errorMsg);
          },
        }
      );
    } else {
      setManagerModalVisible(false);
    }
  };

  const handleSaveTarget = () => {
    const parsedTarget = parseFloat(newTarget);
    if (!isNaN(parsedTarget) && parsedTarget > 0 && wallet) {
      let payload: { targetContribution: number; durationDays?: number; expiresAt?: string } = {
        targetContribution: parsedTarget,
      };

      if (durationMode === 'CUSTOM') {
        const custom = new Date(customDate);
        if (isNaN(custom.getTime()) || custom <= new Date()) {
          onUpdateTargetError?.('Please enter a valid future date in YYYY-MM-DD format.');
          return;
        }
        payload.expiresAt = custom.toISOString();
      } else {
        const daysMap = {
          '4_DAYS': 4,
          '1_WEEK': 7,
          '2_WEEKS': 14,
          '1_MONTH': 30,
        };
        payload.durationDays = daysMap[durationMode as keyof typeof daysMap];
      }

      updateTarget.mutate(payload, {
        onSuccess: () => {
          setTargetModalVisible(false);
          refetch();
          onUpdateTargetSuccess?.();
        },
        onError: (err) => {
          const apiErr = err as { response?: { data?: { error?: string } } };
          const errorMsg = apiErr.response?.data?.error || 'Failed to update target.';
          onUpdateTargetError?.(errorMsg);
        },
      });
    } else {
      setTargetModalVisible(false);
    }
  };

  const openSettings = () => {
    setMenuVisible(true);
  };

  const handleShowTargetInfo = () => {
    setInfoModalVisible(true);
  };

  const handleOpenManagerModal = () => {
    if (!wallet) return;
    setNewManagerId(wallet.walletManagerId);
    setMenuVisible(false);
    setManagerModalVisible(true);
  };

  const handleOpenTargetModal = () => {
    if (!wallet) return;
    setNewTarget(wallet.targetContribution.toString());
    setDurationMode('1_WEEK');
    setCustomDate('');
    setMenuVisible(false);
    setTargetModalVisible(true);
  };

  return {
    user,
    group,
    wallet,
    isLoading: isLoading || transactionsQuery.isLoading,
    isFetching: isFetching,
    isError: isError || transactionsQuery.isError,
    error: error || transactionsQuery.error,
    refetch: handleRefresh,
    setupWallet,
    contribute,
    updateManager,
    updateTarget,

    contributeAmount,
    setContributeAmount,
    showContributeInput,
    setShowContributeInput,
    isRefreshing,
    setIsRefreshing,

    menuVisible,
    setMenuVisible,
    managerModalVisible,
    setManagerModalVisible,
    targetModalVisible,
    setTargetModalVisible,
    infoModalVisible,
    setInfoModalVisible,

    newTarget,
    setNewTarget,
    newManagerId,
    setNewManagerId,
    durationMode,
    setDurationMode,
    customDate,
    setCustomDate,

    isOwner,
    isManager,
    handleRefresh,
    handleSetupWallet,
    handleContribute,
    handleSaveManager,
    handleSaveTarget,

    groupMembers,
    shareTarget,
    myContribution,
    myPaid,
    myPending,
    contributeError,
    sortedMembers,

    openSettings,
    handleShowTargetInfo,
    handleOpenManagerModal,
    handleOpenTargetModal,

    // Paginated transactions
    transactions,
    hasNextPage: transactionsQuery.hasNextPage,
    isFetchingNextPage: transactionsQuery.isFetchingNextPage,
    fetchNextPage: transactionsQuery.fetchNextPage,
  };
}
