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
    }),
    recentExpenses: z.array(expenseSchema),
    groups: z.array(groupSchema),
  }),
});

export type DashboardData = z.infer<typeof dashboardResponseSchema>['data'];
