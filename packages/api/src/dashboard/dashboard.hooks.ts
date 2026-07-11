import { useQuery } from '@tanstack/react-query';
import {
  getDashboardApi,
  getDashboardStatsApi,
  getDashboardRecentExpensesApi,
  getDashboardGroupsApi,
} from './dashboard.api';

export const dashboardKeys = {
  all: ['dashboard'] as const,
  detail: () => [...dashboardKeys.all, 'detail'] as const,
  stats: () => [...dashboardKeys.all, 'stats'] as const,
  expenses: () => [...dashboardKeys.all, 'expenses'] as const,
  groups: () => [...dashboardKeys.all, 'groups'] as const,
};

export const useDashboard = () =>
  useQuery({
    queryKey: dashboardKeys.detail(),
    queryFn: getDashboardApi,
    staleTime: 60 * 1000, // 1 minute
  });

export const useDashboardStats = () =>
  useQuery({
    queryKey: dashboardKeys.stats(),
    queryFn: getDashboardStatsApi,
    staleTime: 60 * 1000, // 1 minute
  });

export const useDashboardRecentExpenses = () =>
  useQuery({
    queryKey: dashboardKeys.expenses(),
    queryFn: getDashboardRecentExpensesApi,
    staleTime: 60 * 1000, // 1 minute
  });

export const useDashboardGroups = () =>
  useQuery({
    queryKey: dashboardKeys.groups(),
    queryFn: getDashboardGroupsApi,
    staleTime: 60 * 1000, // 1 minute
  });
