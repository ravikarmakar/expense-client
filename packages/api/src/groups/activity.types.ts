import { z } from 'zod';
import { expenseSchema } from '../expenses/expense.types';
import { settlementSchema } from '../settlements/settlements.types';

// ─────────────────────────────────────────────────────
// Unified Activity Feed Types
// ─────────────────────────────────────────────────────

export const activityExpenseItemSchema = z.object({
  type: z.literal('expense'),
  data: expenseSchema,
});

export const activitySettlementItemSchema = z.object({
  type: z.literal('settlement'),
  data: settlementSchema,
});

export const activityItemSchema = z.discriminatedUnion('type', [
  activityExpenseItemSchema,
  activitySettlementItemSchema,
]);

export const activityFeedSchema = z.object({
  success: z.boolean(),
  data: z.object({
    activity: z.array(activityItemSchema),
    nextCursor: z.string().nullable().optional(),
  }),
});

export type ActivityExpenseItem = z.infer<typeof activityExpenseItemSchema>;
export type ActivitySettlementItem = z.infer<typeof activitySettlementItemSchema>;
export type ActivityItem = z.infer<typeof activityItemSchema>;
export type ActivityFeed = z.infer<typeof activityFeedSchema>;
