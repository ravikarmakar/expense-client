import { z } from 'zod';
import { authUserSchema } from '../auth/auth.validation';
import { expenseSchema } from '../expenses/expense.types';
import { groupSchema } from '../groups/group.types';

export const dashboardResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    user: authUserSchema,
    stats: z.object({
      totalSpent: z.number(),
      totalGroupSpent: z.number(),
      totalPersonalSpent: z.number(),
      categorySpent: z
        .array(
          z.object({
            category: z.string(),
            amount: z.number(),
          })
        )
        .optional()
        .default([]),
    }),
    recentExpenses: z.array(expenseSchema),
    groups: z.array(groupSchema),
  }),
});

export const dashboardStatsSchema = z.object({
  success: z.boolean(),
  data: z.object({
    totalSpent: z.number(),
    totalGroupSpent: z.number(),
    totalPersonalSpent: z.number(),
    categorySpent: z
      .array(
        z.object({
          category: z.string(),
          amount: z.number(),
        })
      )
      .optional()
      .default([]),
  }),
});

export const dashboardExpensesSchema = z.object({
  success: z.boolean(),
  data: z.array(expenseSchema),
});

export const dashboardGroupsSchema = z.object({
  success: z.boolean(),
  data: z.array(groupSchema),
});
