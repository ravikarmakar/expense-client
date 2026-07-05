import { z } from 'zod';
import { expenseSchema } from '../expenses/expense.types';

export const analyticsHistoryItemSchema = z.object({
  date: z.string(),
  label: z.string(),
  amount: z.number(),
});

export const categoryAnalyticsItemSchema = z.object({
  category: z.string(),
  amount: z.number(),
  percentage: z.number(),
});

export const expenseAnalyticsResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    timeframe: z.enum(['today', 'week', 'month', 'year']),
    startDate: z.string(),
    endDate: z.string(),
    totalSpent: z.number(),
    totalPersonalSpent: z.number(),
    totalGroupSpent: z.number(),
    history: z.array(analyticsHistoryItemSchema),
    categorySpent: z.array(categoryAnalyticsItemSchema),
    expenses: z.array(expenseSchema),
    comparison: z.object({
      totalSpent: z.number(),
      totalPersonalSpent: z.number(),
      totalGroupSpent: z.number(),
    }),
  }),
});

export type ExpenseAnalytics = z.infer<typeof expenseAnalyticsResponseSchema>['data'];
export type AnalyticsHistoryItem = z.infer<typeof analyticsHistoryItemSchema>;
export type CategoryAnalyticsItem = z.infer<typeof categoryAnalyticsItemSchema>;
