import { useState } from 'react';
import { useMe } from '../auth/auth.hooks';
import { useNotifications } from '../notifications/notification.hooks';
import { useDashboard } from './dashboard.hooks';

export function useDashboardController() {
  const [addExpenseVisible, setAddExpenseVisible] = useState(false);
  const [createGroupVisible, setCreateGroupVisible] = useState(false);

  const { data: user } = useMe();
  const {
    data: dashboardData,
    isLoading: dashboardLoading,
    refetch: refetchDashboardData,
  } = useDashboard();
  const { data: notifications = [], refetch: refetchNotifications } = useNotifications();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const stats = dashboardData?.stats;
  const statsLoading = dashboardLoading;
  const expenses = dashboardData?.recentExpenses ?? [];
  const expensesLoading = dashboardLoading;
  const groups = dashboardData?.groups ?? [];
  const groupsLoading = dashboardLoading;

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([refetchDashboardData(), refetchNotifications()]);
    setIsRefreshing(false);
  };

  const refetchDashboard = async () => {
    await refetchDashboardData();
  };

  const recentGroups = groups.slice(0, 2);

  // Compute net balance from groups
  const rawOwed = (groups ?? [])
    .filter((g) => g.myBalance > 0)
    .reduce((sum, g) => sum + g.myBalance, 0);
  const totalOwedToMe = rawOwed < 0.01 ? 0 : rawOwed;

  const rawOwe = (groups ?? [])
    .filter((g) => g.myBalance < 0)
    .reduce((sum, g) => sum + Math.abs(g.myBalance), 0);
  const totalIOwe = rawOwe < 0.01 ? 0 : rawOwe;

  const rawNetBalance = totalOwedToMe - totalIOwe;
  const netBalance = Math.abs(rawNetBalance) < 0.01 ? 0 : rawNetBalance;

  const totalSpent = stats?.totalSpent ?? 0;
  const totalGroupSpent = stats?.totalGroupSpent ?? 0;

  return {
    addExpenseVisible,
    setAddExpenseVisible,
    createGroupVisible,
    setCreateGroupVisible,
    user,
    stats,
    statsLoading,
    expenses,
    expensesLoading,
    groups,
    groupsLoading,
    isRefreshing,
    unreadCount,
    handleRefresh,
    refetchDashboard,
    recentGroups,
    totalOwedToMe,
    totalIOwe,
    netBalance,
    totalSpent,
    totalGroupSpent,
  };
}
