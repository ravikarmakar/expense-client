import { getApiClient } from '../client';
import {
  expenseAnalyticsResponseSchema,
  debtBalancesResponseSchema,
  groupAnalyticsResponseSchema,
  groupDetailAnalyticsResponseSchema,
  type ExpenseAnalytics,
  type DebtUser,
  type GroupSpentItem,
  type GroupDetailAnalytics,
} from './analytics.types';

/**
 * Get spent analytics by timeframe and date.
 */
export const getExpenseAnalyticsApi = async (
  timeframe: 'today' | 'week' | 'month' | 'year',
  date?: string,
  cursor?: string,
  limit?: number,
  type?: 'all' | 'personal' | 'group'
): Promise<ExpenseAnalytics> => {
  const { data } = await getApiClient().get<unknown>('/analytics', {
    params: { timeframe, date, cursor, limit, type },
  });
  const parsed = expenseAnalyticsResponseSchema.parse(data);
  return parsed.data;
};

/**
 * Get outstanding debt balances grouped by user.
 */
export const getDebtBalancesApi = async (): Promise<DebtUser[]> => {
  const { data } = await getApiClient().get<unknown>('/analytics/debts');
  const parsed = debtBalancesResponseSchema.parse(data);
  return parsed.data.debts;
};

/**
 * Get spending summaries across all active groups.
 */
export const getGroupAnalyticsApi = async (): Promise<GroupSpentItem[]> => {
  const { data } = await getApiClient().get<unknown>('/analytics/groups');
  const parsed = groupAnalyticsResponseSchema.parse(data);
  return parsed.data.groups;
};

/**
 * Get detailed analytics for a specific group by time period.
 */
export const getGroupDetailAnalyticsApi = async (
  groupId: string,
  timeframe: 'today' | 'week' | 'month' | 'year',
  date?: string
): Promise<GroupDetailAnalytics> => {
  const { data } = await getApiClient().get<unknown>(`/analytics/groups/${groupId}`, {
    params: { timeframe, date },
  });
  const parsed = groupDetailAnalyticsResponseSchema.parse(data);
  return parsed.data;
};
