import React, { createContext, useContext, useCallback, useMemo } from 'react';
import { Alert } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGroupDetailController, useGroupActivity } from '@workspace/api';
import type { ActivityItem } from '@workspace/api';

// ─────────────────────────────────────────────────────────────────────────────
// Types derived from the controller's actual return shape
// ─────────────────────────────────────────────────────────────────────────────

type ControllerReturn = ReturnType<typeof useGroupDetailController>;

type GroupDetailDataContextType = {
  id: string;
  routeName?: string;
  routeEmoji?: string;
  insets: ReturnType<typeof useSafeAreaInsets>;
  recentActivity: ActivityItem[];
  isLoadingActivity: boolean;
  isFetchingActivity: boolean;
} & Omit<
  ControllerReturn,
  | 'refetch'
  | 'handleRefresh'
  | 'executeLeaveGroup'
  | 'executeDeactivateGroup'
  | 'executeActivateGroup'
  | 'handleSettleUp'
  | 'submitSettleUp'
  | 'handleSendReminder'
>;

type GroupDetailActionsContextType = {
  refetch: ControllerReturn['refetch'];
  handleRefresh: ControllerReturn['handleRefresh'];
  executeLeaveGroup: ControllerReturn['executeLeaveGroup'];
  executeDeactivateGroup: ControllerReturn['executeDeactivateGroup'];
  executeActivateGroup: ControllerReturn['executeActivateGroup'];
  handleSettleUp: ControllerReturn['handleSettleUp'];
  submitSettleUp: ControllerReturn['submitSettleUp'];
  handleSendReminder: ControllerReturn['handleSendReminder'];
  refetchActivity: () => void;
  confirmLeaveGroup: () => void;
  confirmDeactivateGroup: () => void;
  confirmActivateGroup: () => void;
};

// ─────────────────────────────────────────────────────────────────────────────
// Contexts
// ─────────────────────────────────────────────────────────────────────────────

const GroupDetailDataContext = createContext<GroupDetailDataContextType | undefined>(undefined);
const GroupDetailActionsContext = createContext<GroupDetailActionsContextType | undefined>(
  undefined
);

// ─────────────────────────────────────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────────────────────────────────────

interface GroupDetailProviderProps {
  id: string;
  routeName?: string;
  routeEmoji?: string;
  children: React.ReactNode;
}

