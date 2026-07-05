import { useQuery } from '@tanstack/react-query';
import { getExpenseAnalyticsApi } from './analytics.api';

export const analyticsKeys = {
  all: ['analytics'] as const,
  detail: (timeframe: 'today' | 'week' | 'month' | 'year', date?: string) =>
    [...analyticsKeys.all, { timeframe, date }] as const,
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
