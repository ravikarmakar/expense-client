import { useState, useMemo } from 'react';
import { useMe } from '../auth/auth.hooks';
import { useNotifications } from '../notifications/notification.hooks';
import { useDashboard } from './dashboard.hooks';

const RECENT_GROUPS_LIMIT = 4;

export function useDashboardController() {
  const [addExpenseVisible, setAddExpenseVisible] = useState(false);
  const [createGroupVisible, setCreateGroupVisible] = useState(false);

  const { data: user } = useMe();
  const {
    data: dashboardData,
    isLoading: dashboardLoading,
    refetch: refetchDashboardData,
  } = useDashboard();
  const { data: notificationsData, refetch: refetchNotifications } = useNotifications();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const stats = dashboardData?.stats;
  const statsLoading = dashboardLoading;
  const expenses = dashboardData?.recentExpenses ?? [];
  const expensesLoading = dashboardLoading;
  const groups = dashboardData?.groups ?? [];
  const groupsLoading = dashboardLoading;

  const unreadCount = useMemo(() => {
    if (!notificationsData) return 0;
    const all = notificationsData.pages.flatMap((page) => page.notifications);
    return all.filter((n) => !n.read).length;
  }, [notificationsData]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([refetchDashboardData(), refetchNotifications()]);
    setIsRefreshing(false);
  };

  const refetchDashboard = async () => {
    await refetchDashboardData();
  };

  const recentGroups = useMemo(() => groups.slice(0, RECENT_GROUPS_LIMIT), [groups]);

  // Compute net balance from groups in a memoized block to optimize rendering performance
  const { totalOwedToMe, totalIOwe, netBalance } = useMemo(() => {
    const rawOwed = (groups ?? [])
      .filter((g) => g.myBalance > 0)
      .reduce((sum, g) => sum + g.myBalance, 0);
    const totalOwed = rawOwed < 0.01 ? 0 : rawOwed;

    const rawOwe = (groups ?? [])
      .filter((g) => g.myBalance < 0)
      .reduce((sum, g) => sum + Math.abs(g.myBalance), 0);
    const totalOwe = rawOwe < 0.01 ? 0 : rawOwe;

    const rawNet = totalOwed - totalOwe;
    const net = Math.abs(rawNet) < 0.01 ? 0 : rawNet;

    return { totalOwedToMe: totalOwed, totalIOwe: totalOwe, netBalance: net };
  }, [groups]);

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
