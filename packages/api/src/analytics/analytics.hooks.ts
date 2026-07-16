import { useQuery } from '@tanstack/react-query';
import {
  getExpenseAnalyticsApi,
  getDebtBalancesApi,
  getGroupAnalyticsApi,
  getGroupDetailAnalyticsApi,
} from './analytics.api';

export const analyticsKeys = {
  all: ['analytics'] as const,
  detail: (timeframe: 'today' | 'week' | 'month' | 'year', date?: string) =>
    [...analyticsKeys.all, { timeframe, date }] as const,
  debts: () => [...analyticsKeys.all, 'debts'] as const,
  groups: () => [...analyticsKeys.all, 'groups'] as const,
  groupDetail: (groupId: string, timeframe: string, date?: string) =>
    [...analyticsKeys.all, 'group', groupId, { timeframe, date }] as const,
};

/**
 * Fetch user spent analytics data.
 */
export const useExpenseAnalytics = (
  timeframe: 'today' | 'week' | 'month' | 'year',
  date?: string
) =>
  useQuery({
    queryKey: analyticsKeys.detail(timeframe, date),
    queryFn: () => getExpenseAnalyticsApi(timeframe, date),
    staleTime: 30 * 1000,
  });

import { useInfiniteQuery } from '@tanstack/react-query';

export const useExpenseAnalyticsInfinite = (
  timeframe: 'today' | 'week' | 'month' | 'year',
  date?: string,
  limit = 15,
  type?: 'all' | 'personal' | 'group'
) =>
  useInfiniteQuery({
    queryKey: [...analyticsKeys.detail(timeframe, date), { limit, type }] as const,
    queryFn: ({ pageParam }) =>
      getExpenseAnalyticsApi(timeframe, date, pageParam as string | undefined, limit, type),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    staleTime: 30 * 1000,
  });

/**
 * Fetch consolidated debt balances.
 */
export const useDebtBalances = () =>
  useQuery({
    queryKey: analyticsKeys.debts(),
    queryFn: getDebtBalancesApi,
    staleTime: 15 * 1000,
  });

/**
 * Fetch group spending analytics.
 */
export const useGroupAnalytics = () =>
  useQuery({
    queryKey: analyticsKeys.groups(),
    queryFn: getGroupAnalyticsApi,
    staleTime: 30 * 1000,
  });

/**
 * Fetch detailed analytics for a specific group by time period.
 */
export const useGroupDetailAnalytics = (
  groupId: string,
  timeframe: 'today' | 'week' | 'month' | 'year',
  date?: string
) =>
  useQuery({
    queryKey: analyticsKeys.groupDetail(groupId, timeframe, date),
    queryFn: () => getGroupDetailAnalyticsApi(groupId, timeframe, date),
    staleTime: 30 * 1000,
    enabled: !!groupId,
  });
