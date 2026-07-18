import { useState, useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useDebtBalances, analyticsKeys } from '../analytics/analytics.hooks';
import { settleUpApi } from './settlements.api';

interface SettleUpScreenControllerConfig {
  initialTab?: 'owed' | 'owe';
  onSettleSuccess?: () => void;
  onSettleError?: (errorMessage: string) => void;
}

export function useSettleUpScreenController(config?: SettleUpScreenControllerConfig) {
  const queryClient = useQueryClient();
  const { data: debts, isLoading } = useDebtBalances();

  // Tab filter state: 'owed' (Who owes you) | 'owe' (Who you owe)
  const [activeTab, setActiveTab] = useState<'owed' | 'owe'>(config?.initialTab || 'owed');

  // Settle Up modal state
  const [settleModalVisible, setSettleModalVisible] = useState(false);
  const [settleGroupId, setSettleGroupId] = useState<string | null>(null);
  const [settleUserId, setSettleUserId] = useState<string | null>(null);
  const [settleUserName, setSettleUserName] = useState('');
  const [settleGroupName, setSettleGroupName] = useState('');
  const [settleGroupEmoji, setSettleGroupEmoji] = useState('');
  const [settleBalance, setSettleBalance] = useState(0);
  const [settleAmount, setSettleAmount] = useState('');
  const [settleDirection, setSettleDirection] = useState<'owed' | 'owe'>('owed');

  // Settle Up Mutation
  const settleMutation = useMutation({
    mutationFn: settleUpApi,
    onSuccess: () => {
      setSettleModalVisible(false);
      setSettleAmount('');
      // Invalidate queries to refresh values across screens
      queryClient.invalidateQueries({ queryKey: analyticsKeys.all });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      config?.onSettleSuccess?.();
    },
    onError: (error: Error) => {
      config?.onSettleError?.(error.message || 'Failed to settle balance. Please try again.');
    },
  });

  const handleSettlePress = (
    groupId: string,
    withUserId: string,
    withUserName: string,
    groupName: string,
    groupEmoji: string,
    balance: number,
    direction: 'owed' | 'owe'
  ) => {
    setSettleGroupId(groupId);
    setSettleUserId(withUserId);
    setSettleUserName(withUserName);
    setSettleGroupName(groupName);
    setSettleGroupEmoji(groupEmoji);
    setSettleBalance(Math.abs(balance));
    setSettleAmount(Math.abs(balance).toFixed(2));
    setSettleDirection(direction);
    setSettleModalVisible(true);
  };

  const submitSettleUp = () => {
    if (!settleGroupId || !settleUserId) return;
    const amount = parseFloat(settleAmount);
    if (isNaN(amount) || amount <= 0) {
      config?.onSettleError?.('Please enter a positive settlement amount.');
      return;
    }

    settleMutation.mutate({
      groupId: settleGroupId,
      withUserId: settleUserId,
      amount,
    });
  };

  // Flatten and filter debts per group
  const flattenedDebts = useMemo(() => {
    if (!debts) return [];
    const list: {
      userId: string;
      name: string;
      email: string;
      image: string | null;
      groupId: string;
      groupName: string;
      groupEmoji: string;
      balance: number;
    }[] = [];

    for (const user of debts) {
      for (const group of user.groups) {
        const isOwed = group.balance > 0;
        if (activeTab === 'owed' && isOwed) {
          list.push({
            userId: user.userId,
            name: user.name,
            email: user.email,
            image: user.image,
            groupId: group.groupId,
            groupName: group.name,
            groupEmoji: group.emoji,
            balance: group.balance,
          });
        } else if (activeTab === 'owe' && !isOwed) {
          list.push({
            userId: user.userId,
            name: user.name,
            email: user.email,
            image: user.image,
            groupId: group.groupId,
            groupName: group.name,
            groupEmoji: group.emoji,
            balance: group.balance,
          });
        }
      }
    }
    return list;
  }, [debts, activeTab]);

  const isConfirmDisabled =
    !settleAmount ||
    parseFloat(settleAmount) <= 0 ||
    parseFloat(settleAmount) > settleBalance + 0.005 ||
    settleMutation.isPending;

  return {
    debts,
    flattenedDebts,
    isLoading,
    activeTab,
    setActiveTab,
    settleModalVisible,
    setSettleModalVisible,
    settleGroupId,
    settleUserId,
    settleUserName,
    settleGroupName,
    settleGroupEmoji,
    settleBalance,
    settleAmount,
    setSettleAmount,
    settleDirection,
    handleSettlePress,
    submitSettleUp,
    isConfirmDisabled,
    isSettling: settleMutation.isPending,
  };
}
