import { getApiClient } from '../client';
import { expenseAnalyticsResponseSchema, type ExpenseAnalytics } from './analytics.types';

/**
 * Get spent analytics by timeframe and date.
 */
export const getExpenseAnalyticsApi = async (
  timeframe: 'today' | 'week' | 'month' | 'year',
  date?: string
): Promise<ExpenseAnalytics> => {
  const { data } = await getApiClient().get<unknown>('/analytics', {
    params: { timeframe, date },
  });
  const parsed = expenseAnalyticsResponseSchema.parse(data);
  return parsed.data;
};
