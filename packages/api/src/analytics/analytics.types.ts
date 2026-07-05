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

export const debtGroupSchema = z.object({
  groupId: z.string(),
  name: z.string(),
  emoji: z.string(),
  balance: z.number(),
});

export const debtUserSchema = z.object({
  userId: z.string(),
  name: z.string(),
  email: z.string(),
  image: z.string().nullable(),
  netBalance: z.number(),
  groups: z.array(debtGroupSchema),
});

export const debtBalancesResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    debts: z.array(debtUserSchema),
  }),
});

export const groupSpentItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  emoji: z.string(),
  type: z.string(),
  myPayments: z.number(),
  myShare: z.number(),
  totalExpenses: z.number(),
  myBalance: z.number(),
});

export const groupAnalyticsResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    groups: z.array(groupSpentItemSchema),
  }),
});

export type DebtUser = z.infer<typeof debtUserSchema>;
export type DebtGroup = z.infer<typeof debtGroupSchema>;
export type GroupSpentItem = z.infer<typeof groupSpentItemSchema>;

// ── Per-Group Detail Analytics ──

export const memberSpentItemSchema = z.object({
  userId: z.string(),
  name: z.string(),
  image: z.string().nullable(),
  amount: z.number(),
  percentage: z.number(),
});

export const groupDetailAnalyticsResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    groupId: z.string(),
    groupName: z.string(),
    groupEmoji: z.string(),
    timeframe: z.enum(['today', 'week', 'month', 'year']),
    startDate: z.string(),
    endDate: z.string(),
    totalGroupSpent: z.number(),
    myPayments: z.number(),
    myShare: z.number(),
    history: z.array(analyticsHistoryItemSchema),
    categorySpent: z.array(categoryAnalyticsItemSchema),
    memberSpent: z.array(memberSpentItemSchema),
    comparison: z.object({
      totalSpent: z.number(),
    }),
  }),
});

export type GroupDetailAnalytics = z.infer<typeof groupDetailAnalyticsResponseSchema>['data'];
export type MemberSpentItem = z.infer<typeof memberSpentItemSchema>;
