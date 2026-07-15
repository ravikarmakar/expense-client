import React, { createContext, useContext } from 'react';
import { Alert } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGroupDetailController, useGroupActivity } from '@workspace/api';
import type { ActivityItem } from '@workspace/api';

type GroupDetailContextType = ReturnType<typeof useGroupDetailController> & {
  id: string;
  routeName?: string;
  routeEmoji?: string;
  insets: ReturnType<typeof useSafeAreaInsets>;
  recentActivity: ActivityItem[];
  isLoadingActivity: boolean;
  refetchActivity: () => void;
  confirmLeaveGroup: () => void;
  confirmDeactivateGroup: () => void;
};

const GroupDetailContext = createContext<GroupDetailContextType | undefined>(undefined);

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
    refetch: refetchActivity,
  } = useGroupActivity(id);

  const activityItems = React.useMemo(() => {
    return activityData?.pages.flatMap((page) => page.activity) || [];
  }, [activityData]);

  const recentActivity = React.useMemo(() => activityItems.slice(0, 10), [activityItems]);

  const confirmLeaveGroup = () => {
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
  };

  const confirmDeactivateGroup = () => {
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
  };

  const value: GroupDetailContextType = {
    ...controller,
    id,
    routeName,
    routeEmoji,
    insets,
    recentActivity,
    isLoadingActivity,
    refetchActivity,
    confirmLeaveGroup,
    confirmDeactivateGroup,
  };

  return <GroupDetailContext.Provider value={value}>{children}</GroupDetailContext.Provider>;
}

export function useGroupDetail() {
  const context = useContext(GroupDetailContext);
  if (!context) {
    throw new Error('useGroupDetail must be used within a GroupDetailProvider');
  }
  return context;
}
