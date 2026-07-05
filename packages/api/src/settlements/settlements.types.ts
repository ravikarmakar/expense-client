import { z } from 'zod';
import { groupSchema } from '../groups/group.types';

export const settlementSchema = z.object({
  id: z.string(),
  groupId: z.string(),
  fromId: z.string().nullable(),
  toId: z.string().nullable(),
  amount: z.number(),
  from: z.object({
    userId: z.string(),
    name: z.string(),
    image: z.string().nullable().optional(),
  }),
  to: z.object({
    userId: z.string(),
    name: z.string(),
    image: z.string().nullable().optional(),
  }),
  createdAt: z.string(),
});

export const settlementListSchema = z.object({
  success: z.boolean(),
  data: z.object({
    settlements: z.array(settlementSchema),
    total: z.number(),
  }),
});

export const settleUpResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    group: z.lazy(() => groupSchema),
  }),
});

export type Settlement = z.infer<typeof settlementSchema>;
export type SettlementList = z.infer<typeof settlementListSchema>;
export type SettleUpResponse = z.infer<typeof settleUpResponseSchema>;

export interface SettleUpInput {
  groupId: string;
  withUserId: string;
  amount: number;
}