export function GroupDetailProvider({
  id,
  routeName,
  routeEmoji,
  children,
}: GroupDetailProviderProps) {
  const insets = useSafeAreaInsets();

  const controller = useGroupDetailController({
    groupId: id,
    onSettleUpSuccess: () => {
      Alert.alert('Done! 🎉', 'Settlement recorded successfully.');
      controller.refetch();
      refetchActivity();
    },
    onSettleUpError: (err) => {
      Alert.alert('Error', err);
    },
    onLeaveGroupSuccess: () => {
      router.replace('/(tabs)/groups');
    },
    onLeaveGroupError: (err) => {
      Alert.alert('Error', err);
    },
    onDeactivateGroupSuccess: () => {
      Alert.alert('Success 🎉', 'Group deactivated successfully.');
      router.replace('/(tabs)/groups');
    },
    onDeactivateGroupError: (err) => {
      Alert.alert('Error', err);
    },
    onActivateGroupSuccess: () => {
      Alert.alert('Success 🎉', 'Group reactivated successfully.');
      controller.refetch();
      refetchActivity();
    },
    onActivateGroupError: (err) => {
      Alert.alert('Error', err);
    },
    onSendReminderSuccess: (name) => {
      Alert.alert('Reminder Sent! 🔔', `We've sent a settle up reminder notification to ${name}.`);
    },
    onSendReminderError: (err) => {
      Alert.alert('Failed to send reminder', err);
    },
  });

  const {
    data: activityData,
    isLoading: isLoadingActivity,
    isFetching: isFetchingActivity,
    refetch: refetchActivity,
  } = useGroupActivity(id);

  const activityItems = useMemo(() => {
    return activityData?.pages.flatMap((page) => page.activity) || [];
  }, [activityData]);

  const recentActivity = useMemo(() => activityItems.slice(0, 10), [activityItems]);

  // ── Stable action callbacks ────────────────────────────────────────────

  const confirmLeaveGroup = useCallback(() => {
    const walletBalance = controller.group?.wallet?.balance ?? 0;
    if (walletBalance > 0) {
      Alert.alert(
        'Cannot Leave Group',
        `This group has ₹${walletBalance.toFixed(2)} in the wallet. Please use or withdraw the wallet balance before leaving the group.`,
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      'Leave Group',
      'Are you sure you want to leave this group? You will no longer see its expenses.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: controller.executeLeaveGroup,
        },
      ]
    );
  }, [controller.executeLeaveGroup, controller.group?.wallet?.balance]);

  const confirmDeactivateGroup = useCallback(() => {
    if (!controller.isFullySettled) {
      Alert.alert(
        'Cannot Deactivate Group',
        'All member balances must be fully settled (₹0.00) before deactivating the group.',
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      'Deactivate Group',
      'Are you sure you want to deactivate this group? This will hide the group and prevent new expenses, but keep records intact.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Deactivate',
          style: 'destructive',
          onPress: controller.executeDeactivateGroup,
        },
      ]
    );
  }, [controller.isFullySettled, controller.executeDeactivateGroup]);

  const confirmActivateGroup = useCallback(() => {
    Alert.alert(
      'Activate Group',
      'Are you sure you want to reactivate this group? This will allow adding new expenses and members.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Activate',
          onPress: controller.executeActivateGroup,
        },
      ]
    );
  }, [controller.executeActivateGroup]);

  // ── Separate data from actions ─────────────────────────────────────────

  // Destructure actions out, spread the rest as data
  const {
    refetch,
    handleRefresh,
    executeLeaveGroup,
    executeDeactivateGroup,
    executeActivateGroup,
    handleSettleUp,
    submitSettleUp,
    handleSendReminder,
    ...controllerData
  } = controller;

  const dataValue = useMemo(
    () => ({
      ...controllerData,
      id,
      routeName,
      routeEmoji,
      insets,
      recentActivity,
      isLoadingActivity,
      isFetchingActivity,
    }),

    [
      controllerData.group,
      controllerData.isLoading,
      controllerData.isFetching,
      controllerData.isError,
      controllerData.isFullySettled,
      controllerData.addExpenseVisible,
      controllerData.editGroupVisible,
      controllerData.settleModalVisible,
      controllerData.settleAmount,
      controllerData.settleMember,
      controllerData.settlingUserId,
      controllerData.activeTab,
      controllerData.isRefreshing,
      controllerData.menuVisible,
      id,
      routeName,
      routeEmoji,
      insets,
      recentActivity,
      isLoadingActivity,
      isFetchingActivity,
    ]
  );

  const actionsValue = useMemo(
    () => ({
      refetch,
      handleRefresh,
      executeLeaveGroup,
      executeDeactivateGroup,
      executeActivateGroup,
      handleSettleUp,
      submitSettleUp,
      handleSendReminder,
      refetchActivity,
      confirmLeaveGroup,
      confirmDeactivateGroup,
      confirmActivateGroup,
    }),
    [
      refetch,
      handleRefresh,
      executeLeaveGroup,
      executeDeactivateGroup,
      executeActivateGroup,
      handleSettleUp,
      submitSettleUp,
      handleSendReminder,
      refetchActivity,
      confirmLeaveGroup,
      confirmDeactivateGroup,
      confirmActivateGroup,
    ]
  );

  return (
    <GroupDetailActionsContext.Provider value={actionsValue}>
      <GroupDetailDataContext.Provider value={dataValue}>
        {children}
      </GroupDetailDataContext.Provider>
    </GroupDetailActionsContext.Provider>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Consumer hooks
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Access all group detail data and actions (backwards-compatible).
 * For optimized usage, prefer `useGroupDetailData` or `useGroupDetailActions` separately.
 */
export function useGroupDetail() {
  const data = useGroupDetailData();
  const actions = useGroupDetailActions();
  return { ...data, ...actions };
}

/**
 * Access only the group detail data (reactive values like balances, members, loading states).
 * Components using only this hook won't re-render when action references change.
 */
export function useGroupDetailData() {
  const context = useContext(GroupDetailDataContext);
  if (!context) {
    throw new Error('useGroupDetailData must be used within a GroupDetailProvider');
  }
  return context;
}

/**
 * Access only group detail actions (stable function references).
 * Components using only this hook won't re-render when data changes.
 */
export function useGroupDetailActions() {
  const context = useContext(GroupDetailActionsContext);
  if (!context) {
    throw new Error('useGroupDetailActions must be used within a GroupDetailProvider');
  }
  return context;
}
